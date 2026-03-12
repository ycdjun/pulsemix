/**
 * Hook to manage Spotify login state and OAuth callback handling.
 * Includes extra debug logging to help diagnose login/player issues.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  exchangeCodeForToken,
  getCodeFromUrl,
  getStoredToken,
  loginToSpotify,
  logoutSpotify,
} from '../lib/spotifyAuth';

export function useSpotifyAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isHandlingCallback, setIsHandlingCallback] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasHandledCallbackRef = useRef(false);

  const refreshLoginState = useCallback(() => {
    const token = getStoredToken();
    setIsLoggedIn(!!token);

    console.log('[Spotify Auth Hook] refreshLoginState', {
      hasToken: !!token,
      expiresAt: token?.expires_at ?? null,
    });
  }, []);

  useEffect(() => {
    if (hasHandledCallbackRef.current) {
      return;
    }

    const url = new URL(window.location.href);
    const callbackError = url.searchParams.get('error');
    const code = getCodeFromUrl();

    if (!code && !callbackError) {
      refreshLoginState();
      return;
    }

    hasHandledCallbackRef.current = true;
    setError(null);
    setIsHandlingCallback(true);

    if (callbackError) {
      console.error('[Spotify Auth Hook] callback error from Spotify', callbackError);
      setError(`Spotify login failed: ${callbackError}`);
      setIsLoggedIn(false);
      setIsHandlingCallback(false);
      return;
    }

    let cancelled = false;

    exchangeCodeForToken(code as string)
      .then(() => {
        if (cancelled) return;
        console.log('[Spotify Auth Hook] callback exchange succeeded');
        setIsLoggedIn(true);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Login failed';
        console.error('[Spotify Auth Hook] callback exchange failed', err);
        setError(message);
        setIsLoggedIn(false);
      })
      .finally(() => {
        if (!cancelled) {
          setIsHandlingCallback(false);
        }
      });

    return () => {
      cancelled = true
    };
  }, [refreshLoginState]);

  const login = useCallback(async () => {
    try {
      setError(null);
      await loginToSpotify();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      console.error('[Spotify Auth Hook] loginToSpotify failed', err);
      setError(message);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('[Spotify Auth Hook] logout');
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
    refreshLoginState,
  };
}