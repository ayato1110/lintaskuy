# Product Requirements Document — LINTAS

## 1. Ringkasan

LINTAS adalah portal perencanaan perkuliahan berbasis skenario untuk mahasiswa Sistem Informasi Universitas Jambi. Produk membantu mahasiswa melihat hubungan antara kurikulum, peminatan, beban semester, posisi magang, dan arah karier sebelum keputusan akademik dibuat.

LINTAS tidak menggantikan SIAKAD atau dosen pembimbing. SIAKAD mencatat keputusan resmi, sedangkan LINTAS membantu mahasiswa memahami konsekuensi dan menyiapkan konsultasi.

## 2. Masalah

Informasi akademik tersedia, tetapi terpencar dalam tabel kurikulum dan penjelasan informal. Mahasiswa perlu menghubungkan sendiri mata kuliah, jumlah SKS, peminatan, syarat Magang, aktivitas pribadi, dan arah karier. Akibatnya:

- mahasiswa awal tidak memahami alasan mempelajari mata kuliah fondasi;
- keputusan peminatan terasa mendadak pada Semester 5;
- peminatan dapat dipilih karena tren atau teman;
- perencanaan hanya berfokus pada jumlah SKS;
- persiapan Magang dan portofolio terlambat;
- konsultasi dengan dosen PA dimulai tanpa alternatif yang jelas.

## 3. Tujuan

1. Mengubah kurikulum menjadi perjalanan yang mudah dibaca.
2. Membantu mahasiswa menjelajahi peminatan dan arah karier sejak Semester 1.
3. Menjaga penguncian peminatan tetap realistis, yaitu mulai Semester 5.
4. Membantu mahasiswa mencoba beberapa rencana semester.
5. Menjelaskan batas SKS, prasyarat, konsistensi peminatan, dan kesiapan Magang.
6. Menghasilkan Advisor Brief sebagai bahan konsultasi.

## 4. Non-goals

LINTAS bukan:

- pengganti keputusan akademik resmi;
- portal lowongan kerja;
- tes kepribadian;
- alat prediksi kelulusan;
- sistem rekomendasi berbasis probabilitas;
- platform dosen atau SIAKAD;
- aplikasi multi-program studi.

## 5. Persona utama

**Kang Haerin** adalah persona demonstrasi, bukan mahasiswa nyata.

- Semester: 5.
- Progres: 84 dari 144 SKS.
- Indeks Prestasi: 3,67.
- Batas rencana: 24 SKS.
- Aktivitas: organisasi 6 jam per minggu.
- Minat: UI/UX dan produk digital.
- Jalur yang dibandingkan: Enterprise & Aplikasi Digital dan Data & Inteligensi Bisnis.
- Pilihan akhir: Enterprise & Aplikasi Digital.
- Target Magang: UI/UX Design Intern atau Product Management Intern.

Job to be done:

> Ketika memilih peminatan dan menyusun semester, Kang Haerin ingin melihat dampaknya terhadap beban, Magang, dan arah karier agar dapat memilih rencana yang masuk akal dan membawanya ke dosen PA.

## 6. Segmentasi pengguna

### Semester 1–2 — mengenali arah

- Melihat tiga peminatan.
- Menjelajahi peran pekerjaan.
- Memahami mata kuliah fondasi.
- Menyimpan arah untuk dieksplorasi.
- Tidak dapat mengunci peminatan.

### Semester 3–4 — mempersiapkan

- Menilai mata kuliah yang telah ditempuh.
- Membandingkan dua jalur.
- Melihat kompetensi dan portofolio awal.
- Menyusun rencana menuju Semester 5.

### Semester 5–6 — memilih dan menguatkan

- Mengunci satu jalur penuh.
- Menyusun skenario.
- Membandingkan beban.
- Menyiapkan portofolio dan Magang.

### Semester 7–8 — transisi

- Memeriksa kesiapan Magang.
- Menyiapkan Seminar Usulan dan tugas akhir.
- Membawa Advisor Brief ke konsultasi.

## 7. Prinsip produk

1. **Jelaskan, jangan memutuskan.**
2. **Tunjukkan konsekuensi sebelum komitmen.**
3. **Beban lebih luas daripada SKS.**
4. **Arah karier memberi konteks, bukan janji.**
5. **Setiap peringatan harus memiliki alasan dan tindakan berikutnya.**
6. **Data resmi dan asumsi demo harus dapat dibedakan.**

## 8. Fitur dan requirement

### 8.1 Landing

- Menjelaskan masalah dan manfaat dalam satu layar.
- CTA utama `Gunakan Profil Demo`.
- CTA sekunder `Isi Profil Sendiri`.
- Memperlihatkan tiga manfaat: pahami posisi, bandingkan pilihan, siapkan konsultasi.

### 8.2 Onboarding

Empat langkah:

1. Semester dan Indeks Prestasi.
2. Riwayat mata kuliah.
3. Minat peminatan/karier.
4. Aktivitas mingguan dan target.

Requirement:

- pengguna dapat mundur tanpa kehilangan input;
- progress indicator terlihat;
- data wajib divalidasi;
- pilihan profil demo memuat Kang Haerin satu klik.

