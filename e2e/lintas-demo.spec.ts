import { expect, test, type Page } from '@playwright/test';

const DEMO_CTA = 'Coba Profil Kang Haerin';

function isNarrowViewport(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) < 768;
}

async function openProfile(page: Page): Promise<void> {
  if (isNarrowViewport(page)) {
    await page.getByRole('button', { name: 'Kang Haerin' }).click();
  } else {
    await page.getByRole('link', { name: /Profil/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'Profil dan data' })).toBeVisible();
}

test('Kang Haerin - alur perjalanan penuh', async ({ page }) => {
  // 1. Landing
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Rencanakan kuliah, pahami konsekuensinya.' }),
  ).toBeVisible();

  // 2. Masuk lewat profil demo
  await page.getByRole('button', { name: DEMO_CTA }).click();
  await expect(page.getByRole('heading', { name: /Halo, Kang Haerin/ })).toBeVisible();
  await expect(page.getByText('IP 3,67')).toBeVisible();

  // 3. Peta Studi
  await page.getByRole('link', { name: 'Peta Studi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Peta Studi' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Semester 5' })).toBeVisible();
  await expect(page.getByText('Manajemen Proyek Sistem Informasi')).toBeVisible();

  // 4. Peminatan Explorer dan Kompas Karier
  await page.getByRole('link', { name: 'Peminatan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Peminatan Explorer' })).toBeVisible();
  await page.getByRole('tab', { name: /Kompas Karier/ }).click();
  await expect(page.getByText('Sumber informasi karier')).toBeVisible();
  await expect(page.getByText('Keterampilan yang relevan').first()).toBeVisible();
  await page.getByRole('tab', { name: /Peminatan/ }).click();

  // 5. Scenario Simulator: dua rencana demo hadir, buka salah satu
  await page.getByRole('link', { name: 'Simulasi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Scenario Simulator' })).toBeVisible();
  await expect(page.getByText('Enterprise (Seimbang)')).toBeVisible();
  await expect(page.getByText('Data (Pembanding)')).toBeVisible();

  await page.getByRole('link', { name: 'Buka dan ubah', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Ubah skenario' })).toBeVisible();

  // Mata kuliah peminatan aktif hanya boleh muncul sekali
  await expect(
    page.getByRole('checkbox', { name: /Pemrograman Aplikasi Bergerak/ }),
  ).toHaveCount(1);
  await expect(
    page.getByRole('checkbox', { name: /Desain UI\/UX/ }),
  ).toHaveCount(1);

  const uncheckedCourse = page
    .locator('[aria-labelledby="skenario-matkul-heading"]')
    .getByRole('checkbox', { checked: false, disabled: false })
    .first();
  await uncheckedCourse.check();
  await expect(page.getByText('Catatan untuk rencana ini')).toBeVisible();
  await expect(page.getByText(/Total rencana:.*batas 24 SKS/)).toBeVisible();
  await expect(
    page.getByText(/Batas mengikuti Indeks Prestasi 3,67 yang tersimpan di profil/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByRole('heading', { name: 'Scenario Simulator' })).toBeVisible();
});

test('Bandingkan dua skenario demo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: DEMO_CTA }).click();
  await page.getByRole('link', { name: 'Simulasi', exact: true }).click();

  const addToCompare = page.getByRole('button', { name: 'Pilih untuk dibandingkan' });
  await expect(page.getByText('0 dari 2 dipilih')).toBeVisible();
  await addToCompare.first().click();
  await expect(page.getByText('1 dari 2 dipilih')).toBeVisible();
  await page.getByRole('button', { name: 'Pilih untuk dibandingkan' }).click();
  await expect(page.getByText('2 dari 2 dipilih')).toBeVisible();
  await page.getByRole('button', { name: /Bandingkan \(2\)/ }).click();

  await expect(page.getByRole('heading', { name: 'Bandingkan Skenario' })).toBeVisible();
  await expect(page.getByText('Cara membaca hasil')).toBeVisible();
  await expect(page.getByText('Matriks mata kuliah')).toBeVisible();
  await expect(page.getByText('Catatan setiap rencana')).toBeVisible();

  const isNarrow = (page.viewportSize()?.width ?? 1280) < 640;
  await expect(
    page.getByText('Geser tabel ke samping untuk melihat kedua rencana.'),
  ).toBeVisible({ visible: isNarrow });
  await expect(
    page.getByText('Geser tabel ke samping untuk melihat mata kuliah tiap rencana.'),
  ).toBeVisible({ visible: isNarrow });
});

test('Tab Peminatan tanpa ikon dan dialog kunci bisa dipakai', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: DEMO_CTA }).click();
  await page.getByRole('link', { name: 'Peminatan', exact: true }).click();

  const peminatanTab = page.getByRole('tab', { name: 'Peminatan', exact: true });
  await expect(peminatanTab).toBeVisible();
  await expect(peminatanTab.locator('svg')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Kompas Karier' })).toBeVisible();

  await page.getByRole('button', { name: 'Kunci sebagai pilihan' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /^Kunci / })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Kunci jalur' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Batal' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('Tombol skenario ketiga dinonaktifkan ketika dua sudah dipilih', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: DEMO_CTA }).click();
  await page.getByRole('link', { name: 'Simulasi', exact: true }).click();

  await page.getByRole('button', { name: 'Duplikasi', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Pilih untuk dibandingkan' })).toHaveCount(3);

  const compareButtons = page.getByRole('button', { name: 'Pilih untuk dibandingkan' });
  await compareButtons.nth(0).click();
  await compareButtons.nth(1).click();
  await expect(page.getByText('2 dari 2 dipilih')).toBeVisible();

  const third = page.getByRole('button', { name: 'Pilih untuk dibandingkan' });
  await expect(third).toBeDisabled();
  await expect(third).toHaveAttribute('aria-pressed', 'false');
});

