/* A section heading with an optional "Se alle …" link on the right.
   title-large (22/500) — the prototype's 22/600 drops to 500 per the handoff. */

import { Link } from "react-router-dom";

export function SectionHeading({
  title,
  linkLabel,
  linkTo,
  style,
}: {
  title: string;
  linkLabel?: string;
  linkTo?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ gap: "var(--space-md)", ...style }}
    >
      <h2 className="title-large text-on-surface m-0">{title}</h2>
      {linkLabel && linkTo && (
        <Link
          to={linkTo}
          className="label-large text-primary no-underline whitespace-nowrap"
          style={{ fontWeight: "var(--font-weight-semibold)" }}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
