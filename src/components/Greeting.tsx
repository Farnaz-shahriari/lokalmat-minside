/* The greeting block.

   The h1 is one of only THREE sanctioned serif usages in this app. See
   src/styles/fonts.css.

   The prototype sets it at 40px, which is not in the design system's named type
   scale. Per the handoff's type normalization table it drops to headline-medium
   (32px / 400) — "32px is the top of your scale; the greeting drops from
   40 -> 32".

   The row also carries the entry point to Innkjøper-innstillinger. It lives
   here, not in NavTabs, because the four tab cards are the buyer's working
   surfaces and account settings is not one of them — a fifth card wraps onto
   its own row and breaks the 4-across grid. A secondary (outlined) button keeps
   it clearly subordinate to the tabs.

   The h1 is headline-medium at line-height 1.25 = 40px, which is exactly the
   height of a size="sm" button, so items-start aligns the two optically. */

import { useNavigate } from "react-router-dom";
import { USER } from "../data/lokalmat-data";
import { timeGreeting } from "../lib/format";
import { Button } from "./ui/button";
import { Icon } from "./Icon";

export function Greeting() {
  const navigate = useNavigate();
  const firstName = USER.name.split(" ")[0];

  return (
    <div
      className="flex items-start justify-between flex-wrap"
      style={{ marginBottom: "var(--space-lg)", gap: "var(--space-md)" }}
    >
      <div className="min-w-0">
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

      <Button
        variant="secondary"
        size="sm"
        className="shrink-0"
        onClick={() => navigate("/innstillinger")}
      >
        <Icon name="manage_accounts" size={18} />
        Innkjøper innstillinger
      </Button>
    </div>
  );
}
