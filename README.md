# LINTAS — Vibecoding Project Kit

**Tagline:** Rencanakan kuliah, pahami konsekuensinya.

Paket ini adalah sumber kerja utama untuk membangun website LINTAS secara front-end only. Letakkan seluruh folder ini di root repository, lalu minta AI coding agent membaca `AGENTS.md` sebelum menyentuh kode.

## Tujuan produk

LINTAS membantu mahasiswa Sistem Informasi Universitas Jambi memahami perjalanan menuju 144 SKS, menjelajahi tiga peminatan, melihat hubungan peminatan dengan arah karier dan posisi magang, menguji beberapa rencana semester, lalu membawa ringkasan yang jelas ketika berkonsultasi dengan dosen pembimbing akademik.

## Urutan membaca

1. `AGENTS.md`
2. `docs/01-PRD.md`
3. `docs/02-APPFLOW.md`
4. `docs/03-UI-UX-DESIGN-BRIEF.md`
5. `docs/04-DESIGN-SYSTEM.md`
6. `docs/05-TRD.md`
7. `docs/06-DATA-AND-RULES.md`
8. `docs/07-USABILITY-TEST-AND-DEMO.md`
9. `docs/08-CONTENT-AND-MICROCOPY.md`
10. `docs/09-IMPLEMENTATION-PLAN.md`
11. `docs/10-ACCEPTANCE-CHECKLIST.md`

## Struktur paket

```text
LINTAS-vibecoding-kit/
├── AGENTS.md
├── README.md
├── docs/
├── data/
├── prompts/
├── references/
└── starter-config/
```

## Batas produk

- Tidak memakai backend produksi.
- Tidak memakai login.
- Tidak terhubung ke SIAKAD.
- State persisten disimpan melalui `localStorage`.
- Data kurikulum Semester 1–7 berasal dari data peserta.
- Semester 8 dan prasyarat tertentu wajib dilabeli **asumsi demo**.
- Informasi karier adalah bahan eksplorasi, bukan jaminan pekerjaan.

## Definition of done singkat

Website dapat dibuka publik tanpa akun, profil demo Kang Haerin dapat dimuat satu klik, semua halaman P0 berfungsi, skenario tetap tersimpan setelah refresh, tampilan 390–1440 px matang, Advisor Brief dapat dicetak, dan tidak ada tombol utama palsu.

## Menjalankan di mesin lokal

```bash
npm install
npm run dev        # Vite dev server, default http://localhost:5173
npm run build      # typecheck + production build ke dist/
npm run preview    # pratinjau hasil build di http://localhost:4173
```

## Skrip verifikasi

```bash
npm run lint        # ESLint
npm run typecheck   # tsc untuk app, config, dan e2e
npm test            # vitest: tes data layer dan rule engine
npm run e2e         # Playwright: perjalanan Kang Haerin + cek 390px (desktop & mobile)
```

Sebelum `npm run e2e` pertama kali: `npx playwright install chromium`.

## Deployment

Proyek ini front-end only. Build statis berada di `dist/` dan dapat dihosting di host statis mana pun (Netlify, Vercel, GitHub Pages, dll). Karena memakai React Router, setiap host statis wajib mengarahkan semua path ke `index.html` agar refresh langsung di subpath (mis. `/app/scenarios`) tidak menghasilkan 404:

- **Netlify**: buat `netlify.toml` dengan `redirects = [{ from = "/*", to = "/index.html", status = 200 }]`.
- **Vercel**: buat `vercel.json` dengan `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
- **GitHub Pages**: tambahkan `404.html` berisi salinan `index.html`, dan set `base` di `vite.config.ts` sesuai nama repo.

Data akademik dimuat dari folder `data/` saat build. State pengguna (profil, skenario, pertanyaan PA) disimpan di `localStorage` (key `lintas.app-state.v1`) dan tidak pernah dikirim ke server.
