import { academicRules, coursesById } from '@/lib/data-repo';
import type {
  Course,
  CourseStatus,
  InternshipResult,
  RuleResult,
  Scenario,
  StudentProfile,
  WorkloadAssessment,
} from '@/domain/types';

export function getCreditLimit(performanceIndex: number): 21 | 24 {
  return performanceIndex > academicRules.creditLimit.whenPerformanceIndexGreaterThan
    ? (academicRules.creditLimit.greaterLimit as 24)
    : (academicRules.creditLimit.otherwiseLimit as 21);
}

export interface CreditLimitInfo {
  limit: 21 | 24;
  label: string;
}

export function getCreditLimitInfo(performanceIndex: number): CreditLimitInfo {
  return {
    limit: getCreditLimit(performanceIndex),
    label: academicRules.creditLimit.label,
  };
}

export function calculateCredits(courseIds: string[]): number {
  return courseIds.reduce((sum, id) => {
    const course = coursesById.get(id);
    return sum + (course?.credits ?? 0);
  }, 0);
}

export function countProjectHeavy(courseIds: string[]): number {
  return courseIds.filter((id) => coursesById.get(id)?.projectHeavy).length;
}

export function getSatuanKredit(courseIds: string[]): number {
  return calculateCredits(courseIds);
}

export function validateCreditLimit(profile: StudentProfile, scenario: Scenario): RuleResult {
  const total = getSatuanKredit(scenario.selectedCourseIds);
  const limit = getCreditLimit(profile.performanceIndex);

  if (total <= limit) {
    return {
      status: 'ok',
      title: 'Total SKS sesuai batas',
      reason: `Rencana ini memuat ${total} SKS dan masih dalam batas ${limit} SKS untuk ${academicRules.creditLimit.label} ${profile.performanceIndex.toLocaleString('id-ID')}.`,
      source: academicRules.creditLimit.source,
      nextAction: 'Tidak perlu tindakan.',
    };
  }

  return {
    status: 'error',
    title: `Melebihi batas SKS`,
    reason: `Rencana ini memuat ${total} SKS, sedangkan batas untuk ${academicRules.creditLimit.label} ${profile.performanceIndex.toLocaleString('id-ID')} adalah ${limit} SKS.`,
    source: academicRules.creditLimit.source,
    nextAction: `Hapus atau pindahkan setidaknya satu mata kuliah agar total mencapai ${limit} SKS atau kurang.`,
  };
}

export interface TrackAnalysis {
  mixed: boolean;
  presentTrackIds: string[];
  base: string[];
}

