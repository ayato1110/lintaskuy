import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { AnimatedOutlet, PageLoader } from '@/components/app/PageTransitions';

export function RequireProfile() {
  const profile = useAppStore((state) => state.persisted.profile);
  const onboardingCompleted = useAppStore((state) => state.persisted.onboardingCompleted);
  const location = useLocation();

  if (!profile || !onboardingCompleted) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RedirectIfOnboarded() {
  const profile = useAppStore((state) => state.persisted.profile);
  const onboardingCompleted = useAppStore((state) => state.persisted.onboardingCompleted);
  if (profile && onboardingCompleted) {
    return <Navigate to="/app" replace />;
  }
  return <AnimatedOutlet />;
}

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  if (!hasHydrated) {
    return <PageLoader />;
  }
  return children;
}