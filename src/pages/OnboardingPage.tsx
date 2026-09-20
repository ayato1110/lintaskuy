import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CheckboxField, RadioGroupField } from '@/components/ui/controls';
import { NumberInput, TextInput } from '@/components/ui/input';
import { SelectField, type SelectOption } from '@/components/ui/select';
import { FieldShell } from '@/components/ui/input';
import { courses, coursesForSemester, coursesById, careerRoles, specializations } from '@/lib/data-repo';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/cn';
import type { StudentProfile, WeeklyCommitment } from '@/domain/types';
import { displaySKS } from '@/lib/format';

const semesterOptions: SelectOption[] = Array.from({ length: 8 }, (_, i) => ({
  value: String(i + 1),
  label: `Semester ${i + 1}`,
}));

const internshipTitleOptions: SelectOption[] = Array.from(
  new Set(careerRoles.flatMap((role) => role.internshipTitles)),
).map((title) => ({ value: title, label: title }));

const stepTitles = ['Semester dan nilai', 'Riwayat mata kuliah', 'Minat jalur dan karier', 'Aktivitas dan target'];

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

  const semesterNumber = semester ? Number(semester) : 0;

  const historicalCourses = useMemo(
    () =>
      courses
        .filter((course) => course.semester <= semesterNumber && course.type !== 'demo_assumption')
        .sort((a, b) => a.semester - b.semester),
    [semesterNumber],
  );

  const completedCredits = useMemo(
    () => completedIds.reduce((sum, id) => sum + (coursesById.get(id)?.credits ?? 0), 0),
    [completedIds],
  );

  function validateStep(current: number): boolean {
    const nextErrors: Record<string, string> = {};
    if (current === 1) {
      if (!semester) nextErrors.semester = 'Pilih semester aktif Anda saat ini.';
      const ip = Number(performanceIndex.replace(',', '.'));
      if (!performanceIndex || Number.isNaN(ip) || ip < 0 || ip > 4) {
        nextErrors.performanceIndex = 'Indeks Prestasi harus berupa angka antara 0 dan 4.';
      }
    }
    if (current === 2) {
      if (semesterNumber > 1 && completedIds.length === 0 && semesterNumber >= 2) {
        nextErrors.completed = 'Pilih mata kuliah yang sudah selesai, atau tandai seluruhnya pada tiap semester.';
      }
      if (gradesAboveC === null) {
        nextErrors.gradesAboveC =
          'Jawab pertanyaan nilai di atas C. Informasi ini diperlukan untuk pemeriksaan Magang.';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((value) => Math.min(4, value + 1));
  }

  function goBack() {
    setErrors({});
    setStep((value) => Math.max(1, value - 1));
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
      allSelected ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids])),
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
    if (!semesterNumber) return;
    const profile: StudentProfile = {
      id: `student-${Date.now().toString(36)}`,
      name: name.trim() || 'Mahasiswa',
      isDemoPersona: false,
      currentSemester: semesterNumber,
      performanceIndex: Number(performanceIndex.replace(',', '.')),
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
            className="text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Gunakan profil demo Kang Haerin
          </button>
        </header>

        <ol
          aria-label="Progres onboarding"
          className="mb-8 flex items-center gap-2"
        >
          {stepTitles.map((title, index) => {
            const stepNumber = index + 1;
            const isPast = stepNumber < step;
            const isCurrent = stepNumber === step;
            return (
              <li key={title} className="flex flex-1 items-center gap-2" aria-current={isCurrent ? 'step' : undefined}>
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
                <span className={cn('text-xs font-medium', isCurrent ? 'text-ink' : 'text-muted')}>
                  {title}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="card p-5 md:p-8">
          <h1 className="mb-6 text-xl font-semibold text-ink md:text-2xl">
            Langkah {step} dari 4: {stepTitles[step - 1]}
          </h1>

          {step === 1 ? (
            <fieldset className="flex flex-col gap-5">
              <legend className="sr-only">Semester dan Indeks Prestasi</legend>
              <TextInput
                id="profile-name"
                label="Nama (opsional)"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Misalnya: Andi"
              />
              <SelectField
                id="current-semester"
                label="Semester aktif saat ini"
                value={semester}
                onValueChange={(value) => {
                  setSemester(value);
                  setCompletedIds([]);
                }}
                options={semesterOptions}
                placeholder="Pilih semester"
                error={errors.semester}
              />
              <NumberInput
                id="performance-index"
                label="Indeks Prestasi saat ini"
                value={performanceIndex}
                onChange={(event) => setPerformanceIndex(event.target.value)}
                step="0.01"
                min="0"
                max="4"
                placeholder="Contoh: 3,50"
                hint="Digunakan untuk menentukan batas SKS: di atas 3,00 berarti maksimal 24 SKS per semester, selebihnya 21 SKS."
                error={errors.performanceIndex}
              />
            </fieldset>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-5">
              {semesterNumber > 1 ? (
                <>
                  <div className="flex flex-col gap-4" role="group" aria-labelledby="riwayat-label">
                    <h2 id="riwayat-label" className="text-sm font-semibold text-ink">
                      Tandai mata kuliah yang sudah selesai
                    </h2>
                    {Array.from(new Set(historicalCourses.map((c) => c.semester))).map((sem) => (
                      <div key={sem} className="card-subtle p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-ink">Semester {sem}</h3>
                          <button
                            type="button"
                            onClick={() => toggleAllForSemester(sem)}
                            className="text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            Tandai seluruhnya / kosongkan
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
                    ))}
                  </div>
                  {errors.completed ? (
                    <p className="text-sm text-danger" role="alert">
                      {errors.completed}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted">
                  Semester 1 berarti seluruh mata kuliah masih berjalan. Lanjut ke langkah berikutnya.
                </p>
              )}

              <div className="card-subtle p-4">
                <p className="mb-2 text-sm text-muted">
                  Total SKS selesai: <span className="tabular font-semibold text-ink">{displaySKS(completedCredits)}</span>
                </p>
                <RadioGroupField
                  id="grades-above-c"
                  label="Apakah seluruh mata kuliah yang telah ditempuh memiliki nilai di atas C?"
                  value={gradesAboveC === null ? null : String(gradesAboveC)}
                  onValueChange={(value) => setGradesAboveC(value === 'true')}
                  options={[
                    { value: 'true', label: 'Ya' },
                    { value: 'false', label: 'Tidak / belum yakin' },
                  ]}
                  error={errors.gradesAboveC}
                  hint="Jawaban mengikuti informasi yang Anda berikan dan perlu dikonfirmasi ke program studi saat persiapan Magang."
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-col gap-6">
              <section aria-labelledby="minat-spec-label">
                <h2 id="minat-spec-label" className="mb-2 text-sm font-semibold text-ink">
                  Peminatan yang ingin dieksplorasi
                </h2>
                <p className="mb-3 text-sm text-muted">
                  Semester 1 sampai 4 dapat menjelajahi semua. Penguncian tersedia mulai Semester 5.
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
                <div className="flex flex-col gap-2">
                  {careerRoles.map((role) => {
                    const checked = exploredRoles.includes(role.id);
                    return (
                      <CheckboxField
                        key={role.id}
                        id={`onboard-role-${role.id}`}
                        label={role.title}
                        checked={checked}
                        onCheckedChange={() => toggleExploredRole(role.id)}
                      />
                    );
                  })}
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
                  Jam aktivitas diperhitungkan saat menilai beban rencana semester.
                </p>
                <div className="flex flex-col gap-3">
                  {commitments.length === 0 ? (
                    <p className="text-sm text-muted">Belum ada aktivitas. Tambahkan di bawah jika diperlukan.</p>
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
                                c.id === commitment.id ? { ...c, label: event.target.value } : c,
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
                        size="sm"
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
                      size="sm"
                      onClick={() =>
                        setCommitments((current) => [
                          ...current,
                          { id: `commit-${Date.now().toString(36)}`, label: 'Aktivitas baru', hoursPerWeek: 6 },
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
                <FieldShell id="intern-targets" label="Pilih satu atau lebih" hint="Pilihan ini menentukan daftar posisi Magang yang didukung rencana Anda.">
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
              <Button onClick={finish}>
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