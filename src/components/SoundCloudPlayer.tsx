import type { PlaylistTrack } from '../types/music';

interface SoundCloudPlayerProps {
  track: PlaylistTrack | null;
}

export function SoundCloudPlayer({ track }: SoundCloudPlayerProps) {
  if (!track || track.provider !== 'soundcloud' || !track.embedUrl) {
    return (
      <div className="panel embed-panel">
        <h2>SoundCloud player</h2>
        <p className="muted">Select a SoundCloud track in the playlist to render the embed player here.</p>
      </div>
    );
  }

  return (
    <div className="panel embed-panel">
      <h2>SoundCloud player</h2>
      <iframe
        title={`SoundCloud player for ${track.title}`}
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={track.embedUrl}
      />
    </div>
  );
}
