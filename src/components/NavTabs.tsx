/* The four large nav tab cards: Min side · Mine produsenter · Mine produkter ·
   Lagrede søk.

   DESIGN SYSTEM NOTE — why this is bespoke rather than a component:
   These are 104px icon cards in a 4-column grid. The handoff explicitly says
   they are NOT `tabs`, and raises "should they become ConnectedButtonGroup?" as
   an open question for the design team. They are kept bespoke here because
   ConnectedButtonGroup is a 40px pill segmented control — it cannot express a
   104px card with a 46px icon circle without being redefined, which is a design
   system decision, not an app decision.
   104px is the one height in this app with no token behind it; the handoff's
   height table says "custom, no token; keep 104". Everything else here is
   tokenised.

   Resting:  white, 1px outline-variant border, surface-container icon circle.
   Hover:    surface-container-low background.
   Active:   primary/8 background, 2px primary border, primary icon circle with
             a white FILL-1 icon, primary label.
   ========================================================================== */

import { NavLink } from "react-router-dom";
import { Icon } from "./Icon";
import { cn } from "./ui/utils";

const TABS = [
  { to: "/min-side", label: "Min side", icon: "dashboard" },
  { to: "/produsenter", label: "Mine produsenter", icon: "storefront" },
  { to: "/produkter", label: "Mine produkter", icon: "favorite" },
  { to: "/lagrede-sok", label: "Lagrede søk", icon: "bookmark" },
];

export function NavTabs() {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4"
      style={{ gap: "var(--space-md)" }}
    >
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className="no-underline">
          {({ isActive }) => (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2.5 h-[104px] cursor-pointer transition-colors",
                isActive
                  ? "bg-primary/8 border-2 border-primary"
                  : "bg-surface border border-outline-variant hover:bg-surface-container-low",
              )}
              style={{
                borderRadius: "var(--radius-card)",
                transitionTimingFunction: "var(--motion-standard)",
                transitionDuration: "150ms",
              }}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-[46px] h-[46px] rounded-full",
                  isActive ? "bg-primary" : "bg-surface-container",
                )}
              >
                <Icon
                  name={t.icon}
                  fill={isActive}
                  className={isActive ? "text-primary-foreground" : "text-on-surface-variant"}
                />
              </div>
              <span
                className={cn("label-large", isActive ? "text-primary" : "text-on-surface")}
                style={{ fontWeight: "var(--font-weight-semibold)" }}
              >
                {t.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </div>
  );
}
