import axios from 'axios';

export async function refreshSpotifyAccessToken(refreshToken: string) {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  params.append('client_id', process.env.SPOTIFY_CLIENT_ID!);
  params.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET!);

  const res = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return res.data as {
    access_token: string;
    token_type: 'Bearer';
    scope: string;
    expires_in: number;
    refresh_token?: string;
  };
}
