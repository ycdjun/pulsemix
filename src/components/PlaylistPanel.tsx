/**
 * Right panel: current mixed playlist with add/remove/play controls.
 */

import type { PlaylistTrack } from '../types/music';

interface PlaylistPanelProps {
  tracks: PlaylistTrack[];
  currentIndex: number;
  onRemove: (index: number) => void;
  onPlayTrack: (index: number) => void;
  onClear: () => void;
}

export function PlaylistPanel({
  tracks,
  currentIndex,
  onRemove,
  onPlayTrack,
  onClear,
}: PlaylistPanelProps) {
  return (
    <div className="playlist-panel">
      <div className="playlist-panel-header">
        <h2>Playlist</h2>
        {tracks.length > 0 && (
          <button type="button" className="btn btn-small btn-ghost" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
      <ul className="playlist-list">
        {tracks.length === 0 ? (
          <li className="playlist-empty">Add tracks from search or SoundCloud samples.</li>
        ) : (
          tracks.map((track, index) => (
            <li
              key={`${track.provider}-${track.id}-${index}`}
              className={`playlist-item ${index === currentIndex ? 'is-current' : ''}`}
            >
              <button
                type="button"
                className="playlist-item-main"
                onClick={() => onPlayTrack(index)}
              >
                {track.artworkUrl ? (
                  <img src={track.artworkUrl} alt="" className="playlist-item-artwork" />
                ) : (
                  <div className="playlist-item-artwork placeholder" />
                )}
                <div className="playlist-item-info">
                  <span className="playlist-item-provider" data-provider={track.provider}>
                    {track.provider}
                  </span>
                  <span className="playlist-item-title">{track.title}</span>
                  <span className="playlist-item-artist">{track.artist}</span>
                </div>
              </button>
              <button
                type="button"
                className="playlist-item-remove"
                onClick={() => onRemove(index)}
                title="Remove from playlist"
                aria-label="Remove"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
