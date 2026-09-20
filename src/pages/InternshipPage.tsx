import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarClock, Check, Flag, Plus, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge, StatusBadge } from '@/components/academic/status-badge';
import { InlineAlert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/controls';
import {
  academicRules,
  careerRoles,
  coursesForSemester,
  coursesById,
} from '@/lib/data-repo';
import { assessInternshipEligibility } from '@/domain/academic/rules';
import { useAppStore } from '@/stores/appStore';
import { displaySKS } from '@/lib/format';
import { cn } from '@/lib/cn';

export function InternshipPage() {
  const profile = useAppStore((state) => state.persisted.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const [customTitle, setCustomTitle] = useState('');

  const internship = useMemo(() => {
    if (!profile) return null;
    return assessInternshipEligibility(profile);
  }, [profile]);

  if (!profile || !internship) return null;

  const internshipCourses = coursesById
    ? Array.from(coursesById.values()).filter((course) => course.name.toLowerCase().includes('magang'))
    : [];

  const eligibiltyMeta = {
    ready: { label: 'Siap mendaftar', cls: 'border-success/30 bg-success/10 text-success' },
    in_progress: { label: 'Perlu konfirmasi nilai', cls: 'border-warning/30 bg-warning/10 text-warning' },
    needs_work: { label: 'Belum memenuhi', cls: 'border-border bg-surface-subtle text-muted' },
  }[internship.eligibility];

  const targets = profile.targetInternshipTitles;
  const availableTitles = Array.from(
    new Set(careerRoles.flatMap((role) => role.internshipTitles)),
  );

  function toggleTarget(title: string) {
    const next = targets.includes(title)
      ? targets.filter((t) => t !== title)
      : [...targets, title];
    updateProfile({ targetInternshipTitles: next });
  }

  function addCustomTarget() {
    const trimmed = customTitle.trim();
    if (!trimmed || targets.includes(trimmed)) return;
    updateProfile({ targetInternshipTitles: [...targets, trimmed] });
    setCustomTitle('');
  }

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <PageHeader
        title="Perencanaan Magang"
        description={`Posisi Magang dibuka sesuai persyaratan: ${internship.minimumCredits} SKS dan seluruh nilai di atas C (${academicRules.internship.allCompletedGradesMustBeAbove}).`}
      />

      <section aria-labelledby="status-magang-heading" className="card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="status-magang-heading" className="text-base font-semibold text-ink">
            Status persyaratan Magang
          </h2>
          <span className={cn('chip-status', eligibiltyMeta.cls)}>
            <Flag className="h-3.5 w-3.5" aria-hidden="true" />
            {eligibiltyMeta.label}
          </span>
        </div>

        <ul className="mt-4 flex flex-col divide-y divide-border">
          <li className="flex items-center gap-3 py-3">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                internship.creditsMet ? 'bg-success/10 text-success' : 'bg-surface-subtle text-muted',
              )}
            >
              {internship.creditsMet ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">SKS selesai minimal {internship.minimumCredits}</p>
              <p className="text-sm text-muted">
                Saat ini {displaySKS(internship.completedCredits)}.
                {!internship.creditsMet
                  ? ` Sisa ${displaySKS(internship.minimumCredits - internship.completedCredits)}.`
                  : ' Persyaratan terpenuhi.'}
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 py-3">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                internship.gradesAboveC ? 'bg-success/10 text-success' : 'bg-surface-subtle text-muted',
              )}
            >
              {internship.gradesAboveC ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                Seluruh nilai di atas {academicRules.internship.allCompletedGradesMustBeAbove}
              </p>
              <p className="text-sm text-muted">
                {internship.gradesAboveC
                  ? 'Dinyatakan pada profil bahwa seluruh nilai sudah di atas C.'
                  : 'Belum dinyatakan atau belum sesuai. Perbarui jawaban pada profil.'}
              </p>
            </div>
          </li>
        </ul>

        {internship.eligibility === 'ready' ? (
          <div className="mt-4 border-t border-border pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <BadgeCheck className="h-4 w-4 text-success" aria-hidden="true" />
              Siap administrasi
            </h3>
            <p className="mt-1 text-sm text-muted">
              Saat ini Anda dapat membahas rencana Magang dengan dosen PA. Konfirmasi jadwal dan
              persetujuan program studi dilakukan oleh pihak terkait.
            </p>
          </div>
        ) : (
          <InlineAlert
            tone="warning"
            title={`${eligibiltyMeta.label}`}
            reason={internship.nextActions.join(' ')}
          />
        )}
      </section>

      <section aria-labelledby="posisi-heading" className="card mt-6 p-5 md:p-6">
        <h2 id="posisi-heading" className="text-base font-semibold text-ink">
          Posisi yang diminati
        </h2>
        <p className="mt-1 text-sm text-muted">
          Informasi ini dipakai pada Kompas Karier dan Ringkasan PA. Bukan jaminan penerimaan.
        </p>

        <fieldset className="mt-4">
          <legend className="sr-only">Daftar posisi Magang</legend>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {availableTitles.map((title) => (
              <CheckboxField
                key={title}
                id={`intern-${title}`}
                label={title}
                checked={targets.includes(title)}
                onCheckedChange={() => toggleTarget(title)}
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="custom-intern" className="field-label">
              Judul kustom
            </label>
            <input
              id="custom-intern"
              type="text"
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              placeholder="Misalnya: Business Analyst Inter"
              className="w-full rounded-control border border-border bg-surface px-3 py-2.5 text-base focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <Button variant="secondary" size="md" onClick={addCustomTarget}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambahkan
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {targets.map((title) => (
            <span
              key={title}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-sm text-teal"
            >
              {title}
              <button
                type="button"
                aria-label={`Hapus ${title}`}
                onClick={() => toggleTarget(title)}
                className="rounded-full p-0.5 hover:bg-teal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
          {targets.length === 0 ? (
            <p className="text-sm text-muted">Belum ada posisi yang dipilih.</p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="dukungan-heading" className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 id="dukungan-heading" className="flex items-center gap-2 text-base font-semibold text-ink">
            <CalendarClock className="h-4 w-4 text-teal" aria-hidden="true" />
            Mata kuliah Magang pada kurikulum
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {internshipCourses.map((course) => {
              const semesterCourses = focusSemesterCourses(course.semester);
              return (
                <li key={course.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{course.name}</p>
                    <p className="text-xs text-muted">
                      Semester {course.semester} · {course.credits} SKS · {semesterCourses} mata kuliah
                      pada semester itu
                    </p>
                  </div>
                  <StatusBadge status="available" />
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Masukkan mata kuliah Magang ke dalam skenario pada semester target setelah persyaratan
            SKS terpenuhi.
          </p>
          <Link
            to="/app/scenarios/new"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary-strong"
          >
            Buka pembuat skenario
          </Link>
        </div>

        <div className="card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <BadgeCheck className="h-4 w-4 text-teal" aria-hidden="true" />
            Peran yang relevan dengan posisi diminati
          </h2>
          {targets.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Pilih posisi untuk melihat peran karier dan keterampilan yang mendukung.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {relatedRolesForTargets(targets).map((role) => (
                <li key={role.id} className="card-subtle p-3">
                  <p className="text-sm font-medium text-ink">{role.title}</p>
                  <p className="mt-1 text-xs text-muted">Keterampilan: {role.skills.join(', ')}</p>
                  <Badge tone="neutral" className="mt-2">
                    {role.internshipTitles.join(' · ')}
                  </Badge>
                </li>
              ))}
              {relatedRolesForTargets(targets).length === 0 ? (
                <li className="text-sm text-muted">
                  Judul kustom tidak terhubung ke peran standar. Tandai peran pada Kompas Karier
                  untuk didiskusikan bersama PA.
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function focusSemesterCourses(semester: number): number {
  return coursesForSemester(semester).length;
}

function relatedRolesForTargets(targets: string[]) {
  return careerRoles
    .filter((role) => role.internshipTitles.some((title) => targets.includes(title)))
    .slice(0, 4);
}