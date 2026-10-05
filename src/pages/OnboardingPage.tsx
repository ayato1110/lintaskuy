import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CheckboxField, RadioGroupField } from '@/components/ui/controls';
import { FieldShell, NumberInput, TextInput } from '@/components/ui/input';
import { SelectField, type SelectOption } from '@/components/ui/select';
import {
  careerRoles,
  coursesById,
  coursesForSemester,
  specializations,
} from '@/lib/data-repo';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/cn';
import type { StudentProfile, WeeklyCommitment } from '@/domain/types';
import { historicalSemestersFor, pruneCompletedCourseIds } from '@/domain/academic/progress';
import { displaySKS } from '@/lib/format';

const semesterOptions: SelectOption[] = Array.from({ length: 8 }, (_, i) => ({
  value: String(i + 1),
  label: `Semester ${i + 1}`,
}));

const internshipTitleOptions: SelectOption[] = Array.from(
  new Set(careerRoles.flatMap((role) => role.internshipTitles)),
).map((title) => ({ value: title, label: title }));

const stepTitles = ['Semester dan nilai', 'Riwayat matakuliah', 'Peminatan dan karier', 'Aktivitas dan Magang'];

const IP_ERROR = 'Masukkan Indeks Prestasi antara 0 dan 4.';

export function OnboardingPage() {
  const navigate = useNavigate();
  const loadDemoProfile = useAppStore((state) => state.loadDemoProfile);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState<string | null>(null);
  const [performanceIndex, setPerformanceIndex] = useState('');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [gradesAboveC, setGradesAboveC] = useState<boolean | null>(null);
  const [exploredSpecs, setExploredSpecs] = useState<string[]>([]);
  const [exploredRoles, setExploredRoles] = useState<string[]>([]);
  const [commitments, setCommitments] = useState<WeeklyCommitment[]>([]);
  const [internTitles, setInternTitles] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [semesterNote, setSemesterNote] = useState('');
  const [saving, setSaving] = useState(false);

  const semesterNumber = semester ? Number(semester) : 0;
  const hasHistory = semesterNumber >= 2;

  const historicalSemesters = useMemo(
    () => historicalSemestersFor(semesterNumber),
    [semesterNumber],
  );

  const completedCredits = useMemo(
    () =>
      completedIds.reduce((sum, id) => sum + (coursesById.get(id)?.credits ?? 0), 0),
    [completedIds],
  );

  function errorsForStep(current: number): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (current === 1) {
      if (!semester) nextErrors.semester = 'Pilih semester aktif kamu saat ini.';
      const ip = Number(performanceIndex.trim().replace(',', '.'));
      if (performanceIndex.trim() === '' || Number.isNaN(ip) || ip < 0 || ip > 4) {
        nextErrors.performanceIndex = IP_ERROR;
      }
    }
    if (current === 2) {
      if (hasHistory && completedIds.length === 0) {
        nextErrors.completed = 'Pilih mata kuliah yang sudah selesai, atau tandai seluruhnya pada tiap semester.';
      }
      if (hasHistory && gradesAboveC === null) {
        nextErrors.gradesAboveC =
          'Jawab pertanyaan nilai di atas. Informasi ini diperlukan untuk pemeriksaan Magang.';
      }
    }
    return nextErrors;
  }

  function validateStep(current: number): boolean {
    const nextErrors = errorsForStep(current);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setErrors({});
    setStep((value) => Math.min(4, value + 1));
  }

  function goBack() {
    setErrors({});
    setStep((value) => Math.max(1, value - 1));
  }

  function handleSemesterChange(value: string) {
    const nextSemester = Number(value);
    const previousSemester = semesterNumber;
    setSemester(value);
    setErrors((current) => ({ ...current, semester: '', performanceIndex: current.performanceIndex ?? '' }));

    if (nextSemester === previousSemester) return;

    const { kept, removed } = pruneCompletedCourseIds(completedIds, nextSemester);
    setCompletedIds(kept);

    if (removed.length === 0) {
      setSemesterNote('');
      return;
    }
    const removedSemesters = Array.from(new Set(removed.map((course) => course.semester))).sort(
      (a, b) => a - b,
    );
    const list = removedSemesters
      .map((sem) => `Semester ${sem}`)
      .join(', ')
      .replace(/, ([^,]*)$/, ' dan $1');
    setSemesterNote(
      `${removed.length} mata kuliah dari ${list} dikeluarkan dari riwayat karena semester aktifmu sekarang Semester ${nextSemester}.`,
    );
  }

  function toggleCompleted(courseId: string) {
    setCompletedIds((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );
  }

  function toggleAllForSemester(targetSemester: number) {
    const ids = coursesForSemester(targetSemester)
      .filter((c) => c.type !== 'demo_assumption')
      .map((c) => c.id);
    const allSelected = ids.every((id) => completedIds.includes(id));
    setCompletedIds((current) =>
      allSelected
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  }

  function toggleExploredSpec(specId: string) {
    setExploredSpecs((current) =>
      current.includes(specId) ? current.filter((id) => id !== specId) : [...current, specId],
    );
  }

  function toggleExploredRole(roleId: string) {
    setExploredRoles((current) =>
      current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId],
    );
  }

  function toggleInternTitle(title: string) {
    setInternTitles((current) =>
      current.includes(title) ? current.filter((t) => t !== title) : [...current, title],
    );
  }

  function finish() {
    if (saving) return;
    for (let current = 1; current <= 4; current += 1) {
      const stepErrors = errorsForStep(current);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setStep(current);
        return;
      }
    }
    if (!semesterNumber) return;

    setSaving(true);
    const profile: StudentProfile = {
      id: `student-${Date.now().toString(36)}`,
      name: name.trim() || 'Mahasiswa',
      isDemoPersona: false,
      currentSemester: semesterNumber,
      performanceIndex: Number(performanceIndex.trim().replace(',', '.')),
      completedCourseIds: completedIds,
      completedCredits,
      allCompletedGradesAboveC: gradesAboveC === true,
      weeklyCommitments: commitments,
      exploredSpecializationIds: exploredSpecs,
      lockedSpecializationId: null,
      exploredCareerRoleIds: exploredRoles,
      targetInternshipTitles: internTitles,
    };
    completeOnboarding(profile);
    navigate('/app');
  }

  return (
    <div className="min-h-screen bg-surface-subtle">
      <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-8 md:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-semibold tracking-tight text-ink">
            LINTAS<span className="text-primary">.</span>
          </p>
          <button
            type="button"
            onClick={() => {
              loadDemoProfile();
              navigate('/app');
            }}
            className="min-h-11 rounded-control px-2 text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Gunakan profil demo Kang Haerin
          </button>
        </header>

        <ol aria-label="Progres onboarding" className="mb-8 flex items-center gap-2">
          {stepTitles.map((title, index) => {
            const stepNumber = index + 1;
            const isPast = stepNumber < step;
            const isCurrent = stepNumber === step;
            return (
              <li
                key={title}
                className="flex min-w-0 flex-1 items-center gap-2"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    isCurrent
                      ? 'border-primary bg-primary text-white'
                      : isPast
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-muted',
                  )}
                >
                  {isPast ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : stepNumber}
                </span>
                <span
                  className={cn(
                    'hidden truncate text-xs font-medium sm:inline',
                    isCurrent ? 'text-ink' : 'text-muted',
                  )}
                >
                  {title}
                </span>
                {isCurrent ? (
                  <span className="truncate text-xs font-medium text-ink sm:hidden">{title}</span>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="card p-5 md:p-8">
          <h1
            aria-live="polite"
            className="mb-6 text-xl font-semibold text-ink md:text-2xl"
          >
            Langkah {step} dari 4: {stepTitles[step - 1]}
          </h1>

          {step === 1 ? (
            <section className="flex flex-col gap-5" aria-labelledby="step-1-heading">
              <div>
                <h2 id="step-1-heading" className="text-sm font-semibold text-ink">
                  Semester dan Indeks Prestasi
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Isi posisi akademikmu saat ini. Informasi ini digunakan untuk menyesuaikan batas
                  SKS dan perjalanan studi.
                </p>
              </div>
              <TextInput
                id="profile-name"
                label="Nama panggilan (opsional)"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Contoh: Ripa"
                hint="Jika dikosongkan, kami akan menggunakan “Mahasiswa”."
              />
              <SelectField
                id="current-semester"
                label="Semester aktif saat ini"
                value={semester}
                onValueChange={handleSemesterChange}
                options={semesterOptions}
                placeholder="Pilih semester"
                error={errors.semester}
              />
              {semesterNote ? (
                <p className="text-sm text-muted" role="status">
                  {semesterNote}
                </p>
              ) : null}
              <NumberInput
                id="performance-index"
                label="Indeks Prestasi"
                value={performanceIndex}
                onChange={(event) => setPerformanceIndex(event.target.value)}
                step="0.01"
                min="0"
                max="4"
                inputMode="decimal"
                placeholder="Contoh: 3.67"
                hint="Gunakan titik untuk angka desimal, misalnya 3.67. Sesuaikan dengan indeks yang digunakan dalam kebijakan akademik kampusmu. Di atas 3.00 memiliki batas 24 SKS. Nilai 3.00 atau di bawahnya memiliki batas 21 SKS."
                error={errors.performanceIndex}
              />
            </section>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-5">
              <div>
                <h2 id="riwayat-heading" className="text-sm font-semibold text-ink">
                  Mata kuliah yang sudah selesai
                </h2>
                {hasHistory ? (
                  <>
                    <p className="mt-1 text-sm text-muted">
                      Pilih mata kuliah yang sudah kamu selesaikan sebelum semester aktif saat ini.
                    </p>
                    <div
                      className="mt-4 flex flex-col gap-4"
                      role="group"
                      aria-labelledby="riwayat-heading"
                    >
                      {historicalSemesters.map((sem) => {
                        const semesterCourseIds = coursesForSemester(sem)
                          .filter((c) => c.type !== 'demo_assumption')
                          .map((c) => c.id);
                        const allSelected = semesterCourseIds.every((id) =>
                          completedIds.includes(id),
                        );
                        return (
                          <div key={sem} className="card-subtle p-3">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <h3 className="text-sm font-medium text-ink">Semester {sem}</h3>
                              <button
                                type="button"
                                onClick={() => toggleAllForSemester(sem)}
                                className="min-h-11 rounded-control px-2 text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                              >
                                {allSelected ? 'Batalkan semua' : 'Pilih semua'}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              {coursesForSemester(sem)
                                .filter((c) => c.type !== 'demo_assumption')
                                .map((course) => (
                                  <CheckboxField
                                    key={course.id}
                                    id={`onboard-${course.id}`}
                                    label={`${course.name}, ${course.credits} SKS`}
                                    checked={completedIds.includes(course.id)}
                                    onCheckedChange={() => toggleCompleted(course.id)}
                                  />
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted">
                    Kamu belum memiliki riwayat mata kuliah dari semester sebelumnya.
                  </p>
                )}
                <p className="mt-3 text-sm text-muted">
                  Total SKS selesai:{' '}
                  <span className="tabular font-semibold text-ink">
                    {displaySKS(completedCredits)}
                  </span>
                </p>
                {errors.completed ? (
                  <p className="mt-2 text-sm text-danger" role="alert">
                    {errors.completed}
                  </p>
                ) : null}
              </div>

              {hasHistory ? (
                <RadioGroupField
                  id="grades-above-c"
                  label="Apakah semua nilai mata kuliah yang sudah kamu tempuh berada di atas C?"
                  value={gradesAboveC === null ? null : String(gradesAboveC)}
                  onValueChange={(value) => setGradesAboveC(value === 'true')}
                  options={[
                    { value: 'true', label: 'Ya' },
                    { value: 'false', label: 'Tidak / belum yakin' },
                  ]}
                  error={errors.gradesAboveC}
                  hint="Informasi ini digunakan untuk memeriksa kesiapan Magang dan tetap perlu dikonfirmasi kepada program studi."
                />
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-col gap-6">
              <section aria-labelledby="minat-spec-label">
                <h2 id="minat-spec-label" className="mb-2 text-sm font-semibold text-ink">
                  Peminatan yang ingin dieksplorasi
                </h2>
                <p className="mb-3 text-sm text-muted">
                  Pilih jalur dan peran yang ingin kamu eksplorasi. Pilihan ini belum mengunci
                  keputusanmu. Semester 1 sampai 4 dapat menjelajahi semua, dan penguncian tersedia
                  mulai Semester 5.
                </p>
                <div className="flex flex-col gap-2">
                  {specializations.map((spec) => (
                    <CheckboxField
                      key={spec.id}
                      id={`onboard-spec-${spec.id}`}
                      label={spec.name}
                      hint={spec.focus}
                      checked={exploredSpecs.includes(spec.id)}
                      onCheckedChange={() => toggleExploredSpec(spec.id)}
                    />
                  ))}
                </div>
              </section>

              <section aria-labelledby="minat-role-label">
                <h2 id="minat-role-label" className="mb-2 text-sm font-semibold text-ink">
                  Peran karier yang ingin dilihat
                </h2>
                <p className="mb-3 text-sm text-muted">
                  Pilih peran yang ingin kamu lihat hubungannya dengan mata kuliah, keterampilan,
                  dan Magang.
                </p>
                <div className="flex flex-col gap-2">
                  {careerRoles.map((role) => (
                    <CheckboxField
                      key={role.id}
                      id={`onboard-role-${role.id}`}
                      label={role.title}
                      checked={exploredRoles.includes(role.id)}
                      onCheckedChange={() => toggleExploredRole(role.id)}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="flex flex-col gap-6">
              <section aria-labelledby="aktivitas-label">
                <h2 id="aktivitas-label" className="mb-2 text-sm font-semibold text-ink">
                  Aktivitas mingguan di luar kuliah
                </h2>
                <p className="mb-3 text-sm text-muted">
                  Tambahkan kegiatan rutin di luar kuliah agar perkiraan beban rencana lebih sesuai
                  dengan keseharianmu. Bagian ini boleh dikosongkan.
                </p>
                <div className="flex flex-col gap-3">
                  {commitments.length === 0 ? (
                    <p className="text-sm text-muted">
                      Belum ada aktivitas. Tambahkan di bawah jika diperlukan.
                    </p>
                  ) : null}
                  {commitments.map((commitment) => (
                    <div
                      key={commitment.id}
                      className="flex flex-col gap-2 rounded-control border border-border p-3 sm:flex-row sm:items-end"
                    >
                      <div className="min-w-0 flex-1">
                        <label htmlFor={`commit-label-${commitment.id}`} className="field-label">
                          Nama aktivitas
                        </label>
                        <input
                          id={`commit-label-${commitment.id}`}
                          type="text"
                          value={commitment.label}
                          onChange={(event) =>
                            setCommitments((current) =>
                              current.map((c) =>
                                c.id === commitment.id
                                  ? { ...c, label: event.target.value }
                                  : c,
                              ),
                            )
                          }
                          className="w-full rounded-control border border-border bg-surface px-3 py-2.5 text-base focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        />
                      </div>
                      <NumberInput
                        id={`commit-hours-${commitment.id}`}
                        label="Jam per minggu"
                        value={String(commitment.hoursPerWeek)}
                        onChange={(event) =>
                          setCommitments((current) =>
                            current.map((c) =>
                              c.id === commitment.id
                                ? { ...c, hoursPerWeek: Number(event.target.value) || 0 }
                                : c,
                            ),
                          )
                        }
                        min={0}
                        max={40}
                        className="sm:w-32"
                        inputClassName="tabular"
                      />
                      <Button
                        variant="ghost"
                        size="md"
                        className="shrink-0"
                        onClick={() =>
                          setCommitments((current) =>
                            current.filter((c) => c.id !== commitment.id),
                          )
                        }
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                  <div>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() =>
                        setCommitments((current) => [
                          ...current,
                          {
                            id: `commit-${Date.now().toString(36)}`,
                            label: 'Aktivitas baru',
                            hoursPerWeek: 6,
                          },
                        ])
                      }
                    >
                      Tambah aktivitas
                    </Button>
                  </div>
                </div>
              </section>

              <section aria-labelledby="target-label">
                <h2 id="target-label" className="mb-2 text-sm font-semibold text-ink">
                  Posisi Magang yang diminati
                </h2>
                <p className="mb-3 text-sm text-muted">
                  Pilih posisi Magang yang ingin kamu persiapkan. Pilihan ini masih dapat diubah dan
                  tidak diwajibkan sekarang. Kamu dapat memilih lebih dari satu.
                </p>
                <FieldShell
                  id="intern-targets"
                  label="Pilih satu atau lebih"
                  hint="Pilihan ini menentukan daftar posisi Magang yang didukung rencana kamu."
                >
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {internshipTitleOptions.map((option) => (
                      <CheckboxField
                        key={option.value}
                        id={`onboard-intern-${option.value}`}
                        label={option.label}
                        checked={internTitles.includes(option.value)}
                        onCheckedChange={() => toggleInternTitle(option.value)}
                      />
                    ))}
                  </div>
                </FieldShell>
              </section>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={goBack} disabled={step === 1}>
              Kembali
            </Button>
            {step < 4 ? (
              <Button onClick={goNext}>Lanjut</Button>
            ) : (
              <Button onClick={finish} disabled={saving}>
                <PencilLine className="h-4 w-4" aria-hidden="true" />
                Simpan profil
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
