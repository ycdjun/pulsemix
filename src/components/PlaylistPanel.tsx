import type { PlaylistTrack } from '../types/music';

interface PlaylistPanelProps {
  tracks: PlaylistTrack[];
  currentTrack: PlaylistTrack | null;
  onSelect: (track: PlaylistTrack) => void;
  onRemove: (track: PlaylistTrack) => void;
  onClear: () => void;
}

export function PlaylistPanel({ tracks, currentTrack, onSelect, onRemove, onClear }: PlaylistPanelProps) {
  return (
    <aside className="playlist-column panel">
      <div className="playlist-header">
        <div>
          <h2>Mixed playlist</h2>
          <p className="muted">{tracks.length} saved tracks</p>
        </div>
        <button className="button button-secondary" onClick={onClear} disabled={!tracks.length}>
          Clear
        </button>
      </div>

      <div className="playlist-list">
        {tracks.length === 0 ? (
          <p className="muted">Add tracks from Spotify or SoundCloud to build your playlist.</p>
        ) : (
          tracks.map((track) => {
            const isActive = currentTrack?.provider === track.provider && currentTrack.id === track.id;
            return (
              <div key={`${track.provider}-${track.id}`} className={`playlist-item ${isActive ? 'playlist-item-active' : ''}`}>
                <button className="playlist-select" onClick={() => onSelect(track)}>
                  <strong>{track.title}</strong>
                  <span>{track.artist}</span>
                </button>
                <button className="playlist-remove" onClick={() => onRemove(track)} aria-label={`Remove ${track.title}`}>
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
