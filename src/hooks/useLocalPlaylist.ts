import { useEffect, useMemo, useState } from 'react';
import { clearPlaylist as clearPlaylistStorage, loadPlaylist, savePlaylist } from '../lib/storage';
import type { PlaylistTrack } from '../types/music';

function getTrackKey(track: Pick<PlaylistTrack, 'provider' | 'id'>): string {
  return `${track.provider}:${track.id}`;
}

export function useLocalPlaylist() {
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>(() => loadPlaylist());

  useEffect(() => {
    savePlaylist(playlist);
  }, [playlist]);

  const playlistKeys = useMemo(() => new Set(playlist.map(getTrackKey)), [playlist]);

  function addTrack(track: PlaylistTrack) {
    const key = getTrackKey(track);
    if (playlistKeys.has(key)) return;
    setPlaylist((current) => [...current, track]);
  }

  function removeTrack(track: Pick<PlaylistTrack, 'provider' | 'id'>) {
    const keyToRemove = getTrackKey(track);
    setPlaylist((current) => current.filter((item) => getTrackKey(item) !== keyToRemove));
  }

  function clearAll() {
    setPlaylist([]);
    clearPlaylistStorage();
  }

  return {
    playlist,
    addTrack,
    removeTrack,
    clearAll,
  };
}
