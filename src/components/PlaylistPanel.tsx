import type { PlaylistTrack } from '../types/music';

interface PlaylistPanelProps {
  playlist: PlaylistTrack[];
  onPlay: (track: PlaylistTrack) => void;
  onRemove: (track: PlaylistTrack) => void;
  onClear: () => void;
}

export function PlaylistPanel({ playlist, onPlay, onRemove, onClear }: PlaylistPanelProps) {
  return (
    <section className="panel playlist-panel">
      <div className="panel-header">
        <h2>Playlist</h2>
        <button className="button ghost" onClick={onClear} disabled={!playlist.length}>
          Clear
        </button>
      </div>

      {!playlist.length ? <p className="muted">Add tracks from Spotify or SoundCloud.</p> : null}

      <div className="playlist-list">
        {playlist.map((track) => (
          <div key={`${track.provider}:${track.id}`} className="playlist-item">
            <div>
              <strong>{track.title}</strong>
              <div className="tiny">{track.artist} · {track.provider}</div>
            </div>
            <div className="track-actions">
              <button className="button" onClick={() => onPlay(track)}>Play</button>
              <button className="button ghost" onClick={() => onRemove(track)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
