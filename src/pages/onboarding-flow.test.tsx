import { describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { seedPersistedState, coursesById } from '@/lib/data-repo';

// Radix Select tidak dapat dibuka di jsdom, jadi diganti select native.
// Select asli tetap diuji lewat E2E.
vi.mock('@/components/ui/select', () => ({
  SelectField: ({
    id,
    label,
    value,
    onValueChange,
    options,
    error,
    placeholder,
  }: {
    id: string;
    label: string;
    value: string | null;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    error?: string;
    placeholder?: string;
  }) => (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(event) => onValueChange(event.target.value)}
      >
        <option value="">{placeholder ?? ''}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  ),
}));

const { OnboardingPage } = await import('@/pages/OnboardingPage');

const IP_ERROR = 'Masukkan Indeks Prestasi antara 0 dan 4.';

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <OnboardingPage />
    </MemoryRouter>,
  );
}

async function pickSemester(user: ReturnType<typeof userEvent.setup>, semester: number) {
  await user.selectOptions(
    screen.getByLabelText('Semester aktif saat ini'),
    String(semester),
  );
}

async function fillStepOne(
  user: ReturnType<typeof userEvent.setup>,
  options: { semester?: number; ip?: string; name?: string },
) {
  if (options.name !== undefined) {
    await user.type(screen.getByLabelText('Nama panggilan (opsional)'), options.name);
  }
  await pickSemester(user, options.semester ?? 5);
  if (options.ip !== undefined) {
    const field = screen.getByLabelText('Indeks Prestasi');
    await user.clear(field);
    if (options.ip !== '') await user.type(field, options.ip);
  }
}

async function goToStepTwo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Lanjut' }));
}

function stepTwo() {
  expect(screen.getByRole('heading', { name: /Langkah 2 dari 4/ })).toBeInTheDocument();
}

function semesterButtons() {
  return screen.getAllByRole('button', { name: /Pilih semua|Batalkan semua/ });
}

function allAlerts() {
  return screen.getAllByRole('alert').map((node) => node.textContent ?? '').join(' ');
}

async function answerGrades(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Ya' }));
}

async function saveProfile(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Simpan profil' }));
}

async function selectFirstCourse(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole('checkbox')[0]);
}

describe('Onboarding langkah 1', () => {
  it('menampilkan placeholder dan hint Indeks Prestasi memakai titik', () => {
    renderOnboarding();
    const field = screen.getByLabelText('Indeks Prestasi');
    expect(field).toHaveAttribute('placeholder', 'Contoh: 3.67');
    expect(field).toHaveAttribute('inputmode', 'decimal');
    expect(field).toHaveAttribute('min', '0');
    expect(field).toHaveAttribute('max', '4');
    expect(field).toHaveAttribute('step', '0.01');
    expect(
      screen.getByText(/Gunakan titik untuk angka desimal, misalnya 3.67/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Di atas 3.00 memiliki batas 24 SKS. Nilai 3.00 atau di bawahnya memiliki batas 21 SKS./),
    ).toBeInTheDocument();
  });

  it('menjelaskan nama sebagai opsional dengan fallback Mahasiswa', () => {
    renderOnboarding();
    const field = screen.getByLabelText('Nama panggilan (opsional)');
    expect(field).toHaveAttribute('placeholder', 'Contoh: Ripa');
    expect(screen.getByText(/Jika dikosongkan, kami akan menggunakan/)).toBeInTheDocument();
  });

  it('menolak nilai Indeks Prestasi di luar rentang dan kosong', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    for (const value of ['', 'abc', '-1', '4.1']) {
      await fillStepOne(user, { ip: value });
      await goToStepTwo(user);
      expect(screen.getByText(IP_ERROR)).toBeInTheDocument();
    }
  });

  it('menerima nilai Indeks Prestasi yang valid', async () => {
    const user = userEvent.setup();
    for (const value of ['0', '3', '3.00', '3.01', '3.67', '4']) {
      cleanup();
      renderOnboarding();
      await fillStepOne(user, { ip: value });
      await goToStepTwo(user);
      stepTwo();
      expect(screen.queryByText(IP_ERROR)).not.toBeInTheDocument();
      await selectFirstCourse(user);
      await answerGrades(user);
      await goToStepTwo(user);
      expect(screen.getByRole('heading', { name: /Langkah 3 dari 4/ })).toBeInTheDocument();
    }
  });

  it('menyimpan nama yang hanya berisi spasi sebagai Mahasiswa', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { ip: '3.67', name: '   ' });
    await goToStepTwo(user);
    stepTwo();
    await selectFirstCourse(user);
    await answerGrades(user);
    await goToStepTwo(user);
    expect(screen.getByRole('heading', { name: /Langkah 3 dari 4/ })).toBeInTheDocument();
    await goToStepTwo(user);
    await saveProfile(user);

    expect(useAppStore.getState().persisted.profile?.name).toBe('Mahasiswa');
  });

  it('menyimpan nama panggilan yang diisi', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { ip: '3.67', name: 'Ripa' });
    await goToStepTwo(user);
    stepTwo();
    await selectFirstCourse(user);
    await answerGrades(user);
    await goToStepTwo(user);
    await goToStepTwo(user);
    await saveProfile(user);

    const profile = useAppStore.getState().persisted.profile;
    expect(profile?.name).toBe('Ripa');
    expect(profile?.currentSemester).toBe(5);
    expect(profile?.performanceIndex).toBe(3.67);
  });
});

