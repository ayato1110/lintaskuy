import { assessInternshipEligibility } from '@/domain/academic/rules';
import { careerRoleById, roleById, specializationById } from '@/lib/data-repo';
import type { AdvisorBrief, RuleResult, Scenario, StudentProfile } from '@/domain/types';
import { analyzeScenario } from '@/domain/scenario/analyze';

export interface BuildBriefOptions {
  primaryScenario: Scenario | null;
  questions: string[];
}

export function buildAdvisorBrief(profile: StudentProfile, options: BuildBriefOptions): AdvisorBrief {
  const { primaryScenario, questions } = options;
  const specialization = primaryScenario
    ? specializationById(primaryScenario.specializationId)
    : null;
  const careerRole = primaryScenario ? careerRoleById(primaryScenario.targetCareerRoleId) : null;
  const internship = assessInternshipEligibility(profile);

  const risks: RuleResult[] = [];
  if (primaryScenario) {
    const analysis = analyzeScenario(profile, primaryScenario);
    risks.push(...[analysis.creditResult, analysis.trackResult, analysis.lockedTrackResult]);
    risks.push(...analysis.prerequisiteResults);
  }

  if (!internship.creditsMet) {
    risks.push({
      status: 'warning',
      title: 'Progres menuju syarat Magang',
      reason: `${profile.name} telah menyelesaikan ${internship.completedCredits} dari minimal ${internship.minimumCredits} SKS untuk Magang.`,
      source: 'participant_confirmed',
      nextAction: 'Lanjutkan menempuh mata kuliah dan siapkan portofolio lebih awal.',
    });
  }

  const uniqueRisks = risks.filter(
    (risk, index) => risks.findIndex((r) => r.title === risk.title) === index,
  );

  return {
    generatedAt: new Date().toISOString(),
    profile,
    primaryScenario,
    specialization,
    careerRole,
    internship,
    risks: uniqueRisks,
    questions,
  };
}

export function roleTitleById(id: string | null): string {
  return roleById(id)?.title ?? '';
}