import { useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { TrackCard } from './components/TrackCard';
import { PlaylistPanel } from './components/PlaylistPanel';
import { PlayerBar } from './components/PlayerBar';
import { SoundCloudPlayer } from './components/SoundCloudPlayer';
import { soundcloudSamples } from './data/soundcloudSamples';
import { useLocalPlaylist } from './hooks/useLocalPlaylist';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { searchSpotifyTracks } from './lib/spotifyApi';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import type { PlaylistTrack, UnifiedTrack } from './types/music';

function App() {
  const [query, setQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState<UnifiedTrack[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(null);
  const [uiMessage, setUiMessage] = useState<string | null>(null);

  const spotifyAuth = useSpotifyAuth();
  const spotifyPlayer = useSpotifyPlayer(spotifyAuth.token);
  const { playlist, addTrack, removeTrack, clearAll } = useLocalPlaylist();

  const visibleResults = useMemo(
    () => [...soundcloudSamples, ...spotifyResults],
    [spotifyResults]
  );

  const handleSearch = async () => {
    if (!spotifyAuth.token || !query.trim()) return;
    try {
      setSearchError(null);
      const results = await searchSpotifyTracks(spotifyAuth.token, query.trim());
      setSpotifyResults(results);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Spotify search failed.');
    }
  };

  const handlePlay = async (track: UnifiedTrack) => {
    setCurrentTrack(track);
    setUiMessage(null);

    if (track.provider === 'spotify') {
      if (!track.spotifyUri) {
        setUiMessage('Missing Spotify URI for this track.');
        return;
      }

      try {
        await spotifyPlayer.playUri(track.spotifyUri);
        setUiMessage('Spotify playback started.');
      } catch (error) {
        setUiMessage(error instanceof Error ? error.message : 'Spotify playback failed.');
      }
      return;
    }

    if (track.provider === 'soundcloud') {
      setUiMessage('SoundCloud playback loaded in the embedded player.');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        isAuthenticated={spotifyAuth.isAuthenticated}
        isLoading={spotifyAuth.isLoading}
        authError={spotifyAuth.authError}
        onLogin={() => void spotifyAuth.login()}
        onLogout={spotifyAuth.logout}
      />

      <main className="main-content">
        <section className="panel">
          <h2>Discover</h2>
          <p className="muted">
            SoundCloud samples are always visible. Spotify search is enabled after login.
          </p>
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={() => void handleSearch()}
            disabled={!spotifyAuth.isAuthenticated}
          />
          {searchError ? <p className="error">{searchError}</p> : null}
        </section>

        <section className="results-grid">
          {visibleResults.map((track) => (
            <TrackCard
              key={`${track.provider}:${track.id}`}
              track={track}
              onAdd={addTrack}
              onPlay={(nextTrack) => void handlePlay(nextTrack)}
            />
          ))}
        </section>

        <SoundCloudPlayer url={currentTrack?.provider === 'soundcloud' ? currentTrack.soundcloudUrl : null} />
      </main>

      <div className="right-rail">
        <PlaylistPanel
          playlist={playlist}
          onPlay={(track) => void handlePlay(track)}
          onRemove={removeTrack}
          onClear={clearAll}
        />

        <section className="panel">
          <h2>Debug</h2>
          <ul className="hint-list">
            <li>Spotify logged in: {String(spotifyAuth.isAuthenticated)}</li>
            <li>Spotify device ready: {String(spotifyPlayer.isReady)}</li>
            <li>Spotify device id: {spotifyPlayer.deviceId ?? 'none'}</li>
            <li>Current track: {currentTrack ? `${currentTrack.title} (${currentTrack.provider})` : 'none'}</li>
          </ul>
          {spotifyPlayer.playerError ? <p className="error">{spotifyPlayer.playerError}</p> : null}
        </section>
      </div>

      <PlayerBar
        currentTrack={currentTrack}
        message={uiMessage}
        onPrev={() => void spotifyPlayer.previousTrack()}
        onNext={() => void spotifyPlayer.nextTrack()}
        onToggle={() => void spotifyPlayer.togglePlay()}
      />
    </div>
  );
}

export default App;
