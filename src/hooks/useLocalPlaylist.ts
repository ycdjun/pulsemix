/**
 * Hook to manage the mixed playlist with localStorage persistence.
 * Loads on mount, saves on every change.
 */

import { useState, useEffect, useCallback } from 'react';
import type { PlaylistTrack, UnifiedTrack } from '../types/music';
import { loadPlaylist, savePlaylist } from '../lib/storage';

export function useLocalPlaylist() {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setTracks(loadPlaylist());
    setHydrated(true);
  }, []);

  // Persist whenever tracks change (after initial load)
  useEffect(() => {
    if (!hydrated) return;
    savePlaylist(tracks);
  }, [tracks, hydrated]);

  const addTrack = useCallback((track: UnifiedTrack) => {
    setTracks((prev) => [...prev, track]);
  }, []);

  const removeTrack = useCallback((index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPlaylist = useCallback(() => {
    setTracks([]);
  }, []);

  const moveTrack = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setTracks((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  return {
    tracks,
    addTrack,
    removeTrack,
    clearPlaylist,
    moveTrack,
    hydrated,
  };
}
