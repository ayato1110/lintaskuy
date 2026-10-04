import { expect, test } from '@playwright/test';

const DEMO_CTA = 'Coba Profil Kang Haerin';

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

  const uncheckedCourse = page
    .locator('[aria-labelledby="skenario-matkul-heading"]')
    .getByRole('checkbox', { checked: false, disabled: false })
    .first();
  await uncheckedCourse.check();
  await expect(page.getByText('Catatan untuk rencana ini')).toBeVisible();
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByRole('heading', { name: 'Scenario Simulator' })).toBeVisible();
});

test('Bandingkan dua skenario demo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: DEMO_CTA }).click();
  await page.getByRole('link', { name: 'Simulasi', exact: true }).click();

  const addToCompare = page.getByRole('button', { name: 'Pilih untuk dibandingkan' });
  await addToCompare.first().click();
  await page.getByRole('button', { name: 'Pilih untuk dibandingkan' }).click();
  await page.getByRole('button', { name: /Bandingkan \(2\)/ }).click();

  await expect(page.getByRole('heading', { name: 'Compare Scenarios' })).toBeVisible();
  await expect(page.getByText('Matriks mata kuliah')).toBeVisible();
  await expect(page.getByText('Catatan untuk tiap rencana')).toBeVisible();
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

test('Mobile 390px tanpa overflow horizontal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: DEMO_CTA }).click();
  const noOverflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  await expect(page.getByRole('heading', { name: /Halo, Kang Haerin/ })).toBeVisible();
  expect(await noOverflow()).toBe(true);

  await page.getByRole('link', { name: 'Peta Studi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Peta Studi' })).toBeVisible();
  expect(await noOverflow()).toBe(true);

  await page.getByRole('link', { name: 'Simulasi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Scenario Simulator' })).toBeVisible();
  expect(await noOverflow()).toBe(true);

  await page.getByRole('link', { name: 'Ringkasan PA', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Advisor Brief' })).toBeVisible();
  expect(await noOverflow()).toBe(true);
});
