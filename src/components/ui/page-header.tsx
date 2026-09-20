import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  path?: string;
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Jejak halaman" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.label} className="flex items-center gap-1">
              {crumb.path && !isLast ? (
                <Link
                  to={crumb.path}
                  className="rounded-control px-1 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-ink' : ''}>
                  {crumb.label}
                </span>
              )}
              {!isLast ? <ChevronRight className="h-3.5 w-3.5 text-border" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  id,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-ink md:text-3xl" id={id}>
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-base text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 md:shrink-0">{actions}</div> : null}
    </header>
  );
}