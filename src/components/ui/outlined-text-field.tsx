import { useState, useRef } from 'react';

interface OutlinedTextFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  className?: string;
}

export function OutlinedTextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
  required,
  disabled,
  onKeyDown,
  autoFocus,
  className = '',
}: OutlinedTextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFloating = isFocused || value.length > 0;

  return (
    <div
      className={`relative ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Floating label — sits on the border when floating */}
      <label
        className={`absolute left-3 pointer-events-none bg-background px-1 transition-all duration-150 leading-none
          ${isFloating
            ? 'top-0 -translate-y-1/2 label-small'
            : 'top-1/2 -translate-y-1/2 body-large'
          }
          ${isFocused ? 'text-primary' : 'text-muted-foreground'}
          ${icon && !isFloating ? 'left-10' : 'left-3'}
        `}
      >
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>

      {/* Input container */}
      <div
        className={`flex items-center h-14 rounded-[var(--radius)] border px-3 gap-2 transition-colors cursor-text
          ${isFocused
            ? 'border-primary ring-[1.5px] ring-primary'
            : 'border-border'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'bg-background'}
        `}
      >
        {icon && (
          <span className="shrink-0 text-muted-foreground flex items-center">
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={isFloating ? (placeholder ?? '') : ''}
          className="flex-1 bg-transparent outline-none border-none body-large text-foreground placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
