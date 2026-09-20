import { assessWorkload, getCreditLimit, validateCreditLimit, validateLockedTrackMatch, validatePrerequisites, validateScenarioTrack, validateSelectedSameSemester } from '@/domain/academic/rules';
import { assessInternshipEligibility } from '@/domain/academic/rules';
import { calculateCredits, countProjectHeavy } from '@/domain/academic/rules';
import type { RuleResult, Scenario, StudentProfile, WorkloadAssessment } from '@/domain/types';

export interface ScenarioAnalysis {
  credits: number;
  projectHeavyCount: number;
  creditLimit: number;
  creditResult: RuleResult;
  trackResult: RuleResult;
  lockedTrackResult: RuleResult;
  prerequisiteResults: RuleResult[];
  semesterResult: RuleResult;
  workload: WorkloadAssessment;
  internshipEligibility: ReturnType<typeof assessInternshipEligibility>;
  allValid: boolean;
}

export function analyzeScenario(profile: StudentProfile, scenario: Scenario): ScenarioAnalysis {
  const creditResult = validateCreditLimit(profile, scenario);
  const trackResult = validateScenarioTrack(scenario);
  const lockedTrackResult = validateLockedTrackMatch(profile, scenario);
  const prerequisiteResults = validatePrerequisites(profile, scenario);
  const semesterResult = validateSelectedSameSemester(scenario);
  const workload = assessWorkload(profile, scenario);
  const internshipEligibility = assessInternshipEligibility(profile);

  const blockingResults = [creditResult, trackResult, lockedTrackResult, semesterResult].filter(
    (r) => r.status === 'error',
  );
  const allValid =
    blockingResults.length === 0 &&
    creditResult.status === 'ok' &&
    trackResult.status === 'ok' &&
    lockedTrackResult.status === 'ok';

  return {
    credits: calculateCredits(scenario.selectedCourseIds),
    projectHeavyCount: countProjectHeavy(scenario.selectedCourseIds),
    creditLimit: getCreditLimit(profile.performanceIndex),
    creditResult,
    trackResult,
    lockedTrackResult,
    prerequisiteResults,
    semesterResult,
    workload,
    internshipEligibility,
    allValid,
  };
}

export function summarizeScenarios(profile: StudentProfile, scenarios: Scenario[]): ScenarioAnalysis[] {
  return scenarios.map((s) => analyzeScenario(profile, s));
}

export function scenarioCredits(scenario: Scenario): number {
  return calculateCredits(scenario.selectedCourseIds);
}