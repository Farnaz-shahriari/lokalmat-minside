/* Wrapper that animates a row or card out after `useLinger` marks it leaving.

   Two exit styles, because the containers differ:
     collapse   — vertical lists. Height collapses as well as fading, so the
                  rows below slide up smoothly instead of jumping. Uses the
                  grid-template-rows 1fr -> 0fr technique, which animates to
                  auto height without measuring anything in JS.
     fade       — wrapping card grids and horizontal scroll rows, where
                  collapsing one item's height means nothing. Fades and shrinks
                  very slightly in place.

   `gap` cancels the parent flex/grid gap as the row collapses, otherwise a
   fully collapsed row still leaves its gap behind and the list keeps a hole. */

import type { CSSProperties, ReactNode } from "react";

export function Lingering({
  leaving,
  variant = "collapse",
  gap = 0,
  children,
}: {
  leaving: boolean;
  variant?: "collapse" | "fade";
  gap?: number;
  children: ReactNode;
}) {
  if (variant === "fade") {
    return (
      <div className="lm-linger-fade" data-leaving={leaving ? "true" : "false"}>
        {children}
      </div>
    );
  }

  return (
    <div
      className="lm-linger"
      data-leaving={leaving ? "true" : "false"}
      style={{ "--lm-linger-gap": `${gap}px` } as CSSProperties}
    >
      <div className="lm-linger__inner">{children}</div>
    </div>
  );
}
