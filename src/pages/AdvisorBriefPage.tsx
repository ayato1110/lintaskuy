import { useEffect, useState } from 'react';
import { Printer, Save } from 'lucide-react';
import { PageHeader, Breadcrumb } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/academic/status-badge';
import { InlineAlert, RuleResultAlert } from '@/components/ui/alert';
import { TextareaField } from '@/components/ui/input';
import { WorkloadBar } from '@/components/scenarios/scenario-panel';
import { buildAdvisorBrief } from '@/domain/advisor/build';
import { analyzeScenario } from '@/domain/scenario/analyze';
import { getCourseStatus } from '@/domain/academic/rules';
import { useAppStore } from '@/stores/appStore';
import { coursesById } from '@/lib/data-repo';
import { displaySKS, formatDate, formatPerformanceIndex } from '@/lib/format';

export function AdvisorBriefPage() {
  const profile = useAppStore((state) => state.persisted.profile);
  const primaryScenario = useAppStore((state) =>
    state.persisted.scenarios.find((scenario) => scenario.id === state.persisted.primaryScenarioId) ?? null,
  );
  const advisorQuestions = useAppStore((state) => state.persisted.advisorQuestions);
  const setAdvisorQuestions = useAppStore((state) => state.setAdvisorQuestions);

  const [questionsDraft, setQuestionsDraft] = useState(advisorQuestions.join('\n'));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setQuestionsDraft(advisorQuestions.join('\n'));
  }, [advisorQuestions]);

  if (!profile) return null;

  const brief = buildAdvisorBrief(profile, {
    primaryScenario,
    questions: advisorQuestions,
  });
  const analysis = primaryScenario ? analyzeScenario(profile, primaryScenario) : null;
  const context = { activeCourseIds: primaryScenario?.selectedCourseIds ?? [] };

  function saveQuestions() {
    const questions = questionsDraft
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    setAdvisorQuestions(questions);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="print-container mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <div className="no-print">
        <Breadcrumb crumbs={[{ label: 'Ringkasan PA' }]} />
        <PageHeader
          title="Advisor Brief"
          description="Bahan ringkas untuk diskusi dengan dosen pembimbing: posisi, rencana utama, risiko, dan pertanyaan yang ingin diajukan."
          actions={
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Cetak / simpan PDF
            </Button>
          }
        />
      </div>

      {!primaryScenario ? (
        <div className="no-print mb-6">
          <InlineAlert
            tone="warning"
            title="Belum ada rencana utama"
            reason="Ringkasan PA belum memuat skenario. Tetapkan satu skenario sebagai rencana utama agar dosen pembimbing melihat arah yang menjadi pertimbangan."
            nextAction="Buka daftar skenario dan tekan Jadikan rencana utama."
          />
        </div>
      ) : null}

      <section className="print-section card p-5 md:p-6" aria-labelledby="brief-identitas">
        <h2 id="brief-identitas" className="print-section-title text-base font-semibold text-ink">
          Identitas mahasiswa
        </h2>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Nama</dt>
            <dd className="font-medium text-ink">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Prodi</dt>
            <dd className="font-medium text-ink">Sistem Informasi, Universitas Jambi</dd>
          </div>
          <div>
            <dt className="text-muted">Semester aktif</dt>
            <dd className="font-medium text-ink">Semester {profile.currentSemester}</dd>
          </div>
          <div>
            <dt className="text-muted">Indeks Prestasi</dt>
            <dd className="font-medium tabular text-ink">{formatPerformanceIndex(profile.performanceIndex)}</dd>
          </div>
          <div>
            <dt className="text-muted">SKS selesai</dt>
            <dd className="font-medium tabular text-ink">{displaySKS(profile.completedCredits)}</dd>
          </div>
          <div>
            <dt className="text-muted">Dibuat pada</dt>
            <dd className="font-medium text-ink">{formatDate(brief.generatedAt)}</dd>
          </div>
        </dl>
      </section>

      {primaryScenario && analysis ? (
        <>
          <section className="print-section card mt-4 p-5 md:p-6" aria-labelledby="brief-rencana">
            <div className="print-section-title flex flex-wrap items-center justify-between gap-2">
              <h2 id="brief-rencana" className="text-base font-semibold text-ink">
                Rencana utama: {primaryScenario.name}
              </h2>
              <Badge tone="primary">Semester {primaryScenario.targetSemester}</Badge>
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Jalur peminatan</dt>
                <dd className="font-medium text-ink">{brief.specialization?.name ?? 'Belum memilih'}</dd>
              </div>
              <div>
                <dt className="text-muted">Arah karier yang dipertimbangkan</dt>
                <dd className="font-medium text-ink">{brief.careerRole?.title ?? 'Belum memilih'}</dd>
              </div>
              <div>
                <dt className="text-muted">Target posisi Magang</dt>
                <dd className="font-medium text-ink">{primaryScenario.targetInternshipRole ?? 'Belum memilih'}</dd>
              </div>
            </dl>

            <p className="mt-4 text-sm text-muted">
              Total SKS rencana {displaySKS(analysis.credits)} untuk Semester {primaryScenario.targetSemester}.
            </p>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-ink">Mata kuliah pada rencana</p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {primaryScenario.selectedCourseIds.map((courseId) => {
                  const course = coursesById.get(courseId);
                  if (!course) return null;
                  const result = getCourseStatus(course, profile, context);
                  return (
                    <li key={courseId} className="flex items-center justify-between gap-2 rounded-control bg-surface-subtle px-3 py-2">
                      <span className="min-w-0 truncate text-sm text-ink">
                        {course.name} <span className="text-xs text-muted">({course.credits} SKS)</span>
                      </span>
                      <StatusBadge status={result.status} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section className="print-section card mt-4 p-5 md:p-6" aria-labelledby="brief-beban">
            <h2 id="brief-beban" className="print-section-title text-base font-semibold text-ink">
              Beban rencana
            </h2>
            <div className="mt-3">
              <WorkloadBar workload={analysis.workload} />
            </div>
          </section>
        </>
      ) : null}

      <section className="print-section card mt-4 p-5 md:p-6" aria-labelledby="brief-magang">
        <h2 id="brief-magang" className="print-section-title text-base font-semibold text-ink">
          Kesiapan Magang
        </h2>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Syarat SKS minimal {brief.internship.minimumCredits}</dt>
            <dd className="font-medium text-ink">
              {brief.internship.creditsMet
                ? `Terpenuhi (${brief.internship.completedCredits} dari ${brief.internship.minimumCredits} SKS)`
                : `Belum, saat ini ${brief.internship.completedCredits} dari ${brief.internship.minimumCredits} SKS`}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Semua nilai di atas C</dt>
            <dd className="font-medium text-ink">
              {brief.internship.gradesAboveC === null
                ? 'Belum dapat dievaluasi'
                : brief.internship.gradesAboveC
                  ? 'Terpenuhi'
                  : 'Belum terkonfirmasi'}
            </dd>
          </div>
        </dl>
        <Badge
          className="mt-3"
          tone={brief.internship.eligibility === 'ready' ? 'success' : 'warning'}
        >
          {brief.internship.eligibility === 'ready'
            ? 'Syarat dasar terpenuhi'
            : brief.internship.eligibility === 'in_progress'
              ? 'Perlu konfirmasi nilai'
              : 'Belum memenuhi'}
        </Badge>
      </section>

      <section className="print-section card mt-4 p-5 md:p-6" aria-labelledby="brief-risiko">
        <h2 id="brief-risiko" className="print-section-title text-base font-semibold text-ink">
          Risiko dan catatan
        </h2>
        {brief.risks.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Belum ada catatan dari pemeriksaan LINTAS. Rencana ini tetap perlu dikonfirmasikan kepada
            dosen PA.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {brief.risks.map((risk) => (
              <RuleResultAlert key={`${risk.title}-${risk.reason}`} result={risk} />
            ))}
          </div>
        )}
      </section>

      <section className="print-section card mt-4 p-5 md:p-6" aria-labelledby="brief-pertanyaan">
        <h2 id="brief-pertanyaan" className="print-section-title text-base font-semibold text-ink">
          Pertanyaan untuk dosen pembimbing
        </h2>
        {brief.questions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Tambahkan hal yang ingin dipastikan saat berkonsultasi dengan dosen PA.
          </p>
        ) : (
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-ink">
            {brief.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        )}

        <div className="no-print mt-5">
          <TextareaField
            id="questions-input"
            label="Tulis pertanyaan, satu baris untuk satu pertanyaan"
            value={questionsDraft}
            onChange={(event) => {
              setQuestionsDraft(event.target.value);
              setSaved(false);
            }}
            placeholder={`Contoh:\nApakah rencana Semester ${profile.currentSemester} ini realistis dengan beban organisasi saya?\nBagaimana urutan Magang ideal setelah Semester ${profile.currentSemester}?`}
          />
          <div className="mt-2 flex items-center gap-3">
            <Button variant="secondary" onClick={saveQuestions}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Simpan pertanyaan
            </Button>
            {saved ? (
              <span role="status" className="text-sm text-success">
                Pertanyaan disimpan.
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <p className="mt-6 text-sm text-muted">
        Ringkasan ini dibuat sebagai bahan konsultasi, bukan persetujuan akademik resmi.
      </p>
    </div>
  );
}