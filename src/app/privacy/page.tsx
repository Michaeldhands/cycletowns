import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";
export const metadata: Metadata = { title: "Privacy policy" };
export default function Page() {
  return (
    <ProsePage kick="Legal" title="Privacy policy">
      <div className="wprose">
        <p><i>This page is a placeholder — the final Privacy policy will be published before rider accounts open.</i></p>
        <p>Questions in the meantime: hello@cycletowns.com.</p>
      </div>
    </ProsePage>
  );
}
