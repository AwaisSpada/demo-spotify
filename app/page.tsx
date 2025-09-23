// app/page.tsx
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthButton from "@/components/AuthButton";
import PlaylistBrowser from "@/components/PlaylistBrowser";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <div>
      <h1>Spotify Demo</h1>
      <p className="muted">Sign in, view your playlists, and control playback.</p>
      <AuthButton />
      {user ? (
        <div style={{ marginTop: 20 }}>
          <div className="row" style={{ marginBottom: 16 }}>
            {user.image && (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                width={48}
                height={48}
                style={{ borderRadius: "50%" }}
              />
            )}
            <div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div className="muted">{user.email}</div>
            </div>
          </div>
          <PlaylistBrowser />
        </div>
      ) : (
        <p style={{ marginTop: 16 }}>You are not signed in.</p>
      )}
    </div>
  );
}
