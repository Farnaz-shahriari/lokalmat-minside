/* A column that stops growing at a given height and scrolls instead.

   Built for the producer list beside the map on Min side. That list is as long
   as the radius slider makes it, and the map next to it is a fixed height, so
   without a cap a wide radius left the map stranded at the top of a very tall
   column of rows and pushed the rest of the page down.

   Scroll rather than pagination: the list is a browsing surface, not a result
   set you work through. You drag the radius, glance down the rows, and stop
   when something catches your eye — page buttons would interrupt that, and
   "page 3 of 7" is not a thing anyone needs to know about producers near them.

   TWO THINGS THAT ARE EASY TO GET WRONG, both handled here:

   1. Discoverability. macOS hides overlay scrollbars until you scroll, so a
      capped list looks exactly like a short one. Hence the always-visible
      scrollbar (.lm-scroll-list) and the fade at the bottom edge, which
      disappears once you reach the end.
   2. Keyboard. A scrollable region that is not focusable traps its content
      away from keyboard users (WCAG 2.1.1). It therefore takes tabIndex 0 and
      a labelled role — but ONLY while it actually overflows, so a short list
      does not add a pointless tab stop. */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./ui/utils";

export function ScrollColumn({
  maxHeight,
  label,
  className,
  style,
  children,
}: {
  /** Undefined until measured — the column is simply uncapped until then. */
  maxHeight?: number;
  /** Names the region for screen readers once it scrolls. */
  label: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const over = el.scrollHeight - el.clientHeight > 1;
    setOverflowing(over);
    setAtEnd(!over || el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    // Rows are added and removed as the radius and the category chips change,
    // and each row can change height, so watch the children too.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => ro.disconnect();
  }, [measure, children]);

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={measure}
        className={cn("lm-scroll-list", className)}
        style={{ maxHeight, ...style }}
        tabIndex={overflowing ? 0 : undefined}
        role={overflowing ? "region" : undefined}
        aria-label={overflowing ? label : undefined}
      >
        {children}
      </div>
      {overflowing && !atEnd && <div className="lm-scroll-fade" aria-hidden="true" />}
    </div>
  );
}
