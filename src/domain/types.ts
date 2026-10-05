export type CourseType = 'required' | 'specialization' | 'demo_assumption';
export type CourseStatus =
  | 'completed'
  | 'in_progress'
  | 'available'
  | 'planned'
  | 'locked'
  | 'attention';
export type RuleSource = 'participant_confirmed' | 'curriculum_source' | 'demo_assumption';
export type PrerequisiteMode = 'all' | 'any';
export type RuleVerdict = 'ok' | 'warning' | 'error';

export interface Course {
  id: string;
  code: string | null;
  name: string;
  credits: number;
  semester: number;
  type: CourseType;
  specializationId: string | null;
  prerequisiteIds: string[];
  prerequisiteMode: PrerequisiteMode;
  ruleSource: RuleSource;
  projectHeavy: boolean;
}

export interface Specialization {
  id: string;
  name: string;
  courseIds: string[];
  focus: string;
}

export interface CareerRole {
  id: string;
  title: string;
  specializationIds: string[];
  skills: string[];
  supportingCourseIds: string[];
  internshipTitles: string[];
  portfolioIdeas: string[];
}

export interface WeeklyCommitment {
  id: string;
  label: string;
  hoursPerWeek: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  isDemoPersona: boolean;
  currentSemester: number;
  performanceIndex: number;
  completedCourseIds: string[];
  completedCredits: number;
  allCompletedGradesAboveC: boolean;
  weeklyCommitments: WeeklyCommitment[];
  exploredSpecializationIds: string[];
  lockedSpecializationId: string | null;
  exploredCareerRoleIds: string[];
  targetInternshipTitles: string[];
}

export interface Scenario {
  id: string;
  name: string;
  targetSemester: number;
  selectedCourseIds: string[];
  commitments: WeeklyCommitment[];
  specializationId: string | null;
  targetCareerRoleId: string | null;
  targetInternshipRole: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersistedStateV1 {
  version: 1;
  profile: StudentProfile | null;
  scenarios: Scenario[];
  primaryScenarioId: string | null;
  onboardingCompleted: boolean;
  advisorQuestions: string[];
  updatedAt: string;
}

export interface RuleResult {
  status: RuleVerdict;
  title: string;
  reason: string;
  source: RuleSource;
  nextAction: string;
}

export interface WorkloadAssessment {
  category: 'Ringan' | 'Seimbang' | 'Tinggi' | 'Sangat Tinggi';
  points: number;
  reasons: string[];
}

export interface InternshipResult {
  eligibility: 'ready' | 'needs_work' | 'in_progress';
  completedCredits: number;
  minimumCredits: number;
  creditsMet: boolean;
  /** null berarti syarat nilai belum dapat dievaluasi karena belum ada riwayat mata kuliah. */
  gradesAboveC: boolean | null;
  sources: RuleSource[];
  nextActions: string[];
}

export interface AdvisorBrief {
  generatedAt: string;
  profile: StudentProfile;
  primaryScenario: Scenario | null;
  specialization: Specialization | null;
  careerRole: CareerRole | null;
  internship: InternshipResult;
  risks: RuleResult[];
  questions: string[];
}