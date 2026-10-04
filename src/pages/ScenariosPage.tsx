import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, Copy, GitCompareArrows, Plus, Star, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/academic/status-badge';
import { ConfirmDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { WorkloadBar } from '@/components/scenarios/scenario-panel';
import { scenarioCredits } from '@/domain/scenario/analyze';
import { specializations } from '@/lib/data-repo';
import { assessWorkload, getCreditLimit, validateCreditLimit } from '@/domain/academic/rules';
import { useAppStore } from '@/stores/appStore';
import type { Scenario } from '@/domain/types';
import { displaySKS } from '@/lib/format';
import { cn } from '@/lib/cn';

const MAX_COMPARE = 2;

export function ScenariosPage() {
  const navigate = useNavigate();
  const profile = useAppStore((state) => state.persisted.profile);
  const scenarios = useAppStore((state) => state.persisted.scenarios);
  const primaryScenarioId = useAppStore((state) => state.persisted.primaryScenarioId);
  const setPrimaryScenario = useAppStore((state) => state.setPrimaryScenario);
  const duplicateScenario = useAppStore((state) => state.duplicateScenario);
  const deleteScenario = useAppStore((state) => state.deleteScenario);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null);

  const sorted = useMemo(
    () => [...scenarios].sort((a, b) => a.targetSemester - b.targetSemester || a.createdAt.localeCompare(b.createdAt)),
    [scenarios],
  );

  if (!profile) return null;

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      const has = current.includes(id);
      if (has) return current.filter((c) => c !== id);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, id];
    });
  }

  const specNameById = (id: string | null) =>
    id ? specializations.find((s) => s.id === id)?.name ?? 'Tanpa jalur' : 'Tanpa jalur';

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <PageHeader
        title="Scenario Simulator"
        description="Simulasikan kombinasi mata kuliah, pilih dua rencana untuk dibandingkan, lalu jadikan satu sebagai rencana utama."
        actions={
          <Link to="/app/scenarios/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Buat skenario
            </Button>
          </Link>
        }
      />

      {scenarios.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Belum ada skenario"
          description="Buat rencana pertama untuk Semester yang sedang berjalan, lalu periksa beban dan batasnya."
          actionLabel="Buat skenario"
          onAction={() => navigate('/app/scenarios/new')}
        />
      ) : (
        <>
          <div className="card-subtle mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Beri tanda pada {compareIds.length} dari maksimal {MAX_COMPARE} skenario untuk
              dibandingkan. Pilih dua rencana untuk membandingkannya.
            </p>
            <Button
              variant={compareIds.length >= 2 ? 'primary' : 'outline'}
              disabled={compareIds.length < 2}
              onClick={() => navigate(`/app/scenarios/compare?ids=${compareIds.join(',')}`)}
            >
              <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
              Bandingkan ({compareIds.length})
            </Button>
          </div>

          <ul className="flex flex-col gap-4">
            {sorted.map((scenario) => {
              const isPrimary = scenario.id === primaryScenarioId;
              const credits = scenarioCredits(scenario);
              const workload = assessWorkload(profile, scenario);
              const limitRule = validateCreditLimit(profile, scenario);
              const selected = compareIds.includes(scenario.id);
              return (
                <li key={scenario.id} className="card flex flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-ink">{scenario.name}</h2>
                        {isPrimary ? <Badge tone="primary">Rencana utama</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        Semester {scenario.targetSemester} · {specNameById(scenario.specializationId)}
                      </p>
                    </div>
                    <Button
                      variant={selected ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => toggleCompare(scenario.id)}
                      aria-pressed={selected}
                    >
                      <CheckSquare className="h-4 w-4" aria-hidden="true" />
                      {selected ? 'Sudah dipilih' : 'Pilih untuk dibandingkan'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <WorkloadBar workload={workload} />
                    <div className="grid grid-cols-2 gap-3 content-start">
                      <div className="card-subtle p-3">
                        <p className="text-xs text-muted">Total</p>
                        <p className="mt-1 text-lg font-semibold tabular text-ink">{displaySKS(credits)}</p>
                      </div>
                      <div className="card-subtle p-3">
                        <p className="text-xs text-muted">Batas</p>
                        <p className="mt-1 text-lg font-semibold tabular text-ink">
                          {displaySKS(getCreditLimit(profile.performanceIndex))}
                        </p>
                        <p className={cn('text-xs', limitRule.status === 'error' ? 'text-danger' : 'text-muted')}>
                          {limitRule.status === 'error' ? `total melebihi (${credits})` : 'total sesuai'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <Link to={`/app/scenarios/${scenario.id}`}>
                      <Button size="sm" variant="secondary">
                        Buka dan ubah
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={isPrimary ? 'ghost' : 'outline'}
                      onClick={() => setPrimaryScenario(isPrimary ? null : scenario.id)}
                    >
                      <Star className="h-4 w-4" aria-hidden="true" />
                      {isPrimary ? 'Batalkan sebagai rencana utama' : 'Jadikan rencana utama'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => duplicateScenario(scenario.id)}>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      Duplikasi
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-danger hover:text-danger"
                      onClick={() => setDeleteTarget(scenario)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Hapus
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Hapus skenario ${deleteTarget?.name ?? ''}?`}
        description="Rencana dan hasil perbandingannya akan dihapus dari data lokal. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteScenario(deleteTarget.id);
          setCompareIds((current) => current.filter((id) => id !== deleteTarget?.id));
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}