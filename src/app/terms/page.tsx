import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";
export const metadata: Metadata = { title: "Terms of use" };
export default function Page() {
  return (
    <ProsePage kick="Legal" title="Terms of use">
      <div className="wprose">
        <p><i>This page is a placeholder — the final Terms of use will be published before rider accounts open.</i></p>
        <p>Questions in the meantime: hello@cycletowns.com.</p>
      </div>
    </ProsePage>
  );
}
