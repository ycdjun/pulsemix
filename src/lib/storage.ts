import type { PlaylistTrack } from '../types/music';

const PLAYLIST_STORAGE_KEY = 'pulsemix-playlist';

export function loadPlaylist(): PlaylistTrack[] {
  try {
    const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePlaylist(tracks: PlaylistTrack[]): void {
  localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(tracks));
}

export function clearPlaylist(): void {
  localStorage.removeItem(PLAYLIST_STORAGE_KEY);
}
