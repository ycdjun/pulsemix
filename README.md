# PulseMix

PulseMix is a frontend-only React + TypeScript + Vite music app prototype that combines Spotify login/search/playback with SoundCloud sample tracks in one mixed playlist.

## Local development

Create a `.env` file in the project root:

```env
VITE_SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
```

Important: for local Spotify login, always open the app at:

```text
http://127.0.0.1:5173/
```

Do not use `localhost` for local Spotify testing. `localhost` and `127.0.0.1` use different browser storage origins, which can break the PKCE verifier flow.

Your Spotify app should include both redirect URIs:

- `http://127.0.0.1:5173/`
- `https://ycdjun.github.io/pulsemix/`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run deploy`
