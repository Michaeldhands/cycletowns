import { DISTINCTIONS, type DistinctionStatus, type Level } from "@/lib/distinctions";

/* The distinction mark: one to three wheels, drawn as the ring from the Cycletowns logo. "Selected"
   towns get no wheels — being in the guide is the honour. Provisional distinctions say so. */

export function Wheels({ level, size = 16, color = "var(--coral)" }: { level: Level; size?: number; color?: string }) {
  if (level === 0) return null;
  return (
    <span className="wheels" aria-hidden="true">
      {Array.from({ length: level }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="7.2" fill="none" stroke={color} strokeWidth="3.2" />
        </svg>
      ))}
    </span>
  );
}

export function Distinction({
  level,
  status,
  variant = "plain",
  showLine = false,
}: {
  level: Level;
  status: DistinctionStatus;
  variant?: "plain" | "onphoto" | "chip";
  showLine?: boolean;
}) {
  const d = DISTINCTIONS[level];
  return (
    <span className={`dist dist-${variant}`} title={`${d.name} — ${d.line}${status === "provisional" ? " Provisional: from our research, not yet inspected." : ""}`}>
      <Wheels level={level} color={variant === "onphoto" ? "#fff" : undefined} />
      <span className="dist-name">{level === 0 ? "Selected" : d.short}</span>
      {status === "provisional" && <span className="dist-prov">provisional</span>}
      {showLine && <span className="dist-line">{d.line}</span>}
    </span>
  );
}
