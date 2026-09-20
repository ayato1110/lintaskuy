import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-card border border-border bg-surface p-6 shadow-lg',
            'focus-visible:outline-none',
          )}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return (
    <DialogPrimitive.Title className="mb-1 text-lg font-semibold text-ink">
      {children}
    </DialogPrimitive.Title>
  );
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <DialogPrimitive.Description className="mb-4 text-sm text-muted">{children}</DialogPrimitive.Description>;
}

export function DialogCloseIcon() {
  return (
    <DialogPrimitive.Close
      aria-label="Tutup"
      className="absolute right-4 top-4 rounded-control p-1 text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <X className="h-4 w-4" />
    </DialogPrimitive.Close>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Batal',
  onConfirm,
  destructive,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <DialogCloseIcon />
      <DialogFooter>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex h-11 items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            onConfirm();
          }}
          className={
            destructive
              ? 'inline-flex h-11 items-center justify-center rounded-control bg-danger px-4 text-sm font-medium text-white hover:bg-[#991B1B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40'
              : 'inline-flex h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-medium text-white hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
          }
        >
          {confirmLabel}
        </button>
      </DialogFooter>
    </Dialog>
  );
}