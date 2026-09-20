import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Info,
  Lightbulb,
} from 'lucide-react';
import type { RuleResult } from '@/domain/types';
import { cn } from '@/lib/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const toneMeta: Record<AlertTone, { icon: LucideIcon; className: string; label: string }> = {
  info: { icon: Info, className: 'border-info/30 bg-info/10 text-info', label: 'Informasi' },
  success: { icon: CheckCircle2, className: 'border-success/30 bg-success/10 text-success', label: 'Berhasil' },
  warning: { icon: AlertTriangle, className: 'border-warning/30 bg-warning/10 text-warning', label: 'Perhatian' },
  error: { icon: AlertCircle, className: 'border-danger/30 bg-danger/10 text-danger', label: 'Perlu diperbaiki' },
};

export function InlineAlert({
  tone = 'info',
  title,
  reason,
  nextAction,
  sourceLabel,
  className,
}: {
  tone?: AlertTone;
  title: string;
  reason?: string;
  nextAction?: string;
  sourceLabel?: string;
  className?: string;
}) {
  const meta = toneMeta[tone];
  const Icon = meta.icon;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-control border p-3.5', meta.className, className)}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {reason ? (
            <p className="mt-0.5 text-sm leading-snug" aria-label={reason}>
              {reason}
            </p>
          ) : null}
          {nextAction ? (
            <p className="mt-1.5 text-sm">
              <span className="font-medium">Tindakan: </span>
              {nextAction}
            </p>
          ) : null}
          {sourceLabel ? (
            <p className="mt-1.5 text-xs opacity-80">Sumber: {sourceLabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function RuleResultAlert({ result }: { result: RuleResult }) {
  const tone: AlertTone =
    result.status === 'error' ? 'error' : result.status === 'warning' ? 'warning' : 'success';
  return (
    <InlineAlert
      tone={tone}
      title={result.title}
      reason={result.reason}
      nextAction={result.nextAction}
      sourceLabel={result.source === 'curriculum_source' ? 'Sumber kurikulum' : undefined}
    />
  );
}

export function SummaryTip({ icon = Lightbulb, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  const Icon = icon;
  return (
    <div className="card-subtle flex items-start gap-3 p-4">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
      <div className="text-sm text-muted">{children}</div>
    </div>
  );
}

export function RuleOverview({ results, icon = BellRing }: { results: RuleResult[]; icon?: LucideIcon }) {
  const Icon = icon;
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
        Hasil pemeriksaan
      </p>
      <div className="flex flex-col gap-2">
        {results.map((result) => (
          <RuleResultAlert key={`${result.title}-${result.reason}`} result={result} />
        ))}
      </div>
    </div>
  );
}