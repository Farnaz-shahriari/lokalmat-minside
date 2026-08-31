/* The greeting block.

   The h1 is one of only THREE sanctioned serif usages in this app. See
   src/styles/fonts.css.

   The prototype sets it at 40px, which is not in the design system's named type
   scale. Per the handoff's type normalization table it drops to headline-medium
   (32px / 400) — "32px is the top of your scale; the greeting drops from
   40 -> 32". */

import { USER } from "../data/lokalmat-data";
import { timeGreeting } from "../lib/format";

export function Greeting() {
  const firstName = USER.name.split(" ")[0];

  return (
    <div style={{ marginBottom: "var(--space-lg)" }}>
      <h1
        className="font-brand-serif headline-medium text-on-surface m-0"
        style={{ fontFamily: "var(--font-lokalmat-serif)", marginBottom: "var(--space-xs)" }}
      >
        {timeGreeting()}, {firstName}
      </h1>
      <p className="body-large text-on-surface-variant m-0">
        Her er det som er nytt for {USER.store} i dag.
      </p>
    </div>
  );
}
