/* Empty state, per the handoff: a plain block on surface-container-low at
   radius-card, a 44px icon, one sentence, centred, 64px vertical padding.
   Copy always says what to do next, not just what is missing. */

import { Icon } from "./Icon";

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div
      className="flex flex-col items-center gap-2.5 px-6 text-center bg-surface-container-low"
      style={{ paddingBlock: "var(--space-2xl)", borderRadius: "var(--radius-card)" }}
    >
      <Icon name={icon} size={44} className="text-on-surface-variant" />
      <p className="body-large text-on-surface-variant m-0 max-w-[380px]">{message}</p>
    </div>
  );
}
