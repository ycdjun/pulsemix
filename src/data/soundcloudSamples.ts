/**
 * Hardcoded public SoundCloud sample tracks for PulseMix.
 * No SoundCloud OAuth; these are public tracks used for demo/mixing.
 * Replace with your own public track URLs if desired.
 */

import type { UnifiedTrack } from '../types/music';

export const soundcloudSamples: UnifiedTrack[] = [
  {
    id: 'sc-demo-1',
    provider: 'soundcloud',
    title: 'Cipher',
    artist: 'Kevin MacLeod',
    artworkUrl: 'https://i1.sndcdn.com/artworks-000072126799-6e0z41-t500x500.jpg',
    durationMs: 164000,
    soundcloudUrl: 'https://soundcloud.com/kevinmacleod/cipher',
  },
  {
    id: 'sc-demo-2',
    provider: 'soundcloud',
    title: 'Funkorama',
    artist: 'Kevin MacLeod',
    artworkUrl: 'https://i1.sndcdn.com/artworks-000072126799-6e0z41-t500x500.jpg',
    durationMs: 208000,
    soundcloudUrl: 'https://soundcloud.com/kevinmacleod/funkorama',
  },
  {
    id: 'sc-demo-3',
    provider: 'soundcloud',
    title: 'Carefree',
    artist: 'Kevin MacLeod',
    artworkUrl: 'https://i1.sndcdn.com/artworks-000072126799-6e0z41-t500x500.jpg',
    durationMs: 228000,
    soundcloudUrl: 'https://soundcloud.com/kevinmacleod/carefree',
  },
];
