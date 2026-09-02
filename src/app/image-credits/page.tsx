import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Image credits" };

export default function Credits() {
  return (
    <ProsePage kick="Credits" title="Image credits.">
      <div className="wprose">
        <p>Town photography is used under Creative Commons licences via Wikimedia Commons; the original file and licence can be opened by following the image URL. Rider and venue imagery is licensed stock photography from Pexels under the Pexels licence. Map tiles © OpenStreetMap contributors.</p>
        <p>If you own an image shown here and would like it credited differently or removed, email hello@cycletowns.com.</p>
      </div>
    </ProsePage>
  );
}
