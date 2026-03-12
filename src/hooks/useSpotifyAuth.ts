/**
 * Hook to manage Spotify login state and OAuth callback.
 * On mount, checks URL for ?code= and exchanges it for a token if present.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCodeFromUrl,
  exchangeCodeForToken,
  getStoredToken,
  loginToSpotify,
  logoutSpotify,
} from '../lib/spotifyAuth';

export function useSpotifyAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLoginState = useCallback(() => {
    setIsLoggedIn(!!getStoredToken());
  }, []);

  // On mount: if URL has ?code=, we're returning from Spotify — exchange for token
  useEffect(() => {
    const code = getCodeFromUrl();
    if (!code) {
      updateLoginState();
      return;
    }

    let cancelled = false;
    setError(null);
    setIsHandlingCallback(true);

    exchangeCodeForToken(code)
      .then(() => {
        if (!cancelled) {
          setIsLoggedIn(true);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Login failed');
          setIsLoggedIn(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsHandlingCallback(false);
      });

    return () => {
      cancelled = true;
    };
  }, [updateLoginState]);

  const login = useCallback(async () => {
    setError(null);
    try {
      await loginToSpotify();
      // Redirect happens; no need to update state here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }, []);

  const logout = useCallback(() => {
    logoutSpotify();
    setIsLoggedIn(false);
    setError(null);
  }, []);

  return {
    isLoggedIn,
    isHandlingCallback,
    error,
    login,
    logout,
    refreshLoginState: updateLoginState,
  };
}
