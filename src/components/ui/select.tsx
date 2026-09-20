import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Pilih salah satu',
  error,
  hint,
  disabled,
}: {
  id: string;
  label: string;
  value: string | null;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <SelectPrimitive.Root
        value={value ?? undefined}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={id}
          aria-invalid={error ? true : undefined}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-control border border-border bg-surface px-3 py-2.5 text-base text-ink data-[placeholder]:text-muted',
            'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            'disabled:bg-surface-subtle',
            error && 'border-danger',
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon aria-hidden="true">
            <ChevronDown className="h-4 w-4 text-muted" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-control border border-border bg-surface p-1 shadow-md"
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-control px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-surface-subtle"
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="ml-auto text-primary">
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {hint && !error ? <p className="field-hint">{hint}</p> : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SelectSimple({
  value,
  onValueChange,
  options,
  className,
  triggerLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  triggerLabel?: ReactNode;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink',
          'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          className,
        )}
        aria-label={typeof triggerLabel === 'string' ? triggerLabel : undefined}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon aria-hidden="true">
          <ChevronDown className="h-4 w-4 text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-control border border-border bg-surface p-1 shadow-md"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer select-none items-center gap-2 rounded-control px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-surface-subtle"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}