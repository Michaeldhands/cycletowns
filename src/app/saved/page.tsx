import type { Metadata } from "next";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { SavedList } from "@/components/SavedList";
import { currentUser } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Saved towns" };
export const dynamic = "force-dynamic";
export default async function Saved() {
  const me = await currentUser();
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in">
          <div className="kick">Your list</div>
          <div className="h2">Saved towns</div>
          <div className="lead">
            {me ? "Towns you’ve saved, synced to your account." : "Towns you’ve saved on this device. Join free to keep your list across devices."}
          </div>
          <SavedList userId={me?.id ?? null} />
        </div>
      </div>
      <Footer />
    </>
  );
}
