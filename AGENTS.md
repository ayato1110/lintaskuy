# AGENTS.md — Instruksi Wajib AI Coding Agent

## 1. Cara bekerja

Baca semua dokumen dan data sebelum menulis kode. Jangan langsung membuat landing page setelah hanya membaca README. Urutan sumber kebenaran:

1. `docs/01-PRD.md` untuk tujuan, scope, persona, dan acceptance criteria produk.
2. `docs/02-APPFLOW.md` untuk navigasi dan alur.
3. `docs/03-UI-UX-DESIGN-BRIEF.md` serta `docs/04-DESIGN-SYSTEM.md` untuk keputusan visual dan interaksi.
4. `docs/05-TRD.md` untuk arsitektur teknis.
5. `docs/06-DATA-AND-RULES.md` dan folder `data/` untuk angka, aturan, dan data akademik.
6. `docs/10-ACCEPTANCE-CHECKLIST.md` untuk validasi akhir.

Jika dokumen bertentangan, hentikan bagian yang konflik dan jelaskan konflik. Jangan mengarang aturan akademik.

## 2. Keputusan yang sudah dikunci

- Nama produk: **LINTAS**.
- Tagline: **Rencanakan kuliah, pahami konsekuensinya.**
- Program studi demo: Sistem Informasi Universitas Jambi.
- Persona demo: **Kang Haerin**, Semester 5, IP 3,67, 84/144 SKS, organisasi 6 jam/minggu.
- Pilihan akhirnya: Enterprise & Aplikasi Digital.
- Jalur pembanding: Data & Inteligensi Bisnis.
- Kompas Karier adalah tab di Peminatan Explorer, bukan produk terpisah.
- Pengguna Semester 1–4 boleh menjelajahi peminatan dan karier, tetapi baru dapat mengunci peminatan mulai Semester 5.
- Front-end only dengan JSON lokal dan `localStorage`.

## 3. Fitur P0

1. Landing dan demo entry.
2. Onboarding/profil.
3. Dashboard.
4. Academic Journey Map Semester 1–8.
5. Peminatan Explorer.
6. Tab Kompas Karier.
7. Scenario Simulator.
8. Compare Scenarios.
9. Perencanaan Magang.
10. Advisor Brief print-friendly.

## 4. Larangan

- Jangan menambah backend, login, chatbot, forum, dashboard dosen, lowongan kerja langsung, AI recommendation palsu, atau integrasi SIAKAD.
- Jangan memberi persentase kecocokan karier tanpa dasar.
- Jangan menyebut prasyarat asumsi sebagai kebijakan resmi.
- Jangan menampilkan KKN.
- Jangan menyimpan rahasia atau credential di repository.
- Jangan meniru identitas visual IBM, GOV.UK, LinkedIn, Khan Academy, atau Notion secara identik.
- Jangan membuat tombol utama yang tidak bekerja.
- Jangan mengganti Kang Haerin dengan persona lain.

## 5. Aturan implementasi

- Gunakan TypeScript strict.
- Semua data akademik berasal dari folder `data/` dan diimpor melalui satu data-access layer.
- Semua perhitungan berada di fungsi murni pada folder `rules/` atau `domain/`.
- Komponen UI tidak boleh menghitung aturan akademik secara langsung.
- Pisahkan domain state dari presentation state.
- `localStorage` memakai schema version dan migrasi sederhana.
- Semua form mempunyai label tetap, error spesifik, dan fokus keyboard terlihat.
- Semua status memiliki teks/ikon; warna hanya penguat.
- Mobile 390 px tidak boleh horizontal overflow.
- Hormati `prefers-reduced-motion`.
- Advisor Brief memiliki print CSS.

## 6. Proses kerja yang diharapkan

1. Audit dokumen dan buat ringkasan constraint.
2. Buat route skeleton serta application shell.
3. Implementasikan data types, data loader, dan rule engine.
4. Bangun design tokens dan primitive components.
5. Bangun halaman sesuai urutan pada implementation plan.
6. Isi seluruh empty, loading, success, warning, dan error state.
7. Tambahkan unit test rule engine.
8. Tambahkan end-to-end test alur Kang Haerin.
9. Jalankan lint, typecheck, test, dan production build.
10. Lakukan QA visual desktop dan mobile.

## 7. Format laporan agent

Setiap selesai satu fase, laporkan:

- File yang dibuat atau diubah.
- Acceptance criteria yang sudah terpenuhi.
- Test yang dijalankan.
- Risiko atau asumsi yang tersisa.
- Langkah berikutnya.

Jangan mengklaim selesai jika build, route, atau tombol utama belum diuji.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop skill for the task:
- Core filter, always on: `antislop`
- UI / visual: `antislop-ui`
- Copy & text: `antislop-copywriting`
- People: `antislop-human`
- Mobile / responsive: `antislop-layoutmobile`
- Code comments: `antislop-code`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->
