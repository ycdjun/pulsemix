import { useEffect, useMemo, useRef, useState } from 'react';
import {
  beginSpotifyLogin,
  clearStoredToken,
  getStoredToken,
  handleSpotifyRedirectCallback,
  type StoredSpotifyToken,
} from '../lib/spotifyAuth';

export interface SpotifyAuthState {
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  token: StoredSpotifyToken | null;
}

export function useSpotifyAuth(): SpotifyAuthState {
  const [token, setToken] = useState<StoredSpotifyToken | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const run = async () => {
      try {
        const nextToken = await handleSpotifyRedirectCallback();
        setToken(nextToken);
        setError(null);
      } catch (err) {
        console.error('[Spotify Auth Hook] callback error', err);
        setError(err instanceof Error ? err.message : 'Spotify login failed.');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, []);

  const login = async () => {
    setError(null);
    await beginSpotifyLogin();
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setError(null);
  };

  return useMemo(
    () => ({
      accessToken: token?.accessToken ?? null,
      isLoggedIn: !!token?.accessToken,
      isLoading,
      error,
      login,
      logout,
      token,
    }),
    [token, isLoading, error]
  );
}
