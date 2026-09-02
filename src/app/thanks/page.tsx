import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export default function Thanks() {
  return (
    <ProsePage kick="Thanks" title="Got it — you’re on the list." lead="We’ll be in touch. In the meantime, there’s a lot of riding to explore.">
      <div style={{ textAlign: "center" }}>
        <Link href="/towns" className="lk-coral big">Explore towns</Link>
      </div>
    </ProsePage>
  );
}
