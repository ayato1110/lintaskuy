import { z } from 'zod';
import type {
  CareerRole,
  Course,
  PersistedStateV1,
  Scenario,
  Specialization,
  StudentProfile,
  WeeklyCommitment,
} from '@/domain/types';

import curriculumJson from '../../data/curriculum.json';
import specializationJson from '../../data/specializations.json';
import careerRoutesJson from '../../data/career-paths.json';
import academicRulesJson from '../../data/academic-rules.json';
import demoProfileJson from '../../data/demo-profile.json';
import sampleScenariosJson from '../../data/sample-scenarios.json';

const weeklyCommitmentSchema = z.object({
  id: z.string(),
  label: z.string(),
  hoursPerWeek: z.number().min(0),
});

const courseSchema = z.object({
  id: z.string(),
  code: z.string().nullable(),
  name: z.string(),
  credits: z.number().int().min(0),
  semester: z.number().int().min(1).max(8),
  type: z.enum(['required', 'specialization', 'demo_assumption']),
  specializationId: z.string().nullable(),
  prerequisiteIds: z.array(z.string()).default([]),
  prerequisiteMode: z.enum(['all', 'any']).default('all'),
  ruleSource: z.enum(['participant_confirmed', 'curriculum_source', 'demo_assumption']),
  projectHeavy: z.boolean().default(false),
});

const curriculumSchema = z.object({
  schemaVersion: z.number(),
  officialCourseCountSemester1To7: z.number(),
  items: z.array(courseSchema),
});

const specializationSchema = z.object({
  id: z.string(),
  name: z.string(),
  courseIds: z.array(z.string()),
  focus: z.string(),
});

const specializationsSchema = z.object({
  schemaVersion: z.number(),
  lockFromSemester: z.number(),
  maxLocked: z.number(),
  items: z.array(specializationSchema),
});

const careerRoleSchema = z.object({
  id: z.string(),
  title: z.string(),
  specializationIds: z.array(z.string()),
  skills: z.array(z.string()),
  supportingCourseIds: z.array(z.string()),
  internshipTitles: z.array(z.string()),
  portfolioIdeas: z.array(z.string()),
});

const careerRoutesSchema = z.object({
  schemaVersion: z.number(),
  disclaimer: z.string(),
  items: z.array(careerRoleSchema),
});

const academicRulesSchema = z.object({
  schemaVersion: z.number(),
  graduationCredits: z.number(),
  hasCommunityServiceCourse: z.boolean(),
  creditLimit: z.object({
    whenPerformanceIndexGreaterThan: z.number(),
    greaterLimit: z.number(),
    otherwiseLimit: z.number(),
    label: z.string(),
    source: z.enum(['participant_confirmed', 'curriculum_source', 'demo_assumption']),
  }),
  specialization: z.object({
    lockFromSemester: z.number(),
    maxLocked: z.number(),
    coursesPerTrack: z.number(),
    creditsPerTrack: z.number(),
    source: z.enum(['participant_confirmed', 'curriculum_source', 'demo_assumption']),
  }),
  internship: z.object({
    minimumCompletedCredits: z.number(),
    allCompletedGradesMustBeAbove: z.string(),
    comparison: z.string(),
    source: z.enum(['participant_confirmed', 'curriculum_source', 'demo_assumption']),
  }),
  assumptions: z.array(z.string()),
});

const demoProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDemoPersona: z.boolean().default(false),
  currentSemester: z.number(),
  performanceIndex: z.number(),
  completedCredits: z.number(),
  completedCourseIds: z.array(z.string()),
  allCompletedGradesAboveC: z.boolean().default(false),
  weeklyCommitments: z.array(weeklyCommitmentSchema).default([]),
  exploredSpecializationIds: z.array(z.string()).default([]),
  lockedSpecializationId: z.string().nullable().default(null),
  exploredCareerRoleIds: z.array(z.string()).default([]),
  targetInternshipTitles: z.array(z.string()).default([]),
});

const sampleScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetSemester: z.number(),
  selectedCourseIds: z.array(z.string()),
  specializationId: z.string().nullable(),
  commitments: z.array(weeklyCommitmentSchema).default([]),
  targetCareerRoleId: z.string().nullable().default(null),
  targetInternshipRole: z.string().nullable().default(null),
});

const sampleScenariosSchema = z.object({
  schemaVersion: z.number(),
  items: z.array(sampleScenarioSchema),
});

export const academicRules = academicRulesSchema.parse(academicRulesJson);
export const courses: Course[] = curriculumSchema.parse(curriculumJson).items;
export const specializations: Specialization[] =
  specializationsSchema.parse(specializationJson).items;
export const careerRoles: CareerRole[] = careerRoutesSchema.parse(careerRoutesJson).items;
export const careerDisclaimer = careerRoutesSchema.parse(careerRoutesJson).disclaimer;
export const sampleScenariosRaw = sampleScenariosSchema.parse(sampleScenariosJson).items;

export const coursesById: ReadonlyMap<string, Course> = new Map(courses.map((c) => [c.id, c]));

