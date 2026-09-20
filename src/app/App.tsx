import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShellOutlet } from '@/components/app/AppShell';
import { AppBootstrap, RedirectIfOnboarded, RequireProfile } from '@/app/guards';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { LandingPage } from '@/pages/LandingPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { JourneyPage } from '@/pages/JourneyPage';
import { SpecializationsPage } from '@/pages/SpecializationsPage';
import { CareerPage } from '@/pages/CareerPage';
import { ScenariosPage } from '@/pages/ScenariosPage';
import { ScenarioEditorPage } from '@/pages/ScenarioEditorPage';
import { ScenarioComparePage } from '@/pages/ScenarioComparePage';
import { InternshipPage } from '@/pages/InternshipPage';
import { AdvisorBriefPage } from '@/pages/AdvisorBriefPage';
import { SettingsPage } from '@/pages/SettingsPage';

const basename = import.meta.env.BASE_URL || '/';
const normalizedBasename = basename === '/' ? '/' : basename.replace(/\/$/, '');

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={normalizedBasename}>
        <AppBootstrap>
          <Routes>
            <Route element={<RedirectIfOnboarded />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>

            <Route path="/app" element={<RequireProfile />}>
              <Route element={<AppShellOutlet />}>
                <Route index element={<DashboardPage />} />
                <Route path="journey" element={<JourneyPage />} />
                <Route path="specializations" element={<SpecializationsPage />} />
                <Route path="specializations/career" element={<CareerPage />} />
                <Route path="scenarios" element={<ScenariosPage />} />
                <Route path="scenarios/new" element={<ScenarioEditorPage />} />
                <Route path="scenarios/:id" element={<ScenarioEditorPage />} />
                <Route path="scenarios/compare" element={<ScenarioComparePage />} />
                <Route path="internship" element={<InternshipPage />} />
                <Route path="advisor-brief" element={<AdvisorBriefPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppBootstrap>
      </BrowserRouter>
    </ErrorBoundary>
  );
}