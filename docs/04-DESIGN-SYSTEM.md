# LINTAS Design System

## 1. Fondasi

Gunakan komponen shadcn/ui dan Radix sebagai primitive, lalu terapkan token LINTAS. Referensi design system adalah sumber pola, bukan sesuatu yang disalin identik.

## 2. Color tokens

| Token | Nilai | Fungsi |
|---|---:|---|
| `--color-ink` | `#0B1220` | Judul dan teks utama |
| `--color-muted` | `#526070` | Teks sekunder |
| `--color-border` | `#D8E0E8` | Border |
| `--color-surface` | `#FFFFFF` | Surface utama |
| `--color-surface-subtle` | `#F6F8FB` | Surface sekunder |
| `--color-primary` | `#2563EB` | CTA dan fokus produk |
| `--color-primary-strong` | `#1D4ED8` | Hover/active |
| `--color-teal` | `#0F766E` | Karier/arah |
| `--color-success` | `#15803D` | Berhasil/aman |
| `--color-warning` | `#B45309` | Peringatan |
| `--color-danger` | `#B91C1C` | Kesalahan |
| `--color-info` | `#0369A1` | Informasi |

Warna tidak boleh menjadi satu-satunya pembeda status.

## 3. Typography

- Font utama: Inter atau sans-serif sistem.
- Display: 40/48 semibold desktop, 32/40 mobile.
- H1: 32/40 semibold.
- H2: 24/32 semibold.
- H3: 20/28 semibold.
- Body: 16/24 regular.
- Small: 14/20.
- Caption: 12/16.
- Angka progres memakai tabular numerals.

## 4. Spacing dan shape

- Base spacing: 4 px.
- Gap umum: 8, 12, 16, 24, 32, 48.
- Radius kontrol: 8 px.
- Radius card: 12 px.
- Shadow hanya untuk overlay dan selected card; surface utama mengandalkan border.
- Border default 1 px.

## 5. Grid

- App content max-width 1280 px.
- Sidebar 240 px desktop.
- Page padding 32 px desktop, 20 px tablet, 16 px mobile.
- Simulator desktop 7/5 columns.

## 6. Komponen wajib

### Navigation

AppShell, SidebarNav, MobileBottomNav, Breadcrumb, PageHeader.

### Input

TextInput, NumberInput, Select, Combobox, Checkbox, RadioGroup, SegmentedControl, Slider untuk jam aktivitas jika jelas, SearchField.

### Feedback

InlineAlert, Toast, ErrorSummary, ProgressIndicator, EmptyState, Skeleton, ConfirmDialog.

### Data

CourseCard, CourseDetailSheet, StatusBadge, CreditMeter, SemesterSection, SpecializationCard, CareerRoleCard, ScenarioCard, ComparisonRow, WorkloadSummary.

### Actions

Button primer/sekunder/ghost/destruktif, IconButton, SplitButton hanya jika benar-benar dibutuhkan.

## 7. Course status

| Status | Label | Ikon |
|---|---|---|
| completed | Selesai | check-circle |
| in_progress | Sedang ditempuh | clock |
| available | Tersedia | unlock |
| planned | Direncanakan | calendar-plus |
| locked | Terkunci | lock |
| attention | Perlu perhatian | alert-triangle |

## 8. Alert hierarchy

- Info: konteks atau disclaimer.
- Success: tindakan berhasil.
- Warning: masih dapat dilanjutkan setelah dipahami.
- Error: harus diperbaiki sebelum simpan.

Setiap alert memuat judul, alasan, dan tindakan berikutnya.

## 9. Career card

Urutan konten:

1. Nama peran.
2. Deskripsi maksimal dua kalimat.
3. Kompetensi utama.
4. Jalur relevan.
5. Mata kuliah pendukung.
6. Posisi Magang.
7. Ide portofolio.
8. CTA `Simpan untuk dieksplorasi`.

## 10. Comparison

- Maksimal dua objek.
- Tampilkan atribut per baris.
- Sorot perbedaan, bukan semua sel.
- Mobile mengulang label pada setiap card.
- Tidak menggunakan warna merah/hijau untuk menentukan menang/kalah.

## 11. Empty states

Empty state harus menjawab:

- apa yang belum ada;
- mengapa berguna;
- bagaimana memulai.

Contoh: `Belum ada skenario. Buat rencana pertama untuk melihat beban dan konsekuensinya.`

## 12. Print

Advisor Brief memakai putih, hitam, border tipis, tanpa sidebar, tanpa tombol, ukuran A4, dan mencegah pemotongan section penting.
