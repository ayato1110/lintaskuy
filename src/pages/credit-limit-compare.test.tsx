import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { seedPersistedState } from '@/lib/data-repo';
import { useAppStore } from '@/stores/appStore';
import { ScenarioEditorPage } from '@/pages/ScenarioEditorPage';
import { ScenariosPage } from '@/pages/ScenariosPage';

function seedProfile(performanceIndex: number) {
  const state = seedPersistedState();
  state.profile = { ...state.profile!, performanceIndex };
  useAppStore.setState({ persisted: state, hasHydrated: true });
}

describe('ScenarioEditorPage credit limit display', () => {
  it('menampilkan batas 24 SKS untuk Indeks Prestasi 3,67', () => {
    seedProfile(3.67);
    render(
      <MemoryRouter initialEntries={['/app/scenarios/new']}>
        <Routes>
          <Route path="/app/scenarios/new" element={<ScenarioEditorPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Total rencana:.*batas 24 SKS/)).toBeInTheDocument();
    expect(screen.getByText(/Batas mengikuti Indeks Prestasi 3,67 yang tersimpan di profil/)).toBeInTheDocument();
  });

  it('menampilkan batas 21 SKS untuk Indeks Prestasi 3,00', () => {
    seedProfile(3.0);
    render(
      <MemoryRouter initialEntries={['/app/scenarios/new']}>
        <Routes>
          <Route path="/app/scenarios/new" element={<ScenarioEditorPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Total rencana:.*batas 21 SKS/)).toBeInTheDocument();
    expect(screen.getByText(/Batas mengikuti Indeks Prestasi 3,00 yang tersimpan di profil/)).toBeInTheDocument();
  });
});

describe('ScenariosPage compare selection', () => {
  it('menonaktifkan tombol skenario ketiga ketika dua sudah dipilih', async () => {
    const user = userEvent.setup();
    seedProfile(3.67);
    useAppStore.getState().createDraftScenario({
      name: 'Skenario ketiga',
      targetSemester: 5,
      selectedCourseIds: ['isp151', 'bsp154'],
    });

    render(
      <MemoryRouter initialEntries={['/app/scenarios']}>
        <Routes>
          <Route path="/app/scenarios" element={<ScenariosPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('0 dari 2 dipilih')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Pilih untuk dibandingkan' })).toHaveLength(3);

    const compareButtons = screen.getAllByRole('button', { name: 'Pilih untuk dibandingkan' });
    await user.click(compareButtons[0]);
    await user.click(compareButtons[1]);

    expect(screen.getByText('2 dari 2 dipilih')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Sudah dipilih' })).toHaveLength(2);

    const third = screen.getByRole('button', { name: 'Pilih untuk dibandingkan' });
    expect(third).toBeDisabled();
    await user.click(third);
    expect(screen.getByText('2 dari 2 dipilih')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Sudah dipilih' })).toHaveLength(2);
  });
});