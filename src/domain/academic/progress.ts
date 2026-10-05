import { courses, coursesById } from '@/lib/data-repo';
import type { Course } from '@/domain/types';

/**
 * Riwayat resmi hanya berisi mata kuliah dari semester sebelum semester aktif.
 * Mata kuliah pada semester aktif masih ditempuh, bukan riwayat selesai.
 */
export function isHistoricalCourse(course: Course, activeSemester: number): boolean {
  return course.type !== 'demo_assumption' && course.semester < activeSemester;
}

export function historicalCoursesFor(activeSemester: number): Course[] {
  return courses
    .filter((course) => isHistoricalCourse(course, activeSemester))
    .sort((a, b) => a.semester - b.semester);
}

export function historicalSemestersFor(activeSemester: number): number[] {
  return Array.from(new Set(historicalCoursesFor(activeSemester).map((c) => c.semester)));
}

export interface PruneResult {
  kept: string[];
  removed: Course[];
}

/**
 * Membuang mata kuliah yang tidak lagi valid sebagai riwayat selesai,
 * yaitu mata kuliah pada semester aktif, semester mendatang, atau asumsi demo.
 */
export function pruneCompletedCourseIds(courseIds: string[], activeSemester: number): PruneResult {
  const kept: string[] = [];
  const removed: Course[] = [];
  const seen = new Set<string>();

  for (const id of courseIds) {
    if (seen.has(id)) continue;
    const course = coursesById.get(id);
    if (!course) continue;
    seen.add(id);
    if (isHistoricalCourse(course, activeSemester)) {
      kept.push(id);
    } else {
      removed.push(course);
    }
  }

  return { kept, removed };
}

export function hasCompletedHistory(completedCourseIds: string[]): boolean {
  return completedCourseIds.length > 0;
}
