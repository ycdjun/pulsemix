/**
 * localStorage helpers for PulseMix.
 * Playlist and any other persisted state live here.
 */

import type { PlaylistTrack } from '../types/music';

const PLAYLIST_KEY = 'pulsemix-playlist';

/**
 * Load the saved playlist from localStorage.
 * Returns empty array if nothing saved or parse fails.
 */
export function loadPlaylist(): PlaylistTrack[] {
  try {
    const raw = localStorage.getItem(PLAYLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Basic shape check: each item should have id, provider, title, artist
    return parsed.filter(
      (item): item is PlaylistTrack =>
        item &&
        typeof item === 'object' &&
        typeof (item as PlaylistTrack).id === 'string' &&
        typeof (item as PlaylistTrack).provider === 'string' &&
        typeof (item as PlaylistTrack).title === 'string' &&
        typeof (item as PlaylistTrack).artist === 'string'
    );
  } catch {
    return [];
  }
}

/**
 * Save the playlist to localStorage.
 */
export function savePlaylist(tracks: PlaylistTrack[]): void {
  try {
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(tracks));
  } catch {
    // Quota or other storage error; fail silently for now
  }
}
