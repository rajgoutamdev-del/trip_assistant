import { Suspense, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Compass, Home, Map, Moon, Settings, ShieldCheck } from 'lucide-react';
import { BrandLink } from '@/components/Brand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EmergencyButton } from '@/components/trip/EmergencyAccess';
import { TRIP_MODULES, tripPath } from '@/components/trip/tripNav';
import { Skeleton } from '@/components/ui/States';
import { useTripStore } from '@/store/tripStore';
import { formatDateRange } from '@/utils/format';
import { cn } from '@/utils/cn';

const PRIMARY_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/explore', label: 'Explore India', icon: Compass },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function navClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition',
    isActive ? 'bg-surface-2 text-ink' : 'text-ink-faint hover:bg-surface-2/60 hover:text-ink',
  );
}

function Sidebar() {
  const { activeTrip, activeDestination } = useTripStore();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-5 lg:flex">
      <BrandLink className="px-2" />

      <nav aria-label="Main" className="mt-7 space-y-1">
        {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navClass}>
            <Icon size={17} aria-hidden /> {label}
          </NavLink>
        ))}
      </nav>

      {activeTrip && activeDestination ? (
        <div className="mt-7 min-h-0 flex-1 overflow-y-auto scrollbar-none">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Current trip</p>
          <Link
            to={tripPath(activeTrip.id)}
            className="mt-2 block rounded-xl border border-line bg-surface px-3 py-2.5 transition hover:border-line-strong"
          >
            <p className="font-display text-[16px] leading-tight">{activeDestination.name}</p>
            <p className="mt-0.5 text-[12px] text-ink-faint">
              {formatDateRange(activeTrip.startDate, activeTrip.endDate)}
            </p>
          </Link>
          <nav aria-label="Trip modules" className="mt-2 space-y-0.5">
            {TRIP_MODULES.map(({ slug, label, icon: Icon }) => (
              <NavLink key={slug} to={tripPath(activeTrip.id, slug)} className={navClass}>
                <Icon size={16} aria-hidden /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      ) : (
        <div className="mt-7 flex-1">
          <Link
            to="/onboarding"
            className="block rounded-xl border border-dashed border-line-strong px-3 py-4 text-center text-[13px] text-ink-faint transition hover:border-saffron hover:text-ink"
          >
            No trip yet — plan one
          </Link>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <ThemeToggle />
        <EmergencyButton />
      </div>
    </aside>
  );
}

function MobileTopBar() {
  const { activeTrip, activeDestination, nightMode, setNightMode } = useTripStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
      <BrandLink />
      <div className="flex items-center gap-1.5">
        {activeTrip && activeDestination ? (
          <button
            type="button"
            onClick={() => setNightMode(!nightMode)}
            aria-pressed={nightMode}
            aria-label="Toggle night travel mode"
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full border transition',
              nightMode ? 'border-indigo bg-indigo/15 text-indigo' : 'border-line text-ink-faint',
            )}
          >
            <Moon size={16} />
          </button>
        ) : null}
        <ThemeToggle />
        <EmergencyButton compact />
      </div>
    </header>
  );
}

function BottomNav() {
  const { activeTrip } = useTripStore();
  const items = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: activeTrip ? tripPath(activeTrip.id, 'itinerary') : '/onboarding', label: 'Plan', icon: Map },
    { to: activeTrip ? tripPath(activeTrip.id, 'safety') : '/explore', label: 'Safety', icon: ShieldCheck },
    { to: '/settings', label: 'More', icon: Settings },
  ];

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper/95 backdrop-blur lg:hidden"
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex min-h-[58px] flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition',
              isActive ? 'text-ink' : 'text-ink-faint',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function NightModeBanner() {
  const { nightMode, activeTrip } = useTripStore();
  if (!nightMode || !activeTrip) return null;
  return (
    <Link
      to={tripPath(activeTrip.id, 'night')}
      className="flex items-center justify-center gap-2 bg-[#141b2d] px-4 py-2 text-[12.5px] font-medium text-[#c7d2fe] transition hover:bg-[#1a2238]"
    >
      <Moon size={14} /> Night travel mode is on — open after-dark guidance
    </Link>
  );
}

export function AppShell() {
  const { pathname } = useLocation();

  // Route changes should start at the top, like a native app.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <NightModeBanner />
        <main id="main" className="min-w-0 flex-1 pb-24 lg:pb-12">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-40 w-full rounded-card" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 rounded-card" />
        <Skeleton className="h-28 rounded-card" />
      </div>
    </div>
  );
}