export function analyzeScenarioTrack(scenario: Scenario): TrackAnalysis {
  const presentTrackIds = Array.from(
    new Set(
      scenario.selectedCourseIds
        .map((id) => coursesById.get(id)?.specializationId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  return {
    mixed: presentTrackIds.length > 1,
    presentTrackIds,
    base: presentTrackIds,
  };
}

export function validateScenarioTrack(scenario: Scenario): RuleResult {
  const analysis = analyzeScenarioTrack(scenario);

  if (analysis.mixed) {
    return {
      status: 'error',
      title: 'Satu skenario memuat beberapa peminatan',
      reason: `Mata kuliah dari ${analysis.presentTrackIds.length} jalur tercampur dalam satu rencana. Satu skenario hanya boleh memuat satu peminatan penuh.`,
      source: academicRules.specialization.source,
      nextAction: 'Hapus mata kuliah yang berasal dari jalur lain, atau buat skenario terpisah untuk jalur pembanding.',
    };
  }

  const chosen = scenario.specializationId;
  const present = analysis.presentTrackIds[0] ?? null;
  if (chosen && present && chosen !== present) {
    return {
      status: 'warning',
      title: 'Jalur skenario tidak cocok dengan mata kuliah',
      reason: `Jalur yang dipilih adalah satu peminatan, tetapi mata kuliah pada rencana berasal dari jalur berbeda.`,
      source: academicRules.specialization.source,
      nextAction: 'Sesuaikan jalur pada skenario dengan mata kuliah yang dipilih.',
    };
  }

  if (!chosen && present) {
    return {
      status: 'warning',
      title: 'Jalur skenario belum ditetapkan',
      reason: 'Rencana memuat mata kuliah peminatan tetapi jalur tidak dicantumkan pada skenario.',
      source: academicRules.specialization.source,
      nextAction: 'Tentukan jalur pada skenario agar perbandingan lengkap.',
    };
  }

  return {
    status: 'ok',
    title: 'Jalur konsisten',
    reason: 'Skenario hanya memuat satu peminatan dan cocok dengan jalur yang dicantumkan.',
    source: academicRules.specialization.source,
    nextAction: 'Tidak perlu tindakan.',
  };
}

export function validateLockedTrackMatch(profile: StudentProfile, scenario: Scenario): RuleResult {
  const lockedId = profile.lockedSpecializationId;
  if (!lockedId) {
    return {
      status: 'ok',
      title: 'Belum ada peminatan yang dikunci',
      reason: `Penguncian tersedia mulai Semester ${academicRules.specialization.lockFromSemester}.`,
      source: academicRules.specialization.source,
      nextAction: 'Anda dapat menjelajahi beberapa jalur sebelum mengunci satu.',
    };
  }

  if (scenario.specializationId && scenario.specializationId !== lockedId) {
    return {
      status: 'error',
      title: 'Skenario berbeda dengan peminatan yang dikunci',
      reason: `Anda mengunci jalur tertentu, sedangkan skenario ini memakai jalur lain.`,
      source: academicRules.specialization.source,
      nextAction: 'Ubah jalur skenario setelah konfirmasi, atau gunakan untuk perbandingan saja.',
    };
  }

  return {
    status: 'ok',
    title: 'Skenario sesuai peminatan terkunci',
    reason: 'Jalur pada skenario sama dengan peminatan yang telah dikunci.',
    source: academicRules.specialization.source,
    nextAction: 'Tidak perlu tindakan.',
  };
}

export function validateLockAllowed(profile: StudentProfile): RuleResult {
  const lockFrom = academicRules.specialization.lockFromSemester;
  if (profile.currentSemester < lockFrom) {
    return {
      status: 'error',
      title: 'Penguncian tersedia mulai Semester 5',
      reason: `Pada Semester ${profile.currentSemester}, penguncian peminatan belum tersedia.`,
      source: academicRules.specialization.source,
      nextAction: 'Anda tetap dapat melihat dan menyimpan arah yang ingin dieksplorasi.',
    };
  }
  return {
    status: 'ok',
    title: 'Penguncian tersedia',
    reason: `Semester ${profile.currentSemester} sudah memenuhi syarat untuk mengunci satu peminatan.`,
    source: academicRules.specialization.source,
    nextAction: 'Pilih satu jalur dan kunci setelah membandingkan.',
  };
}

export function prerequisitesMet(course: Course, profile: StudentProfile, planned: string[] = []): boolean {
  const allRequired = (course.prerequisiteIds ?? []).every(
    (prereqId) =>
      profile.completedCourseIds.includes(prereqId) || planned.includes(prereqId),
  );
  const anyRequired = (course.prerequisiteIds ?? []).some(
    (prereqId) =>
      profile.completedCourseIds.includes(prereqId) || planned.includes(prereqId),
  );
  return (course.prerequisiteMode ?? 'all') === 'all' ? allRequired : anyRequired;
}

export function validatePrerequisites(profile: StudentProfile, scenario: Scenario): RuleResult[] {
  const results: RuleResult[] = [];
  for (const courseId of scenario.selectedCourseIds) {
    const course = coursesById.get(courseId);
    if (!course) continue;
    const unmet = (course.prerequisiteIds ?? []).filter(
      (prereqId) =>
        !profile.completedCourseIds.includes(prereqId) &&
        !scenario.selectedCourseIds.includes(prereqId),
    );
    if ((course.prerequisiteIds ?? []).length > 0 && unmet.length > 0) {
      const needAll = (course.prerequisiteMode ?? 'all') === 'all';
      const requirement = needAll
        ? `semua prasyarat berikut`
        : `setidaknya satu prasyarat berikut`;
      results.push({
        status: 'warning',
        title: `Prasyarat belum terpenuhi: ${course.name}`,
        reason: `${course.name} membutuhkan ${requirement}: ${unmet.map((id) => coursesById.get(id)?.name ?? id).join(', ')}.`,
        source: course.ruleSource,
        nextAction: 'Konfirmasikan hubungan prasyarat ini kepada program studi atau dosen PA.',
      });
    }
  }
  return results;
}

export function validateSelectedSameSemester(scenario: Scenario): RuleResult {
  const others = scenario.selectedCourseIds.filter(
    (id) => coursesById.get(id)?.semester !== scenario.targetSemester,
  );
  if (others.length === 0) {
    return {
      status: 'ok',
      title: 'Semua mata kuliah sesuai semester',
      reason: `Rencana ini disusun untuk Semester ${scenario.targetSemester}.`,
      source: 'curriculum_source',
      nextAction: 'Tidak perlu tindakan.',
    };
  }
  return {
    status: 'warning',
    title: 'Terdapat mata kuliah dari semester lain',
    reason: `${others.map((id) => coursesById.get(id)?.name ?? id).join(', ')} tidak tersedia pada Semester ${scenario.targetSemester}.`,
    source: 'curriculum_source',
    nextAction: 'Hapus mata kuliah tersebut atau pilih dari daftar Semester target.',
  };
}

export function assessWorkload(_profile: StudentProfile, scenario: Scenario): WorkloadAssessment {
  const totalCredits = getSatuanKredit(scenario.selectedCourseIds);
  const projectCount = countProjectHeavy(scenario.selectedCourseIds);

  let sksPoints: number;
  if (totalCredits <= 18) sksPoints = 0;
  else if (totalCredits <= 21) sksPoints = 1;
  else sksPoints = 2;

  const projectPoints = Math.min(projectCount, 3);

  const maxHours = scenario.commitments.reduce((max, c) => Math.max(max, c.hoursPerWeek), 0);
  let commitmentPoints: number;
  if (maxHours <= 5) commitmentPoints = 0;
  else if (maxHours <= 10) commitmentPoints = 1;
  else commitmentPoints = 2;

  const hasActiveInternship =
    scenario.selectedCourseIds.some((id) => coursesById.get(id)?.name.toLowerCase().includes('magang')) ?? false;
  const internshipPoints = hasActiveInternship ? 2 : 0;

  const points = sksPoints + projectPoints + commitmentPoints + internshipPoints;

  let category: WorkloadAssessment['category'];
  if (points <= 1) category = 'Ringan';
  else if (points <= 3) category = 'Seimbang';
  else if (points <= 5) category = 'Tinggi';
  else category = 'Sangat Tinggi';

  const reasons: string[] = [];
  reasons.push(`${totalCredits} SKS pada rencana ini memberi nilai ${sksPoints}`);
  if (projectCount > 0) {
    reasons.push(`${projectCount} mata kuliah berproyek memberi nilai ${projectPoints}`);
  }
  if (maxHours > 0) {
    reasons.push(`Komitmen mingguan ${maxHours} jam memberi nilai ${commitmentPoints}`);
  }
  if (hasActiveInternship) {
    reasons.push('Magang aktif pada semester ini memberi nilai 2');
  }

  return { category, points, reasons };
}

export function assessInternshipEligibility(profile: StudentProfile): InternshipResult {
  const minimum = academicRules.internship.minimumCompletedCredits;
  const creditsMet = profile.completedCredits >= minimum;
  const gradesAboveC = profile.allCompletedGradesAboveC;

  let eligibility: InternshipResult['eligibility'];
  if (creditsMet && gradesAboveC) eligibility = 'ready';
  else if (creditsMet) eligibility = 'in_progress';
  else eligibility = 'needs_work';

  const nextActions: string[] = [];
  if (!creditsMet) {
    nextActions.push(`Lanjutkan menempuh mata kuliah hingga mencapai ${minimum} SKS.`);
  }
  if (!gradesAboveC) {
    nextActions.push('Pastikan seluruh nilai mata kuliah yang telah ditempuh berada di atas C, lalu konfirmasikan ke program studi.');
  }
  if (creditsMet && gradesAboveC) {
    nextActions.push('Siapkan kompetensi dan portofolio untuk posisi Magang yang diminati.');
  }

  return {
    eligibility,
    completedCredits: profile.completedCredits,
    minimumCredits: minimum,
    creditsMet,
    gradesAboveC,
    sources: [academicRules.internship.source],
    nextActions,
  };
}

export interface StatusContext {
  activeCourseIds: string[];
}

export interface CourseStatusResult {
  status: CourseStatus;
  reason: string;
}

export function getCourseStatus(
  course: Course,
  profile: StudentProfile,
  context: StatusContext,
): CourseStatusResult {
  if (profile.completedCourseIds.includes(course.id)) {
    return { status: 'completed', reason: 'Mata kuliah ini tercatat sudah diselesaikan.' };
  }

  if (context.activeCourseIds.includes(course.id)) {
    return { status: 'planned', reason: 'Mata kuliah ini masuk dalam skenario aktif.' };
  }

  if (course.semester === profile.currentSemester && course.type === 'required') {
    return { status: 'in_progress', reason: 'Mata kuliah wajib pada semester berjalan.' };
  }

  if (course.semester < profile.currentSemester) {
    return {
      status: 'attention',
      reason: 'Semester mata kuliah ini sudah lewat tetapi belum tercatat selesai.',
    };
  }

  if (profile.lockedSpecializationId && course.specializationId) {
    const specs = profile.lockedSpecializationId;
    if (course.specializationId !== specs) {
      return {
        status: 'locked',
        reason: 'Berbeda dengan peminatan yang dikunci pada profil.',
      };
    }
  }

  if (!prerequisitesMet(course, profile)) {
    return {
      status: 'locked',
      reason: 'Prasyarat yang diasumsikan belum tercatat terpenuhi. Konfirmasikan ke prodi atau dosen PA.',
    };
  }

  return { status: 'available', reason: 'Mata kuliah siap direncanakan pada semester ini.' };
}