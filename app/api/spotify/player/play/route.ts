import { withSpotify } from '../../_utils';

export const POST = async (req: Request) => withSpotify(async (token) => {
  const { deviceId, uris } = await req.json();
  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ uris })
  });
  return new Response(null, { status: res.status });
});
