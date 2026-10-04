import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calculator,
  CircleAlert,
  Compass,
  FileText,
  Map,
  Target,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { CreditMeter } from '@/components/ui/credit-meter';
import { Badge, StatusBadge as StatusPill } from '@/components/academic/status-badge';
import { useAppStore } from '@/stores/appStore';
import { academicRules, coursesForSemester, specializations } from '@/lib/data-repo';
import {
  assessInternshipEligibility,
  getCreditLimitInfo,
  validateCreditLimit,
  validateLockAllowed,
} from '@/domain/academic/rules';
import type { StudentProfile, Scenario } from '@/domain/types';
import { displaySKS, formatPerformanceIndex } from '@/lib/format';

interface ActionItem {
  severity: 'info' | 'warning' | 'error';
  title: string;
  body: string;
  to: string;
  cta: string;
}

function buildActions(profile: StudentProfile, scenarios: Scenario[], primary: Scenario | null): ActionItem[] {
  const actions: ActionItem[] = [];
  const internship = assessInternshipEligibility(profile);
  const lockRule = validateLockAllowed(profile);

  if (internship.eligibility !== 'ready') {
    actions.push({
      severity: internship.creditsMet ? 'warning' : 'warning',
      title: `Menuju syarat Magang ${internship.minimumCredits} SKS`,
      body: internship.nextActions.join(' '),
      to: '/app/internship',
      cta: 'Cek kesiapan Magang',
    });
  }

  if (!profile.lockedSpecializationId && lockRule.status === 'ok') {
    actions.push({
      severity: 'info',
      title: 'Bandingkan peminatan sebelum mengunci',
      body: 'Penguncian tersedia sekarang. Cek mata kuliah dan peran karier tiap jalur terlebih dahulu.',
      to: '/app/specializations',
      cta: 'Bandingkan peminatan',
    });
  }

  if (scenarios.length === 0) {
    actions.push({
      severity: 'info',
      title: 'Buat skenario pertamamu',
      body: 'Simulasikan satu rencana untuk menilai beban dan batas SKS semester ini.',
      to: '/app/scenarios/new',
      cta: 'Buat skenario',
    });
  } else if (primary) {
    const creditRule = validateCreditLimit(profile, primary);
    actions.push({
      severity: creditRule.status === 'ok' ? 'info' : creditRule.status,
      title: `Rencana utama: ${primary.name}`,
      body: `${primary.selectedCourseIds.length} mata kuliah dalam rencana. ${creditRule.reason}`,
      to: `/app/scenarios/${primary.id}`,
      cta: 'Tinjau rencana utama',
    });
  } else if (scenarios.length > 0 && !primary) {
    actions.push({
      severity: 'warning',
      title: 'Belum ada rencana utama',
      body: 'Pilih satu skenario sebagai rencana utama agar muncul pada Ringkasan PA.',
      to: '/app/scenarios',
      cta: 'Pilih rencana utama',
    });
  }

  return actions.slice(0, 3);
}

const quickLinks = [
  {
    to: '/app/journey',
    label: 'Peta Studi',
    body: 'Status mata kuliah per semester',
    icon: Map,
  },
  {
    to: '/app/specializations',
    label: 'Peminatan',
    body: 'Mata kuliah dan peran karier',
    icon: Compass,
  },
  {
    to: '/app/scenarios',
    label: 'Simulasi',
    body: 'Uji beban dan batas SKS',
    icon: Calculator,
  },
  {
    to: '/app/internship',
    label: 'Perencanaan Magang',
    body: 'Syarat dan posisi yang diminati',
    icon: Target,
  },
];

