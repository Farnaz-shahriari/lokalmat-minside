import { ReactNode } from "react";
import { cn } from "./utils";

/**
 * List Item, Material 3.
 *
 * Generalizes the density and trailing content variants that already existed
 * as one off Figma exports, ListItemListItem0Density, ListItemListItem4Density,
 * across several files, never as a single reusable component. Same anatomy,
 * one component, two densities.
 *
 * default density, 56px min height, py-8, one line title, matches "0 Density".
 * compact density, tighter py-4, no fixed height, supports an overline label
 * plus a two line title or title and supporting text, matches "-4 Density".
 */

interface ListItemProps {
  density?: "default" | "compact";
  leadingIcon?: ReactNode;
  overline?: string;
  title: string;
  supportingText?: string;
  trailingText?: string;
  trailingIcon?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListItem({
  density = "default",
  leadingIcon,
  overline,
  title,
  supportingText,
  trailingText,
  trailingIcon,
  selected = false,
  disabled = false,
  onClick,
  className = "",
}: ListItemProps) {
  const isCompact = density === "compact";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-4 w-full rounded-xl text-left transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        isCompact ? "px-4 py-1" : "px-6 py-2 min-h-14",
        selected ? "bg-secondary-container" : "hover:bg-muted",
        className
      )}
    >
      {leadingIcon && (
        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
          {leadingIcon}
        </div>
      )}

      <div className="flex-1 flex flex-col items-start text-left overflow-hidden">
        {overline && (
          <p
            className={cn(
              "label-small",
              selected ? "text-secondary-container-foreground" : "text-muted-foreground"
            )}
          >
            {overline}
          </p>
        )}

        <p
          className={cn(
            isCompact ? "label-large" : "body-large",
            selected ? "text-secondary-container-foreground" : "text-foreground",
            !isCompact && "line-clamp-2 w-full"
          )}
        >
          {title}
        </p>

        {supportingText && (
          <p
            className={cn(
              "label-medium mt-0.5",
              selected ? "text-secondary-container-foreground" : "text-muted-foreground"
            )}
          >
            {supportingText}
          </p>
        )}
      </div>

      {(trailingText || trailingIcon) && (
        <div className="shrink-0 flex items-center gap-2.5">
          {trailingText && (
            <span className="label-medium text-muted-foreground whitespace-nowrap">
              {trailingText}
            </span>
          )}
          {trailingIcon}
        </div>
      )}
    </button>
  );
}
