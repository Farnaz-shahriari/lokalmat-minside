/* App header. Full width, 1px bottom border, white.

   The handoff's Token normalization table rounds the prototype's 72px top bar
   to height-lg (56px). Nav links at 15px round to body-medium/label-large.
   No top-bar component exists in the design system yet — this is assembled from
   primitives (nav links + Avatar + Badge), as the component mapping instructs. */

import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Icon } from "./Icon";
import { USER } from "../data/lokalmat-data";
import { cn } from "./ui/utils";

/* The public lokalmat.no navigation. Only "Innkjøper" is inside this app; the
   rest are the marketing site and are inert here. */
const SITE_LINKS = [
  { label: "Produkter", href: "#" },
  { label: "Produsenter", href: "#" },
  { label: "Egenrevisjon", href: "#" },
  { label: "Nyttig informasjon", href: "#" },
];

const NOTIFICATION_COUNT = 3;

export function TopBar() {
  return (
    <header
      className="flex items-center bg-surface border-b border-outline-variant"
      style={{
        height: "var(--height-lg)",
        paddingInline: "var(--space-lg)",
        gap: "var(--space-lg)",
      }}
    >
      <a href="#" className="flex items-center shrink-0" aria-label="Lokalmat.no">
        <img src={`${import.meta.env.BASE_URL}lokalmat-logo.svg`} alt="Lokalmat.no" className="block w-24" />
      </a>

      <nav
        className="flex items-center flex-1 min-w-0 overflow-hidden"
        style={{ gap: "var(--space-lg)" }}
      >
        {SITE_LINKS.slice(0, 2).map((l) => (
          <a key={l.label} href={l.href} className="body-medium text-on-surface no-underline py-1 whitespace-nowrap">
            {l.label}
          </a>
        ))}

        {/* Active section. Primary colour, semibold, 2px primary underline. */}
        <NavLink
          to="/min-side"
          className={({ isActive }) =>
            cn(
              "label-large no-underline py-1 whitespace-nowrap",
              isActive || true
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface",
            )
          }
          style={{ fontWeight: "var(--font-weight-semibold)" }}
        >
          Innkjøper
        </NavLink>

        {SITE_LINKS.slice(2).map((l) => (
          <a key={l.label} href={l.href} className="body-medium text-on-surface no-underline py-1 whitespace-nowrap">
            {l.label}
          </a>
        ))}

        {/* De-emphasised, per the handoff. */}
        <a href="#" className="body-medium text-on-surface-variant no-underline py-1 whitespace-nowrap">
          Om lokalmat.no
        </a>
      </nav>

      <div className="flex items-center shrink-0" style={{ gap: "var(--space-md)" }}>
        <button
          type="button"
          className="relative flex items-center bg-transparent border-0 p-0 cursor-pointer"
          aria-label={`Varsler, ${NOTIFICATION_COUNT} nye`}
        >
          <Icon name="notifications" className="text-on-surface-variant" />
          <span
            className="absolute flex items-center justify-center bg-primary text-primary-foreground"
            style={{
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              paddingInline: 4,
              borderRadius: "var(--radius-button)",
              fontSize: 10,
              fontWeight: 700,
              lineHeight: "16px",
            }}
          >
            {NOTIFICATION_COUNT}
          </span>
        </button>

        <div className="flex items-center" style={{ gap: "var(--space-sm)" }}>
          <Avatar>
            <AvatarFallback className="bg-secondary-container text-secondary-container-foreground label-large">
              {USER.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="label-large text-on-surface" style={{ fontWeight: "var(--font-weight-semibold)" }}>
              {USER.name}
            </span>
            <span className="label-small text-on-surface-variant">{USER.email}</span>
          </div>
          <Icon name="expand_more" size={20} className="text-on-surface-variant" />
        </div>
      </div>
    </header>
  );
}
