import type { UnifiedTrack } from '../types/music';

interface TrackCardProps {
  track: UnifiedTrack;
  onAdd: (track: UnifiedTrack) => void;
  onPlay: (track: UnifiedTrack) => void;
}

export function TrackCard({ track, onAdd, onPlay }: TrackCardProps) {
  return (
    <div className="track-card">
      <div className="artwork">
        {track.artworkUrl ? <img src={track.artworkUrl} alt={track.title} /> : <span>{track.provider[0].toUpperCase()}</span>}
      </div>
      <div className="track-meta">
        <strong>{track.title}</strong>
        <span>{track.artist}</span>
        <span className="tiny">{track.provider === 'spotify' ? 'Spotify' : 'SoundCloud'}</span>
      </div>
      <div className="track-actions">
        <button className="button" onClick={() => onPlay(track)}>Play</button>
        <button className="button ghost" onClick={() => onAdd(track)}>Add</button>
      </div>
    </div>
  );
}
