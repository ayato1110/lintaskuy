# UI/UX Design Brief — LINTAS

## 1. Tujuan pengalaman

Pengguna harus merasa sedang memahami pilihan, bukan sedang diadili oleh sistem. Antarmuka harus menjawab tiga pertanyaan pada setiap layar:

1. Posisi saya sekarang di mana?
2. Apa pilihan yang tersedia?
3. Apa konsekuensi dan tindakan berikutnya?

## 2. Kepribadian

- tenang;
- cerdas;
- suportif;
- transparan;
- modern;
- akademik tanpa terasa birokratis.

Hindari tampilan admin generik, dashboard penuh grafik, glassmorphism, gradient berlebihan, dan bahasa promosi kosong.

## 3. Referensi yang diterjemahkan

### Carbon

Ambil struktur shell, tabel, filter, status, form, dan kepadatan informasi. Jangan meniru branding IBM.

### GOV.UK

Ambil label permanen, helper text, error summary, inline error, fokus keyboard, dan bahasa langsung. Jangan meniru identitas visual pemerintah Inggris.

### LinkedIn

Ambil pola hubungan peran–kompetensi–pengalaman. Jangan meniru profil, warna, logo, atau feed.

### Khan Academy

Ambil pola progres, status selesai/berikutnya/terkunci. Jangan meniru ilustrasi atau gamifikasi.

### Notion

Ambil pola dokumen bersih untuk Advisor Brief. Jangan membuat editor Notion palsu.

## 4. Prinsip layout

- Desktop memakai sidebar dan content canvas maksimal 1280 px.
- Halaman analisis memakai grid 12 kolom.
- Konten bacaan panjang maksimal 72 karakter per baris.
- Gunakan whitespace untuk kelompok, bukan card untuk setiap elemen.
- Satu layar memiliki satu CTA primer.
- Aksi destruktif dipisahkan dan meminta konfirmasi.

## 5. Pola halaman

### Landing

Hero ringkas, bukti manfaat, preview alur, data disclaimer, CTA demo. Jangan membuat landing terlalu panjang.

### Dashboard

Urutan: greeting dan next action; progres; peringatan; skenario aktif; arah karier; aktivitas terbaru.

### Journey Map

Desktop berupa lintasan per semester. Mobile berupa accordion/list. Mata kuliah dapat dipindai melalui status dan jenis.

### Peminatan

Tiga kartu jalur diikuti mode compare. Kompas Karier menjadi tab kedua. Jangan mencampur seluruh data dalam satu kartu.

### Simulator

Desktop: builder kiri, analysis panel kanan sticky. Mobile: builder dan hasil menjadi langkah berurutan dengan summary sticky.

### Advisor Brief

Tampil seperti dokumen. Navigasi aplikasi disembunyikan ketika print.

## 6. Responsif

Target utama:

- 1440 px desktop;
- 1024 px laptop;
- 768 px tablet;
- 390 px mobile.

Aturan mobile:

- tidak ada tabel lebar; ubah menjadi stacked comparison;
- sidebar menjadi bottom navigation atau drawer;
- touch target minimal nyaman;
- CTA utama full-width jika perlu;
- sticky summary tidak menutup konten.

## 7. Accessibility

- Target WCAG 2.2 AA sejauh realistis.
- Semua input memiliki label.
- Urutan tab mengikuti urutan visual.
- Focus ring terlihat.
- Kontras teks dan kontrol memadai.
- Status tidak hanya memakai warna.
- Icon-only button memiliki accessible name.
- Dialog mengunci fokus dan dapat ditutup Escape.
- Animasi menghormati reduced motion.
- Heading berurutan.
- Error dibaca screen reader melalui `aria-describedby`/live region yang tepat.

## 8. Content design

- Gunakan kalimat pendek.
- Sebut masalah dan tindakan, bukan hanya `Terjadi kesalahan`.
- Jangan memakai `AI merekomendasikan`.
- Gunakan `LINTAS menemukan` atau `Skenario ini memiliki`.
- Tulis `di atas C` persis untuk aturan Magang.
- Label `Asumsi demo` selalu terlihat, bukan disembunyikan pada tooltip saja.

## 9. Motion

- Durasi pendek 150–250 ms.
- Gunakan untuk perubahan state, bukan dekorasi.
- Tidak ada parallax.
- Jangan menggerakkan elemen ketika pengguna sedang membaca peringatan.

## 10. Bukti kualitas UI/UX untuk juri

- Onboarding selesai cepat.
- Alasan status dapat dibuka.
- Perbandingan tidak membutuhkan scroll horizontal.
- Simulator merespons input secara langsung.
- Error memberi jalan keluar.
- Arah karier tidak mengaburkan tema akademik.
- Alur Kang Haerin selesai sampai Advisor Brief.
