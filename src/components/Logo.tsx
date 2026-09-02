import { CT_PATHS } from "./logo-paths";

export function Logo({ h = 28 }: { h?: number }) {
  return (
    <svg
      viewBox="0 0 1161 265"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height: h, width: "auto", display: "block", flexShrink: 0 }}
      aria-label="Cycletowns"
      role="img"
      dangerouslySetInnerHTML={{ __html: CT_PATHS }}
    />
  );
}

export function WheelMark({ s = 22 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#01536C" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#fff" strokeWidth="6" />
      <circle cx="50" cy="50" r="14" fill="#FD3D35" />
      <g stroke="#fff" strokeWidth="5">
        <path d="M50 12V36M50 64V88M12 50H36M64 50H88" />
      </g>
    </svg>
  );
}
