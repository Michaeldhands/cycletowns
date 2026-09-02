const AVC = ["#01536C", "#FD3D35", "#3E8DA6", "#177245", "#9C6ADE", "#E2872A", "#0E7C7B"];
function hash(s: string) {
  let h = 5;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
/** Initial-letter avatar, or the rider's photo when they have one. */
export function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  if (url)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} referrerPolicy="no-referrer" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <span className="av2" style={{ width: size, height: size, background: AVC[hash(name) % AVC.length], fontSize: size * 0.42 }} aria-hidden="true">
      {(name || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}
