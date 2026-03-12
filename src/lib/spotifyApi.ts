/**
 * Spotify Web API calls (search). Uses access token from auth.
 */

import type { UnifiedTrack } from '../types/music';
import { getStoredToken } from './spotifyAuth';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

async function getAccessToken(): Promise<string> {
  const token = getStoredToken();
  if (!token) throw new Error('Not logged in to Spotify');
  return token.access_token;
}

/**
 * Search Spotify for tracks. Returns unified track shape for the app.
 */
export async function searchSpotifyTracks(query: string): Promise<UnifiedTrack[]> {
  if (!query.trim()) return [];

  const token = await getAccessToken();
  const params = new URLSearchParams({
    q: query.trim(),
    type: 'track',
    limit: '20',
  });

  const res = await fetch(`${SPOTIFY_API_BASE}/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Spotify session expired');
    throw new Error(`Search failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    tracks?: { items?: Array<{
      id: string;
      name: string;
      duration_ms: number;
      uri: string;
      album?: { name: string; images?: Array<{ url: string }> };
      artists?: Array<{ name: string }>;
    }>;
  };

  const items = data.tracks?.items ?? [];
  return items.map((t) => ({
    id: t.id,
    provider: 'spotify' as const,
    title: t.name,
    artist: t.artists?.map((a) => a.name).join(', ') ?? 'Unknown',
    album: t.album?.name,
    artworkUrl: t.album?.images?.[0]?.url,
    durationMs: t.duration_ms,
    spotifyUri: t.uri,
  }));
}
