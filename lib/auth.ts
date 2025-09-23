// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import axios from "axios";

async function refreshSpotifyAccessToken(refreshToken: string) {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", process.env.SPOTIFY_CLIENT_ID!);
  params.append("client_secret", process.env.SPOTIFY_CLIENT_SECRET!);

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return res.data as {
    access_token: string;
    token_type: "Bearer";
    scope: string;
    expires_in: number;
    refresh_token?: string;
  };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope: [
            "user-read-email",
            "user-read-private",
            "playlist-read-private",
            "streaming",
            "user-modify-playback-state",
            "user-read-playback-state",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && account.provider === "spotify") {
        const now = Math.floor(Date.now() / 1000);
        return {
          ...token,
          accessToken: account.access_token as string,
          refreshToken: account.refresh_token as string,
          expiresAt: now + ((account.expires_in as number) ?? 3600),
          user: profile,
        };
      }

      const t = token as any;
      const now = Math.floor(Date.now() / 1000);
      if (t.expiresAt && now < t.expiresAt - 60) return token;

      if (!t.refreshToken) return token;
      try {
        const refreshed = await refreshSpotifyAccessToken(t.refreshToken);
        return {
          ...token,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? t.refreshToken,
          expiresAt: now + refreshed.expires_in,
        };
      } catch {
        return token;
      }
    },
    async session({ session, token }) {
      const t = token as any;
      (session as any).accessToken = t.accessToken;
      (session as any).expiresAt = t.expiresAt;
      return session;
    },
  },
};
