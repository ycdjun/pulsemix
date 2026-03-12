/**
 * Single track result card: artwork, title, artist, add button.
 */

import type { UnifiedTrack } from '../types/music';

interface TrackCardProps {
  track: UnifiedTrack;
  onAdd: (track: UnifiedTrack) => void;
  /** Optional: show a "in playlist" state and disable add */
  isInPlaylist?: boolean;
}

export function TrackCard({ track, onAdd, isInPlaylist }: TrackCardProps) {
  return (
    <div className="track-card">
      <div className="track-card-artwork">
        {track.artworkUrl ? (
          <img src={track.artworkUrl} alt="" />
        ) : (
          <div className="track-card-artwork-placeholder" />
        )}
      </div>
      <div className="track-card-info">
        <span className="track-card-provider" data-provider={track.provider}>
          {track.provider}
        </span>
        <h3 className="track-card-title">{track.title}</h3>
        <p className="track-card-artist">{track.artist}</p>
        {track.album && <p className="track-card-album">{track.album}</p>}
      </div>
      <div className="track-card-actions">
        <button
          type="button"
          className="btn btn-small"
          onClick={() => onAdd(track)}
          disabled={isInPlaylist}
          title={isInPlaylist ? 'Already in playlist' : 'Add to playlist'}
        >
          {isInPlaylist ? 'Added' : '+ Add'}
        </button>
      </div>
    </div>
  );
}
