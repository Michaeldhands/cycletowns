import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
export const metadata: Metadata = { title: "Plan my trip" };
export default function Plan() {
  return (
    <ComingSoon kick="Plan my trip" title="The trip planner is on its way." lead="Your dates, riding style and ability in — a ride-ready itinerary out, built around the town’s best rides, cafés and when it rides best. Want early access?" form="planner-waitlist" cta="I want early access">
      <p>Until then, every town guide has a “Plan your visit” section with the best months to ride, peak crowds and local tips.</p>
    </ComingSoon>
  );
}
