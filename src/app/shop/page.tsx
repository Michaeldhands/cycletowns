import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
export const metadata: Metadata = { title: "Shop" };
export default function Shop() {
  return (
    <ComingSoon kick="Shop" title="Wear your town." lead="Town-edition jerseys, caps and tees for the Cycletowns you love — coming soon. Tell us you want one and we’ll let you know when the first drop lands." form="shop-waitlist" cta="Tell me when it drops" />
  );
}
