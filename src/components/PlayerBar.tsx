import type { PlaylistTrack } from '../types/music';

interface PlayerBarProps {
  currentTrack: PlaylistTrack | null;
  message?: string | null;
  onPrev?: () => void;
  onNext?: () => void;
  onToggle?: () => void;
}

export function PlayerBar({ currentTrack, message, onPrev, onNext, onToggle }: PlayerBarProps) {
  return (
    <footer className="player-bar">
      <div>
        <strong>{currentTrack ? currentTrack.title : 'Nothing playing'}</strong>
        <div className="tiny">
          {currentTrack ? `${currentTrack.artist} · ${currentTrack.provider}` : 'Choose a track to start playback.'}
        </div>
      </div>
      <div className="track-actions">
        <button className="button ghost" onClick={onPrev}>Prev</button>
        <button className="button" onClick={onToggle}>Toggle</button>
        <button className="button ghost" onClick={onNext}>Next</button>
      </div>
      {message ? <div className="error">{message}</div> : null}
    </footer>
  );
}
