import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, GitCompareArrows, X } from 'lucide-react';
import { PageHeader, Breadcrumb } from '@/components/ui/page-header';
import { Badge } from '@/components/academic/status-badge';
import { ScenarioPanel, WorkloadBar } from '@/components/scenarios/scenario-panel';
import { InlineAlert } from '@/components/ui/alert';
import { coursesById, specializations } from '@/lib/data-repo';
import {
  assessWorkload,
  calculateCredits,
  getCreditLimit,
  validateCreditLimit,
} from '@/domain/academic/rules';
import { useAppStore } from '@/stores/appStore';
import type { Scenario } from '@/domain/types';
import { displaySKS } from '@/lib/format';
import { cn } from '@/lib/cn';

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <th scope="row" className="p-3 text-left align-top text-sm font-medium text-ink">
      {children}
    </th>
  );
}

export function ScenarioComparePage() {
  const [searchParams] = useSearchParams();
  const profile = useAppStore((state) => state.persisted.profile);
  const scenarios = useAppStore((state) => state.persisted.scenarios);

  if (!profile) return null;

  const rawIds = (searchParams.get('ids') ?? '').split(',').filter(Boolean);
  const selected = rawIds
    .map((id) => scenarios.find((s) => s.id === id))
    .filter((s): s is Scenario => Boolean(s))
    .slice(0, 3);

  if (selected.length < 2) {
    return (
      <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
        <Breadcrumb crumbs={[{ label: 'Simulasi', path: '/app/scenarios' }, { label: 'Banding' }]} />
        <InlineAlert
          tone="warning"
          title="Butuh minimal dua skenario"
          reason="Pilih dua hingga tiga skenario dari daftar, lalu tekan tombol Bandingkan."
          nextAction="Kembali ke daftar skenario"
        />
        <Link to="/app/scenarios" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary-strong">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke daftar skenario
        </Link>
      </div>
    );
  }

  const specName = (id: string | null) =>
    id ? specializations.find((s) => s.id === id)?.name ?? 'Tanpa jalur' : 'Tanpa jalur';

  const unionCourseIds = Array.from(
    new Set(selected.flatMap((s) => s.selectedCourseIds)),
  );

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <Breadcrumb
        crumbs={[{ label: 'Simulasi', path: '/app/scenarios' }, { label: 'Banding' }]}
      />
      <PageHeader
        title="Compare Scenarios"
        description={`Perbandingan ${selected.length} rencana berdampingan untuk melihat konsekuensi memilih satu arah.`}
        actions={
          <Link
            to="/app/scenarios"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke daftar
          </Link>
        }
      />

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">
            Perbandingan skenario: semester, jalur, total SKS, beban, dan kepatuhan batas.
          </caption>
          <thead>
            <tr className="bg-surface-subtle">
              <th scope="col" className="p-3 text-left text-sm font-medium text-muted">
                Aspek
              </th>
              {selected.map((scenario) => (
                <th key={scenario.id} scope="col" className="p-3 text-left align-top">
                  <span className="text-sm font-semibold text-ink">{scenario.name}</span>
                  <Link
                    to={`/app/scenarios/${scenario.id}`}
                    className="mt-1 block text-xs text-primary underline hover:text-primary-strong"
                  >
                    Ubah rencana
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <RowLabel>Semester target</RowLabel>
              {selected.map((s) => (
                <td key={s.id} className="p-3 align-top text-muted">
                  Semester {s.targetSemester}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border">
              <RowLabel>Jalur peminatan</RowLabel>
              {selected.map((s) => (
                <td key={s.id} className="p-3 align-top">
                  <Badge tone={s.specializationId ? 'teal' : 'neutral'}>
                    {specName(s.specializationId)}
                  </Badge>
                </td>
              ))}
            </tr>
            <tr className="border-t border-border">
              <RowLabel>Total SKS / batas</RowLabel>
              {selected.map((s) => {
                const credits = calculateCredits(s.selectedCourseIds);
                const rule = validateCreditLimit(profile, s);
                return (
                  <td key={s.id} className={cn('p-3 align-top tabular', rule.status === 'error' ? 'text-danger' : 'text-ink')}>
                    {displaySKS(credits)} / {displaySKS(getCreditLimit(profile.performanceIndex))}
                    <p className="text-xs text-muted">
                      {rule.status === 'error' ? 'melebihi batas' : 'sesuai batas'}
                    </p>
                  </td>
                );
              })}
            </tr>
            <tr className="border-t border-border">
              <RowLabel>Beban rencana</RowLabel>
              {selected.map((s) => (
                <td key={s.id} className="p-3 align-top">
                  <WorkloadBar workload={scenarioWorkload(s)} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <section aria-labelledby="matrix-heading" className="mt-8">
        <h2 id="matrix-heading" className="mb-3 text-base font-semibold text-ink">
          Matriks mata kuliah
        </h2>
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-surface-subtle">
                <th scope="col" className="p-3 text-left text-sm font-medium text-muted">
                  Mata kuliah
                </th>
                {selected.map((s) => (
                  <th key={s.id} scope="col" className="p-3 text-right text-sm font-medium text-muted">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unionCourseIds.map((courseId) => {
                const course = coursesById.get(courseId);
                return (
                  <tr key={courseId} className="border-t border-border">
                    <td className="p-3">
                      <span className="text-ink">{course?.name ?? courseId}</span>
                      <span className="ml-2 text-xs text-muted">
                        Semester {course?.semester ?? '-'} · {course?.credits ?? 0} SKS
                      </span>
                    </td>
                    {selected.map((s) =>
                      s.selectedCourseIds.includes(courseId) ? (
                        <td key={s.id} className="p-3 text-right text-teal">
                          <Check className="inline h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">termasuk</span>
                        </td>
                      ) : (
                        <td key={s.id} className="p-3 text-right text-muted">
                          <X className="inline h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">tidak termasuk</span>
                        </td>
                      ),
                    )}
                  </tr>
                );
              })}
              {unionCourseIds.length === 0 ? (
                <tr className="border-t border-border">
                  <td className="p-3 text-muted" colSpan={selected.length + 1}>
                    Belum ada mata kuliah pada skenario yang dipilih.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="hasil-heading" className="mt-8">
        <h2 id="hasil-heading" className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
          <GitCompareArrows className="h-4 w-4 text-muted" aria-hidden="true" />
          Hasil pemeriksaan tiap skenario
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {selected.map((s) => (
            <div key={s.id} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-ink">{s.name}</h3>
              <ScenarioPanel profile={profile} scenario={s} compact />
            </div>
          ))}
        </div>
      </section>

      <InlineAlert
        tone="info"
        title="Interpretasi"
        reason="Perbandingan ini menyoroti konsekuensi berbasis aturan, bukan rekomendasi mutlak. Keputusan akhir tetap memerlukan diskusi dengan dosen PA."
      />
    </div>
  );
}

function scenarioWorkload(scenario: Scenario) {
  const profile = useAppStore.getState().persisted.profile;
  if (!profile) throw new Error('Profil dibutuhkan untuk menghitung beban.');
  return assessWorkload(profile, scenario);
}