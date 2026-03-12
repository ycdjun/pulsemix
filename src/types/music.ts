/**
 * PulseMix music types
 * Unified types for Spotify and SoundCloud tracks and player state.
 */

/** Supported music providers. */
export type MusicProvider = 'spotify' | 'soundcloud';

/**
 * A single track that can come from Spotify or SoundCloud.
 * Used in search results and in the mixed playlist.
 */
export interface UnifiedTrack {
  id: string;
  provider: MusicProvider;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  /** Spotify track URI (e.g. spotify:track:xxx). Required when provider is spotify. */
  spotifyUri?: string;
  /** SoundCloud track/widget URL. Required when provider is soundcloud. */
  soundcloudUrl?: string;
}

/**
 * A track as stored in the playlist, with optional playlist-specific data.
 * We use the same shape as UnifiedTrack for simplicity; index in array is the position.
 */
export type PlaylistTrack = UnifiedTrack;

/**
 * Current player state for the bottom bar.
 * Tracks what is playing, from which provider, and playback progress.
 */
export interface PlayerState {
  /** The track currently selected for playback (or last played). */
  currentTrack: PlaylistTrack | null;
  /** Index in the playlist; -1 if nothing selected. */
  currentIndex: number;
  /** Whether audio is currently playing. */
  isPlaying: boolean;
  /** Progress in seconds (for display). */
  progressSeconds: number;
  /** Total duration in seconds (for display). */
  durationSeconds: number;
}