describe('Onboarding langkah 2', () => {
  it('Semester 1 tidak menampilkan daftar riwayat maupun pertanyaan nilai', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 1, ip: '3.00' });
    await goToStepTwo(user);
    stepTwo();

    expect(
      screen.getByText('Kamu belum memiliki riwayat mata kuliah dari semester sebelumnya.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Apakah semua nilai mata kuliah yang sudah kamu tempuh berada di atas C\?/),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Total SKS selesai:/)).toHaveTextContent('0 SKS');

    await goToStepTwo(user);
    expect(screen.getByRole('heading', { name: /Langkah 3 dari 4/ })).toBeInTheDocument();
  });

  it('Semester 1 tidak menyatakan syarat Magang terpenuhi', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 1, ip: '3.00' });
    await goToStepTwo(user);
    await goToStepTwo(user);
    await goToStepTwo(user);
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }));

    const profile = useAppStore.getState().persisted.profile;
    expect(profile?.currentSemester).toBe(1);
    expect(profile?.completedCourseIds).toEqual([]);
    expect(profile?.completedCredits).toBe(0);
    expect(profile?.allCompletedGradesAboveC).toBe(false);
  });

  it('Semester 2 hanya menampilkan Semester 1', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 2, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();

    expect(screen.getByRole('heading', { name: 'Semester 1' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Semester 2' })).not.toBeInTheDocument();
    expect(semesterButtons()).toHaveLength(1);
  });

  it('Semester 5 menampilkan Semester 1 sampai 4 dan tidak Semester 5', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 5, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();

    for (const semester of [1, 2, 3, 4]) {
      expect(screen.getByRole('heading', { name: `Semester ${semester}` })).toBeInTheDocument();
    }
    expect(screen.queryByRole('heading', { name: 'Semester 5' })).not.toBeInTheDocument();
    expect(semesterButtons()).toHaveLength(4);
  });

  it(' mewajibkan jawaban kondisi nilai untuk Semester 2 sampai 8', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 3, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();

    await goToStepTwo(user);
    expect(screen.getByRole('heading', { name: /Langkah 2 dari 4/ })).toBeInTheDocument();
    expect(allAlerts()).toMatch(/Jawab pertanyaan nilai/);
  });
});

describe('Tombol Pilih semua', () => {
  it('berubah menjadi Batalkan semua dan menjumlahkan 84 SKS', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 5, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();

    const buttons = semesterButtons();
    for (const button of buttons) {
      expect(button).toHaveTextContent('Pilih semua');
      await user.click(button);
      expect(button).toHaveTextContent('Batalkan semua');
    }

    expect(screen.getByText(/Total SKS selesai:/)).toHaveTextContent('84 SKS');

    for (const button of semesterButtons()) {
      await user.click(button);
      expect(button).toHaveTextContent('Pilih semua');
    }
    expect(screen.getByText(/Total SKS selesai:/)).toHaveTextContent('0 SKS');
  });

  it('hanya memengaruhi semester terkait dan kembali ke Pilih semua saat satu dibatalkan', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 5, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();

    const [semester1, semester2] = semesterButtons();
    await user.click(semester1);
    await user.click(semester2);

    expect(semester2).toHaveTextContent('Batalkan semua');
    await user.click(semester2);
    expect(semester2).toHaveTextContent('Pilih semua');
    expect(semester1).toHaveTextContent('Batalkan semua');
    expect(screen.getByText(/Total SKS selesai:/)).toHaveTextContent('21 SKS');
  });

  it('membatalkan satu mata kuliah secara manual mengembalikan label Pilih semua', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 5, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();

    const semester1 = semesterButtons()[0];
    await user.click(semester1);
    expect(semester1).toHaveTextContent('Batalkan semua');

    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(firstCheckbox);

    expect(semester1).toHaveTextContent('Pilih semua');
    expect(screen.getByText(/Total SKS selesai:/)).not.toHaveTextContent('21 SKS');
  });
});

