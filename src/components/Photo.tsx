"use client";
import { useState } from "react";

/** Absolutely-positioned cover photo (the demo's .tphoto). Hides itself if the image fails so the
    teal gradient behind it shows instead. */
export function Photo({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={"tphoto" + (failed ? " noimg" : "") + (className ? " " + className : "")}
      loading="lazy"
      referrerPolicy="no-referrer"
      alt={alt}
      src={src}
      onError={() => setFailed(true)}
    />
  );
}
