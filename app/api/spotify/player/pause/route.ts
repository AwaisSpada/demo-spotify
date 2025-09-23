import { withSpotify } from '../../_utils';

export const POST = async () => withSpotify(async (token) => {
  const res = await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return new Response(null, { status: res.status });
});
