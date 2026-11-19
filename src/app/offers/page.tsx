import { permanentRedirect } from "next/navigation";

// Retired in November 2026: rewards, member offers and the creator programme made an independent
// guide look like a loyalty scheme. Riders now have two doors — subscribe, or join.
export default function Retired() {
  permanentRedirect("/membership");
}
