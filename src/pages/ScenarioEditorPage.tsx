import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { PageHeader, Breadcrumb } from '@/components/ui/page-header';
import { TextInput } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/input';
import { SelectField, type SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/controls';
import { ConfirmDialog } from '@/components/ui/dialog';
import { InlineAlert } from '@/components/ui/alert';
import { ScenarioPanel } from '@/components/scenarios/scenario-panel';
import {
  academicRules,
  careerRoles,
  coursesById,
  specializations,
} from '@/lib/data-repo';
import { useAppStore } from '@/stores/appStore';
import type { Scenario, WeeklyCommitment } from '@/domain/types';
import { displaySKS, formatPerformanceIndex } from '@/lib/format';
import { cn } from '@/lib/cn';
import { getCreditLimit } from '@/domain/academic/rules';

const semesterOptions: SelectOption[] = Array.from({ length: 8 }, (_, index) => ({
  value: String(index + 1),
  label: `Semester ${index + 1}`,
}));

const specOptions: SelectOption[] = specializations.map((spec) => ({
  value: spec.id,
  label: spec.name,
}));

const careerRoleOptions: SelectOption[] = careerRoles.map((role) => ({
  value: role.id,
  label: role.title,
}));

const internshipOptions: SelectOption[] = Array.from(
  new Set(careerRoles.flatMap((role) => role.internshipTitles)),
).map((title) => ({ value: title, label: title }));

function commitKey(commitment: WeeklyCommitment): string {
  return commitment.id;
}

export function ScenarioEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const profile = useAppStore((state) => state.persisted.profile);
  const existing = useAppStore((state) =>
    state.persisted.scenarios.find((scenario) => scenario.id === id) ?? null,
  );
  const saveScenario = useAppStore((state) => state.saveScenario);
  const deleteScenario = useAppStore((state) => state.deleteScenario);

  const [name, setName] = useState(() => existing?.name ?? `Rencana Semester ${profile?.currentSemester ?? 1}`);
  const [targetSemester, setTargetSemester] = useState<number>(() => existing?.targetSemester ?? profile?.currentSemester ?? 1);
  const [specId, setSpecId] = useState<string | null>(() => existing?.specializationId ?? null);
  const [careerRoleId, setCareerRoleId] = useState<string | null>(() => existing?.targetCareerRoleId ?? null);
  const [internRole, setInternRole] = useState<string | null>(() => existing?.targetInternshipRole ?? null);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [...(existing?.selectedCourseIds ?? [])]);
  const [commitments, setCommitments] = useState<WeeklyCommitment[]>(() =>
    existing?.commitments.map((c) => ({ ...c })) ?? [],
  );
  const [nameError, setNameError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const spec = specId ? specializations.find((s) => s.id === specId) ?? null : null;

  const groups = useMemo(() => {
    const grouped: { semester: number; items: { id: string; name: string; credits: number; code: string }[] }[] = [];
    const bySemester = new Map<number, typeof grouped[0]['items']>();
    const available = Array.from(coursesById.values()).filter(
      (course) => !profile?.completedCourseIds.includes(course.id),
    );
    for (const course of available) {
      if (!bySemester.has(course.semester)) bySemester.set(course.semester, []);
      bySemester.get(course.semester)!.push({
        id: course.id,
        name: course.name,
        credits: course.credits,
        code: course.code ?? '',
      });
    }
    for (const [semester, items] of [...bySemester.entries()].sort((a, b) => a[0] - b[0])) {
      grouped.push({ semester, items });
    }
    return grouped;
  }, [profile?.completedCourseIds]);

  const specCourses = useMemo(() => {
    if (!spec) return [];
    return spec.courseIds
      .map((courseId) => coursesById.get(courseId))
      .filter((course): course is NonNullable<typeof course> => Boolean(course))
      .filter((course) => !profile?.completedCourseIds.includes(course.id));
  }, [spec, profile?.completedCourseIds]);

  const specSemesterGroups = useMemo(() => {
    const bySemester = new Map<number, typeof specCourses>();
    for (const course of specCourses) {
      if (!bySemester.has(course.semester)) bySemester.set(course.semester, []);
      bySemester.get(course.semester)!.push(course);
    }
    return [...bySemester.entries()].sort((a, b) => a[0] - b[0]);
  }, [specCourses]);

  const activeSpecCourseIds = useMemo(
    () => new Set(specCourses.map((course) => course.id)),
    [specCourses],
  );

  const visibleGeneralGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !activeSpecCourseIds.has(item.id)),
        }))
        .filter((group) => group.items.length > 0),
    [groups, activeSpecCourseIds],
  );

  if (!profile) return <Navigate to="/onboarding" replace />;

  if (!isNew && !existing) {
    return (
      <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
        <InlineAlert
          tone="error"
          title="Skenario tidak ditemukan"
          reason="Rencana dengan ID ini tidak ada di data lokal. Bisa jadi sudah dihapus."
        />
        <Link to="/app/scenarios" className="mt-4 inline-block text-sm font-medium text-primary underline hover:text-primary-strong">
          Kembali ke daftar skenario
        </Link>
      </div>
    );
  }

  const totalCredits = selectedIds.reduce((sum, courseId) => sum + (coursesById.get(courseId)?.credits ?? 0), 0);

  function toggleCourse(courseId: string) {
    setSelectedIds((current) =>
      current.includes(courseId) ? current.filter((c) => c !== courseId) : [...current, courseId],
    );
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Nama rencana wajib diisi.');
      return;
    }
    setNameError(undefined);
    const scenario: Scenario = {
      id: existing?.id ?? '',
      name: trimmed,
      targetSemester,
      selectedCourseIds: [...selectedIds],
      commitments: commitments.map((c) => ({ ...c })),
      specializationId: specId,
      targetCareerRoleId: careerRoleId,
      targetInternshipRole: internRole,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (isNew) {
      const newId = useAppStore.getState().createDraftScenario({
        name: scenario.name,
        targetSemester: scenario.targetSemester,
        selectedCourseIds: scenario.selectedCourseIds,
        commitments: scenario.commitments,
        specializationId: scenario.specializationId,
        targetCareerRoleId: scenario.targetCareerRoleId,
        targetInternshipRole: scenario.targetInternshipRole,
      });
      navigate(`/app/scenarios/${newId}`);
    } else {
      saveScenario(scenario);
      navigate('/app/scenarios');
    }
  }

  function handleReset() {
    if (!profile) return;
    setName(existing?.name ?? `Rencana Semester ${profile.currentSemester}`);
    setTargetSemester(existing?.targetSemester ?? profile.currentSemester);
    setSpecId(existing?.specializationId ?? null);
    setCareerRoleId(existing?.targetCareerRoleId ?? null);
    setInternRole(existing?.targetInternshipRole ?? null);
    setSelectedIds([...(existing?.selectedCourseIds ?? [])]);
    setCommitments(existing?.commitments.map((c) => ({ ...c })) ?? []);
  }

  const currentScenario: Scenario = {
    id: existing?.id ?? 'draft',
    name,
    targetSemester,
    selectedCourseIds: selectedIds,
    commitments,
    specializationId: specId,
    targetCareerRoleId: careerRoleId,
    targetInternshipRole: internRole,
    createdAt: existing?.createdAt ?? '',
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <Breadcrumb
        crumbs={[
          { label: 'Simulasi', path: '/app/scenarios' },
          { label: isNew ? 'Buat skenario' : name },
        ]}
      />
      <PageHeader
        title={isNew ? 'Buat skenario' : 'Ubah skenario'}
        description={`Susun kombinasi mata kuliah untuk satu semester dan periksa batas SKS, prasyarat, serta beban rencana.`}
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="card p-5" aria-labelledby="skenario-dasar-heading">
            <h2 id="skenario-dasar-heading" className="mb-4 text-base font-semibold text-ink">
              Detail rencana
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                id="scenario-name"
                label="Nama rencana"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (nameError) setNameError(undefined);
                }}
                placeholder="Contoh: Rencana Semester 5"
                error={nameError}
              />
              <SelectField
                id="scenario-semester"
                label="Semester target"
                value={String(targetSemester)}
                onValueChange={(value) => setTargetSemester(Number(value))}
                options={semesterOptions}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="scenario-spec"
                label="Jalur peminatan (opsional)"
                value={specId}
                onValueChange={setSpecId}
                options={specOptions}
                placeholder="Belum memilih"
              />
              <SelectField
                id="scenario-career"
                label="Peran karier target (opsional)"
                value={careerRoleId}
                onValueChange={setCareerRoleId}
                options={careerRoleOptions}
                placeholder="Belum memilih"
              />
            </div>
            <div className="mt-4">
              <SelectField
                id="scenario-intern"
                label="Posisi Magang target (opsional)"
                value={internRole}
                onValueChange={setInternRole}
                options={internshipOptions}
                placeholder="Belum memilih"
              />
            </div>
          </section>

          <section className="card p-5" aria-labelledby="skenario-matkul-heading">
            <h2 id="skenario-matkul-heading" className="text-base font-semibold text-ink">
              Pilihan mata kuliah
            </h2>
            <p className="mt-1 text-sm text-muted">
              Mata kuliah yang sudah selesai tidak dapat dipilih lagi. Pilihan dari semester lain
              menimbulkan peringatan pada catatan rencana.
            </p>
            <p className="mt-3 text-sm text-ink">
              Total rencana: <span className="tabular font-semibold">{displaySKS(totalCredits)}</span>
              {' · '}batas {displaySKS(getCreditLimit(profile.performanceIndex))}
            </p>
            <p className="mt-1 text-xs text-muted">
              Batas mengikuti {academicRules.creditLimit.label} {formatPerformanceIndex(profile.performanceIndex)} yang tersimpan di profil.
            </p>

            {spec ? (
              <div className="card-subtle mt-4 p-4">
                <h3 className="mb-1 text-sm font-semibold text-ink">Mata kuliah peminatan {spec.name}</h3>
                <p className="mb-3 text-xs text-muted">
                  Jalur ini terdiri dari empat mata kuliah: dua di Semester 5 dan dua di Semester
                  6. Untuk skenario ini, pilih mata kuliah yang tersedia pada semester target.
                </p>
                {specSemesterGroups.map(([semester, items]) => (
                  <div key={semester} className="mb-4 last:mb-0">
                    <h4 className="mb-2 text-xs font-medium text-muted">
                      Semester {semester}
                      {semester === targetSemester ? (
                        <span className="ml-2 text-primary">semester target</span>
                      ) : null}
                    </h4>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {items.map((course) => (
                        <li key={course.id}>
                          <CheckboxField
                            id={`scen-spec-${course.id}`}
                            label={`${course.name}, ${course.credits} SKS`}
                            hint={
                              course.semester !== targetSemester
                                ? `Berasal dari Semester ${course.semester}, bukan Semester ${targetSemester}.`
                                : 'Berada pada semester target.'
                            }
                            checked={selectedIds.includes(course.id)}
                            onCheckedChange={() => toggleCourse(course.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-4">
              {visibleGeneralGroups.map((group) => (
                <div key={group.semester} className={cn(group.semester === targetSemester && 'rounded-control border border-primary/30 bg-primary/5 p-3')}>
                  <h3 className="mb-2 text-sm font-medium text-ink">
                    Semester {group.semester}
                    {group.semester === targetSemester ? (
                      <span className="ml-2 text-xs text-primary">semester target</span>
                    ) : null}
                  </h3>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <CheckboxField
                          id={`scen-${item.id}`}
                          label={`${item.name}, ${item.credits} SKS`}
                          hint={item.code ? item.code : undefined}
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={() => toggleCourse(item.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5" aria-labelledby="skenario-aktivitas-heading">
            <h2 id="skenario-aktivitas-heading" className="mb-2 text-base font-semibold text-ink">
              Komitmen mingguan
            </h2>
            <p className="mb-3 text-sm text-muted">
              Tambahkan aktivitas di luar kuliah agar perkiraan beban lebih sesuai dengan
              keseharianmu. Kosongkan jika tidak ada.
            </p>
            <div className="flex flex-col gap-3">
              {commitments.map((commitment) => (
                <div key={commitKey(commitment)} className="flex flex-col gap-2 rounded-control border border-border p-3 sm:flex-row sm:items-end">
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
              {commitments.length === 0 ? (
                <p className="text-sm text-muted">Belum ada aktivitas di luar kuliah.</p>
              ) : null}
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCommitments((current) => [
                      ...current,
                      { id: `commit-${Date.now().toString(36)}`, label: 'Organisasi (BEM/HMJ)', hoursPerWeek: 6 },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Tambah aktivitas
                </Button>
              </div>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <ScenarioPanel profile={profile} scenario={currentScenario} />
          <div className="card-subtle p-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row lg:flex-col">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4" aria-hidden="true" />
                {isNew ? 'Simpan skenario' : 'Simpan perubahan'}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Urungkan perubahan
              </Button>
            </div>
            {!isNew ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-danger hover:text-danger"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Hapus skenario
              </Button>
            ) : null}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Hapus skenario ini?"
        description="Rencana dan perbandingannya akan dihapus dari data lokal. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        destructive
        onConfirm={() => {
          if (existing) deleteScenario(existing.id);
          navigate('/app/scenarios');
        }}
      />
    </div>
  );
}