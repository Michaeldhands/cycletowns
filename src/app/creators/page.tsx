import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
export const metadata: Metadata = { title: "Become a creator" };
export default function Creators() {
  return (
    <ComingSoon kick="Creators" title="Post it. Get seen. Get paid." lead="Tag #cycletowns and your rides can land on a town’s front page. Creator briefs and paid bounties from partners are coming — register your interest." form="creator-waitlist" cta="Count me in">
      <p>Tag your rides <b>#cycletowns</b> on Instagram and TikTok now — we’re already watching.</p>
    </ComingSoon>
  );
}
