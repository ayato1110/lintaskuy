# Data and Rules Specification

## 1. Sumber data

- `data/curriculum.json`: mata kuliah Semester 1–7 dari data peserta, ditambah Semester 8 berlabel asumsi demo.
- `data/specializations.json`: tiga jalur resmi dari peserta.
- `data/career-paths.json`: pemetaan produk untuk eksplorasi.
- `data/academic-rules.json`: aturan terkonfirmasi dan asumsi.
- `data/demo-profile.json`: persona Kang Haerin.
- `data/sample-scenarios.json`: seed demo.

## 2. Aturan terkonfirmasi

- Total kelulusan 144 SKS.
- Tidak ada KKN.
- Satu jalur peminatan penuh.
- IP >3,00 maksimal 24 SKS.
- IP ≤3,00 maksimal 21 SKS.
- Magang minimal 120 SKS.
- Seluruh nilai mata kuliah yang ditempuh harus di atas C untuk Magang.

## 3. Asumsi demo

- Semester 8: Seminar Hasil 1 SKS dan Skripsi/Tugas Akhir 6 SKS.
- Hubungan prasyarat selain Magang.
- Tag project-heavy.
- Syarat umum Seminar Usulan.
- Istilah input `Indeks Prestasi` sampai acuan IPS/IPK resmi dikonfirmasi.

## 4. Specialization locking

- `currentSemester < 5`: eksplorasi boleh, lock ditolak dengan penjelasan.
- `currentSemester >= 5`: lock boleh.
- Satu scenario utama tidak boleh memuat mata kuliah dari jalur berbeda.
- Compare boleh membandingkan skenario dari jalur berbeda.

## 5. Career mapping

Pemetaan karier tidak menyatakan lulusan pasti bekerja pada peran tertentu. Gunakan copy:

> Jalur ini mengembangkan kompetensi yang relevan untuk beberapa peran berikut.

Jangan gunakan `kecocokan 93%`, `karier terbaik`, atau janji gaji.

## 6. Course availability

Status ditentukan dari:

1. Apakah selesai.
2. Apakah sedang ditempuh.
3. Apakah semester sudah sesuai.
4. Apakah prasyarat demo terpenuhi.
5. Apakah jalur sesuai.
6. Apakah masuk scenario.

Setiap status harus mempunyai alasan yang dapat dibuka.

## 7. Nilai dan Magang

Prototype tidak memerlukan input nilai lengkap jika demo memakai flag `allCompletedGradesAboveC`. Jika pengguna mengisi profil sendiri, sediakan pertanyaan eksplisit:

> Apakah seluruh mata kuliah yang telah ditempuh memiliki nilai di atas C?

Jelaskan bahwa ini mengikuti informasi yang diberikan peserta dan perlu dikonfirmasi ke prodi.

## 8. Konsistensi data

Tambahkan test yang memastikan:

- 57 mata kuliah sumber Semester 1–7;
- total 59 item setelah dua asumsi Semester 8;
- 12 mata kuliah peminatan;
- masing-masing jalur memiliki 4 mata kuliah/12 SKS;
- tidak ada course ID duplikat;
- tidak ada KKN;
- setiap prerequisite ID valid.
