# PulseMix debug patch v13

This patch adds deeper Spotify diagnostics:

- logs `/me` account identity and product
- logs `/me/player/devices`
- logs token scope from stored auth token
- keeps stable auth exports and dual verifier storage for compatibility

Use local dev URL:

`http://127.0.0.1:5173/`

not `localhost`.
