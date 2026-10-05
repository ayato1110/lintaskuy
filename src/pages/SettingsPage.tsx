import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardDrive, RefreshCcw, Trash2 } from 'lucide-react';
import { PageHeader, Breadcrumb } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { NumberInput, TextInput } from '@/components/ui/input';
import { SelectField, type SelectOption } from '@/components/ui/select';
import { CheckboxField, RadioGroupField } from '@/components/ui/controls';
import { ConfirmDialog } from '@/components/ui/dialog';
import { InlineAlert } from '@/components/ui/alert';
import { specializations, careerRoles } from '@/lib/data-repo';
import { useAppStore } from '@/stores/appStore';
import type { StudentProfile } from '@/domain/types';
import { calculateCredits } from '@/domain/academic/rules';
import { pruneCompletedCourseIds } from '@/domain/academic/progress';
import { displaySKS } from '@/lib/format';

const semesterOptions: SelectOption[] = Array.from({ length: 8 }, (_, index) => ({
  value: String(index + 1),
  label: `Semester ${index + 1}`,
}));

export function SettingsPage() {
  const navigate = useNavigate();
  const profile = useAppStore((state) => state.persisted.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const toggleExploredCareerRole = useAppStore((state) => state.toggleExploredCareerRole);
  const toggleExploredSpecialization = useAppStore((state) => state.toggleExploredSpecialization);
  const loadDemoProfile = useAppStore((state) => state.loadDemoProfile);
  const resetApp = useAppStore((state) => state.resetApp);

  const [semesterValue, setSemesterValue] = useState<string | null>(null);
  const [ipValue, setIpValue] = useState('');
  const [semesterNote, setSemesterNote] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDemo, setConfirmDemo] = useState(false);

  if (!profile) return null;

  const applyEdits = () => {
    const patch: Record<string, unknown> = {};
    if (semesterValue !== null) {
      const nextSemester = Number(semesterValue);
      patch.currentSemester = nextSemester;
      const { kept, removed } = pruneCompletedCourseIds(profile.completedCourseIds, nextSemester);
      if (removed.length > 0) {
        patch.completedCourseIds = kept;
        patch.completedCredits = calculateCredits(kept);
        setSemesterNote(
          `${removed.length} mata kuliah dikeluarkan dari riwayat karena semester aktifmu sekarang Semester ${nextSemester}.`,
        );
      }
    }
    const parsedIp = Number(ipValue.replace(',', '.'));
    if (ipValue !== '' && !Number.isNaN(parsedIp)) patch.performanceIndex = parsedIp;
    updateProfile(patch as Partial<StudentProfile>);
    setSemesterValue(null);
    setIpValue('');
  };

  const dirty = semesterValue !== null || ipValue !== '';

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <Breadcrumb crumbs={[{ label: 'Profil dan data' }]} />
      <PageHeader
        title="Profil dan data"
        description="Perbarui data pribadi akademik kamu."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="edit-profil-heading">
          <h2 id="edit-profil-heading" className="text-base font-semibold text-ink">
            Data akademik
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <TextInput
              id="settings-name"
              label="Nama"
              value={profile.name}
              onChange={(event) => updateProfile({ name: event.target.value })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="settings-semester"
                label="Semester aktif saat ini"
                value={semesterValue ?? String(profile.currentSemester)}
                onValueChange={setSemesterValue}
                options={semesterOptions}
              />
              <NumberInput
                id="settings-ip"
                label="Indeks Prestasi"
                value={ipValue !== '' ? ipValue : String(profile.performanceIndex)}
                onChange={(event) => setIpValue(event.target.value)}
                step="0.01"
                min="0"
                max="4"
                inputClassName="tabular"
              />
            </div>
            {dirty ? (
              <div>
                <Button onClick={applyEdits}>Simpan perubahan semester atau IP</Button>
              </div>
            ) : null}
            {semesterNote ? (
              <p className="text-sm text-muted" role="status">
                {semesterNote}
              </p>
            ) : null}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <RadioGroupField
              id="settings-grades"
              label="Apakah seluruh mata kuliah yang telah ditempuh memiliki nilai di atas C?"
              value={String(profile.allCompletedGradesAboveC)}
              onValueChange={(value) => updateProfile({ allCompletedGradesAboveC: value === 'true' })}
              options={[
                { value: 'true', label: 'Ya', description: 'Dikonfirmasi untuk syarat Magang.' },
                { value: 'false', label: 'Tidak / belum yakin', description: 'Akan ditandai pada status Magang.' },
              ]}
            />
          </div>
        </section>

        <section className="card p-5" aria-labelledby="edit-minat-heading">
          <h2 id="edit-minat-heading" className="text-base font-semibold text-ink">
            Minat eksplorasi
          </h2>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-ink">Peminatan</p>
            <div className="flex flex-col gap-2">
              {specializations.map((spec) => (
                <CheckboxField
                  key={spec.id}
                  id={`settings-spec-${spec.id}`}
                  label={spec.name}
                  hint={spec.focus}
                  checked={profile.exploredSpecializationIds.includes(spec.id)}
                  onCheckedChange={() => toggleExploredSpecialization(spec.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-ink">Peran karier</p>
            <div className="flex flex-col gap-2">
              {careerRoles.map((role) => (
                <CheckboxField
                  key={role.id}
                  id={`settings-role-${role.id}`}
                  label={role.title}
                  checked={profile.exploredCareerRoleIds.includes(role.id)}
                  onCheckedChange={() => toggleExploredCareerRole(role.id)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="card mt-6 p-5" aria-labelledby="data-heading">
        <h2 id="data-heading" className="flex items-center gap-2 text-base font-semibold text-ink">
          <HardDrive className="h-4 w-4 text-muted" aria-hidden="true" />
          Penyimpanan data
        </h2>
        <p className="mt-2 text-sm text-muted">
          Data otomatis tersimpan dan tersedia kembali saat aplikasi dibuka berikutnya.
        </p>
        <p className="mt-1 text-sm text-muted">
          SKS selesai: <span className="tabular text-ink">{displaySKS(profile.completedCredits)}</span>
          {' · '}total mata kuliah tercatat selesai: <span className="tabular text-ink">{profile.completedCourseIds.length}</span>
        </p>
      </section>

      {profile.isDemoPersona ? (
        <div className="no-print mt-6">
          <InlineAlert
            tone="info"
            title="Profil demo aktif"
            reason="Kamu dapat mengedit data ini seperti profil biasa."
          />
        </div>
      ) : null}

      <section className="card-subtle mt-6 p-5" aria-labelledby="reset-heading">
        <h2 id="reset-heading" className="text-base font-semibold text-ink">
          Area berisiko
        </h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => setConfirmDemo(true)}>
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Muat ulang profil demo
          </Button>
          <Button variant="destructive" onClick={() => setConfirmReset(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Mulai ulang aplikasi
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Muat ulang profil demo mengganti seluruh data. Mulai ulang mengosongkan seluruh data dan
          kembali ke halaman awal.
        </p>
      </section>

      <ConfirmDialog
        open={confirmDemo}
        onOpenChange={setConfirmDemo}
        title="Ganti seluruh data dengan profil demo?"
        description="Profil, skenario, dan pertanyaan saat ini akan diganti dengan data demo Kang Haerin."
        confirmLabel="Muat profil demo"
        onConfirm={() => {
          loadDemoProfile();
          navigate('/app');
        }}
      />
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Mulai ulang aplikasi?"
        description="Seluruh data di perangkat ini dihapus dan semua pengaturan dikembalikan ke awal."
        confirmLabel="Mulai ulang"
        destructive
        onConfirm={() => {
          resetApp();
          navigate('/');
        }}
      />
    </div>
  );
}