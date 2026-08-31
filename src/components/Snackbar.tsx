/* =============================================================================
   SNACKBAR — Material 3
   =============================================================================
   Brief, bottom-anchored confirmation of an action the user just took, with an
   optional single action (here: Angre / undo).

   WHY THIS IS HAND-BUILT RATHER THAN THE DESIGN SYSTEM'S `sonner`:
   The design system ships `sonner.tsx`, but it is a thin wrapper around the
   `sonner` package that (a) hard-depends on `next-themes`, a Next.js theming
   library this app does not use, and (b) styles toasts as a LIGHT `--popover`
   card. An M3 snackbar is the opposite: an inverse-surface bar. Adopting it
   would mean pulling in two dependencies and then overriding essentially all of
   its styling. Flagged for the design system in the README — there is no M3
   snackbar in the library today, and there should be.

   TOKENS. M3 specifies inverse-surface / inverse-on-surface / inverse-primary,
   none of which exist in tokens.css. The closest true equivalents in the
   LokalMat palette are used instead, and they are genuinely the inverse pair:
     inverse-surface     -> var(--on-surface)        #1B1C1A
     inverse-on-surface  -> var(--surface)           #FFFFFF
     inverse-primary     -> var(--primary-container) #E69D9D  (light red, high
                            contrast on near-black; --primary itself is far too
                            dark to sit on this bar)

   ONE AT A TIME. M3 shows a single snackbar; a new message replaces the current
   one rather than stacking. That matters here because following several
   producers quickly is a normal thing to do.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** M3 default is 4s; with an action, a little longer so Angre is reachable. */
const DEFAULT_DURATION_MS = 5000;
const EXIT_MS = 150;

export interface SnackbarOptions {
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface SnackbarMessage extends SnackbarOptions {
  id: number;
  text: string;
}

interface SnackbarApi {
  showSnackbar: (text: string, options?: SnackbarOptions) => void;
}

const Ctx = createContext<SnackbarApi | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<SnackbarMessage | null>(null);
  const [visible, setVisible] = useState(false);
  const nextId = useRef(0);
  const dismissTimer = useRef<number | undefined>(undefined);
  const clearTimer = useRef<number | undefined>(undefined);

  const clearTimers = () => {
    window.clearTimeout(dismissTimer.current);
    window.clearTimeout(clearTimer.current);
  };

  const dismiss = useCallback(() => {
    clearTimers();
    setVisible(false);
    clearTimer.current = window.setTimeout(() => setMessage(null), EXIT_MS);
  }, []);

  const showSnackbar = useCallback((text: string, options: SnackbarOptions = {}) => {
    clearTimers();
    setMessage({ id: nextId.current++, text, ...options });
    setVisible(true);
    dismissTimer.current = window.setTimeout(
      () => {
        setVisible(false);
        clearTimer.current = window.setTimeout(() => setMessage(null), EXIT_MS);
      },
      options.durationMs ?? DEFAULT_DURATION_MS,
    );
  }, []);

  useEffect(() => clearTimers, []);

  return (
    <Ctx.Provider value={{ showSnackbar }}>
      {children}

      {/* aria-live="polite" announces the confirmation without stealing focus,
          which is the whole point of a snackbar over a dialog. */}
      <div
        className="lm-snackbar-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message && (
          <div className="lm-snackbar" data-visible={visible ? "true" : "false"} key={message.id}>
            <span className="lm-snackbar__text body-medium">{message.text}</span>
            {message.actionLabel && (
              <button
                type="button"
                className="lm-snackbar__action label-large"
                onClick={() => {
                  message.onAction?.();
                  dismiss();
                }}
              >
                {message.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export function useSnackbar(): SnackbarApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSnackbar must be used inside <SnackbarProvider>");
  return v;
}
