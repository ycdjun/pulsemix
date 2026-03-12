/**
 * SoundCloud embedded player (iframe widget).
 * Renders when the current track is from SoundCloud; hidden otherwise.
 * We use the standard SoundCloud widget URL format.
 */

interface SoundCloudPlayerProps {
  /** SoundCloud track page URL (e.g. https://soundcloud.com/artist/track-name) */
  trackUrl: string | null;
  /** Whether this track is currently active (we may still render hidden to keep state) */
  isActive: boolean;
  onEnded?: () => void;
}

/**
 * SoundCloud embed: use the widget URL.
 * Format: https://w.soundcloud.com/player/?url=<encoded-track-url>&auto_play=true&hide_related=true
 * We don't get precise "ended" events from the iframe without postMessage; for simplicity we don't implement it.
 */
export function SoundCloudPlayer({ trackUrl, isActive, onEnded }: SoundCloudPlayerProps) {
  if (!trackUrl) return null;

  const encodedUrl = encodeURIComponent(trackUrl);
  const widgetUrl = `https://w.soundcloud.com/player/?url=${encodedUrl}&auto_play=${isActive}&hide_related=true&show_comments=false`;

  return (
    <div className="soundcloud-player" aria-hidden={!isActive} style={{ display: isActive ? 'block' : 'none' }}>
      <iframe
        title="SoundCloud player"
        src={widgetUrl}
        width="100%"
        height="166"
        allow="autoplay"
        style={{ border: 0 }}
      />
      {/* onEnded would require SoundCloud widget API; not implemented for simplicity */}
    </div>
  );
}
