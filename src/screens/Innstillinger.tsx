/* Screen 6 — Innkjøper-innstillinger.

   Reached from the "Innkjøper innstillinger" button in the greeting row, not
   from the tab cards. The four tab cards are the buyer's WORKING surfaces —
   what they browse day to day. Account settings are a different kind of thing:
   visited rarely, and not part of that rhythm. Putting it in the tab grid made
   a fifth card wrap onto its own row and broke the 4-across layout, which is
   what prompted moving it out.

   Follows the Søk pattern: a back link, then the page title, then the body.

   🟡 SERIF. The title uses Messina Serif, which the handoff reserves for three
   places (greeting, search page title, producer name). This is a fourth. It is
   consistent — Søk's page title is serif and this is the same role — but it
   does widen a documented rule, so it needs a design decision. */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Icon } from "../components/Icon";
import { EmptyState } from "../components/EmptyState";
import { BUYER_SETTINGS, SETTINGS_SECTIONS, type SettingsSectionId } from "../data/lokalmat-data";
import { cn } from "../components/ui/utils";

export function Innstillinger() {
  const navigate = useNavigate();
  const [section, setSection] = useState<SettingsSectionId>("bedrift");

  return (
    <div style={{ marginTop: "var(--space-lg)" }}>
      {/* Pulled 8px left to optically align with the title, same as Søk. */}
      <div style={{ margin: "0 0 var(--space-xs) -8px" }}>
        <Button variant="tertiary" size="sm" onClick={() => navigate("/min-side")}>
          <Icon name="arrow_back" size={18} />
          Tilbake til Min side
        </Button>
      </div>

      <h1 className="font-brand-serif headline-medium text-on-surface m-0">Innstillinger</h1>

      <div
        className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] items-start"
        style={{ marginTop: "var(--space-lg)", gap: "var(--space-xl)" }}
      >
        {/* ---------------- Section list ---------------- */}
        <nav className="flex flex-col" aria-label="Innstillinger">
          {SETTINGS_SECTIONS.map((s, i) => {
            const active = s.id === section;
            return (
              <button
                key={s.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setSection(s.id)}
                className={cn(
                  "flex items-center text-left min-h-[44px] bg-transparent border-0 cursor-pointer transition-colors",
                  "label-large",
                  active ? "text-primary" : "text-on-surface hover:text-primary",
                )}
                style={{
                  gap: "var(--space-sm)",
                  paddingInline: "var(--space-sm)",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: active ? "var(--font-weight-semibold)" : undefined,
                }}
              >
                <span className="text-on-surface-variant">{i + 1}</span>
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* ---------------- Section content ---------------- */}
        <div className="min-w-0">
          {section === "bedrift" ? (
            <dl className="m-0 flex flex-col" style={{ gap: "var(--space-lg)" }}>
              {BUYER_SETTINGS.map((f) => (
                <div key={f.label} className="flex flex-col" style={{ gap: "var(--space-xs)" }}>
                  <dt
                    className="label-large text-on-surface"
                    style={{ fontWeight: "var(--font-weight-semibold)" }}
                  >
                    {f.label}
                  </dt>
                  <dd className="body-large text-on-surface-variant m-0">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            /* Honest rather than invented: the design only specifies the first
               section so far. */
            <EmptyState
              icon="pending"
              message="Denne seksjonen er ikke designet ennå. Bedriftsinnstillinger er den eneste som er spesifisert."
            />
          )}
        </div>
      </div>
    </div>
  );
}
