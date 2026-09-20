import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/academic/status-badge';
import { careerRoles, coursesById, specializations } from '@/lib/data-repo';
import { getCourseStatus } from '@/domain/academic/rules';
import { useAppStore } from '@/stores/appStore';

export function CareerRoleCard({ roleId }: { roleId: string }) {
  const role = careerRoles.find((item) => item.id === roleId);
  const profile = useAppStore((state) => state.persisted.profile);
  const toggleExploredCareerRole = useAppStore((state) => state.toggleExploredCareerRole);
  const primaryScenario = useAppStore((state) =>
    state.persisted.scenarios.find((scenario) => scenario.id === state.persisted.primaryScenarioId) ?? null,
  );

  if (!role || !profile) return null;

  const context = { activeCourseIds: primaryScenario?.selectedCourseIds ?? [] };
  const interested = profile.exploredCareerRoleIds.includes(role.id);
  const relatedSpecs = role.specializationIds
    .map((id) => specializations.find((spec) => spec.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <article className="card flex flex-col p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink">{role.title}</h3>
          <p className="mt-1 text-sm text-muted">
            Terhubung dengan: {relatedSpecs.join(', ') || 'belum ada'}
          </p>
        </div>
        <Button
          variant={interested ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => toggleExploredCareerRole(role.id)}
          aria-pressed={interested}
        >
          {interested ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
          {interested ? 'Sudah diikuti' : 'Tandai sebagai minat'}
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Keterampilan yang relevan</p>
          <ul className="flex flex-wrap gap-1.5">
            {role.skills.map((skill) => (
              <li key={skill} className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-muted">
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Mata kuliah pendukung</p>
          <ul className="flex flex-col gap-1.5">
            {role.supportingCourseIds.map((courseId) => {
              const course = coursesById.get(courseId);
              if (!course) return null;
              const result = getCourseStatus(course, profile, context);
              return (
                <li key={courseId} className="flex items-center justify-between gap-2 rounded-control bg-surface-subtle px-3 py-2">
                  <span className="min-w-0 truncate text-sm text-ink">{course.name}</span>
                  <StatusBadge status={result.status} />
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Posisi Magang yang relevan</p>
          <ul className="flex flex-wrap gap-1.5">
            {role.internshipTitles.map((title) => (
              <li key={title} className="rounded-full border border-teal/30 bg-teal/10 px-2.5 py-1 text-xs text-teal">
                {title}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Pembelajaran dan portofolio</p>
          <ul className="flex flex-col gap-1 text-sm text-muted">
            {role.portfolioIdeas.map((idea) => (
              <li key={idea} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                {idea}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}