import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  children,
  ariaLabel,
}: {
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <TabsPrimitive.List
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-11 w-full items-center gap-1 rounded-control bg-surface-subtle p-1 sm:w-auto',
        className,
      )}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'flex-1 rounded-control px-4 py-2 text-sm font-medium text-muted transition-colors sm:flex-none',
        'hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm',
        className,
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Content value={value} className={cn('mt-4 outline-none', className)}>
      {children}
    </TabsPrimitive.Content>
  );
}