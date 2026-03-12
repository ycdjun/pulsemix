import type { PlaylistTrack } from '../types/music';

interface PlayerBarProps {
  currentTrack: PlaylistTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function PlayerBar({ currentTrack, isPlaying, onTogglePlay }: PlayerBarProps) {
  return (
    <footer className="player-bar">
      <div>
        <p className="player-label">Now playing</p>
        <h3>{currentTrack?.title ?? 'Nothing selected yet'}</h3>
        <p className="muted">{currentTrack ? `${currentTrack.artist} • ${currentTrack.provider}` : 'Pick a track from your playlist.'}</p>
      </div>

      <button className="button button-primary" onClick={onTogglePlay} disabled={!currentTrack}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </footer>
  );
}
