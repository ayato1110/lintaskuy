import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface FieldControlProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  inputClassName?: string;
}

const baseInput =
  'w-full rounded-control border border-border bg-surface px-3 py-2.5 text-base text-ink placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:bg-surface-subtle';

export const TextInput = forwardRef<HTMLInputElement, Omit<FieldControlProps, 'error'> & { error?: string }>(
  function TextInput({ id, label, hint, error, className, inputClassName, ...props }, ref) {
    return (
      <div className={cn('w-full', className)}>
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            baseInput,
            error && 'border-danger focus-visible:ring-danger/40',
            inputClassName,
          )}
          {...props}
        />
        {hint && !error ? (
          <p id={`${id}-hint`} className="field-hint">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${id}-error`} className="field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export const NumberInput = forwardRef<
  HTMLInputElement,
  Omit<FieldControlProps, 'error'> & { error?: string }
>(function NumberInput(props, ref) {
  return <TextInput ref={ref} type="number" inputMode="decimal" {...props} />;
});

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
}

export function TextareaField({ id, label, error, className, ...props }: TextareaFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseInput, 'min-h-24 resize-y', error && 'border-danger')}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <span id={`${id}-label`} className="field-label">
        {label}
      </span>
      <div id={id} role="group" aria-labelledby={`${id}-label`}>
        {children}
      </div>
      {hint && !error ? <p className="field-hint">{hint}</p> : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}