export function getCourse(id: string): Course {
  const course = coursesById.get(id);
  if (!course) {
    throw new Error(`Unknown course id: ${id}`);
  }
  return course;
}

export function coursesForSemester(semester: number): Course[] {
  return courses.filter((c) => c.semester === semester);
}

export function specializationById(id: string | null): Specialization | null {
  if (!id) return null;
  return specializations.find((s) => s.id === id) ?? null;
}

export function careerRoleById(id: string | null): CareerRole | null {
  if (!id) return null;
  return careerRoles.find((r) => r.id === id) ?? null;
}

export function coursesForSpecialization(id: string): Course[] {
  const spec = specializationById(id);
  if (!spec) return [];
  return spec.courseIds.map(getCourse);
}

export function coursesForCareerRole(role: CareerRole): Course[] {
  return role.supportingCourseIds.map(getCourse);
}

export function rolesForSpecialization(specId: string): CareerRole[] {
  return careerRoles.filter((r) => r.specializationIds.includes(specId));
}

export function roleById(id: string | null): CareerRole | null {
  return careerRoles.find((r) => r.id === id) ?? null;
}

export function commitmentsFromInput(values: { id: string; label: string; hoursPerWeek: number }[]): WeeklyCommitment[] {
  return values.map((v) => ({ id: v.id, label: v.label, hoursPerWeek: v.hoursPerWeek }));
}

export const demoProfile: StudentProfile = demoProfileSchema.parse(demoProfileJson);

const SEED_DATE = '2025-08-01T00:00:00.000Z';

export function seedScenarios(): Scenario[] {
  return sampleScenariosRaw.map((s) => ({
    ...s,
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  }));
}

export const emptyPersistedState = (): PersistedStateV1 => ({
  version: 1,
  profile: null,
  scenarios: [],
  primaryScenarioId: null,
  onboardingCompleted: false,
  advisorQuestions: [],
  updatedAt: new Date().toISOString(),
});

export function seedPersistedState(): PersistedStateV1 {
  const scenarios = seedScenarios();
  return {
    version: 1,
    profile: {
      ...demoProfile,
      weeklyCommitments: demoProfile.weeklyCommitments.map((c) => ({ ...c })),
      completedCourseIds: [...demoProfile.completedCourseIds],
    },
    scenarios,
    primaryScenarioId: scenarios.find((s) => s.specializationId === 'enterprise-digital')?.id ?? null,
    onboardingCompleted: true,
    advisorQuestions: [],
    updatedAt: SEED_DATE,
  };
}

export function dataIntegrityIssues(): string[] {
  const issues: string[] = [];

  const ids = new Set<string>();
  for (const course of courses) {
    if (ids.has(course.id)) issues.push(`Duplikat course id: ${course.id}`);
    ids.add(course.id);
  }

  const sem1to7Count = courses.filter((c) => c.semester <= 7).length;
  if (sem1to7Count !== 57) {
    issues.push(`Jumlah mata kuliah Semester 1-7 harus 57, ditemukan ${sem1to7Count}`);
  }

  const sem8 = courses.filter((c) => c.semester === 8);
  if (sem8.length !== 2 || sem8.some((c) => c.type !== 'demo_assumption')) {
    issues.push('Semester 8 harus berisi dua item berlabel demo_assumption');
  }

  if (courses.some((c) => /kkn/i.test(c.name))) {
    issues.push('Kurikulum tidak boleh memuat KKN');
  }

  const specCourseCounts = new Map<string, number>();
  for (const spec of specializations) {
    if (spec.courseIds.length !== 4) {
      issues.push(`Peminatan ${spec.id} harus memiliki 4 mata kuliah`);
    }
    const totalCredits = spec.courseIds.reduce((sum, id) => {
      const course = coursesById.get(id);
      return sum + (course?.credits ?? 0);
    }, 0);
    if (totalCredits !== 12) {
      issues.push(`Peminatan ${spec.id} harus berjumlah 12 SKS, ditemukan ${totalCredits}`);
    }
    for (const courseId of spec.courseIds) {
      specCourseCounts.set(courseId, (specCourseCounts.get(courseId) ?? 0) + 1);
      if (!coursesById.has(courseId)) {
        issues.push(`Course id ${courseId} pada peminatan ${spec.id} tidak ada`);
      }
    }
  }

  for (const [courseId, count] of specCourseCounts) {
    if (count > 1) issues.push(`Course ${courseId} muncul di lebih dari satu peminatan`);
    if (coursesById.get(courseId)?.type !== 'specialization') {
      issues.push(`Course ${courseId} terdaftar sebagai peminatan tetapi tipenya bukan specialization`);
    }
  }

  for (const course of courses) {
    for (const prereqId of course.prerequisiteIds ?? []) {
      if (!coursesById.has(prereqId)) {
        issues.push(`Prasyarat ${prereqId} pada ${course.id} tidak valid`);
      }
    }
  }

  return issues;
}

export { z, curriculumJson, sampleScenariosJson };