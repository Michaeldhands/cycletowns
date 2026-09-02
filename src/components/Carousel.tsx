"use client";
import { Fragment, useRef, useState, type ReactNode } from "react";

/** Landing-page carousel (4-up grid that scrolls horizontally). */
export function LpCarousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const w = ref.current;
    if (w) w.scrollBy({ left: dir * Math.max(240, Math.round(w.clientWidth * 0.85)), behavior: "smooth" });
  };
  return (
    <div className="lpcarwrap">
      <button className="lpcarbtn l" onClick={() => scroll(-1)} aria-label="Scroll left">
        ‹
      </button>
      <div className="lpcar" ref={ref}>
        {children}
      </div>
      <button className="lpcarbtn r" onClick={() => scroll(1)} aria-label="Scroll right">
        ›
      </button>
    </div>
  );
}

export type Filter = { id: string; label: string };

/** Section carousel used on town guides: heading, optional filter chips, horizontal card strip. */
export function SectionCarousel({
  title,
  sub,
  filters,
  items,
}: {
  title: ReactNode;
  sub?: ReactNode;
  filters?: Filter[];
  /** Cards with an optional discipline/filter key. */
  items: { key: string; filter?: string; node: ReactNode }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("all");
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * 360, behavior: "smooth" });
  const shown = active === "all" ? items : items.filter((i) => i.filter === active);
  return (
    <div className="wsec">
      <div className="wh">
        <div>
          <h2>{title}</h2>
          {sub && <span className="wsub">{sub}</span>}
        </div>
        <div className="carbtns">
          <button className="carbtn" onClick={() => scroll(-1)} aria-label="Scroll left">
            ‹
          </button>
          <button className="carbtn" onClick={() => scroll(1)} aria-label="Scroll right">
            ›
          </button>
        </div>
      </div>
      {filters && (
        <div className="filterchips">
          <button className={"filterchip" + (active === "all" ? " on" : "")} onClick={() => setActive("all")}>
            All
          </button>
          {filters.map((f) => (
            <button key={f.id} className={"filterchip" + (active === f.id ? " on" : "")} onClick={() => setActive(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      )}
      <div className="carousel" ref={ref}>
        {shown.map((i) => (
          <Fragment key={i.key}>{i.node}</Fragment>
        ))}
      </div>
    </div>
  );
}
