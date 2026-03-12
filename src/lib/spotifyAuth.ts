/**
 * Spotify OAuth 2.0 + PKCE helpers for a frontend-only app.
 * This version uses localStorage for the PKCE verifier and adds
 * stronger debug logging so auth issues are easier to diagnose.
 */

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

const SCOPES = [
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing',
  'streaming',
  'user-read-email',
  'user-read-private',
].join(' ');

const STORAGE_KEY_TOKEN = 'pulsemix-spotify-token';
const STORAGE_KEY_VERIFIER = 'pulsemix-spotify-code-verifier';

export interface SpotifyTokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface StoredToken extends SpotifyTokenData {
  expires_at: number;
}

function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function persistToken(data: SpotifyTokenData): void {
  const withExpiry: StoredToken = {
    ...data,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(withExpiry));
}

export function getStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredToken;
    if (!parsed.expires_at) return null;

    // Treat token as expired a minute early to avoid edge cases.
    if (Date.now() >= parsed.expires_at - 60_000) {
      console.warn('[Spotify Auth] stored token is expired or near expiry');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('[Spotify Auth] failed to parse stored token', error);
    return null;
  }
}

export function logoutSpotify(): void {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_VERIFIER);
}

export function getCodeFromUrl(): string | null {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');

  if (code) {
    // Remove one-time auth params immediately to avoid replay on refresh.
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.searchParams.delete('error');
    window.history.replaceState({}, document.title, url.pathname + url.search);
    return code;
  }

  return null;
}

export async function loginToSpotify(): Promise<void> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Missing VITE_SPOTIFY_CLIENT_ID or VITE_SPOTIFY_REDIRECT_URI.');
  }

  if (window.location.origin.includes('localhost') && redirectUri.includes('127.0.0.1')) {
    throw new Error(
      'Origin mismatch: open the app at http://127.0.0.1:5173/ instead of localhost so PKCE storage survives the redirect.'
    );
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem(STORAGE_KEY_VERIFIER, verifier);

  console.log('[Spotify Auth] starting login', {
    clientIdPresent: !!clientId,
    redirectUri,
    currentOrigin: window.location.origin,
    verifierLength: verifier.length,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<SpotifyTokenData> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const verifier = localStorage.getItem(STORAGE_KEY_VERIFIER);

  console.log('[Spotify Auth] exchanging code', {
    codePresent: !!code,
    clientIdPresent: !!clientId,
    redirectUri,
    verifierPresent: !!verifier,
    currentOrigin: window.location.origin,
  });

  if (!clientId || !redirectUri || !verifier) {
    throw new Error('Missing Spotify PKCE verifier or client id. Check .env and restart the dev server.');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[Spotify Auth] token exchange failed', {
      status: response.status,
      body: text,
    });
    throw new Error(`Unable to exchange Spotify authorization code for a token. ${text}`);
  }

  const data = (await response.json()) as SpotifyTokenData;

  console.log('[Spotify Auth] token exchange success', {
    hasAccessToken: !!data.access_token,
    hasRefreshToken: !!data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  });

  localStorage.removeItem(STORAGE_KEY_VERIFIER);
  persistToken(data);
  return data;
}