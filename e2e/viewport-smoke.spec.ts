import { expect, test } from '@playwright/test';

const DEMO_CTA = 'Coba Profil Kang Haerin';

const VIEWPORTS = [
  { width: 320, height: 700 },
  { width: 360, height: 800 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test(`Shell dan halaman utama muat pada ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const noOverflow = () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Rencanakan kuliah, pahami konsekuensinya.' }),
    ).toBeVisible();
    expect(await noOverflow()).toBe(true);

    await page.getByRole('button', { name: DEMO_CTA }).click();
    await expect(page.getByRole('heading', { name: /Halo, Kang Haerin/ })).toBeVisible();

    // Nama panjang pada top bar boleh dipotong, tidak boleh mendorong layout
    const isNarrow = viewport.width < 768;
    const profileButton = page.getByRole('button', { name: 'Kang Haerin' });
    if (isNarrow) {
      await expect(profileButton).toBeVisible();
      const profileBox = await profileButton.boundingBox();
      expect(profileBox?.width ?? 0).toBeLessThanOrEqual(160);
      expect(profileBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    } else {
      await expect(profileButton).toBeHidden();
    }
    expect(await noOverflow()).toBe(true);

    const bottomNav = page.getByRole('navigation', { name: 'Navigasi bawah' });
    if (isNarrow) {
      await expect(bottomNav.getByRole('link')).toHaveCount(5);
      await expect(bottomNav.getByRole('link', { name: 'Profil', exact: true })).toHaveCount(0);
    } else {
      await expect(bottomNav).toBeHidden();
      await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible();
    }

    await page.getByRole('link', { name: 'Simulasi', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Scenario Simulator' })).toBeVisible();
    expect(await noOverflow()).toBe(true);

    await page.getByRole('button', { name: 'Pilih untuk dibandingkan' }).first().click();
    await page.getByRole('button', { name: 'Pilih untuk dibandingkan' }).click();
    await page.getByRole('button', { name: /Bandingkan \(2\)/ }).click();
    await expect(page.getByRole('heading', { name: 'Bandingkan Skenario' })).toBeVisible();

    // Tabel membungkus sendiri, halaman tidak ikut melebar
    const hint = page.getByText('Geser tabel ke samping untuk melihat kedua rencana.');
    await expect(hint).toBeVisible({ visible: viewport.width < 640 });
    expect(await noOverflow()).toBe(true);

    await page.getByRole('link', { name: 'Ringkasan PA', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Advisor Brief' })).toBeVisible();
    expect(await noOverflow()).toBe(true);
  });
}
