import { expect, test, type Page } from '@playwright/test';

const IP_ERROR = 'Masukkan Indeks Prestasi antara 0 dan 4.';

function isMobile(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) < 768;
}

async function readProfile(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem('lintas.app-state.v1');
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      state?: { persisted?: { profile?: Record<string, unknown> } };
      persisted?: { profile?: Record<string, unknown> };
    };
    return parsed.state?.persisted?.profile ?? parsed.persisted?.profile ?? {};
  });
}

async function startOnboarding(page: Page): Promise<void> {
  await page.goto('onboarding');
  await expect(page.getByRole('heading', { name: /Langkah 1 dari 4/ })).toBeVisible();
}

async function selectSemester(page: Page, semester: number): Promise<void> {
  await page.getByRole('combobox', { name: 'Semester aktif saat ini' }).click();
  await page.getByRole('option', { name: `Semester ${semester}` }).click();
}

async function fillStepOne(
  page: Page,
  options: { semester: number; ip?: string; name?: string },
): Promise<void> {
  if (options.name !== undefined) {
    await page.getByRole('textbox', { name: 'Nama panggilan (opsional)' }).fill(options.name);
  }
  await selectSemester(page, options.semester);
  if (options.ip !== undefined) {
    await page.getByRole('spinbutton', { name: 'Indeks Prestasi' }).fill(options.ip);
  }
}

async function openStepTwo(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await expect(page.getByRole('heading', { name: /Langkah 2 dari 4/ })).toBeVisible();
}

function bulkButtons(page: Page) {
  return page.getByRole('button', { name: 'Pilih semua' });
}

function undoBulkButtons(page: Page) {
  return page.getByRole('button', { name: 'Batalkan semua' });
}

async function clickAllBulkButtons(
  page: Page,
  locator: (page: Page) => ReturnType<Page['getByRole']>,
): Promise<void> {
  while ((await locator(page).count()) > 0) {
    await locator(page).first().click();
  }
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      const flag = 'lintas.e2e.cleared';
      if (!window.sessionStorage.getItem(flag)) {
        window.localStorage.clear();
        window.sessionStorage.setItem(flag, '1');
      }
    } catch {
      /* storage tidak tersedia */
    }
  });
});

test('A. Semester 5 menampilkan Semester 1 sampai 4 dan menyimpan 84 SKS', async ({ page }) => {
  await startOnboarding(page);
  await fillStepOne(page, { semester: 5, ip: '3.67', name: 'Ripa' });
  await openStepTwo(page);

  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 0 SKS');
  for (const semester of [1, 2, 3, 4]) {
    await expect(page.getByRole('heading', { name: `Semester ${semester}` })).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: 'Semester 5' })).toHaveCount(0);
  await expect(bulkButtons(page)).toHaveCount(4);

  await clickAllBulkButtons(page, bulkButtons);
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 84 SKS');

  await page.getByRole('radio', { name: 'Ya', exact: true }).click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await expect(page.getByRole('heading', { name: /Langkah 3 dari 4/ })).toBeVisible();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Simpan profil' }).click();

  await expect(page.getByRole('heading', { name: /Halo, Ripa/ })).toBeVisible();
  const profile = await readProfile(page);
  expect(profile.currentSemester).toBe(5);
  expect(profile.performanceIndex).toBe(3.67);
  expect(profile.completedCredits).toBe(84);
  expect(profile.allCompletedGradesAboveC).toBe(true);
  const ids = profile.completedCourseIds as string[];
  expect(ids.length).toBe(31);
  expect(new Set(ids).size).toBe(ids.length);
});

test('B. Semester 1 tidak menampilkan riwayat dan menandai nilai belum dapat dievaluasi', async ({
  page,
}) => {
  await startOnboarding(page);
  await fillStepOne(page, { semester: 1, ip: '3.00' });
  await openStepTwo(page);

  await expect(
    page.getByText('Kamu belum memiliki riwayat mata kuliah dari semester sebelumnya.'),
  ).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(
    page.getByText(/Apakah semua nilai mata kuliah yang sudah kamu tempuh berada di atas C\?/),
  ).toHaveCount(0);
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 0 SKS');
  await expect(page.getByRole('button', { name: /Pilih semua|Batalkan semua/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'Lanjut' }).click();
  await expect(page.getByRole('heading', { name: /Langkah 3 dari 4/ })).toBeVisible();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('button', { name: 'Simpan profil' }).click();

  const profile = await readProfile(page);
  expect(profile.currentSemester).toBe(1);
  expect(profile.completedCourseIds).toEqual([]);
  expect(profile.completedCredits).toBe(0);
  expect(profile.allCompletedGradesAboveC).toBe(false);

  await page.goto('app/internship');
  await expect(page.getByRole('heading', { name: 'Perencanaan Magang' })).toBeVisible();
  await expect(page.getByText('Syarat nilai belum dapat dievaluasi')).toBeVisible();
  await expect(page.getByText(/seluruh nilai yang sudah ditempuh berada di atas C/)).toHaveCount(0);
  await expect(page.getByText(/Masih ada 120 SKS lagi\./)).toBeVisible();
  await expect(page.getByText('SKS SKS')).toHaveCount(0);
});

test('C. Matriks validasi Indeks Prestasi', async ({ page }) => {
  for (const value of ['0', '3', '3.00', '3.01', '3.67', '4']) {
    await startOnboarding(page);
    await fillStepOne(page, { semester: 5, ip: value });
    await page.getByRole('button', { name: 'Lanjut' }).click();
    await expect(page.getByRole('heading', { name: /Langkah 2 dari 4/ })).toBeVisible();
    await expect(page.getByText(IP_ERROR)).toHaveCount(0);
  }

  for (const value of ['', '4.1', '5', '-1']) {
    await startOnboarding(page);
    await fillStepOne(page, { semester: 5, ip: value });
    await page.getByRole('button', { name: 'Lanjut' }).click();
    await expect(page.getByText(IP_ERROR)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Langkah 2 dari 4/ })).toHaveCount(0);
  }
});

