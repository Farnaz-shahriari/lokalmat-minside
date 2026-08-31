/* Screen 4 — Lagrede søk. */

import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { hitLabel } from "../lib/format";
import { emptyFilters, summarizeFilters } from "../lib/search";
import { useApp } from "../state/AppState";

export function LagredeSok() {
  const navigate = useNavigate();
  const { savedSearches, openSearch, deleteSavedSearch, setEmailUpdates } = useApp();

  function goToSearch(filters?: Parameters<typeof openSearch>[0], id?: string) {
    openSearch(filters ?? emptyFilters(), id);
    navigate("/sok");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <div style={{ marginTop: "var(--space-xl)" }}>
      <div
        className="flex items-center justify-between flex-wrap"
        style={{ gap: "var(--space-md)", marginBottom: "var(--space-sm)" }}
      >
        <h2 className="title-large text-on-surface m-0">
          Lagrede søk{" "}
          <span className="text-on-surface-variant" style={{ fontWeight: "var(--font-weight-normal)" }}>
            · {savedSearches.length}
          </span>
        </h2>
        <Button size="sm" onClick={() => goToSearch()}>
          <Icon name="add" size={18} />
          Opprett nytt søk
        </Button>
      </div>

      <p
        className="body-medium text-on-surface-variant m-0 max-w-[620px]"
        style={{ marginBottom: "var(--space-lg)" }}
      >
        Vi varsler deg når nye produkter eller produsenter passer søkene dine. Kjør et
        søk for å se alle treff.
      </p>

      {savedSearches.length > 0 ? (
        <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
          {savedSearches.map((s) => {
            const hasNew = s.count > 0;
            return (
              <div
                key={s.id}
                className="flex items-center flex-wrap bg-surface border border-outline-variant"
                style={{
                  borderRadius: "var(--radius-card)",
                  padding: "var(--space-lg)",
                  gap: "var(--space-md)",
                }}
              >
                <div className="shrink-0 w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                  <Icon name="bookmark" className="text-on-surface-variant" />
                </div>

                <div className="flex-1 min-w-[200px] flex flex-col" style={{ gap: "var(--space-sm)" }}>
                  <span className="body-large text-on-surface" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    {s.name}
                  </span>
                  <div className="flex flex-wrap items-center" style={{ gap: "var(--space-xs)" }}>
                    {/* Summary pills: query in guillemets first, then each selected
                        filter in group order, then radius, then approved-only.
                        Truncated to 6. */}
                    {summarizeFilters(s.filters).map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center h-6 bg-surface-container text-on-surface-variant label-small"
                        style={{ paddingInline: 10, borderRadius: "var(--radius-button)", fontWeight: "var(--font-weight-semibold)" }}
                      >
                        {f}
                      </span>
                    ))}
                    <span
                      className={`inline-flex items-center label-small ${hasNew ? "text-primary" : "text-on-surface-variant"}`}
                      style={{ gap: "var(--space-xs)", fontWeight: "var(--font-weight-semibold)" }}
                    >
                      <Icon name={hasNew ? "notifications_active" : "notifications"} size={16} />
                      {hitLabel(s.count)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center flex-wrap" style={{ gap: "var(--space-md)" }}>
                  <div className="flex items-center" style={{ gap: "var(--space-sm)" }}>
                    <Switch
                      id={`email-${s.id}`}
                      checked={s.emailUpdates}
                      onCheckedChange={(v) => setEmailUpdates(s.id, v)}
                    />
                    <Label htmlFor={`email-${s.id}`} className="body-medium text-on-surface cursor-pointer">
                      Få oppdateringer på e-post
                    </Label>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => goToSearch(s.filters, s.id)}>
                    Kjør søk
                    <Icon name="arrow_forward" size={18} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Slett lagret søk: ${s.name}`}
                    onClick={() => deleteSavedSearch(s.id)}
                  >
                    <Icon name="delete" size={20} className="text-on-surface-variant" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="bookmark"
          message="Ingen lagrede søk ennå. Søk etter produkter eller produsenter, og lagre søket for å få varsler."
        />
      )}
    </div>
  );
}
