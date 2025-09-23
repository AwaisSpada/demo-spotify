import { withSpotify } from '../_utils';

export const GET = async () => withSpotify(async (token) => {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
});
