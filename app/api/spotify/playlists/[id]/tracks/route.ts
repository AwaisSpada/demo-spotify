import { withSpotify } from '../../../_utils';

export const GET = async (_req: Request, { params }: { params: { id: string } }) =>
  withSpotify(async (token) => {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${params.id}/tracks?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  });
