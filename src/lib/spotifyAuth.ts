/**
 * Spotify OAuth 2.0 with PKCE (no client secret).
 * Safe for frontend-only apps: we never use a client secret.
 * Requires VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_REDIRECT_URI in env.
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

/** Generate a cryptographically random code verifier (43–128 chars for PKCE). */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/** Base64url encode (no +/-, no padding per RFC 7636). */
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Compute code challenge = base64url(SHA-256(verifier)).
 * Uses Web Crypto API (browser-native).
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Start login: generate PKCE pair, store verifier, redirect to Spotify.
 * Call this when user clicks "Log in with Spotify".
 */
export async function loginToSpotify(): Promise<void> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Missing VITE_SPOTIFY_CLIENT_ID or VITE_SPOTIFY_REDIRECT_URI');
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem(STORAGE_KEY_VERIFIER, verifier);

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

/**
 * After redirect, Spotify sends us ?code=... (and maybe state). We exchange
 * the code for tokens using the code_verifier. No client secret needed.
 * CORS: Spotify token endpoint supports browser requests for PKCE flow.
 */
export async function exchangeCodeForToken(code: string): Promise<SpotifyTokenData> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const verifier = sessionStorage.getItem(STORAGE_KEY_VERIFIER);

  if (!clientId || !redirectUri || !verifier) {
    throw new Error('Missing config or code verifier (e.g. session expired)');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as SpotifyTokenData;
  sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
  persistToken(data);
  return data;
}

function persistToken(data: SpotifyTokenData): void {
  const withTimestamp = {
    ...data,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(withTimestamp));
}

export interface StoredToken extends SpotifyTokenData {
  expires_at: number;
}

/** Get token from storage if still valid. Caller can use this for API calls. */
export function getStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;
    // Consider expired 60s before actual expiry to avoid edge cases
    if (parsed.expires_at && Date.now() < parsed.expires_at - 60_000) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Clear token and verifier (logout). */
export function logoutSpotify(): void {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
}

/**
 * Parse the authorization code from the current URL (after redirect).
 * Returns null if no code present.
 */
export function getCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    // Optional: clean URL so user doesn't see the code in address bar
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState({}, '', url.pathname + url.search);
    return code;
  }
  return null;
}
