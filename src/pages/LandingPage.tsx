import { Link } from 'react-router-dom';
import {
  ArrowRight, Banknote, BackpackIcon, Camera, CloudSun, Compass, Languages,
  LifeBuoy, Map, Moon, ShieldCheck, Sparkles, UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Figure } from '@/components/ui/Figure';
import { DESTINATIONS } from '@/data/destinations';
import { formatINRCompact } from '@/utils/format';
import { useTripStore } from '@/store/tripStore';

const CAPABILITIES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Map,
    title: 'Personalised trip planning',
    body: 'Tell us how you travel and the planner builds a timed, day-by-day plan — grouped by area to keep travel time down, with a plain-language reason attached to every stop.',
  },
  {
    icon: Compass,
    title: 'Everything in one place',
    body: 'Places, food, stays, parking, phrases, photo spots and emergency contacts live inside the trip. No switching between six apps mid-journey.',
  },
  {
    icon: Banknote,
    title: 'Budget that holds up',
    body: 'Set a total and see it split across stay, food, transport and activities. Log expenses as you go and get warned before you cross the line — not after.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Food with context',
    body: 'Not restaurant cards. The dishes a place is actually known for, where to eat them, what they cost, and why they exist — filtered by your diet and chilli tolerance.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety you can act on',
    body: 'Local scams, cultural norms, dress codes, areas to avoid and after-dark guidance, written per destination. Specific enough to change what you do.',
  },
  {
    icon: BackpackIcon,
    title: 'Packing from the real forecast',
    body: 'A checklist generated from your destination, month, trip length and planned activities — so an umbrella appears for a Mumbai July and trekking shoes for a Sahyadri trail.',
  },
  {
    icon: LifeBuoy,
    title: 'Help, one tap away',
    body: 'India’s national helplines and a directory of hospitals, police stations, pharmacies and ATMs, reachable from every screen in the trip.',
  },
  {
    icon: Sparkles,
    title: 'Travel intelligence',
    body: 'Best months, crowd patterns, quiet windows at each sight, typical costs and local transport realities — the things that decide whether a day works.',
  },
];

const JOURNEY = [
  {
    step: '01',
    title: 'Tell us how you travel',
    body: 'Eight short steps: where and when, who with, your budget, interests, food, pace and how you like to get around.',
  },
  {
    step: '02',
    title: 'Get a plan, not a list',
    body: 'A timed itinerary with costs, travel times and reasoning — then change anything. Reorder, retime, remove, add your own stops.',
  },
  {
    step: '03',
    title: 'Carry it with you',
    body: 'On the ground, the same trip becomes your weather read, food guide, budget tracker, phrasebook, safety brief and emergency directory.',
  },
];

const MODULES = [
  { icon: CloudSun, label: 'Weather' },
  { icon: UtensilsCrossed, label: 'Food' },
  { icon: Banknote, label: 'Budget' },
  { icon: ShieldCheck, label: 'Safety' },
  { icon: BackpackIcon, label: 'Packing' },
  { icon: Camera, label: 'Photo spots' },
  { icon: Languages, label: 'Language' },
  { icon: Moon, label: 'Night mode' },
];

const ROADMAP = [
  ['Room & hotel booking', 'Neighbourhood guidance is live; live rates and booking arrive with a partner API.'],
  ['Crowd intelligence', 'Typical patterns ship today; real-time popular-times data needs a places provider.'],
  ['Currency conversion', 'Indicative reference rates now, live FX on connecting a rates API.'],
  ['Health-aware planning', 'Medication reminders and condition-aware destination filtering.'],
  ['Traveller matching', 'Opt-in connections between travellers with compatible styles and dates.'],
  ['Documents & visa', 'Per-nationality visa, permit and ID guidance for every state.'],
];

