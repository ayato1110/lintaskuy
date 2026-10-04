import { useMemo, useState } from 'react';
import { Search, TriangleAlert } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/academic/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { coursesForSemester, academicRules } from '@/lib/data-repo';
import { getCourseStatus } from '@/domain/academic/rules';
import { useAppStore } from '@/stores/appStore';
import type { Course, CourseStatus } from '@/domain/types';
import { cn } from '@/lib/cn';

const statusOptions: { value: CourseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'completed', label: 'Selesai' },
  { value: 'in_progress', label: 'Sedang ditempuh' },
  { value: 'available', label: 'Tersedia' },
  { value: 'planned', label: 'Direncanakan' },
  { value: 'locked', label: 'Terkunci' },
  { value: 'attention', label: 'Perlu perhatian' },
];

function semesterSks(semester: number, completedIds: string[]): { done: number; total: number } {
  const items = coursesForSemester(semester);
  return {
    total: items.reduce((sum, c) => sum + c.credits, 0),
    done: items.filter((c) => completedIds.includes(c.id)).reduce((sum, c) => sum + c.credits, 0),
  };
}

function CourseCard({ course, status, reason }: { course: Course; status: CourseStatus; reason: string }) {
  return (
    <article className="flex h-full flex-col gap-2 rounded-control border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted">{course.code ?? 'Mata kuliah'}</p>
          <h3 className="text-sm font-semibold leading-snug text-ink">{course.name}</h3>
        </div>
        <p className="shrink-0 text-sm tabular text-muted">{course.credits} SKS</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={status} />
      </div>
      <p className="text-xs leading-snug text-muted">{reason}</p>
    </article>
  );
}

export function JourneyPage() {
  const profile = useAppStore((state) => state.persisted.profile);
  const primaryScenario = useAppStore((state) =>
    state.persisted.scenarios.find((scenario) => scenario.id === state.persisted.primaryScenarioId) ?? null,
  );

  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const context = useMemo(
    () => ({ activeCourseIds: primaryScenario?.selectedCourseIds ?? [] }),
    [primaryScenario],
  );

  if (!profile) return null;

  const completedIds = profile.completedCourseIds;
  const semesters = Array.from({ length: 8 }, (_, index) => index + 1);
  const normalizedQuery = query.trim().toLowerCase();

  const visiblePerSemester = semesters.map((semester) =>
    coursesForSemester(semester)
      .map((course) => {
        const result = getCourseStatus(course, profile, context);
        return { course, result };
      })
      .filter(({ course, result }) => {
        if (statusFilter !== 'all' && result.status !== statusFilter) return false;
        if (normalizedQuery) {
          const haystack = `${course.code ?? ''} ${course.name}`.toLowerCase();
          if (!haystack.includes(normalizedQuery)) return false;
        }
        return true;
      }),
  );

  const totalVisible = visiblePerSemester.reduce((sum, items) => sum + items.length, 0);

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <PageHeader
        title="Peta Studi"
        description={`Mata kuliah kurikulum Sistem Informasi Universitas Jambi menuju ${academicRules.graduationCredits} SKS. Status pada kartu disusun dari profilmu dan rencana utama.`}
      />

      <section aria-label="Legenda status" className="card-subtle mb-6 p-4">
        <ul className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                aria-pressed={statusFilter === option.value}
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  statusFilter === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-ink',
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
        <label htmlFor="journey-search" className="mt-4 flex items-center gap-2 rounded-control border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            id="journey-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama atau kode mata kuliah"
            className="w-full bg-transparent py-2.5 text-base placeholder:text-muted focus-visible:outline-none"
          />
        </label>
      </section>

      {totalVisible === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ada mata kuliah yang cocok"
          description="Ubah kata kunci atau status yang dipilih untuk melihat kembali daftar."
          actionLabel="Reset filter"
          onAction={() => {
            setQuery('');
            setStatusFilter('all');
          }}
        />
      ) : null}

      <div className="flex flex-col gap-8">
        {semesters.map((semester) => {
          const items = visiblePerSemester[semester - 1];
          if (items.length === 0) return null;
          const sks = semesterSks(semester, completedIds);
          const isCurrent = semester === profile.currentSemester;
          return (
            <section key={semester} aria-labelledby={`semester-${semester}-heading`}>
              <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`semester-${semester}-heading`} className="text-lg font-semibold text-ink">
                  Semester {semester}
                  {isCurrent ? (
                    <span className="ml-2 align-middle text-xs font-medium text-primary">
                      semester berjalan
                    </span>
                  ) : null}
                </h2>
                <p className="text-sm tabular text-muted">
                  {sks.done} dari {sks.total} SKS
                </p>
              </header>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(({ course, result }) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    status={result.status}
                    reason={result.reason}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {primaryScenario ? (
        <div className="mt-4 flex items-start gap-3 text-sm text-muted">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
          <p>
            Kartu berstatus Direncanakan berasal dari rencana utama ({primaryScenario.name}).
          </p>
        </div>
      ) : null}

      <p className="mt-3 text-xs text-muted">
        Struktur Semester 8 dan sebagian prasyarat mata kuliah masih berupa asumsi demo dan perlu
        dikonfirmasikan ke program studi atau dosen PA.
      </p>
    </div>
  );
}