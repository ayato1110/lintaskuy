import { cn } from '@/lib/cn';

export function CreditMeter({
  completed,
  total,
  limit,
  label,
}: {
  completed: number;
  total: number;
  limit?: number;
  label?: string;
}) {
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const meetsMinimum = !limit || completed >= limit;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <p className="text-sm text-muted">
          <span className="tabular text-2xl font-semibold text-ink">{completed}</span> dari {total} SKS
        </p>
        {limit ? (
          <BadgeProgress meets={meetsMinimum} limit={limit} />
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label ?? 'Progres SKS'}
        className="h-2 w-full overflow-hidden rounded-full bg-border"
      >
        <div
          className={cn('h-full rounded-full', meetsMinimum ? 'bg-success' : 'bg-primary')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function BadgeProgress({ meets, limit }: { meets: boolean; limit: number }) {
  return (
    <span
      className={cn(
        'chip-status',
        meets ? 'border-success/30 bg-success/10 text-success' : 'border-warning/30 bg-warning/10 text-warning',
      )}
    >
      {meets ? 'Memenuhi' : `Batas ${limit} SKS`}
    </span>
  );
}