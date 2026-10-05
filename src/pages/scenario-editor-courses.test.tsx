import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { seedPersistedState } from '@/lib/data-repo';
import { useAppStore } from '@/stores/appStore';
import { ScenarioEditorPage } from '@/pages/ScenarioEditorPage';
import type { PersistedStateV1, Scenario } from '@/domain/types';

const ENTERPRISE_SCENARIO_ID = 'haerin-enterprise-balanced';
const DATA_SCENARIO_ID = 'haerin-data-comparison';

const MOBIL = 'Pemrograman Aplikasi Bergerak, 3 SKS';
const DESAIN = 'Desain UI/UX, 3 SKS';
const PENAMBANGAN = 'Penambangan Data, 3 SKS';
const PEMBELAJARAN = 'Pembelajaran Mesin, 3 SKS';
const PROYEK = 'Manajemen Proyek Sistem Informasi, 3 SKS';

function scenarioById(id: string): Scenario {
  const scenario = seedPersistedState().scenarios.find((s) => s.id === id);
  if (!scenario) throw new Error(`Skenario seed ${id} tidak ditemukan.`);
  return scenario;
}

function seedState(scenarios: Scenario[]): void {
  const state: PersistedStateV1 = seedPersistedState();
  state.scenarios = scenarios;
  useAppStore.setState({ persisted: state, hasHydrated: true });
}

function renderEditor(scenarioId: string) {
  return render(
    <MemoryRouter initialEntries={[`/app/scenarios/${scenarioId}`]}>
      <Routes>
        <Route path="/app/scenarios/:id" element={<ScenarioEditorPage />} />
        <Route path="/app/scenarios" element={<div>Daftar skenario</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function countCourse(name: string): number {
  return screen.getAllByRole('checkbox', { name }).length;
}

function expectChecked(name: string): void {
  expect(screen.getByRole('checkbox', { name })).toHaveAttribute('aria-checked', 'true');
}

describe('Daftar mata kuliah editor skenario', () => {
  it('tanpa jalur peminatan, daftar umum tetap lengkap', () => {
    seedState([
      { ...scenarioById(ENTERPRISE_SCENARIO_ID), id: 'tanpa-jalur', specializationId: null },
    ]);

    renderEditor('tanpa-jalur');

    expect(screen.queryByText(/Mata kuliah peminatan/)).not.toBeInTheDocument();
    expect(countCourse(MOBIL)).toBe(1);
    expect(countCourse(DESAIN)).toBe(1);
    expect(countCourse(PENAMBANGAN)).toBe(1);
    expect(countCourse(PEMBELAJARAN)).toBe(1);
  });

  it('Enterprise & Aplikasi Digital: mata kuliah peminatan tampil tepat satu kali', () => {
    seedState([scenarioById(ENTERPRISE_SCENARIO_ID)]);

    const { container } = renderEditor(ENTERPRISE_SCENARIO_ID);

    expect(countCourse(MOBIL)).toBe(1);
    expect(countCourse(DESAIN)).toBe(1);
    expect(container.querySelector('#scen-esy155')).toBeNull();
    expect(container.querySelector('#scen-spec-esy155')).not.toBeNull();
    expectChecked(MOBIL);
  });

  it('Data & Inteligensi Bisnis: mata kuliah peminatan tampil tepat satu kali', () => {
    seedState([scenarioById(DATA_SCENARIO_ID)]);

    const { container } = renderEditor(DATA_SCENARIO_ID);

    expect(countCourse(PENAMBANGAN)).toBe(1);
    expect(countCourse(PEMBELAJARAN)).toBe(1);
    expect(container.querySelector('#scen-esy153')).toBeNull();
    expectChecked(PENAMBANGAN);
  });

  it('mata kuliah jalur lain tetap tampil pada daftar umum', () => {
    seedState([scenarioById(ENTERPRISE_SCENARIO_ID)]);

    renderEditor(ENTERPRISE_SCENARIO_ID);

    expect(countCourse(PENAMBANGAN)).toBe(1);
    expect(countCourse(PEMBELAJARAN)).toBe(1);
    expect(countCourse(PROYEK)).toBe(1);
  });

  it('target Semester 6 tetap menampilkan mata kuliah peminatan Semester 5', () => {
    seedState([
      { ...scenarioById(ENTERPRISE_SCENARIO_ID), targetSemester: 6, selectedCourseIds: ['esy165'] },
    ]);

    const { container } = renderEditor(ENTERPRISE_SCENARIO_ID);

    expect(countCourse(MOBIL)).toBe(1);
    expect(screen.getAllByText('Berasal dari Semester 5, bukan Semester 6.')).toHaveLength(2);
    expect(container.querySelector('#scen-esy155')).toBeNull();
  });

  it('memilih mata kuliah tetap mengubah total SKS', async () => {
    const user = userEvent.setup();
    seedState([{ ...scenarioById(ENTERPRISE_SCENARIO_ID), selectedCourseIds: ['esy155'] }]);

    renderEditor(ENTERPRISE_SCENARIO_ID);

    const before = screen.getByText(/Total rencana:/).textContent;
    expect(before).toContain('3 SKS');

    await user.click(screen.getByRole('checkbox', { name: PROYEK }));

    expect(screen.getByText(/Total rencana:/).textContent).toContain('6 SKS');
    expectChecked(PROYEK);
  });

  it('simpan dan buka ulang mempertahankan pilihan matakuliah', async () => {
    const user = userEvent.setup();
    seedState([{ ...scenarioById(ENTERPRISE_SCENARIO_ID), selectedCourseIds: ['esy155'] }]);

    const first = renderEditor(ENTERPRISE_SCENARIO_ID);

    await user.click(screen.getByRole('checkbox', { name: PROYEK }));
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));

    const saved = useAppStore
      .getState()
      .persisted.scenarios.find((s) => s.id === ENTERPRISE_SCENARIO_ID);
    expect(saved?.selectedCourseIds).toContain('isp151');
    expect(saved?.selectedCourseIds).toContain('esy155');

    first.unmount();
    renderEditor(ENTERPRISE_SCENARIO_ID);

    expectChecked(PROYEK);
    expectChecked(MOBIL);
  });
});