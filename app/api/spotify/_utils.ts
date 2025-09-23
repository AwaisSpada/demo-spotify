// app/api/spotify/_utils.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function withSpotify(fn: (token: string) => Promise<Response>) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  return fn(token);
}
