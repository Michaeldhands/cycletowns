import type { Metadata } from "next";
import { TopBar } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { SavedList } from "@/components/SavedList";
export const metadata: Metadata = { title: "Saved towns" };
export default function Saved() {
  return (
    <>
      <TopBar />
      <div className="sec2">
        <div className="in">
          <div className="kick">Your list</div>
          <div className="h2">Saved towns</div>
          <div className="lead">Towns you’ve saved on this device. Join free to keep your list across devices.</div>
          <SavedList />
        </div>
      </div>
      <Footer />
    </>
  );
}
