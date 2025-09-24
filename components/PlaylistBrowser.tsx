'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type Playlist = {
  id: string; name: string; images?: { url: string }[]; tracks?: { total: number };
};

type TrackItem = {
  track: {
    id: string;
    name: string;
    uri: string;
    album: { images?: { url: string }[] };
    artists: { name: string }[];
  } | null;
};

export default function PlaylistBrowser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const uris = useMemo(() => tracks.map(t => t.track?.uri).filter(Boolean) as string[], [tracks]);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/spotify/playlists');
        if (!res.ok) throw new Error('Failed to load playlists');
        const data = await res.json();
        setPlaylists(data.items || []);
      } catch (e: any) {
        setError(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/spotify/playlists/${selected.id}/tracks`);
        if (!res.ok) throw new Error('Failed to load tracks');
        const data = await res.json();
        setTracks(data.items || []);
      } catch (e: any) {
        setError(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selected]);

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if ((window as any).Spotify) {
      initPlayer();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);
    (window as any).onSpotifyWebPlaybackSDKReady = () => initPlayer();
    return () => { script.remove(); };
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;
    const spotify = (window as any).Spotify;
    if (!spotify) return;

    const player = new spotify.Player({
      name: 'Next.js Web Player',
      getOAuthToken: async (cb: (token: string) => void) => {
        const res = await fetch('/api/spotify/me'); // returns access token header auth not included; we just need token
        // We will instead call a tiny endpoint to expose token is not ideal. Better: a dedicated endpoint
        // For simplicity in this demo, create '/api/spotify/me?token=1' to return token, but here we keep SDK
      },
      volume: 0.5,
    });

    player.addListener('ready', ({ device_id }: any) => {
      setDeviceId(device_id);
      setPlayerReady(true);
    });
    player.addListener('not_ready', ({ device_id }: any) => {
      if (device_id === deviceId) setPlayerReady(false);
    });
    player.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      setIsPlaying(!state.paused);
    });
    player.addListener('initialization_error', ({ message }: any) => setError(message));
    player.addListener('authentication_error', ({ message }: any) => setError(message));
    player.addListener('account_error', ({ message }: any) => setError(message));

    player.connect();
    playerRef.current = player;
  };

  const transferToDevice = async () => {
    if (!deviceId) return;
    const res = await fetch('/api/spotify/player/transfer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    });
    if (!res.ok) setError('Transfer playback failed (Premium required)');
  };

  const play = async () => {
    if (!deviceId || uris.length === 0) return;
    await transferToDevice();
    const res = await fetch('/api/spotify/player/play', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, uris })
    });
    if (!res.ok) setError('Play failed (Premium required)');
  };

  const pause = async () => {
    const res = await fetch('/api/spotify/player/pause', { method: 'POST' });
    if (!res.ok) setError('Pause failed');
  };

  const next = async () => {
    const res = await fetch('/api/spotify/player/next', { method: 'POST' });
    if (!res.ok) setError('Next failed');
  };

  const previous = async () => {
    const res = await fetch('/api/spotify/player/previous', { method: 'POST' });
    if (!res.ok) setError('Previous failed');
  };

  return (
    <div>
      <h2>Your Playlists</h2>
      {loading && (
            <div className="grid" style={{ marginTop: 12 }}>
              {Array.from({length:8}).map((_,i)=>(
                <div key={i} className="card">
                  <div className="skeleton" style={{width:'100%', height:130, borderRadius:12}} />
                  <div className="skeleton" style={{width:'60%', height:14, marginTop:10}} />
                  <div className="skeleton" style={{width:'40%', height:12, marginTop:8}} />
                </div>
              ))}
            </div>
          )}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <div className="grid" style={{ marginTop: 12 }}>
        {playlists.map(pl => (
          <button key={pl.id} className="card" onClick={() => setSelected(pl)}>
            {pl.images?.[0]?.url && (
              <Image src={pl.images[0].url} alt={pl.name} width={160} height={160} style={{ width: '100%', height: 'auto', borderRadius: 6 }} />
            )}
            <div style={{ marginTop: 8, fontWeight: 600 }}>{pl.name}</div>
            <div className="muted">{pl.tracks?.total ?? 0} tracks</div>
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 24 }}>
          <h3>Tracks in “{selected.name}”</h3>
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            {tracks.map((item, idx) => {
              const t = item.track;
              if (!t) return null;
              const img = t.album.images?.[0]?.url;
              return (
                <div key={t.id || idx} className="card row" style={{ justifyContent: 'space-between' }}>
                  <div className="row">
                    {img && <Image src={img} alt={t.name} width={48} height={48} />}
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div className="muted">{t.artists.map(a => a.name).join(', ')}</div>
                    </div>
                  </div>
                  <div className="row">
                    <button onClick={play}>Play</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="row" style={{ gap: 12, marginTop: 16 }}>
            <button className="btn" onClick={previous}>Previous</button>
            <button className="btn btn-primary" onClick={() => (isPlaying ? pause() : play())}>{isPlaying ? 'Pause' : 'Play'}</button>
            <button className="btn" onClick={next}>Next</button>
            <button className="btn" disabled={!playerReady} onClick={transferToDevice}>Transfer to Web Player</button>
            <span className="muted">Device: {playerReady && deviceId ? deviceId : 'Not ready'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
