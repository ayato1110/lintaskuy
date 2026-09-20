import { describe, expect, it } from 'vitest';
import {
  careerRoles,
  courses,
  coursesById,
  dataIntegrityIssues,
  demoProfile,
  sampleScenariosRaw,
  specializations,
} from '@/lib/data-repo';

describe('integritas data kurikulum', () => {
  it('tidak memiliki pelanggaran integritas sama sekali', () => {
    expect(dataIntegrityIssues()).toEqual([]);
  });

  it('memuat tepat 57 mata kuliah Semester 1-7 dan 2 asumsi Semester 8', () => {
    const semesters1To7 = courses.filter((c) => c.semester <= 7);
    const semester8 = courses.filter((c) => c.semester === 8);
    expect(semesters1To7.length).toBe(57);
    expect(semester8.length).toBe(2);
    expect(courses.length).toBe(59);
    expect(semester8.every((c) => c.type === 'demo_assumption')).toBe(true);
  });

  it('memuat 12 mata kuliah peminatan dengan 4/4/4 per jalur', () => {
    const specializationCourses = courses.filter((c) => c.type === 'specialization');
    expect(specializationCourses.length).toBe(12);
    for (const spec of specializations) {
      expect(spec.courseIds.length).toBe(4);
    }
  });

  it('tidak memiliki course id duplikat', () => {
    const ids = courses.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tidak memuat KKN', () => {
    expect(courses.some((c) => /kkn/i.test(c.name))).toBe(false);
  });

  it('semua id prasyarat valid', () => {
    for (const course of courses) {
      for (const prereqId of course.prerequisiteIds ?? []) {
        expect(coursesById.has(prereqId)).toBe(true);
      }
    }
  });

  it('karier merujuk course dan peminatan yang valid', () => {
    for (const role of careerRoles) {
      for (const courseId of role.supportingCourseIds) {
        expect(coursesById.has(courseId)).toBe(true);
      }
      for (const specId of role.specializationIds) {
        expect(specializations.some((s) => s.id === specId)).toBe(true);
      }
    }
  });
});

describe('profil demo Kang Haerin', () => {
  it('terdata pada Semester 5 dengan IP 3,67 dan 84 SKS', () => {
    expect(demoProfile.name).toBe('Kang Haerin');
    expect(demoProfile.currentSemester).toBe(5);
    expect(demoProfile.performanceIndex).toBe(3.67);
    expect(demoProfile.completedCredits).toBe(84);
  });

  it('progres SKS dihitung ulang cocok dengan daftar course', () => {
    const computed = demoProfile.completedCourseIds.reduce(
      (sum, id) => sum + (coursesById.get(id)?.credits ?? 0),
      0,
    );
    expect(computed).toBe(84);
    expect(demoProfile.completedCourseIds.length).toBe(31);
  });

  it('memiliki organisasi 6 jam per minggu', () => {
    const org = demoProfile.weeklyCommitments.find((c) => c.id === 'organization');
    expect(org?.hoursPerWeek).toBe(6);
  });

  it('membandingkan dua jalur dengan Enterprise sebagai pilihan akhir', () => {
    expect(demoProfile.exploredSpecializationIds).toContain('enterprise-digital');
    expect(demoProfile.exploredSpecializationIds).toContain('data-bi');
    const mainScenario = sampleScenariosRaw.find((s) => s.id === 'haerin-enterprise-balanced');
    expect(mainScenario?.specializationId).toBe('enterprise-digital');
  });
});

describe('skenario contoh', () => {
  it('setiap skenario hanya memuat satu jalur dan tidak melebihi batas demo', () => {
    for (const scenario of sampleScenariosRaw) {
      const present = Array.from(
        new Set(
          scenario.selectedCourseIds
            .map((id) => coursesById.get(id)?.specializationId)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      expect(present.length).toBeLessThanOrEqual(1);
      const total = scenario.selectedCourseIds.reduce(
        (sum, id) => sum + (coursesById.get(id)?.credits ?? 0),
        0,
      );
      expect(total).toBeLessThanOrEqual(24);
    }
  });
});