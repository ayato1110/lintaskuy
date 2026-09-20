import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Accordion({
  type = 'single',
  collapsible = true,
  children,
  className,
}: {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AccordionPrimitive.Root
      type={type}
      collapsible={type === 'single' ? collapsible : undefined}
      className={cn('divide-y divide-border rounded-card border border-border', className)}
    >
      {children}
    </AccordionPrimitive.Root>
  );
}

export function AccordionItem({
  value,
  trigger,
  children,
}: {
  value: string;
  trigger: ReactNode;
  children: ReactNode;
}) {
  return (
    <AccordionPrimitive.Item value={value}>
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-ink hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          {trigger}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform data-[state=open]:rotate-180 group-data-[state=open]:rotate-180" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="px-4 pb-4 pt-1 text-sm text-muted">
        {children}
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}