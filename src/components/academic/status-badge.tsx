import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
} from 'lucide-react';
import type { CourseStatus } from '@/domain/types';
import { cn } from '@/lib/cn';

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  className: string;
}

const courseStatusMeta: Record<CourseStatus, StatusMeta> = {
  completed: {
    label: 'Selesai',
    icon: CheckCircle2,
    className: 'border-success/30 bg-success/10 text-success',
  },
  in_progress: {
    label: 'Sedang ditempuh',
    icon: Clock,
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  available: {
    label: 'Tersedia',
    icon: Unlock,
    className: 'border-border bg-surface-subtle text-muted',
  },
  planned: {
    label: 'Direncanakan',
    icon: CalendarPlus,
    className: 'border-teal/30 bg-teal/10 text-teal',
  },
  locked: {
    label: 'Terkunci',
    icon: Lock,
    className: 'border-border bg-surface-subtle text-muted',
  },
  attention: {
    label: 'Perlu perhatian',
    icon: AlertTriangle,
    className: 'border-warning/30 bg-warning/10 text-warning',
  },
};

export function StatusBadge({ status, className }: { status: CourseStatus; className?: string }) {
  const meta = courseStatusMeta[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn('chip-status', meta.className, className)}
      role="status"
      aria-label={meta.label}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'teal' | 'primary';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'border-border bg-surface-subtle text-muted',
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    danger: 'border-danger/30 bg-danger/10 text-danger',
    info: 'border-info/30 bg-info/10 text-info',
    teal: 'border-teal/30 bg-teal/10 text-teal',
    primary: 'border-primary/30 bg-primary/10 text-primary',
  };
  return (
    <span className={cn('chip-status', tones[tone], className)}>
      {children}
    </span>
  );
}