### 8.3 Dashboard

Menampilkan:

- progres 84/144 SKS untuk demo;
- semester aktif;
- batas SKS;
- jalur yang sedang dibandingkan;
- target karier dan Magang;
- skenario terakhir;
- next best action;
- peringatan yang dapat ditindaklanjuti.

### 8.4 Academic Journey Map

- Semester 1–8.
- Status: selesai, sedang ditempuh, tersedia, direncanakan, terkunci, perlu perhatian.
- Filter semester, wajib/minat, jalur, dan status.
- Detail mata kuliah berisi kode, nama, SKS, semester, jenis, prasyarat, sumber aturan, dan alasan status.
- Mobile berubah menjadi daftar bertingkat.

### 8.5 Peminatan Explorer

- Tiga kartu jalur.
- Pengguna dapat membandingkan maksimal dua jalur.
- Informasi: fokus, empat mata kuliah, karakter belajar, kompetensi, peran, Magang, dan portofolio.
- Penguncian hanya tersedia mulai Semester 5.
- Pengguna harus mengonfirmasi sebelum mengganti jalur terkunci.

### 8.6 Kompas Karier

Kompas Karier adalah tab dalam Peminatan Explorer.

Setiap peran memuat:

- nama peran;
- deskripsi singkat;
- kompetensi;
- peminatan yang relevan;
- mata kuliah pendukung;
- posisi magang;
- ide portofolio;
- alasan keterkaitan;
- disclaimer bahwa hasil bukan jaminan pekerjaan.

Tidak ada skor kecocokan palsu.

### 8.7 Scenario Simulator

Input:

- semester target;
- Indeks Prestasi;
- mata kuliah;
- jalur peminatan;
- organisasi/kerja/aktivitas lain;
- target Magang atau karier.

Output:

- total SKS;
- batas SKS yang berlaku;
- kategori beban;
- alasan kategori;
- pelanggaran prasyarat;
- konflik jalur;
- kesiapan Magang;
- alternatif tindakan.

Skenario dapat dibuat, disimpan, diubah, diduplikasi, dan dihapus.

### 8.8 Compare Scenarios

- Membandingkan tepat dua skenario.
- Memperlihatkan perbedaan SKS, mata kuliah, jalur, aktivitas, beban, risiko, dan target.
- Menyorot perbedaan tanpa mengumumkan pemenang mutlak.
- Pengguna memilih satu sebagai rencana utama.

### 8.9 Perencanaan Magang

- Memilih posisi Magang yang diminati.
- Memeriksa minimal 120 SKS.
- Memeriksa bahwa nilai mata kuliah yang ditempuh berada di atas C.
- Menampilkan kompetensi dan portofolio yang dapat disiapkan.
- Tidak menampilkan lowongan langsung.

### 8.10 Advisor Brief

Memuat:

- profil;
- progres;
- peminatan;
- arah karier;
- target Magang;
- skenario utama;
- risiko dan asumsi;
- pertanyaan untuk dosen PA;
- waktu pembuatan.

Harus memiliki print stylesheet dan CTA cetak.

## 9. User stories utama

- Sebagai mahasiswa Semester 1, saya ingin melihat peminatan tanpa menguncinya agar dapat menyiapkan diri.
- Sebagai mahasiswa Semester 5, saya ingin membandingkan dua jalur agar pilihan tidak hanya mengikuti teman.
- Sebagai mahasiswa aktif organisasi, saya ingin beban nonakademik diperhitungkan agar rencana realistis.
- Sebagai calon peserta Magang, saya ingin mengetahui kekurangan persiapan agar dapat bertindak lebih awal.
- Sebagai mahasiswa yang akan berkonsultasi, saya ingin ringkasan satu halaman agar pembicaraan lebih terarah.

## 10. Success metrics untuk prototype

- 5 dari 5 tugas inti dapat diselesaikan tanpa bantuan fasilitator.
- Pengguna mampu menjelaskan alasan memilih jalur.
- Pengguna menemukan peringatan batas SKS sebelum menyimpan.
- Pengguna dapat membedakan data resmi dan asumsi demo.
- Tidak ada horizontal overflow pada 390 px.
- Semua CTA utama memiliki hasil yang terlihat.

## 11. Prioritas

### P0

Landing, onboarding, dashboard, Journey Map, Peminatan + Kompas Karier, simulator, compare, Magang, Advisor Brief, localStorage, responsive, accessibility.

### P1

Tur interaktif, animasi lintasan ringan, pengaturan profil, ekspor JSON.

### Tidak dibuat

Backend, login, API lowongan, AI chatbot, dashboard dosen, integrasi SIAKAD, forum, machine learning.

## 12. Definition of done

- Semua route P0 terbuka dan dapat digunakan.
- Data akademik berasal dari folder `data/`.
- Profil Kang Haerin bekerja satu klik.
- Skenario bertahan setelah refresh.
- Penguncian jalur dan aturan SKS bekerja.
- Advisor Brief dapat dicetak.
- Lint, typecheck, test, dan build lulus.
- Deployment publik dapat dibuka tanpa login.
