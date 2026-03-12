/**
 * Bottom player bar: track info, provider badge, play/pause/prev/next, progress.
 * This is the shared UI; actual playback is handled by Spotify SDK or SoundCloud embed.
 */

import type { PlaylistTrack } from '../types/music';

interface PlayerBarProps {
  currentTrack: PlaylistTrack | null;
  isPlaying: boolean;
  progressSeconds: number;
  durationSeconds: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** Whether the underlying player (Spotify or SoundCloud) is ready for the current provider */
  canControlPlayback: boolean;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PlayerBar({
  currentTrack,
  isPlaying,
  progressSeconds,
  durationSeconds,
  onPlayPause,
  onPrev,
  onNext,
  canControlPlayback,
}: PlayerBarProps) {
  const hasTrack = currentTrack != null;
  const duration = durationSeconds > 0 ? durationSeconds : (currentTrack?.durationMs ?? 0) / 1000;

  return (
    <footer className="player-bar">
      <div className="player-bar-track">
        {hasTrack ? (
          <>
            {currentTrack.artworkUrl ? (
              <img src={currentTrack.artworkUrl} alt="" className="player-bar-artwork" />
            ) : (
              <div className="player-bar-artwork placeholder" />
            )}
            <div className="player-bar-meta">
              <span className="player-bar-provider" data-provider={currentTrack.provider}>
                {currentTrack.provider}
              </span>
              <span className="player-bar-title">{currentTrack.title}</span>
              <span className="player-bar-artist">{currentTrack.artist}</span>
            </div>
          </>
        ) : (
          <div className="player-bar-meta">
            <span className="player-bar-title">No track selected</span>
          </div>
        )}
      </div>

      <div className="player-bar-controls">
        <button
          type="button"
          className="player-bar-btn"
          onClick={onPrev}
          disabled={!hasTrack || !canControlPlayback}
          aria-label="Previous"
        >
          ⏮
        </button>
        <button
          type="button"
          className="player-bar-btn player-bar-btn-play"
          onClick={onPlayPause}
          disabled={!hasTrack || !canControlPlayback}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          className="player-bar-btn"
          onClick={onNext}
          disabled={!hasTrack || !canControlPlayback}
          aria-label="Next"
        >
          ⏭
        </button>
      </div>

      <div className="player-bar-progress">
        <span className="player-bar-time">{formatTime(progressSeconds)}</span>
        <div className="player-bar-progress-bar">
          <div
            className="player-bar-progress-fill"
            style={{
              width: duration > 0 ? `${(progressSeconds / duration) * 100}%` : '0%',
            }}
          />
        </div>
        <span className="player-bar-time">{formatTime(duration)}</span>
      </div>
    </footer>
  );
}
