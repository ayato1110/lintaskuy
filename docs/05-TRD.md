# Technical Requirements Document — LINTAS

## 1. Arsitektur

Single-page application front-end only.

```text
React UI
  ├── Domain state
  ├── Rule engine
  ├── Data repository (JSON)
  ├── localStorage adapter
  └── Print adapter
```

Tidak ada server, database, auth, atau API eksternal yang wajib.

## 2. Stack yang disarankan

- React + TypeScript + Vite.
- React Router.
- Tailwind CSS.
- shadcn/ui + Radix UI.
- Zustand untuk domain state ringan.
- Zod untuk validasi data dan storage.
- Lucide Icons.
- Recharts hanya bila visualisasi benar-benar membantu.
- Vitest + Testing Library.
- Playwright untuk E2E.

Gunakan versi stabil saat implementasi. Catat versi pada README project hasil build.

## 3. Struktur source

```text
src/
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── AppShell.tsx
├── components/
│   ├── ui/
│   ├── academic/
│   ├── career/
│   ├── scenario/
│   └── advisor/
├── pages/
├── domain/
│   ├── academic/
│   ├── career/
│   ├── scenario/
│   └── internship/
├── data/
├── stores/
├── hooks/
├── lib/
├── styles/
└── test/
```

## 4. Domain types minimum

```ts
type CourseType = 'required' | 'specialization' | 'demo_assumption';
type CourseStatus = 'completed' | 'in_progress' | 'available' | 'planned' | 'locked' | 'attention';
type RuleSource = 'participant_confirmed' | 'curriculum_source' | 'demo_assumption';

interface Course {
  id: string;
  code: string | null;
  name: string;
  credits: number;
  semester: number;
  type: CourseType;
  specializationId?: string;
  prerequisiteIds: string[];
  prerequisiteMode?: 'all' | 'any';
  ruleSource: RuleSource;
  projectHeavy?: boolean;
}

interface StudentProfile {
  id: string;
  name: string;
  currentSemester: number;
  performanceIndex: number;
  completedCourseIds: string[];
  completedCredits: number;
  weeklyCommitments: WeeklyCommitment[];
  exploredCareerRoleIds: string[];
  lockedSpecializationId?: string;
}

interface Scenario {
  id: string;
  name: string;
  targetSemester: number;
  selectedCourseIds: string[];
  commitments: WeeklyCommitment[];
  specializationId?: string;
  targetCareerRoleId?: string;
  targetInternshipRoleId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 5. Rule engine API

```ts
getCreditLimit(performanceIndex: number): 21 | 24
calculateCredits(courseIds: string[]): number
validateCreditLimit(profile: StudentProfile, scenario: Scenario): RuleResult
validateSpecialization(profile: StudentProfile, scenario: Scenario): RuleResult
validatePrerequisites(profile: StudentProfile, scenario: Scenario): RuleResult[]
assessInternshipEligibility(profile: StudentProfile): InternshipResult
assessWorkload(profile: StudentProfile, scenario: Scenario): WorkloadResult
buildAdvisorBrief(profile: StudentProfile, scenario: Scenario): AdvisorBrief
```

RuleResult selalu berisi `status`, `title`, `reason`, `source`, dan `nextAction`.

## 6. Workload model

Model bersifat deterministik dan dapat dijelaskan. Contoh skor internal:

- SKS 0–18: 0 poin; 19–21: 1; 22–24: 2.
- Setiap mata kuliah project-heavy: +1, maksimum +3.
- Komitmen mingguan 1–5 jam: +0; 6–10: +1; >10: +2.
- Magang/aktivitas besar aktif: +2.

Kategori:

- 0–1 Ringan.
- 2–3 Seimbang.
- 4–5 Tinggi.
- 6+ Sangat Tinggi.

UI tidak perlu menampilkan angka skor mentah. UI menampilkan alasan. Semua tag project-heavy adalah asumsi demo.

## 7. localStorage

Key: `lintas.app-state.v1`.

Schema:

```ts
interface PersistedStateV1 {
  version: 1;
  profile: StudentProfile | null;
  scenarios: Scenario[];
  primaryScenarioId: string | null;
  onboardingCompleted: boolean;
  updatedAt: string;
}
```

Requirement:

- validasi dengan Zod saat load;
- fallback aman jika rusak;
- tombol reset;
- seed demo yang deterministik;
- jangan menyimpan data sensitif nyata.

## 8. Performance

- Route-level code splitting bila mudah.
- Tidak memuat chart library pada route yang tidak membutuhkan.
- Hindari gambar hero besar.
- Production build tanpa error.
- Target Lighthouse bukan angka lomba resmi, tetapi usahakan performance/accessibility/best practices baik.

## 9. Testing

### Unit

- batas 24 SKS untuk IP >3,00;
- batas 21 SKS untuk IP ≤3,00;
- semester <5 tidak dapat mengunci jalur;
- jalur campuran terdeteksi;
- prasyarat all/any;
- Magang minimal 120 SKS dan seluruh nilai di atas C;
- workload menghasilkan alasan.

### Integration

- profil demo memuat dashboard;
- tambah/hapus mata kuliah memperbarui total;
- simpan skenario masuk storage;
- compare memerlukan dua skenario;
- brief mengikuti skenario utama.

### E2E

- alur Kang Haerin dari landing sampai print preview;
- mobile 390 px tidak overflow;
- keyboard navigation pada onboarding dan dialog.

## 10. Deployment

- Build statis.
- Vercel atau Netlify.
- SPA fallback dikonfigurasi.
- HTTPS.
- Public URL tanpa login.
- Metadata title, description, Open Graph sederhana, favicon.

## 11. Error handling

- Error boundary level aplikasi.
- Validasi storage.
- Pesan pengguna tidak memperlihatkan stack trace.
- Logging console dibatasi untuk pengembangan.
- Tombol retry/reset tersedia jika state gagal dimuat.

## 12. Security dan privacy

- Tidak mengumpulkan data nyata.
- Tidak ada analytics yang wajib.
- Jika analytics ditambahkan, harus nonidentifying dan diungkapkan.
- Tidak ada token rahasia.
- Escape konten input ketika dicetak.
