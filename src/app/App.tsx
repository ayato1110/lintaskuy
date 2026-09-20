import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AppShellOutlet } from '@/components/app/AppShell';
import { AppBootstrap, RedirectIfOnboarded, RequireProfile } from '@/app/guards';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { PageLoader, ScrollToTop } from '@/components/app/PageTransitions';

const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const OnboardingPage = lazy(() =>
  import('@/pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const JourneyPage = lazy(() =>
  import('@/pages/JourneyPage').then((module) => ({ default: module.JourneyPage })),
);
const SpecializationsPage = lazy(() =>
  import('@/pages/SpecializationsPage').then((module) => ({ default: module.SpecializationsPage })),
);
const CareerPage = lazy(() =>
  import('@/pages/CareerPage').then((module) => ({ default: module.CareerPage })),
);
const ScenariosPage = lazy(() =>
  import('@/pages/ScenariosPage').then((module) => ({ default: module.ScenariosPage })),
);
const ScenarioEditorPage = lazy(() =>
  import('@/pages/ScenarioEditorPage').then((module) => ({ default: module.ScenarioEditorPage })),
);
const ScenarioComparePage = lazy(() =>
  import('@/pages/ScenarioComparePage').then((module) => ({ default: module.ScenarioComparePage })),
);
const InternshipPage = lazy(() =>
  import('@/pages/InternshipPage').then((module) => ({ default: module.InternshipPage })),
);
const AdvisorBriefPage = lazy(() =>
  import('@/pages/AdvisorBriefPage').then((module) => ({ default: module.AdvisorBriefPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);

const basename = import.meta.env.BASE_URL || '/';
const normalizedBasename = basename === '/' ? '/' : basename.replace(/\/$/, '');

export function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <BrowserRouter basename={normalizedBasename}>
          <ScrollToTop />
          <AppBootstrap>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </AppBootstrap>
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}