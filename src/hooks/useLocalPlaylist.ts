import { useEffect, useState } from 'react';
import { clearPlaylist, loadPlaylist, savePlaylist } from '../lib/storage';
import type { PlaylistTrack } from '../types/music';

function trackKey(track: PlaylistTrack): string {
  return `${track.provider}:${track.id}`;
}

export function useLocalPlaylist() {
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>(() => loadPlaylist());

  useEffect(() => {
    savePlaylist(playlist);
  }, [playlist]);

  const addTrack = (track: PlaylistTrack) => {
    setPlaylist((current) => {
      const exists = current.some((item) => trackKey(item) === trackKey(track));
      return exists ? current : [...current, track];
    });
  };

  const removeTrack = (track: PlaylistTrack) => {
    setPlaylist((current) => current.filter((item) => trackKey(item) !== trackKey(track)));
  };

  const clearAll = () => {
    setPlaylist([]);
    clearPlaylist();
  };

  return {
    playlist,
    addTrack,
    removeTrack,
    clearAll,
    setPlaylist,
  };
}
