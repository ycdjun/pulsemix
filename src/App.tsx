import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import TrackCard from './components/TrackCard';
import PlaylistPanel from './components/PlaylistPanel';
import PlayerBar from './components/PlayerBar';
import SoundCloudPlayer from './components/SoundCloudPlayer';
import { soundcloudSamples } from './data/soundcloudSamples';
import { useLocalPlaylist } from './hooks/useLocalPlaylist';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import { searchSpotifyTracks } from './lib/spotifyApi';
import { PlaylistTrack, UnifiedTrack } from './types/music';

function App() {
  const { accessToken, isAuthenticated, isLoading, error: authError, login, logout } = useSpotifyAuth();
  const spotifyPlayer = useSpotifyPlayer({ accessToken });
  const { playlist, addTrack, removeTrack, clearAll } = useLocalPlaylist();

  const [query, setQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState<UnifiedTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(playlist[0] ?? null);

  useEffect(() => {
    if (!currentTrack && playlist.length > 0) {
      setCurrentTrack(playlist[0]);
    }
  }, [playlist, currentTrack]);

  useEffect(() => {
    if (!isAuthenticated || !query.trim()) {
      setSpotifyResults([]);
      setSearchError(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);
        const results = await searchSpotifyTracks(query);
        setSpotifyResults(results);
      } catch (error) {
        console.error('[PulseMix] Spotify search failed', error);
        setSearchError(error instanceof Error ? error.message : 'Spotify search failed.');
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, query]);

  const combinedResults = useMemo(() => {
    const localSamples = soundcloudSamples.filter((track) => {
      if (!query.trim()) return true;
      const haystack = `${track.title} ${track.artist} ${track.album ?? ''}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });

    return [...localSamples, ...spotifyResults];
  }, [query, spotifyResults]);

  const handleSelectTrack = async (track: PlaylistTrack) => {
    setCurrentTrack(track);

    if (track.provider === 'spotify' && track.spotifyUri) {
      try {
        await spotifyPlayer.playUri(track.spotifyUri);
      } catch (error) {
        console.error('[PulseMix] Spotify play failed', error);
      }
    }
  };

  return (
    <div className="app-shell">
      <aside className="left-column">
        <Sidebar
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          authError={authError}
          onLogin={login}
          onLogout={logout}
        />
      </aside>

      <main className="main-column">
        <SearchBar
          value={query}
          onChange={setQuery}
          isSpotifyEnabled={isAuthenticated}
          isSearching={isSearching}
        />

        {searchError ? <div className="status-banner error">{searchError}</div> : null}
        {spotifyPlayer.error ? <div className="status-banner error">{spotifyPlayer.error}</div> : null}
        {!spotifyPlayer.isReady && isAuthenticated ? (
          <div className="status-banner">Spotify player is connecting...</div>
        ) : null}

        <section className="track-grid">
          {combinedResults.map((track) => (
            <TrackCard
              key={`${track.provider}-${track.id}`}
              track={track}
              onAdd={() => addTrack(track)}
              onPlay={() => handleSelectTrack(track)}
            />
          ))}
        </section>
      </main>

      <aside className="right-column">
        <PlaylistPanel
          playlist={playlist}
          currentTrack={currentTrack}
          onPlayTrack={handleSelectTrack}
          onRemoveTrack={removeTrack}
          onClearAll={clearAll}
        />

        {currentTrack?.provider === 'soundcloud' && currentTrack.soundcloudUrl ? (
          <SoundCloudPlayer trackUrl={currentTrack.soundcloudUrl} />
        ) : null}
      </aside>

      <footer className="player-row">
        <PlayerBar
          track={currentTrack}
          isSpotifyReady={spotifyPlayer.isReady}
          onPause={spotifyPlayer.pause}
          onResume={spotifyPlayer.resume}
          onTogglePlay={spotifyPlayer.togglePlay}
          onNext={spotifyPlayer.nextTrack}
          onPrevious={spotifyPlayer.previousTrack}
        />
      </footer>
    </div>
  );
}

export default App;