describe('Pergantian semester pada langkah 1', () => {
  it('membuang riwayat semester aktif dan mendatang serta menjelaskan alasannya', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 5, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();

    for (const button of semesterButtons()) await user.click(button);
    expect(screen.getByText(/Total SKS selesai:/)).toHaveTextContent('84 SKS');

    await user.click(screen.getByRole('button', { name: 'Kembali' }));
    await pickSemester(user, 3);

    expect(screen.getByRole('status')).toHaveTextContent(
      /dikeluarkan dari riwayat karena semester aktifmu sekarang Semester 3/,
    );

    await goToStepTwo(user);
    stepTwo();
    expect(screen.getByText(/Total SKS selesai:/)).toHaveTextContent('42 SKS');
    expect(
      screen.queryByRole('checkbox', { name: /Manajemen Proyek Sistem Informasi/ }),
    ).not.toBeInTheDocument();
  });

  it('tidak mereset riwayat bila semester tetap sama', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 5, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();

    for (const button of semesterButtons()) await user.click(button);
    await user.click(screen.getByRole('button', { name: 'Kembali' }));
    await pickSemester(user, 5);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await goToStepTwo(user);
    stepTwo();
    expect(screen.getByText(/Total SKS selesai:/)).toHaveTextContent('84 SKS');
  });

  it('menyimpan profil tanpa id mata kuliah ganda', async () => {
    const user = userEvent.setup();
    renderOnboarding();
    await fillStepOne(user, { semester: 5, ip: '3.67' });
    await goToStepTwo(user);
    stepTwo();
    for (const button of semesterButtons()) await user.click(button);
    for (const button of semesterButtons()) await user.click(button);
    for (const button of semesterButtons()) await user.click(button);
    await answerGrades(user);
    await goToStepTwo(user);
    await goToStepTwo(user);
    await saveProfile(user);

    const ids = useAppStore.getState().persisted.profile?.completedCourseIds ?? [];
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => (coursesById.get(id)?.semester ?? 9) < 5)).toBe(true);
    expect(ids.length).toBe(31);
  });
});

describe('Penyimpanan profil', () => {
  it('menyimpan hasil akhir sesuai pilihan pengguna', async () => {
    const user = userEvent.setup();
    const seeded = seedPersistedState();
    useAppStore.setState({ persisted: seeded, hasHydrated: true });
    renderOnboarding();

    await fillStepOne(user, { semester: 5, ip: '3.67', name: 'Ripa' });
    await goToStepTwo(user);
    for (const button of semesterButtons()) await user.click(button);
    await user.click(screen.getByRole('radio', { name: 'Ya' }));
    await goToStepTwo(user);

    await user.click(screen.getByRole('checkbox', { name: /Enterprise & Aplikasi Digital/ }));
    await user.click(screen.getByRole('checkbox', { name: 'UI/UX Designer' }));
    await goToStepTwo(user);

    await user.click(screen.getByRole('button', { name: 'Tambah aktivitas' }));
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }));

    const profile = useAppStore.getState().persisted.profile;
    expect(profile?.name).toBe('Ripa');
    expect(profile?.completedCredits).toBe(84);
    expect(profile?.allCompletedGradesAboveC).toBe(true);
    expect(profile?.exploredSpecializationIds).toEqual(['enterprise-digital']);
    expect(profile?.exploredCareerRoleIds.length).toBe(1);
    expect(profile?.weeklyCommitments).toHaveLength(1);
  });
});