export function DashboardPage() {
  const profile = useAppStore((state) => state.persisted.profile);
  const scenarios = useAppStore((state) => state.persisted.scenarios);
  const primaryScenarioId = useAppStore((state) => state.persisted.primaryScenarioId);

  const primary = useMemo(
    () => scenarios.find((scenario) => scenario.id === primaryScenarioId) ?? null,
    [scenarios, primaryScenarioId],
  );

  if (!profile) return null;

  const remainingCredits = Math.max(0, academicRules.graduationCredits - profile.completedCredits);
  const internship = assessInternshipEligibility(profile);
  const currentCourses = coursesForSemester(profile.currentSemester);
  const currentCompleted = currentCourses.filter((course) =>
    profile.completedCourseIds.includes(course.id),
  ).length;
  const actions = buildActions(profile, scenarios, primary);
  const exploredSpecNames = profile.exploredSpecializationIds
    .map((id) => specializations.find((s) => s.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <PageHeader
          title={`Halo, ${profile.name}`}
          description={`Semester ${profile.currentSemester} · IP ${formatPerformanceIndex(profile.performanceIndex)}`}
          actions={
            profile.isDemoPersona ? <Badge tone="info">Profil demo</Badge> : <Badge>Profil pribadi</Badge>
          }
        />
      </motion.div>

      <motion.section
        aria-labelledby="posisi-label"
        className="card mt-6 p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut', delay: 0.05 }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="posisi-label" className="text-base font-semibold text-ink">
            Posisi saat ini
          </h2>
          <StatusPill status="in_progress" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <CreditMeter
            completed={profile.completedCredits}
            total={academicRules.graduationCredits}
            limit={academicRules.graduationCredits}
            label="Progres menuju kelulusan"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="card-subtle p-3">
              <p className="text-xs text-muted">Sisa SKS</p>
              <p className="mt-1 text-lg font-semibold tabular text-ink">
                {displaySKS(remainingCredits)}
              </p>
            </div>
            <div className="card-subtle p-3">
              <p className="text-xs text-muted">Batas SKS semester ini</p>
              <p className="mt-1 text-lg font-semibold tabular text-ink">
                {displaySKS(getCreditLimitInfo(profile.performanceIndex).limit)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:gap-6">
          <p>
            {currentCompleted} dari {currentCourses.length} mata kuliah Semester {profile.currentSemester} tercatat
            selesai
          </p>
          <p className="sm:ml-auto">
            {profile.completedCourseIds.length} mata kuliah total telah diselesaikan
          </p>
        </div>
        {exploredSpecNames.length > 0 ? (
          <p className="mt-3 text-sm text-muted">
            Sedang membandingkan: {exploredSpecNames.join(' dan ')}.
          </p>
        ) : null}
      </motion.section>

      <motion.div
        className="mt-6 grid gap-6 lg:grid-cols-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut', delay: 0.1 }}
      >
        <section
          aria-labelledby="tindakan-label"
          className="card-subtle p-5 lg:col-span-2 lg:row-span-2"
        >
          <h2 id="tindakan-label" className="mb-3 text-base font-semibold text-ink">
            Yang bisa kamu lakukan sekarang
          </h2>
          {actions.length === 0 ? (
            <p className="text-sm text-muted">
              Belum ada catatan mendesak. Kamu bisa lanjut menyiapkan bahan konsultasi dengan dosen PA.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {actions.map((action, index) => (
                <li key={index} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CircleAlert
                        className={
                          action.severity === 'error'
                            ? 'h-4 w-4 shrink-0 text-danger'
                            : action.severity === 'warning'
                              ? 'h-4 w-4 shrink-0 text-warning'
                              : 'h-4 w-4 shrink-0 text-primary'
                        }
                        aria-hidden="true"
                      />
                      <h3 className="text-sm font-medium text-ink">{action.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted">{action.body}</p>
                  </div>
                  <Link
                    to={action.to}
                    className="shrink-0 text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {action.cta}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="magang-label" className="card-subtle p-5">
          <div className="flex items-center justify-between">
            <h2 id="magang-label" className="text-base font-semibold text-ink">
              Cek kesiapan Magang
            </h2>
            <Badge tone={internship.eligibility === 'ready' ? 'success' : internship.eligibility === 'in_progress' ? 'warning' : 'info'}>
              {internship.eligibility === 'ready'
                ? 'Syarat dasar terpenuhi'
                : internship.eligibility === 'in_progress'
                  ? 'Perlu konfirmasi nilai'
                  : 'Belum memenuhi'}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted">
            Persyaratan: {internship.minimumCredits} SKS dan seluruh nilai di atas C. SKS saat ini{' '}
            <span className="tabular text-ink">{internship.completedCredits}</span>.
          </p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
            {internship.nextActions.slice(0, 2).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/app/internship"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Perencanaan Magang <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        <section aria-labelledby="pintasan-label" className="card-subtle p-5">
          <h2 id="pintasan-label" className="mb-3 text-base font-semibold text-ink">
            Mau lanjut ke mana?
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex h-full flex-col gap-1.5 rounded-control border border-border bg-surface p-3 transition-colors hover:border-primary/40 hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-ink">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      {item.label}
                    </span>
                    <span className="text-xs text-muted">{item.body}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/app/advisor-brief"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Buka Ringkasan PA
          </Link>
        </section>
      </motion.div>
    </div>
  );
}