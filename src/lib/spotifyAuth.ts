/**
 * Stable Spotify auth helpers for frontend-only PKCE auth.
 * This version is intentionally compatibility-friendly:
 * it exports multiple helper names used by earlier patches.
 */
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing',
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
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function persistToken(data: SpotifyTokenData): StoredToken {
  const withTimestamp: StoredToken = {
    ...data,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(withTimestamp));
  console.log('[Spotify Auth] token stored', {
    hasAccessToken: !!withTimestamp.access_token,
    scope: withTimestamp.scope ?? null,
    expiresAt: withTimestamp.expires_at,
    tokenPrefix: withTimestamp.access_token?.slice(0, 10),
  });
  return withTimestamp;
}

export function getStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;

    if (parsed.expires_at && Date.now() < parsed.expires_at - 60_000) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export const getStoredSpotifyToken = getStoredToken;

export function clearStoredToken(): void {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
}

export function logoutSpotify(): void {
  clearStoredToken();
  localStorage.removeItem(STORAGE_KEY_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
}

export function getCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (code) {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState({}, '', url.pathname + url.search);
    return code;
  }

  return null;
}

export async function beginSpotifyLogin(): Promise<void> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined;

  if (!clientId || !redirectUri) {
    throw new Error('Missing VITE_SPOTIFY_CLIENT_ID or VITE_SPOTIFY_REDIRECT_URI');
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  // Store verifier in BOTH storages for compatibility with prior patches
  localStorage.setItem(STORAGE_KEY_VERIFIER, verifier);
  sessionStorage.setItem(STORAGE_KEY_VERIFIER, verifier);

  console.log('[Spotify Auth] starting login', {
    redirectUri,
    currentOrigin: window.location.origin,
    hasVerifier: true,
    verifierPrefix: verifier.slice(0, 8),
    scopes: SCOPES,
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

export const loginToSpotify = beginSpotifyLogin;

export async function exchangeCodeForToken(code: string): Promise<StoredToken> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined;
  const verifier =
    localStorage.getItem(STORAGE_KEY_VERIFIER) ??
    sessionStorage.getItem(STORAGE_KEY_VERIFIER);

  if (!clientId || !redirectUri || !verifier) {
    throw new Error(
      'Missing Spotify PKCE verifier or client id. Check .env and restart the dev server.'
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  console.log('[Spotify Auth] exchanging code for token', {
    redirectUri,
    hasClientId: !!clientId,
    verifierPrefix: verifier.slice(0, 8),
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unable to exchange Spotify authorization code for a token. ${text}`);
  }

  const data = (await res.json()) as SpotifyTokenData;
  localStorage.removeItem(STORAGE_KEY_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEY_VERIFIER);

  return persistToken(data);
}

export async function handleSpotifyRedirectCallback(): Promise<StoredToken | null> {
  const code = getCodeFromUrl();
  if (!code) return getStoredToken();
  return exchangeCodeForToken(code);
}
