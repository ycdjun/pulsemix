/**
 * Spotify Web Playback SDK integration.
 * Loads the SDK script, creates a player when token is available,
 * and exposes play/pause and play-URI.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getStoredToken } from '../lib/spotifyAuth';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayerInstance;
    };
  }
}

interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, cb: (state?: unknown) => void) => void;
  removeListener: (event: string, cb?: (state?: unknown) => void) => void;
  getCurrentState: () => Promise<{ position: number; duration: number; paused: boolean } | null>;
  resume: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  activateElement: () => Promise<void>;
}

const SCRIPT_URL = 'https://sdk.scdn.co/spotify-player.js';

/** Pass isLoggedIn from useSpotifyAuth so the player (re)initializes after login. */
export function useSpotifyPlayer(spotifyLoggedIn: boolean) {
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);

  // Load SDK script once
  useEffect(() => {
    if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return;

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Create and connect player when we have a token (and SDK may load async)
  useEffect(() => {
    if (!spotifyLoggedIn) {
      setIsReady(false);
      setDeviceId(null);
      return;
    }
    const token = getStoredToken();
    if (!token) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const init = () => {
      if (cancelled) return;
      if (!window.Spotify) {
        setTimeout(init, 100);
        return;
      }

      const player = new window.Spotify!.Player({
        name: 'PulseMix Web Player',
        getOAuthToken: (cb) => cb(token.access_token),
        volume: 0.8,
      });

      playerRef.current = player;

      const onReady = ({ device_id }: { device_id: string }) => {
        if (!cancelled) {
          setDeviceId(device_id);
          setIsReady(true);
          setPlayerError(null);
        }
      };

      const onNotReady = () => {
        if (!cancelled) {
          setIsReady(false);
          setDeviceId(null);
        }
      };

      const onPlayerStateChanged = () => {
        // Could sync state to React here if needed
      };

      player.addListener('ready', onReady);
      player.addListener('not_ready', onNotReady);
      player.addListener('player_state_changed', onPlayerStateChanged);

      player.connect().catch((err: unknown) => {
        if (!cancelled) {
          setPlayerError(err instanceof Error ? err.message : 'Failed to connect player');
        }
      });

      cleanup = () => {
        player.removeListener('ready', onReady);
        player.removeListener('not_ready', onNotReady);
        player.removeListener('player_state_changed', onPlayerStateChanged);
        player.disconnect();
        playerRef.current = null;
        setIsReady(false);
        setDeviceId(null);
      };
    };

    init();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [spotifyLoggedIn]); // Re-run when user logs in/out

  /**
   * Start playback of a Spotify track by URI.
   * Requires Spotify Web API "play" endpoint — we'll need to call it from the frontend.
   * The SDK doesn't play by URI directly; we need to call PUT https://api.spotify.com/v1/me/player/play
   * with body { uris: [uri] }. So we need a small helper that uses the token.
   */
  const playSpotifyUri = useCallback(async (uri: string) => {
    const token = getStoredToken();
    if (!token || !deviceId) {
      throw new Error('Spotify player not ready');
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [uri] }),
    });

    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      throw new Error(`Play failed: ${res.status} ${text}`);
    }
  }, [deviceId]);

  const pause = useCallback(async () => {
    const p = playerRef.current;
    if (!p) return;
    await p.pause();
  }, []);

  const resume = useCallback(async () => {
    const p = playerRef.current;
    if (!p) return;
    await p.resume();
  }, []);

  const getState = useCallback(async () => {
    const p = playerRef.current;
    if (!p) return null;
    return p.getCurrentState();
  }, []);

  return {
    isReady,
    deviceId,
    playerError,
    playSpotifyUri,
    pause,
    resume,
    getState,
  };
}
