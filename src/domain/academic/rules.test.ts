import { describe, expect, it } from 'vitest';
import {
  assessInternshipEligibility,
  assessWorkload,
  calculateCredits,
  getCreditLimit,
  prerequisitesMet,
  validateCreditLimit,
  validateLockAllowed,
  validateScenarioTrack,
} from './rules';
import { coursesById, demoProfile, seedScenarios } from '@/lib/data-repo';
import type { Scenario, StudentProfile } from '@/domain/types';

function makeProfile(patch: Partial<StudentProfile>): StudentProfile {
  return {
    ...demoProfile,
    ...patch,
  };
}

function makeScenario(patch: Partial<Scenario>): Scenario {
  return {
    id: 'test-scenario',
    name: 'Test',
    targetSemester: 5,
    selectedCourseIds: [],
    commitments: [{ id: 'organization', label: 'Organisasi', hoursPerWeek: 6 }],
    specializationId: null,
    targetCareerRoleId: null,
    targetInternshipRole: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...patch,
  };
}

describe('credit limit', () => {
  it('memberikan batas 24 SKS untuk IP di atas 3,00', () => {
    expect(getCreditLimit(3.67)).toBe(24);
    expect(getCreditLimit(3.01)).toBe(24);
  });

  it('memberikan batas 21 SKS untuk IP 3,00 atau di bawahnya', () => {
    expect(getCreditLimit(3.0)).toBe(21);
    expect(getCreditLimit(2.75)).toBe(21);
  });
});

describe('calculateCredits', () => {
  it('menjumlahkan SKS dari daftar course', () => {
    expect(calculateCredits(['isp114', 'isp115', 'isp111'])).toBe(9);
    expect(calculateCredits([])).toBe(0);
  });

  it('menotal total SKS dari skenario utama Kang Haerin', () => {
    const scenarios = seedScenarios();
    const main = scenarios.find((s) => s.id === 'haerin-enterprise-balanced')!;
    expect(calculateCredits(main.selectedCourseIds)).toBe(24);
  });
});

describe('validateCreditLimit', () => {
  it('mengembalikan error ketika rencana melebihi batas', () => {
    const profile = makeProfile({ performanceIndex: 3.67 });
    const scenario = makeScenario({
      selectedCourseIds: [
        'isp151', 'isp152', 'isp153', 'isp154', 'isp155', 'isp156',
        'esy155', 'esy156', 'isp141',
      ],
    });
    const result = validateCreditLimit(profile, scenario);
    expect(result.status).toBe('error');
    expect(calculateCredits(scenario.selectedCourseIds)).toBeGreaterThan(24);
  });

  it('mengembalikan ok ketika total masih dalam batas', () => {
    const profile = makeProfile({ performanceIndex: 3.67 });
    const scenario = makeScenario({ selectedCourseIds: ['isp151', 'isp152', 'isp154'] });
    const result = validateCreditLimit(profile, scenario);
    expect(result.status).toBe('ok');
  });
});

describe('specialization lock', () => {
  it('menolak penguncian pada Semester 1-4', () => {
    const profile = makeProfile({ currentSemester: 3 });
    expect(validateLockAllowed(profile).status).toBe('error');
  });

  it('mengizinkan penguncian pada Semester 5', () => {
    const profile = makeProfile({ currentSemester: 5 });
    expect(validateLockAllowed(profile).status).toBe('ok');
  });
});

describe('mixed track detection', () => {
  it('mendeteksi jalur campuran', () => {
    const scenario = makeScenario({
      selectedCourseIds: ['esy155', 'esy153'],
      specializationId: null,
    });
    expect(validateScenarioTrack(scenario).status).toBe('error');
  });

  it('menerima satu jalur konsisten', () => {
    const scenario = makeScenario({
      selectedCourseIds: ['esy155', 'esy156'],
      specializationId: 'enterprise-digital',
    });
    expect(validateScenarioTrack(scenario).status).toBe('ok');
  });
});

describe('prerequisites', () => {
  it('menghormati mode all', () => {
    const profile = makeProfile({ completedCourseIds: ['isp114', 'isp212'] });
    const structuredData = coursesById.get('isp234')!;
    expect(structuredData.prerequisiteMode).toBe('all');
    expect(prerequisitesMet(structuredData, profile)).toBe(true);
    expect(prerequisitesMet(structuredData, makeProfile({ completedCourseIds: ['isp114'] }))).toBe(
      false,
    );
  });

  it('menghormati mode any', () => {
    const softwareTesting = coursesById.get('isp152')!;
    expect(softwareTesting.prerequisiteMode).toBe('any');
    const profileWithOne = makeProfile({ completedCourseIds: ['isp234'] });
    expect(prerequisitesMet(softwareTesting, profileWithOne)).toBe(true);
    const profileWithNone = makeProfile({ completedCourseIds: [] });
    expect(prerequisitesMet(softwareTesting, profileWithNone)).toBe(false);
  });
});

describe('internship eligibility', () => {
  it('belum siap ketika SKS kurang dari 120', () => {
    const result = assessInternshipEligibility(makeProfile({ completedCredits: 84 }));
    expect(result.eligibility).toBe('needs_work');
    expect(result.creditsMet).toBe(false);
  });

  it('siap ketika SKS minimal dan nilai di atas C', () => {
    const result = assessInternshipEligibility(
      makeProfile({ completedCredits: 120, allCompletedGradesAboveC: true }),
    );
    expect(result.eligibility).toBe('ready');
    expect(result.creditsMet).toBe(true);
    expect(result.gradesAboveC).toBe(true);
  });

  it('memerlukan konfirmasi nilai ketika kredit terpenuhi', () => {
    const result = assessInternshipEligibility(
      makeProfile({ completedCredits: 120, allCompletedGradesAboveC: false }),
    );
    expect(result.eligibility).toBe('in_progress');
    expect(result.gradesAboveC).toBe(false);
  });
});

describe('workload', () => {
  it('menghasilkan kategori dan alasan yang dapat dijelaskan', () => {
    const profile = makeProfile({});
    const scenario = makeScenario({
      selectedCourseIds: ['isp151', 'isp152', 'isp153', 'isp154', 'isp155', 'isp156', 'esy155', 'esy156'],
      commitments: [{ id: 'organization', label: 'Organisasi', hoursPerWeek: 6 }],
    });
    const assessment = assessWorkload(profile, scenario);
    expect(assessment.reasons.length).toBeGreaterThan(0);
    expect(['Ringan', 'Seimbang', 'Tinggi', 'Sangat Tinggi']).toContain(assessment.category);
    expect(assessment.points).toBeGreaterThanOrEqual(0);
  });

  it('skenario kosong berperingkat Ringan', () => {
    const profile = makeProfile({});
    const assessment = assessWorkload(profile, makeScenario({ selectedCourseIds: [] }));
    expect(assessment.category).toBe('Ringan');
  });
});