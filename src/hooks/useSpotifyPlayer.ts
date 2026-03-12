import { useCallback, useEffect, useState } from 'react';
import {
  fetchSpotifyAccountDebug,
  fetchSpotifyDevicesDebug,
  startSpotifyPlayback,
} from '../lib/spotifyApi';
import { getStoredToken } from '../lib/spotifyAuth';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: typeof Spotify;
  }
}

type UseSpotifyPlayerParams = {
  accessToken: string | null;
};

type UseSpotifyPlayerResult = {
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
  error: string | null;
  playUri: (trackUri: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
};

export function useSpotifyPlayer({
  accessToken,
}: UseSpotifyPlayerParams): UseSpotifyPlayerResult {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredToken();
    const effectiveToken = accessToken ?? stored?.access_token ?? null;

    if (!effectiveToken) {
      setPlayer(null);
      setDeviceId(null);
      setIsReady(false);
      setError(null);
      return;
    }

    let cancelled = false;
    let currentPlayer: Spotify.Player | null = null;

    const loadSdkScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.Spotify) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[data-spotify-sdk="true"]'
        ) as HTMLScriptElement | null;

        if (existingScript) {
          window.onSpotifyWebPlaybackSDKReady = () => resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        script.dataset.spotifySdk = 'true';
        script.onload = () => {
          window.onSpotifyWebPlaybackSDKReady = () => resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Spotify Web Playback SDK.'));
        document.body.appendChild(script);
      });

    const initializePlayer = async () => {
      try {
        await loadSdkScript();

        if (!window.Spotify || cancelled) {
          return;
        }

        const sdkPlayer = new window.Spotify.Player({
          name: 'PulseMix Web Player',
          getOAuthToken: (cb) => {
            const tokenFromStorage = getStoredToken()?.access_token ?? null;
            const finalToken = tokenFromStorage ?? effectiveToken ?? '';

            console.log('[Spotify SDK] getOAuthToken called', {
              hasToken: !!finalToken,
              tokenPrefix: finalToken ? finalToken.slice(0, 10) : null,
            });

            cb(finalToken);
          },
          volume: 0.5,
        });

        sdkPlayer.addListener('ready', async ({ device_id }) => {
          console.log('[Spotify SDK] ready', { device_id });

          if (cancelled) return;

          setDeviceId(device_id);
          setIsReady(true);
          setError(null);

          try {
            await fetchSpotifyAccountDebug();
            await fetchSpotifyDevicesDebug();
          } catch {
            // logs already emitted inside helpers
          }
        });

        sdkPlayer.addListener('not_ready', ({ device_id }) => {
          console.warn('[Spotify SDK] not_ready', { device_id });
          if (cancelled) return;
          setDeviceId(null);
          setIsReady(false);
        });

        sdkPlayer.addListener('player_state_changed', (state) => {
          console.log('[Spotify SDK] player_state_changed', state);
        });

        sdkPlayer.addListener('initialization_error', (event) => {
          console.error('[Spotify SDK] initialization_error', event?.message, event);
          if (cancelled) return;
          setError(event?.message ?? 'Spotify player initialization failed.');
        });

        sdkPlayer.addListener('authentication_error', async (event) => {
          console.error('[Spotify SDK] authentication_error', event?.message, event);
          try {
            await fetchSpotifyAccountDebug();
          } catch {
            // logs already emitted inside helpers
          }
          if (cancelled) return;
          setError(event?.message ?? 'Spotify player authentication failed.');
        });

        sdkPlayer.addListener('account_error', async (event) => {
          console.error('[Spotify SDK] account_error', event?.message, event);
          try {
            const me = await fetchSpotifyAccountDebug();
            const storedToken = getStoredToken();

            console.log('[Spotify Debug] account eligibility snapshot', {
              spotifyProduct: me?.product ?? null,
              scope: storedToken?.scope ?? null,
              tokenPrefix: storedToken?.access_token?.slice(0, 10) ?? null,
            });
          } catch {
            // logs already emitted
          }

          if (cancelled) return;
          setError(event?.message ?? 'Spotify account error.');
        });

        sdkPlayer.addListener('playback_error', (event) => {
          console.error('[Spotify SDK] playback_error', event?.message, event);
          if (cancelled) return;
          setError(event?.message ?? 'Spotify playback failed.');
        });

        const connected = await sdkPlayer.connect();
        console.log('[Spotify SDK] connect() resolved', connected);

        if (cancelled) {
          await sdkPlayer.disconnect();
          return;
        }

        currentPlayer = sdkPlayer;
        setPlayer(sdkPlayer);

        if (!connected) {
          setError('Spotify SDK failed to connect.');
        }
      } catch (err) {
        console.error('[Spotify SDK] setup failed', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Spotify SDK setup failed.');
        }
      }
    };

    initializePlayer();

    return () => {
      cancelled = true;
      if (currentPlayer) {
        currentPlayer.disconnect();
      }
    };
  }, [accessToken]);

  const playUri = useCallback(
    async (trackUri: string) => {
      if (!deviceId) {
        throw new Error('Spotify player device is not ready yet.');
      }

      await startSpotifyPlayback({
        deviceId,
        trackUri,
      });
    },
    [deviceId]
  );

  const pause = useCallback(async () => {
    if (!player) return;
    await player.pause();
  }, [player]);

  const resume = useCallback(async () => {
    if (!player) return;
    await player.resume();
  }, [player]);

  const togglePlay = useCallback(async () => {
    if (!player) return;
    await player.togglePlay();
  }, [player]);

  const nextTrack = useCallback(async () => {
    if (!player) return;
    await player.nextTrack();
  }, [player]);

  const previousTrack = useCallback(async () => {
    if (!player) return;
    await player.previousTrack();
  }, [player]);

  return {
    player,
    deviceId,
    isReady,
    error,
    playUri,
    pause,
    resume,
    togglePlay,
    nextTrack,
    previousTrack,
  };
}
