import { ShieldCheck, Weight } from 'lucide-react';
import { Badge } from '@/components/academic/status-badge';
import { RuleOverview, SummaryTip } from '@/components/ui/alert';
import { workloadToneMap } from '@/domain/scenario/workload-meta';
import {
  assessWorkload,
  countProjectHeavy,
  getCreditLimit,
  validateCreditLimit,
  validateLockedTrackMatch,
  validatePrerequisites,
  validateSelectedSameSemester,
  validateScenarioTrack,
} from '@/domain/academic/rules';
import { calculateCredits } from '@/domain/academic/rules';
import type { Scenario, StudentProfile, WorkloadAssessment } from '@/domain/types';
import { cn } from '@/lib/cn';

export function WorkloadBar({ workload }: { workload: WorkloadAssessment }) {
  const meta = workloadToneMap[workload.category];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Weight className="h-4 w-4" aria-hidden="true" />
          {meta.label}
        </span>
        <Badge tone={meta.tone}>{workload.category}</Badge>
      </div>
      <ul className="flex flex-col gap-1 text-sm text-muted">
        {workload.reasons.map((reason) => (
          <li key={reason} className="flex items-start gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScenarioPanel({
  profile,
  scenario,
  compact,
}: {
  profile: StudentProfile;
  scenario: Scenario;
  compact?: boolean;
}) {
  const totalCredits = calculateCredits(scenario.selectedCourseIds);
  const creditLimit = validateCreditLimit(profile, scenario);
  const track = validateScenarioTrack(scenario);
  const lockedMatch = validateLockedTrackMatch(profile, scenario);
  const sameSemester = validateSelectedSameSemester(scenario);
  const prerequisites = validatePrerequisites(profile, scenario);
  const workload = assessWorkload(profile, scenario);

  const projectCount = countProjectHeavy(scenario.selectedCourseIds);

  if (scenario.selectedCourseIds.length === 0) {
    return (
      <SummaryTip icon={ShieldCheck}>
        Belum ada mata kuliah di dalam rencana ini. Pilih mata kuliah pada daftar untuk melihat catatan
        dan beban semester.
      </SummaryTip>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!compact ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card-subtle p-3">
            <p className="text-xs text-muted">Total SKS</p>
            <p className="mt-1 text-lg font-semibold tabular text-ink">{totalCredits} SKS</p>
            <p className="text-xs text-muted">
              Batas {getCreditLimit(profile.performanceIndex)} SKS untuk IP {profile.performanceIndex.toFixed(2)}
            </p>
          </div>
          <div className="card-subtle p-3">
            <p className="text-xs text-muted">Mata kuliah berbasis proyek</p>
            <p className="mt-1 text-lg font-semibold tabular text-ink">{projectCount}</p>
          </div>
          <div className="card-subtle p-3">
            <p className="text-xs text-muted">Dasar pemeriksaan</p>
            <p className="mt-1 text-sm font-medium text-ink">Kurikulum dan aturan akademik</p>
            <p className="text-xs text-muted">Berdasarkan kurikulum program studi.</p>
          </div>
        </div>
      ) : null}

      <div className={cn('card-subtle p-4', compact && 'p-3')}>
        <WorkloadBar workload={workload} />
      </div>

      <RuleOverview results={[creditLimit, track, lockedMatch, sameSemester, ...prerequisites]} />
    </div>
  );
}