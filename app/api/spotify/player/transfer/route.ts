import { withSpotify } from '../../_utils';

export const POST = async (req: Request) => withSpotify(async (token) => {
  const { deviceId } = await req.json();
  const res = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ device_ids: [deviceId], play: false })
  });
  return new Response(null, { status: res.status });
});
