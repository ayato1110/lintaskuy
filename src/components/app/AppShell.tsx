import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Calculator,
  CircleGauge,
  Compass,
  FileText,
  LogOut,
  Map,
  Settings,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/cn';
import { ConfirmDialog } from '@/components/ui/dialog';
import { AnimatedOutlet } from '@/components/app/PageTransitions';

interface NavItem {
  to: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  end?: boolean;
}

const primaryNav: NavItem[] = [
  { to: '/app', label: 'Beranda', icon: CircleGauge, end: true },
  { to: '/app/journey', label: 'Peta Studi', icon: Map },
  { to: '/app/specializations', label: 'Peminatan', icon: Compass },
  { to: '/app/scenarios', label: 'Simulasi', icon: Calculator },
  { to: '/app/advisor-brief', label: 'Ringkasan PA', shortLabel: 'Ringkasan', icon: FileText },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'flex items-center gap-2' : 'flex items-center gap-2.5'}>
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-control bg-ink text-white"
      >
        <BookOpen className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </span>
      <span className="text-base font-semibold tracking-tight text-ink">
        LINTAS<span className="text-primary">.</span>
      </span>
    </div>
  );
}

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium text-muted transition-colors',
          'hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          isActive && 'bg-surface-subtle text-ink',
        )
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

function LogoutWithConfirm({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className: string;
  ariaLabel: string;
}) {
  const resetApp = useAppStore((state) => state.resetApp);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Keluar dari sesi ini?"
        description="Profil dan rencana pada perangkat ini dihapus. Kamu kembali ke halaman awal untuk memulai ulang."
        confirmLabel="Keluar"
        destructive
        onConfirm={() => {
          resetApp();
          navigate('/');
        }}
      />
    </>
  );
}

function DesktopSidebar() {
  const profile = useAppStore((state) => state.persisted.profile);
  return (
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
      <BrandMark />
      <nav aria-label="Navigasi utama" className="mt-6 flex flex-1 flex-col gap-1">
        {primaryNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>
      <div className="border-t border-border pt-3">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium text-muted transition-colors',
              'hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              isActive && 'bg-surface-subtle text-ink',
            )
          }
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Profil dan data
        </NavLink>
        {profile ? (
          <p className="mt-3 truncate px-3 text-xs text-muted" title={profile.name}>
            {profile.name} · Semester {profile.currentSemester}
          </p>
        ) : null}
        <LogoutWithConfirm
          ariaLabel="Keluar dari sesi ini"
          className="mt-1 flex w-full items-center gap-3 rounded-control px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Keluar dari sesi ini</span>
        </LogoutWithConfirm>
      </div>
    </aside>
  );
}

function MobileTopBar() {
  const profile = useAppStore((state) => state.persisted.profile);
  const navigate = useNavigate();
  if (!profile) return null;

  const initial = profile.name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-surface/95 px-4 py-2.5 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={() => navigate('/app')}
        aria-label="Kembali ke beranda"
        className="rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <BrandMark compact />
      </button>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => navigate('/app/settings')}
          className="flex min-h-11 min-w-0 max-w-[10rem] items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-xs font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          >
            {initial}
          </span>
          <span className="truncate">{profile.name}</span>
        </button>
        <LogoutWithConfirm
          ariaLabel="Keluar dari sesi ini"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </LogoutWithConfirm>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const profile = useAppStore((state) => state.persisted.profile);
  if (!profile) return null;
  return (
    <nav
      aria-label="Navigasi bawah"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    'flex h-16 flex-col items-center justify-center gap-1 px-0.5 text-[11px] font-medium text-muted',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40',
                    isActive && 'text-primary',
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="max-w-full truncate leading-none">
                  {item.shortLabel ?? item.label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function StorageNotice() {
  const storageNotice = useAppStore((state) => state.storageNotice);
  const dismiss = useAppStore((state) => state.dismissStorageNotice);
  const loadDemoProfile = useAppStore((state) => state.loadDemoProfile);
  const navigate = useNavigate();
  if (!storageNotice) return null;

  return (
    <div
      role="status"
      className="no-print border-b border-warning/30 bg-warning/10 px-4 py-2.5 lg:px-8"
    >
      <p className="text-sm text-warning">
        Data tersimpan gagal dibaca dan diatur ulang ke kondisi awal. Profil Kang Haerin siap dimuat
        ulang.
      </p>
      <div className="mt-1.5 flex gap-2">
        <button
          type="button"
          className="text-sm font-medium text-warning underline hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
          onClick={() => {
            loadDemoProfile();
            navigate('/app');
          }}
        >
          Muat profil demo Kang Haerin
        </button>
        <button
          type="button"
          className="text-sm font-medium text-warning underline hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
          onClick={dismiss}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#main-content"
        className="no-print sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Langsung ke konten
      </a>
      <DesktopSidebar />
      <MobileTopBar />
      <div className="lg:pl-60">
        <StorageNotice />
        <main id="main-content" className="pb-24 lg:pb-12">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export function AppShellOutlet() {
  return (
    <AppShell>
      <AnimatedOutlet />
    </AppShell>
  );
}