test('D. Pilih semua hanya memengaruhi semester terkait', async ({ page }) => {
  await startOnboarding(page);
  await fillStepOne(page, { semester: 5, ip: '3.67' });
  await openStepTwo(page);

  await expect(undoBulkButtons(page)).toHaveCount(0);
  await clickAllBulkButtons(page, bulkButtons);

  await expect(undoBulkButtons(page)).toHaveCount(4);
  await expect(bulkButtons(page)).toHaveCount(0);
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 84 SKS');

  await clickAllBulkButtons(page, undoBulkButtons);
  await expect(bulkButtons(page)).toHaveCount(4);
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 0 SKS');

  await bulkButtons(page).first().click();
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 21 SKS');
  await expect(bulkButtons(page)).toHaveCount(3);
  await expect(undoBulkButtons(page)).toHaveCount(1);

  const checkbox = page.getByRole('checkbox').first();
  await checkbox.click();
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 19 SKS');
  await expect(bulkButtons(page)).toHaveCount(4);
  await expect(undoBulkButtons(page)).toHaveCount(0);

  await checkbox.click();
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 21 SKS');
  await expect(undoBulkButtons(page)).toHaveCount(1);
});

test('E. Mengganti semester membuang riwayat yang tidak valid dan menjelaskannya', async ({ page }) => {
  await startOnboarding(page);
  await fillStepOne(page, { semester: 5, ip: '3.67' });
  await openStepTwo(page);
  await clickAllBulkButtons(page, bulkButtons);
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 84 SKS');

  await page.getByRole('button', { name: 'Kembali' }).click();
  await selectSemester(page, 5);
  await expect(page.getByRole('status')).toHaveCount(0);

  await selectSemester(page, 3);
  await expect(page.getByRole('status')).toContainText(
    'dikeluarkan dari riwayat karena semester aktifmu sekarang Semester 3',
  );
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 42 SKS');
  await expect(page.getByRole('heading', { name: 'Semester 1' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Semester 2' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Semester 3' })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: /Manajemen Proyek Sistem Informasi/ })).toHaveCount(0);
  await expect(undoBulkButtons(page)).toHaveCount(2);
  await expect(bulkButtons(page)).toHaveCount(0);

  await page.getByRole('button', { name: 'Kembali' }).click();
  await selectSemester(page, 5);
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 42 SKS');

  await page.getByRole('button', { name: 'Kembali' }).click();
  await selectSemester(page, 2);
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await expect(page.getByText('Total SKS selesai:')).toHaveText('Total SKS selesai: 21 SKS');
});

test('F. Alur tetap dapat dipakai di layar kecil', async ({ page }) => {
  test.skip(!isMobile(page), 'Hanya dijalankan pada proyek viewport mobile');

  await startOnboarding(page);
  await expectNoHorizontalOverflow(page);
  const stepper = page.getByRole('list', { name: 'Progres onboarding' });
  const currentStep = stepper.locator('[aria-current="step"]');
  await expect(currentStep).toHaveCount(1);
  await expect(currentStep).toContainText('Semester dan nilai');
  for (const title of ['Riwayat mata kuliah', 'Peminatan dan karier', 'Aktivitas dan Magang']) {
    await expect(stepper.getByText(title, { exact: true })).toBeHidden();
  }

  const next = page.getByRole('button', { name: 'Lanjut' });
  await expect(next).toBeVisible();
  expect((await next.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

  await page.getByRole('combobox', { name: 'Semester aktif saat ini' }).click();
  await page.getByRole('option', { name: 'Semester 1' }).click();
  await page.getByRole('spinbutton', { name: 'Indeks Prestasi' }).fill('3.00');
  await expectNoHorizontalOverflow(page);
  await next.click();

  await expect(page.getByText('Kamu belum memiliki riwayat')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Langkah 2 dari 4: Riwayat mata kuliah/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await next.click();
  await expect(page.getByRole('heading', { name: /Langkah 3 dari 4/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await next.click();
  await expect(page.getByRole('heading', { name: /Langkah 4 dari 4/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'Simpan profil' }).click();
  await expect(page.getByRole('heading', { name: /Halo, Mahasiswa/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('G. Profil demo dan halaman terkait tetap utuh', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Rencanakan kuliah, pahami konsekuensinya.' })).toBeVisible();
  await expect(
    page.locator('header').getByRole('button', { name: 'Isi Profil Saya' }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'Coba Profil Kang Haerin' }).click();
  await expect(page.getByRole('heading', { name: /Halo, Kang Haerin/ })).toBeVisible();
  await expect(page.getByText('IP 3,67')).toBeVisible();
  await expect(page.getByText(/84 dari 144 SKS/)).toBeVisible();

  await page.goto('app/internship');
  await expect(page.getByText(/sudah menyelesaikan 84 SKS dari 120 SKS/)).toBeVisible();
  await expect(page.getByText(/seluruh nilai yang sudah ditempuh berada di atas C/)).toBeVisible();

  await page.goto('app/advisor-brief');
  await expect(page.getByRole('heading', { name: /Advisor Brief/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const profile = await readProfile(page);
  expect(profile.currentSemester).toBe(5);
  expect(profile.completedCredits).toBe(84);
});
