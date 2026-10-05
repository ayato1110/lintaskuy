import { describe, expect, it } from 'vitest';
import { courses, coursesById } from '@/lib/data-repo';
import { demoProfile } from '@/lib/data-repo';
import {
  hasCompletedHistory,
  historicalCoursesFor,
  historicalSemestersFor,
  isHistoricalCourse,
  pruneCompletedCourseIds,
} from './progress';

const credits = (ids: string[]) =>
  ids.reduce((sum, id) => sum + (coursesById.get(id)?.credits ?? 0), 0);

describe('Riwayat mata kuliah selesai', () => {
  it('Semester 1 belum memiliki riwayat semester sebelumnya', () => {
    expect(historicalCoursesFor(1)).toHaveLength(0);
    expect(historicalSemestersFor(1)).toEqual([]);
  });

  it('Semester 2 hanya melihat Semester 1', () => {
    expect(historicalSemestersFor(2)).toEqual([1]);
    expect(historicalCoursesFor(2).every((c) => c.semester === 1)).toBe(true);
  });

  it('Semester 3 melihat Semester 1 sampai 2', () => {
    expect(historicalSemestersFor(3)).toEqual([1, 2]);
  });

  it('Semester 5 melihat Semester 1 sampai 4 dengan total 84 SKS', () => {
    const list = historicalCoursesFor(5);
    expect(historicalSemestersFor(5)).toEqual([1, 2, 3, 4]);
    expect(credits(list.map((c) => c.id))).toBe(84);
  });

  it('Semester 8 melihat Semester 1 sampai 7', () => {
    expect(historicalSemestersFor(8)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('tidak memuat mata kuliah semester aktif maupun semester mendatang', () => {
    for (const semester of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const list = historicalCoursesFor(semester);
      expect(list.some((c) => c.semester >= semester)).toBe(false);
    }
  });

  it('tidak memuat asumsi demo sebagai riwayat resmi', () => {
    const list = historicalCoursesFor(8);
    expect(list.some((c) => c.type === 'demo_assumption')).toBe(false);
    const demoAssumptions = courses.filter((c) => c.type === 'demo_assumption');
    expect(demoAssumptions.length).toBeGreaterThan(0);
    expect(demoAssumptions.every((c) => !isHistoricalCourse(c, 8))).toBe(true);
  });
});

describe('Prune riwayat saat semester berubah', () => {
  it('membuang mata kuliah semester aktif dan mendatang, menyimpan yang masih valid', () => {
    const semester5 = historicalCoursesFor(5).map((c) => c.id);
    const result = pruneCompletedCourseIds([...semester5, 'isy155', 'isy165'], 3);

    expect(result.kept).toEqual(semester5.filter((id) => (coursesById.get(id)?.semester ?? 9) < 3));
    expect(result.removed.map((c) => c.id).sort()).toEqual(
      [...new Set([...semester5, 'isy155', 'isy165'])]
        .filter((id) => (coursesById.get(id)?.semester ?? 0) >= 3)
        .sort(),
    );
    expect(result.kept.some((id) => (coursesById.get(id)?.semester ?? 0) >= 3)).toBe(false);
  });

  it('menjaga pilihan yang masih valid tetap utuh', () => {
    const kept = historicalCoursesFor(5).map((c) => c.id);
    expect(pruneCompletedCourseIds(kept, 5).kept).toEqual(kept);
    expect(pruneCompletedCourseIds(kept, 5).removed).toEqual([]);
  });

  it('tidak menghasilkan id duplikat dan mengabaikan id yang tidak dikenal', () => {
    const result = pruneCompletedCourseIds(['fst115', 'fst115', 'tidak-ada', 'fst116'], 5);
    expect(result.kept).toEqual(['fst115', 'fst116']);
  });

  it('profil demo tetap 84 SKS dari Semester 1 sampai 4', () => {
    const result = pruneCompletedCourseIds(demoProfile.completedCourseIds, demoProfile.currentSemester);
    expect(result.kept).toEqual(demoProfile.completedCourseIds);
    expect(result.removed).toEqual([]);
    expect(credits(result.kept)).toBe(84);
    expect(demoProfile.completedCredits).toBe(84);
  });
});

describe('Status riwayat', () => {
  it('profil tanpa riwayat mata kuliah terdeteksi', () => {
    expect(hasCompletedHistory([])).toBe(false);
    expect(hasCompletedHistory(['fst115'])).toBe(true);
  });
});
