export type MusicProvider = 'spotify' | 'soundcloud';

export interface UnifiedTrack {
  id: string;
  provider: MusicProvider;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  spotifyUri?: string;
  soundcloudUrl?: string;
}

export type PlaylistTrack = UnifiedTrack;

export interface PlayerState {
  currentTrack: PlaylistTrack | null;
  isPlaying: boolean;
  progressMs: number;
}
