import { UnifiedTrack } from '../types/music';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

function getStoredAccessToken(): string | null {
  return localStorage.getItem('spotify_access_token');
}

async function spotifyFetch(path: string, init: RequestInit = {}) {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    throw new Error('Missing Spotify access token.');
  }

  const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify API request failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function searchSpotifyTracks(query: string): Promise<UnifiedTrack[]> {
  if (!query.trim()) {
    return [];
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const data = await spotifyFetch(`/search?q=${encodedQuery}&type=track&limit=12`);

  return (data?.tracks?.items ?? []).map((item: any): UnifiedTrack => ({
    id: item.id,
    provider: 'spotify',
    title: item.name,
    artist: item.artists?.map((artist: any) => artist.name).join(', ') ?? 'Unknown Artist',
    album: item.album?.name,
    artworkUrl: item.album?.images?.[0]?.url,
    durationMs: item.duration_ms,
    spotifyUri: item.uri,
  }));
}

/**
 * The Spotify Web Playback SDK provides a browser device. Starting playback of a URI
 * happens through the Web API and targets that device_id.
 */
export async function startSpotifyPlayback(params: {
  deviceId: string;
  trackUri: string;
}) {
  const { deviceId, trackUri } = params;

  console.log('[Spotify API] startSpotifyPlayback()', {
    deviceId,
    trackUri,
  });

  await spotifyFetch(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    method: 'PUT',
    body: JSON.stringify({
      uris: [trackUri],
    }),
  });
}
