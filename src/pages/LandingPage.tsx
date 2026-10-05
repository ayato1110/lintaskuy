import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  GitCompareArrows,
  GraduationCap,
  Map,
  Route,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';

const benefits = [
  {
    icon: Map,
    title: 'Lihat kamu sudah sampai mana',
    body: 'Pantau mata kuliah yang sudah selesai, yang sedang ditempuh, dan apa saja yang masih tersisa menuju 144 SKS.',
  },
  {
    icon: GitCompareArrows,
    title: 'Pilih jalur dengan alasan yang jelas',
    body: 'Bandingkan mata kuliah di setiap peminatan, cara belajarnya, dan kaitannya dengan Magang maupun arah kariermu.',
  },
  {
    icon: ClipboardList,
    title: 'Datang ke dosen PA dengan rencana',
    body: 'Coba beberapa susunan mata kuliah, lihat bebannya, lalu bawa pilihan yang paling masuk akal untuk didiskusikan.',
  },
];

function SemesterDot({ semester }: { semester: number }) {
  const done = semester <= 4;
  return (
    <span
      className={
        done
          ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary md:h-9 md:w-9'
          : semester === 5
            ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary text-ink md:h-9 md:w-9'
            : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-muted md:h-9 md:w-9'
      }
      title={
        done
          ? `Semester ${semester} selesai`
          : semester === 5
            ? `Semester ${semester} berjalan`
            : `Semester ${semester} mendatang`
      }
    >
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
      ) : (
        <span className="text-[10px] tabular md:text-xs">{semester}</span>
      )}
    </span>
  );
}

function TrackRow({ semesters }: { semesters: number[] }) {
  return (
    <div className="flex items-center">
      {semesters.map((semester, index) => (
        <Fragment key={semester}>
          {index > 0 ? <span className="h-px min-w-1.5 flex-1 bg-border" aria-hidden="true" /> : null}
          <SemesterDot semester={semester} />
        </Fragment>
      ))}
    </div>
  );
}

function HeroTrack() {
  return (
    <div className="card p-5 md:p-6" aria-hidden="true">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
        <span>Contoh ilustrasi jalur Kang Haerin</span>
      </div>
      <ol className="flex w-full items-center">
        <TrackRow semesters={[1, 2, 3, 4, 5, 6, 7, 8]} />
      </ol>
      <p className="mt-3 text-sm text-muted">
        Empat semester pertama selesai, Semester 5 sedang berjalan, sisanya direncanakan menuju 144
        SKS.
      </p>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const loadDemoProfile = useAppStore((state) => state.loadDemoProfile);

  return (
    <div className="min-h-screen bg-surface">
      <header className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-5 md:px-8">
        <p className="text-lg font-semibold tracking-tight text-ink">
          LINTAS<span className="text-primary">.</span>
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding')}>
          Isi Profil Saya
        </Button>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-content gap-10 px-4 py-8 md:grid-cols-2 md:items-start md:px-8 md:py-12">
          <div>
            <p className="text-sm font-medium text-primary">Portal perencanaan kuliah berbasis skenario</p>
            <h1 className="mt-2 text-display-mobile font-semibold leading-tight text-ink md:text-display">
              Rencanakan kuliah, pahami konsekuensinya.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              Lihat posisi akademikmu, bandingkan peminatan, lalu coba beberapa rencana semester
              sebelum mengisi KRS atau bertemu dosen PA.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => {
                  loadDemoProfile();
                  navigate('/app');
                }}
              >
                Coba Profil Kang Haerin
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/onboarding')}>
                Isi Profil Saya
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-sm text-muted">
              Dibuat berdasarkan kurikulum Sistem Informasi UNJA: 144 SKS, tiga jalur peminatan,
              dan perjalanan studi hingga Semester 8.
            </p>
          </div>
          <HeroTrack />
        </section>

        <section className="border-y border-border bg-surface-subtle">
          <div className="mx-auto grid w-full max-w-content gap-6 px-4 py-12 md:grid-cols-3 md:px-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="text-xs font-medium tabular">0{index + 1}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-ink">{benefit.title}</h2>
                  <p className="text-sm leading-relaxed text-muted">{benefit.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-content flex-col gap-6 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold text-ink">Cara kerjanya</h2>
            <p className="mt-2 text-base text-muted">
              Setiap bagian LINTAS membantu kamu menjawab tiga hal: sekarang ada di posisi mana,
              pilihan apa yang tersedia, dan apa dampaknya kalau pilihan itu diambil.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Route className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                <p className="text-sm text-muted">
                  Ikuti perjalanan Semester 1 sampai 8 dan pahami alasan di balik setiap status
                  mata kuliah.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <GitCompareArrows className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                <p className="text-sm text-muted">
                  Lihat hubungan antara peminatan, mata kuliah, keterampilan, dan pilihan Magang
                  tanpa persentase kecocokan yang dibuat-buat.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                <p className="text-sm text-muted">
                  Sebelum disimpan, rencana diperiksa dari sisi batas SKS, prasyarat, dan
                  kesibukanmu di luar kuliah.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-content flex-col gap-3 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="text-sm text-muted">
            LINTAS: Rencanakan kuliah, pahami konsekuensinya.
          </p>
        </div>
      </footer>
    </div>
  );
}