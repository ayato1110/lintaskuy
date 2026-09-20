import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';

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
  return <Outlet />;
}

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface" role="status">
        <p className="text-sm text-muted">Memuat data lokal...{''}</p>
      </div>
    );
  }
  return children;
}