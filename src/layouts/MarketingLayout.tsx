import { Link, Outlet } from 'react-router-dom';
import { BrandLink } from '@/components/Brand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ButtonLink } from '@/components/ui/Button';
import { useTripStore } from '@/store/tripStore';

export function MarketingLayout() {
  const { activeTrip } = useTripStore();

  return (
    <div className="min-h-dvh bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <BrandLink />
          <nav aria-label="Marketing" className="hidden items-center gap-7 text-[14px] text-ink-soft md:flex">
            <a href="#how" className="transition hover:text-ink">How it works</a>
            <a href="#capabilities" className="transition hover:text-ink">What it does</a>
            <Link to="/explore" className="transition hover:text-ink">Destinations</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink to={activeTrip ? `/trip/${activeTrip.id}` : '/onboarding'} size="sm">
              {activeTrip ? 'Open my trip' : 'Plan my trip'}
            </ButtonLink>
          </div>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <BrandLink />
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-faint">
                A travel assistant built for India — planning, food, safety, budget and on-the-ground help in one
                place, instead of six apps.
              </p>
            </div>
            <div className="grid gap-x-10 gap-y-2 text-[13.5px] sm:grid-cols-2">
              <Link to="/explore" className="text-ink-soft transition hover:text-ink">Explore destinations</Link>
              <Link to="/onboarding" className="text-ink-soft transition hover:text-ink">Plan a trip</Link>
              <Link to="/settings" className="text-ink-soft transition hover:text-ink">Integrations & settings</Link>
              <a href="#capabilities" className="text-ink-soft transition hover:text-ink">Roadmap</a>
            </div>
          </div>
          <p className="mt-8 border-t border-line pt-6 text-[12px] leading-relaxed text-ink-faint">
            Prototype build. Destination content, facility directories and weather in this build are curated sample
            data, clearly labelled throughout the app — nothing here is presented as live. Emergency helpline numbers
            are India’s published national numbers. Photography from Wikimedia Commons; see{' '}
            <code className="rounded bg-surface-2 px-1 py-0.5">public/img/SOURCES.txt</code>.
          </p>
        </div>
      </footer>
    </div>
  );
}
