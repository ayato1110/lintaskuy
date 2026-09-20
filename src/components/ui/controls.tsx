import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export function CheckboxField({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
  hint,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        disabled={disabled}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-control border border-border bg-surface',
          'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white',
          'disabled:opacity-50',
        )}
        aria-label={label}
      >
        <CheckboxPrimitive.Indicator>
          <Check className="h-3.5 w-3.5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label htmlFor={id} className="text-sm leading-snug text-ink">
        {label}
        {hint ? <span className="block text-sm text-muted">{hint}</span> : null}
      </label>
    </div>
  );
}

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export function RadioGroupField({
  id,
  label,
  value,
  onValueChange,
  options,
  error,
  hint,
}: {
  id: string;
  label: string;
  value: string | null;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  error?: string;
  hint?: string;
}) {
  return (
    <div className="w-full">
      <span id={`${id}-label`} className="field-label">
        {label}
      </span>
      <RadioGroupPrimitive.Root
        id={id}
        value={value ?? undefined}
        onValueChange={onValueChange}
        aria-labelledby={`${id}-label`}
        aria-invalid={error ? true : undefined}
        className="flex flex-col gap-2"
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-control border border-border bg-surface p-3 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
          >
            <RadioGroupPrimitive.Item
              value={option.value}
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=checked]:border-primary"
            >
              <RadioGroupPrimitive.Indicator className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary" />
            </RadioGroupPrimitive.Item>
            <span className="text-sm text-ink">
              {option.label}
              {option.description ? (
                <span className="block text-sm text-muted">{option.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </RadioGroupPrimitive.Root>
      {hint && !error ? <p className="field-hint">{hint}</p> : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}