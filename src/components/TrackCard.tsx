import type { UnifiedTrack } from '../types/music';

interface TrackCardProps {
  track: UnifiedTrack;
  onAdd: (track: UnifiedTrack) => void;
  canPlay?: boolean;
}

function formatDuration(durationMs?: number): string {
  if (!durationMs) return '—';
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function TrackCard({ track, onAdd, canPlay = true }: TrackCardProps) {
  return (
    <article className="track-card">
      <div className="track-artwork">
        {track.artworkUrl ? <img src={track.artworkUrl} alt={track.title} /> : <span>{track.provider === 'spotify' ? 'S' : 'C'}</span>}
      </div>

      <div className="track-copy">
        <div className="track-topline">
          <h3>{track.title}</h3>
          <span className={`provider-badge provider-${track.provider}`}>{track.provider}</span>
        </div>
        <p>{track.artist}</p>
        <small>
          {track.album ?? 'Single'} • {formatDuration(track.durationMs)}
        </small>
      </div>

      <button className="button button-secondary" onClick={() => onAdd(track)} disabled={!canPlay}>
        Add
      </button>
    </article>
  );
}
