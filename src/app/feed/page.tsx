import type { Metadata } from "next";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PostCard, PostComposer } from "@/components/Community";
import { fetchFeed } from "@/lib/community";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Feed" };
export const dynamic = "force-dynamic";

export default async function Feed() {
  const [posts, me] = await Promise.all([fetchFeed({ limit: 60 }), currentUser()]);
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in" style={{ maxWidth: 760 }}>
          <div className="kick">Straight from the saddle</div>
          <div className="h2">The feed</div>
          <div className="lead">Ride reports, café finds and road intel from riders across every Cycletown.</div>
          <PostComposer userId={me?.id ?? null} towns />
          {posts.length === 0 && <p className="wsub" style={{ display: "block", textAlign: "center" }}>Quiet for now — post the first ride.</p>}
          {posts.map((p) => <PostCard key={p.id} p={p} showTown />)}
        </div>
      </div>
      <Footer />
    </>
  );
}
