# PulseMix

A frontend-only music app that mixes **Spotify** and **SoundCloud** in one playlist. Built with React, TypeScript, and Vite. Deploys to GitHub Pages.

## What it does

- **Spotify**: Log in with PKCE OAuth (no backend), search tracks, play via Web Playback SDK
- **SoundCloud**: Add sample tracks from a built-in list; play via embedded widget
- **Playlist**: One mixed list of Spotify + SoundCloud tracks, saved in `localStorage`
- **Single-page app**: No router; GitHub Pages compatible

## Run locally

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/pulsemix.git
cd pulsemix
npm install
```

### Spotify (optional)

To use Spotify search and playback, add a `.env` file in the project root:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/
```

For local dev, use `http://localhost:5173/` as the redirect URI. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and add that redirect URI there.

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You can still add and play SoundCloud sample tracks without logging into Spotify.

## Deploy to GitHub Pages

### 1. Push your code

Push the repo to GitHub (e.g. `https://github.com/YOUR_USERNAME/pulsemix`).

### 2. Configure Spotify for production (optional)

In the Spotify Dashboard, add your GitHub Pages URL as a redirect URI:

- `https://YOUR_USERNAME.github.io/pulsemix/`

Use the same Client ID in your env (see below for deploy-time config).

### 3. Deploy the app

From your machine (with the repo cloned and env set if you use Spotify):

```bash
npm run deploy
```

This runs `npm run build` and publishes the `dist` folder to the `gh-pages` branch.

### 4. Turn on GitHub Pages

1. On GitHub: **Settings** → **Pages**
2. Under **Build and deployment**, choose **Deploy from a branch**
3. Branch: **gh-pages** / **/(root)**
4. Save

After a minute or two, the app is available at:

**https://YOUR_USERNAME.github.io/pulsemix/**

### Deploying with Spotify env vars

GitHub Pages serves static files, so there is no server to read `.env`. To use Spotify in production:

- Use **GitHub Actions** to build with secrets (e.g. `VITE_SPOTIFY_CLIENT_ID`, `VITE_SPOTIFY_REDIRECT_URI`) and then deploy the built `dist` to `gh-pages`, or  
- Build locally with your `.env` and run `npm run deploy`; your Client ID and redirect URI are baked into the built JS (Client ID is public; redirect URI must match the GitHub Pages URL).

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server (localhost)    |
| `npm run build`| Type-check and build for prod  |
| `npm run deploy`| Build and publish to GitHub Pages |
| `npm run preview` | Serve the built app locally |
| `npm run lint` | Run ESLint                     |

## Repo layout

- `src/components/` – Sidebar, SearchBar, TrackCard, PlaylistPanel, PlayerBar, SoundCloudPlayer  
- `src/hooks/` – useLocalPlaylist, useSpotifyAuth, useSpotifyPlayer  
- `src/lib/` – spotifyAuth (PKCE), spotifyApi (search), storage (localStorage)  
- `src/types/music.ts` – Shared types  
- `src/data/soundcloudSamples.ts` – Sample SoundCloud tracks  
- Vite is configured with `base: '/pulsemix/'` for GitHub Pages.
