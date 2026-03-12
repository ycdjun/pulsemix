/**
 * PulseMix: main app orchestration.
 * - Sidebar: Spotify login, status
 * - Main: search bar, provider filter, search results (Spotify + SoundCloud samples)
 * - Right panel: playlist with play/remove
 * - Bottom: player bar; playback is Spotify Web SDK or SoundCloud embed depending on current track
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import { useLocalPlaylist } from './hooks/useLocalPlaylist';
import { searchSpotifyTracks } from './lib/spotifyApi';
import { soundcloudSamples } from './data/soundcloudSamples';
import type { UnifiedTrack, PlaylistTrack } from './types/music';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { TrackCard } from './components/TrackCard';
import { PlaylistPanel } from './components/PlaylistPanel';
import { PlayerBar } from './components/PlayerBar';
import { SoundCloudPlayer } from './components/SoundCloudPlayer';

export default function App() {
  const { isLoggedIn: isSpotifyLoggedIn, isHandlingCallback, error: spotifyError, login, logout } = useSpotifyAuth();
  const {
    isReady: spotifyPlayerReady,
    playSpotifyUri,
    pause: spotifyPause,
    resume: spotifyResume,
    getState: getSpotifyState,
  } = useSpotifyPlayer(isSpotifyLoggedIn);

  const { tracks: playlistTracks, addTrack, removeTrack, clearPlaylist, hydrated } = useLocalPlaylist();

  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<'spotify' | 'soundcloud' | 'all'>('all');
  const [searchResults, setSearchResults] = useState<UnifiedTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Player state: which track is selected and whether we're "playing" (UI + actual playback)
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTrack: PlaylistTrack | null = currentIndex >= 0 && currentIndex < playlistTracks.length
    ? playlistTracks[currentIndex]
    : null;
  const isSpotify = currentTrack?.provider === 'spotify';
  const isSoundCloud = currentTrack?.provider === 'soundcloud';

  // When playing Spotify, poll progress from Web Playback SDK
  useEffect(() => {
    if (!isPlaying || !isSpotify) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }
    const tick = async () => {
      const state = await getSpotifyState();
      if (state) setProgressSeconds(state.position / 1000);
    };
    tick();
    progressIntervalRef.current = setInterval(tick, 1000);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, isSpotify, getSpotifyState]);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim() || !isSpotifyLoggedIn) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const spotifyTracks = await searchSpotifyTracks(searchQuery);
      const soundcloud = soundcloudSamples.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const combined: UnifiedTrack[] = [...spotifyTracks, ...soundcloud];
      setSearchResults(combined);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, isSpotifyLoggedIn]);

  // Initial load: show SoundCloud samples as default "results" so user can add without searching
  useEffect(() => {
    if (hydrated && searchResults.length === 0 && !searchQuery.trim()) {
      setSearchResults(soundcloudSamples);
    }
  }, [hydrated, searchQuery, searchResults.length]);

  const filteredResults =
    providerFilter === 'all'
      ? searchResults
      : searchResults.filter((t) => t.provider === providerFilter);

  const playTrackByIndex = useCallback(
    async (index: number) => {
      if (index < 0 || index >= playlistTracks.length) return;
      const track = playlistTracks[index];
      setCurrentIndex(index);
      setProgressSeconds(0);

      if (track.provider === 'spotify' && track.spotifyUri) {
        if (spotifyPlayerReady) {
          try {
            await playSpotifyUri(track.spotifyUri);
            setIsPlaying(true);
          } catch {
            setIsPlaying(false);
          }
        } else {
          setIsPlaying(false);
        }
      } else if (track.provider === 'soundcloud') {
        // SoundCloud: we'll show the embed with the new URL; autoplay is handled by SoundCloudPlayer
        setIsPlaying(true);
      }
    },
    [playlistTracks, spotifyPlayerReady, playSpotifyUri]
  );

  const handlePlayPause = useCallback(async () => {
    if (!currentTrack) return;
    if (currentTrack.provider === 'spotify') {
      if (isPlaying) {
        await spotifyPause();
        setIsPlaying(false);
      } else {
        await spotifyResume();
        setIsPlaying(true);
      }
    }
    // SoundCloud: play/pause is inside the iframe; we don't control it from outside easily.
    // So we only toggle isPlaying for UI; actual control is in the embed.
    if (currentTrack.provider === 'soundcloud') {
      setIsPlaying((p) => !p);
    }
  }, [currentTrack, isPlaying, spotifyPause, spotifyResume]);

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) return;
    const nextIndex = currentIndex - 1;
    playTrackByIndex(nextIndex);
  }, [currentIndex, playTrackByIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= playlistTracks.length - 1) return;
    playTrackByIndex(currentIndex + 1);
  }, [currentIndex, playlistTracks.length, playTrackByIndex]);

  const canControlPlayback =
    isSpotify ? spotifyPlayerReady : true; // SoundCloud embed is always "ready" from our POV

  const soundcloudUrl = isSoundCloud && currentTrack?.soundcloudUrl ? currentTrack.soundcloudUrl : null;

  const playlistIds = new Set(playlistTracks.map((t) => `${t.provider}-${t.id}`));
  const isInPlaylist = (t: UnifiedTrack) => playlistIds.has(`${t.provider}-${t.id}`);

  return (
    <div className="app">
      <Sidebar
        isSpotifyLoggedIn={isSpotifyLoggedIn}
        isHandlingCallback={isHandlingCallback}
        spotifyError={spotifyError}
        onLogin={login}
        onLogout={logout}
      />

      <main className="main">
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          providerFilter={providerFilter}
          onProviderFilterChange={setProviderFilter}
          onSearch={performSearch}
          isSearching={isSearching}
          spotifyLoggedIn={isSpotifyLoggedIn}
        />
        {searchError && <p className="search-error">{searchError}</p>}
        <div className="search-results">
          {filteredResults.map((track) => (
            <TrackCard
              key={`${track.provider}-${track.id}`}
              track={track}
              onAdd={addTrack}
              isInPlaylist={isInPlaylist(track)}
            />
          ))}
        </div>
      </main>

      <PlaylistPanel
        tracks={playlistTracks}
        currentIndex={currentIndex}
        onRemove={removeTrack}
        onPlayTrack={playTrackByIndex}
        onClear={clearPlaylist}
      />

      {/* SoundCloud embed: only active when current track is SoundCloud */}
      <SoundCloudPlayer
        trackUrl={soundcloudUrl}
        isActive={isSoundCloud && isPlaying}
        onEnded={handleNext}
      />

      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progressSeconds={progressSeconds}
        durationSeconds={currentTrack?.durationMs ? currentTrack.durationMs / 1000 : 0}
        onPlayPause={handlePlayPause}
        onPrev={handlePrev}
        onNext={handleNext}
        canControlPlayback={canControlPlayback}
      />
    </div>
  );
}