export function LandingPage() {
  const { activeTrip } = useTripStore();
  const featured = DESTINATIONS.slice(0, 6);
  const primaryCta = activeTrip ? `/trip/${activeTrip.id}` : '/onboarding';

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 [&>*]:min-w-0 lg:pb-24 lg:pt-20">
          <div className="animate-[var(--animate-rise)]">
            <Badge tone="saffron" className="mb-5">
              <Sparkles size={12} /> India-focused travel assistant
            </Badge>
            <h1 className="text-balance font-display text-[40px] leading-[1.04] tracking-[-0.02em] sm:text-[52px] lg:text-[60px]">
              Your personal travel assistant for India.
            </h1>
            <p className="mt-5 max-w-xl text-balance text-[17px] leading-relaxed text-ink-soft sm:text-lg">
              Plan smarter. Travel safer. Experience more. Tell us where you’re going and how you travel — we’ll handle
              the plan, the food, the budget, the safety brief and the bit where you need a hospital at 2am.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink to={primaryCta} size="lg">
                {activeTrip ? 'Open my trip' : 'Plan my trip'} <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink to="/explore" variant="outline" size="lg">
                Explore India
              </ButtonLink>
            </div>
            <p className="mt-5 text-[13px] text-ink-faint">
              No sign-up. Works without a single API key — sample data is labelled as sample, everywhere.
            </p>
          </div>

          <div className="relative">
            <Figure
              src="/img/jaipur-1400.jpg"
              srcSmall="/img/jaipur-560.jpg"
              alt="The jharokha-lined facade of Hawa Mahal in Jaipur, Rajasthan"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-[4/5] rounded-[28px] shadow-[var(--shadow-lift)] sm:aspect-[5/6]"
            >
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Rajasthan</p>
                <p className="mt-1 font-display text-[22px] leading-tight text-white">Hawa Mahal, Jaipur</p>
                <p className="mt-1.5 text-[13px] leading-snug text-white/75">
                  East-facing, so the light is best before 8am — exactly the kind of thing the planner schedules around.
                </p>
              </div>
            </Figure>

            <div className="absolute -left-6 top-10 hidden w-[218px] rotate-[-3deg] rounded-2xl border border-line bg-surface/95 p-4 shadow-[var(--shadow-lift)] backdrop-blur lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">Day 1 · 09:00</p>
              <p className="mt-1.5 font-display text-[16px] leading-tight">Amber Fort</p>
              <p className="mt-1 text-[12px] leading-snug text-ink-faint">
                2h 30m · ₹200 · quietest before 9am, packed by midday
              </p>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-saffron/12 blur-3xl"
        />
      </section>

      {/* ------------------------------ Journey ------------------------------ */}
      <section id="how" className="border-y border-line bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle
            eyebrow="How it works"
            title="One assistant across the whole journey"
            description="Discover, plan, prepare, travel, stay safe, manage, return. The same trip object carries you through all of it."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {JOURNEY.map(({ step, title, body }) => (
              <Card key={step} className="p-6" interactive>
                <span className="font-display text-[13px] font-semibold tracking-[0.16em] text-saffron">{step}</span>
                <h3 className="mt-3 font-display text-xl leading-tight">{title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">{body}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            {MODULES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] text-ink-soft"
              >
                <Icon size={14} aria-hidden className="text-saffron" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- Capabilities --------------------------- */}
      <section id="capabilities" className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle
            eyebrow="What it does"
            title="Built around the decisions travellers actually make"
            description="Not nineteen feature cards. Eight working capabilities that each change something about your day."
          />
          <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group bg-surface p-5 transition hover:bg-surface-2/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-saffron transition group-hover:bg-saffron-soft">
                  <Icon size={19} aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-[17px] leading-tight">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- Destinations --------------------------- */}
      <section className="border-y border-line bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle
            eyebrow="Destinations"
            title="Eight places, in proper depth"
            description="Each one ships with attractions, dishes, photo spots, safety guidance, phrases, stay areas, parking and a month-by-month climate read."
            action={
              <ButtonLink to="/explore" variant="outline" size="sm">
                See all destinations <ArrowRight size={14} />
              </ButtonLink>
            }
          />
          <div className="-mx-4 flex snap-x-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {featured.map((destination) => (
              <Link
                key={destination.id}
                to={`/destination/${destination.id}`}
                className="group w-[78vw] shrink-0 snap-start sm:w-auto"
              >
                <Figure
                  src={destination.heroImage}
                  srcSmall={destination.thumbnail}
                  alt={`${destination.name}, ${destination.state}`}
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
                  className="aspect-[4/3] rounded-2xl transition duration-500 group-hover:shadow-[var(--shadow-lift)]"
                  imgClassName="group-hover:scale-[1.04]"
                >
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/70">
                      {destination.state}
                    </p>
                    <p className="mt-0.5 font-display text-[20px] leading-tight text-white">{destination.name}</p>
                    <p className="mt-1 text-[12px] text-white/75">
                      {destination.idealDays[0]}–{destination.idealDays[1]} days ·{' '}
                      {formatINRCompact(destination.dailyBudgetINR.comfort)}/day
                    </p>
                  </div>
                </Figure>
                <p className="mt-2.5 line-clamp-2 px-0.5 text-[13.5px] leading-relaxed text-ink-soft">
                  {destination.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Honesty ------------------------------ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-14 [&>*]:min-w-0">
          <div>
            <SectionTitle
              eyebrow="Straight answers"
              title="We never show you sample data as if it were live"
              description="Weather, facility listings, crowd levels and exchange rates in this build are modelled or curated. Every panel that uses them says so, on the panel."
            />
            <div className="space-y-3">
              <div className="rounded-xl bg-warn-soft/70 px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft">
                <strong className="text-ink">Live data unavailable — showing sample information.</strong> Derived from
                monthly climate averages for each date. Connect a weather API for a real forecast.
              </div>
              <p className="text-[14px] leading-relaxed text-ink-soft">
                Every provider — weather, maps, places, stays, currency, content, assistant — sits behind an interface
                with a demo implementation and an environment variable. Add a key and the same screens switch to live,
                with the badge changing from amber to green. Nothing in the UI needs rewriting.
              </p>
              <p className="text-[14px] leading-relaxed text-ink-soft">
                One exception: India’s national emergency helplines are published, stable numbers. Those we state as
                fact.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl">On the roadmap</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Architected, with clean entry points, waiting on integrations rather than design.
            </p>
            <dl className="mt-5 divide-y divide-line overflow-hidden rounded-card border border-line">
              {ROADMAP.map(([title, body]) => (
                <div key={title} className="px-4 py-3.5">
                  <dt className="text-[14.5px] font-medium text-ink">{title}</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-ink-faint">{body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA -------------------------------- */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-line">
          <Figure
            src="/img/kerala-1400.jpg"
            srcSmall="/img/kerala-560.jpg"
            alt="A houseboat on the Alappuzha backwaters in Kerala"
            sizes="100vw"
            className="absolute inset-0 h-full w-full"
            overlay={false}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0b0f14]/92 via-[#0b0f14]/75 to-[#0b0f14]/35" />
          <div className="relative px-6 py-16 sm:px-12 sm:py-20">
            <h2 className="max-w-xl text-balance font-display text-[32px] leading-[1.08] text-white sm:text-[42px]">
              Your trip. One intelligent assistant.
            </h2>
            <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-white/75">
              Eight steps of onboarding, and you have a plan you can actually follow — then edit, spend against and
              travel with.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={primaryCta} variant="secondary" size="lg">
                {activeTrip ? 'Open my trip' : 'Plan my trip'} <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink
                to="/explore"
                size="lg"
                className="border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                Explore India
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