test('Batas SKS menyesuaikan Indeks Prestasi yang diubah', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: DEMO_CTA }).click();

  await openProfile(page);
  await page.locator('#settings-ip').fill('3.00');
  await page.getByRole('button', { name: 'Simpan perubahan semester atau IP' }).click();

  await page.getByRole('link', { name: 'Simulasi', exact: true }).click();
  await page.getByRole('link', { name: 'Buka dan ubah', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Ubah skenario' })).toBeVisible();
  await expect(page.getByText(/Total rencana:.*batas 21 SKS/)).toBeVisible();
  await expect(
    page.getByText(/Batas mengikuti Indeks Prestasi 3,00 yang tersimpan di profil/),
  ).toBeVisible();
});

test('Ringkasan PA, tulis pertanyaan, dan cetak via print', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: DEMO_CTA }).click();
  await page.getByRole('link', { name: 'Ringkasan PA', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Advisor Brief' })).toBeVisible();
  await expect(page.getByText('Identitas mahasiswa')).toBeVisible();
  await expect(page.getByText('Rencana utama: Enterprise (Seimbang)')).toBeVisible();
  await expect(page.getByText('Kesiapan Magang')).toBeVisible();

  await page.getByRole('textbox', { name: /Tulis pertanyaan/ }).fill('Apakah rencana Semester 5 realistis?\nKapan Magang ideal?');
  await page.getByRole('button', { name: 'Simpan pertanyaan' }).click();
  await expect(page.getByText('Pertanyaan disimpan.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Cetak/ })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Kapan Magang ideal?' })).toBeVisible();

  await page.getByRole('button', { name: /Cetak/ }).click();
  await page.waitForTimeout(300);
});

test('Alur utama mobile dan navigasi tanpa overflow horizontal', async ({ page }) => {
  const isNarrow = isNarrowViewport(page);
  const noOverflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  await page.goto('/');
  await page.getByRole('button', { name: DEMO_CTA }).click();
  await expect(page.getByRole('heading', { name: /Halo, Kang Haerin/ })).toBeVisible();
  expect(await noOverflow()).toBe(true);

  // Navigasi bawah memuat lima tujuan dan tidak memuat Profil
  const bottomNav = page.getByRole('navigation', { name: 'Navigasi bawah' });
  if (isNarrow) {
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('link')).toHaveCount(5);
    await expect(bottomNav.getByRole('link', { name: 'Profil', exact: true })).toHaveCount(0);
    for (const label of ['Beranda', 'Peta Studi', 'Peminatan', 'Simulasi', 'Ringkasan PA']) {
      const box = await bottomNav.getByRole('link', { name: label, exact: true }).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    // Tombol profil dan logout di top bar tetap nyaman disentuh
    const profileButton = page.getByRole('button', { name: 'Kang Haerin' });
    await expect(profileButton).toBeVisible();
    const profileBox = await profileButton.boundingBox();
    expect(profileBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    const logoutBox = await page.getByRole('button', { name: 'Keluar dari sesi ini' }).boundingBox();
    expect(logoutBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(logoutBox?.width ?? 0).toBeGreaterThanOrEqual(44);
  } else {
    await expect(bottomNav).toBeHidden();
  }

  // Profil tetap terbuka dari top bar di mobile dan dari sidebar di desktop
  await openProfile(page);
  expect(await noOverflow()).toBe(true);
  await page.goBack();

  await page.getByRole('link', { name: 'Peta Studi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Peta Studi' })).toBeVisible();
  expect(await noOverflow()).toBe(true);

  await page.getByRole('link', { name: 'Peminatan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Peminatan Explorer' })).toBeVisible();
  await page.getByRole('tab', { name: /Kompas Karier/ }).click();
  await expect(page.getByText('Sumber informasi karier')).toBeVisible();
  await page.getByRole('tab', { name: /Peminatan/ }).click();
  expect(await noOverflow()).toBe(true);

  await page.getByRole('link', { name: 'Simulasi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Scenario Simulator' })).toBeVisible();
  expect(await noOverflow()).toBe(true);

  await page.getByRole('link', { name: 'Buka dan ubah', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Ubah skenario' })).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: /Pemrograman Aplikasi Bergerak/ }),
  ).toHaveCount(1);
  await page
    .locator('[aria-labelledby="skenario-matkul-heading"]')
    .getByRole('checkbox', { checked: false, disabled: false })
    .first()
    .check();
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByRole('heading', { name: 'Scenario Simulator' })).toBeVisible();

  await page.getByRole('button', { name: 'Pilih untuk dibandingkan' }).first().click();
  await page.getByRole('button', { name: 'Pilih untuk dibandingkan' }).click();
  await page.getByRole('button', { name: /Bandingkan \(2\)/ }).click();
  await expect(page.getByRole('heading', { name: 'Bandingkan Skenario' })).toBeVisible();
  expect(await noOverflow()).toBe(true);

  await page.getByRole('link', { name: 'Ringkasan PA', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Advisor Brief' })).toBeVisible();
  expect(await noOverflow()).toBe(true);
});
