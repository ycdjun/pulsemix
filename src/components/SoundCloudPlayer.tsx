interface SoundCloudPlayerProps {
  url: string | null | undefined;
}

export function SoundCloudPlayer({ url }: SoundCloudPlayerProps) {
  if (!url) return null;

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%230f172a&auto_play=true`;

  return (
    <section className="panel">
      <h2>SoundCloud Player</h2>
      <iframe
        title="SoundCloud player"
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embedUrl}
      />
    </section>
  );
}
