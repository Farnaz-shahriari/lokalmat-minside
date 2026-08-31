import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "./utils";

/**
 * Connected Button Group, Material 3 calls this a Segmented Button.
 *
 * This replaces the markup that was independently copy pasted into at least
 * 7 files across the app, ConnectedButtonGroup, PlanleggRevisjon, Heading,
 * UpcomingAudits (x2), Actions, Container-5007-6146. Same visual pattern,
 * same tokens, one component.
 *
 * Single select, one segment active at a time, e.g. a time scope switch.
 * Multi select, more than one segment can be active, e.g. filter toggles.
 */

export interface ConnectedButtonGroupItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ConnectedButtonGroupProps {
  items: ConnectedButtonGroupItem[];
  size?: "default" | "sm";
  className?: string;
}

interface SingleSelectProps extends ConnectedButtonGroupProps {
  multiSelect?: false;
  value: string;
  onChange: (value: string) => void;
}

interface MultiSelectProps extends ConnectedButtonGroupProps {
  multiSelect: true;
  value: string[];
  onChange: (value: string[]) => void;
}

type Props = SingleSelectProps | MultiSelectProps;

export function ConnectedButtonGroup(props: Props) {
  const { items, size = "default", className } = props;

  const isSelected = (itemValue: string) =>
    props.multiSelect ? props.value.includes(itemValue) : props.value === itemValue;

  const handleClick = (itemValue: string) => {
    if (props.multiSelect) {
      const next = props.value.includes(itemValue)
        ? props.value.filter((v) => v !== itemValue)
        : [...props.value, itemValue];
      props.onChange(next);
    } else {
      props.onChange(itemValue);
    }
  };

  return (
    <div
      role={props.multiSelect ? "group" : "radiogroup"}
      className={cn(
        "inline-flex items-stretch gap-[2px] rounded-full border border-[var(--outline-variant)] p-[2px]",
        className
      )}
    >
      {items.map((item) => {
        const selected = isSelected(item.value);
        return (
          <button
            key={item.value}
            type="button"
            role={props.multiSelect ? "checkbox" : "radio"}
            aria-checked={selected}
            disabled={item.disabled}
            onClick={() => handleClick(item.value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full transition-colors label-large",
              "disabled:pointer-events-none disabled:opacity-50",
              size === "sm" ? "h-9 px-3" : "h-10 px-4",
              selected
                ? "bg-secondary-container text-secondary-container-foreground"
                : "bg-transparent text-foreground hover:bg-muted"
            )}
          >
            {selected && !item.icon && <Check className="w-[18px] h-[18px] shrink-0" />}
            {item.icon && <span className="w-[18px] h-[18px] shrink-0 flex items-center justify-center">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
