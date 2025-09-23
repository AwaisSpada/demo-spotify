# Next.js + Spotify Web Playback Starter

A Next.js 14 + TypeScript app using NextAuth v5 to authenticate with Spotify,
fetch user playlists, and integrate the Spotify Web Playback SDK.

## Prerequisites
- Node 18+
- Spotify Developer App
- Redirect URI: `http://localhost:3000/api/auth/callback/spotify`

## Env (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-strong-random-string
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify
```

## Install & Run
```bash
npm install
npm run dev
```

## Notes
- Scopes include playlist read and playback control. Full playback requires Spotify Premium.
- Basic UI: sign in/out, playlists grid, tracks list, and simple player controls.
- Web Playback SDK is initialized in the browser; on first play, Spotify may ask to transfer playback.
