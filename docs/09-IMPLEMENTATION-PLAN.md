# Implementation Plan

## Fase 0 — Bootstrap

- Vite React TypeScript.
- Router, Tailwind, shadcn/Radix.
- Lint, formatter, Vitest, Playwright.
- Import docs/data.

Exit: app build dan test kosong berjalan.

## Fase 1 — Domain dan rules

- Types.
- Data loader dan validation.
- Credit limit.
- Specialization lock.
- Prerequisite validation.
- Workload assessment.
- Internship eligibility.
- Unit test.

Exit: seluruh rule test lulus.

## Fase 2 — Design system dan shell

- Tokens.
- Buttons, form, alerts, badge, card, dialogs.
- Sidebar/mobile nav.
- Page header dan empty states.

Exit: Story/demo page menampilkan semua komponen dan state.

## Fase 3 — Entry dan dashboard

- Landing.
- Profil demo.
- Onboarding.
- Dashboard.
- localStorage.

Exit: reload mempertahankan profil.

## Fase 4 — Journey dan Peminatan

- Journey Map.
- Course detail.
- Peminatan compare.
- Kompas Karier.
- Lock gating Semester 5.

Exit: flow eksplorasi dan lock bekerja.

## Fase 5 — Scenario

- Builder.
- Analysis panel.
- Save/edit/delete/duplicate.
- Compare dua skenario.

Exit: seluruh interaksi mengubah hasil secara nyata.

## Fase 6 — Magang dan Advisor Brief

- Internship readiness.
- Portfolio suggestions.
- Brief generator.
- Print CSS.

Exit: alur Kang Haerin selesai.

## Fase 7 — QA

- Responsive 390/768/1024/1440.
- Keyboard dan screen reader smoke test.
- E2E.
- Lighthouse smoke.
- Build dan deployment.

## Definition of ready per feature

- Requirement jelas.
- Data tersedia.
- Empty/error/success state didefinisikan.
- Acceptance criteria dapat diuji.

## Definition of done per feature

- UI dan interaction selesai.
- Responsive.
- Accessible name/label tersedia.
- Test relevan lulus.
- Tidak ada console error.
- Copy sesuai panduan.
