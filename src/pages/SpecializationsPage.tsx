import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Lock, Unlock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/academic/status-badge';
import { InlineAlert, RuleResultAlert } from '@/components/ui/alert';
import { CareerRoleCard } from '@/components/career/career-role-card';
import {
  academicRules,
  careerRoles,
  coursesForSpecialization,
  rolesForSpecialization,
  specializations,
} from '@/lib/data-repo';
import { getCourseStatus, validateLockAllowed } from '@/domain/academic/rules';
import { useAppStore } from '@/stores/appStore';
import type { Specialization } from '@/domain/types';

function SpecCourses({ specId }: { specId: string }) {
  const profile = useAppStore((state) => state.persisted.profile);
  const primaryScenario = useAppStore((state) =>
    state.persisted.scenarios.find((scenario) => scenario.id === state.persisted.primaryScenarioId) ?? null,
  );

  if (!profile) return null;

  const context = { activeCourseIds: primaryScenario?.selectedCourseIds ?? [] };

  return (
    <ul className="flex flex-col gap-1.5">
      {coursesForSpecialization(specId).map((course) => {
        const result = getCourseStatus(course, profile, context);
        return (
          <li key={course.id} className="flex items-center justify-between gap-2 rounded-control bg-surface-subtle px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{course.name}</p>
              <p className="text-xs text-muted">{course.credits} SKS · {course.code ?? 'tanpa kode'}</p>
            </div>
            <StatusBadge status={result.status} />
          </li>
        );
      })}
    </ul>
  );
}

function SpecializationCard({ spec }: { spec: Specialization }) {
  const profile = useAppStore((state) => state.persisted.profile);
  const lockSpecialization = useAppStore((state) => state.lockSpecialization);
  const unlockSpecialization = useAppStore((state) => state.unlockSpecialization);

  const [confirmUnlock, setConfirmUnlock] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);

  if (!profile) return null;

  const lockRule = validateLockAllowed(profile);
  const isLocked = profile.lockedSpecializationId === spec.id;
  const roles = rolesForSpecialization(spec.id);

  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink">{spec.name}</h3>
          <p className="mt-1 text-sm text-muted">{spec.focus}</p>
        </div>
        {isLocked ? <Badge tone="primary">Terkunci</Badge> : null}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-ink">
          Mata kuliah jalur ({academicRules.specialization.coursesPerTrack} mata kuliah, {academicRules.specialization.creditsPerTrack} SKS)
        </p>
        <SpecCourses specId={spec.id} />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-ink">Peran karier yang terhubung</p>
        <ul className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <li key={role.id}>
              <Link
                to="/app/specializations/career"
                className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted transition-colors hover:border-teal/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {role.title}
              </Link>
            </li>
          ))}
          {roles.length === 0 ? <li className="text-sm text-muted">Belum ada peran yang dipetakan.</li> : null}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-5">
        {isLocked ? (
          <Button variant="outline" size="sm" onClick={() => setConfirmUnlock(true)}>
            <Unlock className="h-4 w-4" aria-hidden="true" />
            Buka kunci jalur ini
          </Button>
        ) : lockRule.status === 'ok' ? (
          <Button size="sm" onClick={() => setConfirmLock(true)}>
            <Lock className="h-4 w-4" aria-hidden="true" />
            Kunci sebagai pilihan
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled title={lockRule.nextAction}>
            <Lock className="h-4 w-4" aria-hidden="true" />
            Kunci mulai Semester {academicRules.specialization.lockFromSemester}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmLock}
        onOpenChange={setConfirmLock}
        title={`Kunci ${spec.name}?`}
        description="Setelah dikunci, jalur ini menjadi pilihan utama pada profil Anda. Perbandingan dengan jalur lain tetap bisa dilakukan lewat scenario simulator."
        confirmLabel="Kunci jalur"
        onConfirm={() => lockSpecialization(spec.id)}
      />
      <ConfirmDialog
        open={confirmUnlock}
        onOpenChange={setConfirmUnlock}
        title="Buka kunci peminatan?"
        description="Profil kembali tanpa pilihan terkunci. Anda tetap bisa membatalkan dan membandingkan lagi."
        confirmLabel="Buka kunci"
        onConfirm={() => unlockSpecialization()}
      />
    </article>
  );
}

export function SpecializationsPage() {
  const profile = useAppStore((state) => state.persisted.profile);

  if (!profile) return null;

  const lockRule = validateLockAllowed(profile);

  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <PageHeader
        title="Peminatan Explorer"
        description={`Bandingkan ${specializations.length} peminatan Sistem Informasi dan pilih arah yang paling masuk akal untuk Anda.`}
      />

      <Tabs defaultValue="specializations">
        <TabsList ariaLabel="Bagian Peminatan">
          <TabsTrigger value="specializations">
            <Compass className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Peminatan
          </TabsTrigger>
          <TabsTrigger value="career">Kompas Karier</TabsTrigger>
        </TabsList>

        <TabsContent value="specializations">
          {lockRule.status === 'ok' ? (
            <RuleResultAlert result={lockRule} />
          ) : (
            <InlineAlert
              tone="warning"
              title="Menunggu Semester 5"
              reason={lockRule.reason}
              nextAction={lockRule.nextAction}
            />
          )}
          {profile.lockedSpecializationId ? (
            <InlineAlert
              tone="info"
              title="Peminatan terkunci"
              reason="Jalur terkunci tetap bisa dibandingkan dengan jalur lain melalui scenario simulator."
            />
          ) : null}
          <div className="mt-4 grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-3">
            {specializations.map((spec) => (
              <SpecializationCard key={spec.id} spec={spec} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="career">
          <InlineAlert
            tone="info"
            title="Sumber informasi karier"
            reason="Setiap peran dihubungkan ke kompetensi, mata kuliah, peminatan, dan posisi Magang. Informasi tidak menggunakan skor kecocokan."
          />
          <div className="mt-4 grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2">
            {careerRoles.map((role) => (
              <CareerRoleCard key={role.id} roleId={role.id} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}