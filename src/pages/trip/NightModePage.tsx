import { useEffect } from 'react';
import { Clock, Moon, Phone, ShieldAlert, TriangleAlert } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { useTripStore } from '@/store/tripStore';
import { NATIONAL_HELPLINES } from '@/data/emergencyNumbers';
import { isNightHours } from '@/utils/dates';

/**
 * Night mode is intentionally a different visual world — darker, higher
 * contrast, fewer things on screen, bigger targets. It is the one screen
 * someone might open one-handed, outdoors, in a hurry.
 */
export default function NightModePage() {
  const { destination } = useTripContext();
  const { nightMode, setNightMode } = useTripStore();
  const lateNow = isNightHours();

  useEffect(() => {
    if (lateNow && !nightMode) setNightMode(true);
  }, [lateNow, nightMode, setNightMode]);

  const openLate = [...destination.nightLife].sort((a, b) => a.name.localeCompare(b.name));
  const hospitals = destination.emergency.filter((service) => service.kind === 'hospital' || service.kind === 'police');
  const priority = NATIONAL_HELPLINES.filter((line) => line.priority).slice(0, 3);

  return (
    <div className="bg-[#0a0e18] text-[#e7ecf7]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1b2440] px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#9db4f0]">
              <Moon size={12} /> Night travel mode
            </span>
            <h1 className="mt-4 font-display text-[30px] leading-tight sm:text-[36px]">
              {destination.name} after dark
            </h1>
            <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-[#9fadc9]">
              What is open, how to move, and where not to be. Written for this city — not generic night-safety advice.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNightMode(!nightMode)}
            className="h-11 shrink-0 rounded-full border border-[#2b3657] bg-[#141c30] px-5 text-sm font-medium text-[#cdd8f0] transition hover:bg-[#1b2440] active:scale-[0.98]"
          >
            {nightMode ? 'Turn off night mode' : 'Keep night mode on'}
          </button>
        </div>

        {/* Emergency row — biggest targets on the screen */}
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {priority.map((line) => (
            <a
              key={line.id}
              href={`tel:${line.number}`}
              className="flex items-center gap-3 rounded-2xl bg-[#3b1420] px-4 py-4 ring-1 ring-[#7c2436] transition hover:bg-[#4b1a29]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e04257] text-white">
                <Phone size={18} />
              </span>
              <span>
                <span className="block font-display text-[24px] leading-none tabular-nums">{line.number}</span>
                <span className="mt-1 block text-[12.5px] text-[#e5b7bf]">{line.label}</span>
              </span>
            </a>
          ))}
        </div>

        <section className="mt-9">
          <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8fa3cc]">
            <ShieldAlert size={13} /> How this city behaves at night
          </h2>
          <ul className="mt-3 space-y-2.5">
            {destination.safety.nightGuidance.map((line, index) => (
              <li
                key={index}
                className="flex gap-3 rounded-2xl bg-[#121a2c] px-4 py-3.5 text-[14px] leading-relaxed text-[#c6d1e8]"
              >
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7f9df0]" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8fa3cc]">
            <Clock size={13} /> Open late
          </h2>
          <ul className="mt-3 divide-y divide-[#1e2740] overflow-hidden rounded-2xl bg-[#121a2c]">
            {openLate.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-[14.5px] font-medium">{entry.name}</p>
                    <span className="rounded-full bg-[#1e2740] px-2 py-0.5 text-[10.5px] uppercase tracking-wide text-[#8fa3cc]">
                      {entry.kind}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#9fadc9]">{entry.detail}</p>
                </div>
                <span className="shrink-0 text-[13px] font-medium tabular-nums text-[#7f9df0]">till {entry.openTill}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#e5a0ac]">
            <TriangleAlert size={13} /> Stay out of
          </h2>
          <ul className="mt-3 space-y-2.5">
            {destination.safety.avoidAreas.map((area) => (
              <li key={area.id} className="rounded-2xl bg-[#2a1520] px-4 py-3.5 ring-1 ring-[#53202f]">
                <p className="text-[14.5px] font-medium">{area.name}</p>
                <p className="mt-0.5 text-[12.5px] font-medium text-[#e58a9b]">{area.when}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#c6b2b8]">{area.why}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8fa3cc]">
            24-hour hospitals and police
          </h2>
          <ul className="mt-3 divide-y divide-[#1e2740] overflow-hidden rounded-2xl bg-[#121a2c]">
            {hospitals.map((service) => (
              <li key={service.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className="text-[14.5px] font-medium">{service.name}</p>
                  {service.open24h ? (
                    <span className="rounded-full bg-[#133026] px-2 py-0.5 text-[10.5px] uppercase tracking-wide text-[#6fd3a4]">
                      24h
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[12.5px] text-[#9fadc9]">{service.area}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8fa3cc]">
            If you are travelling alone
          </h2>
          <ul className="mt-3 space-y-2.5">
            {destination.safety.soloWomenNotes.map((line, index) => (
              <li
                key={index}
                className="flex gap-3 rounded-2xl bg-[#121a2c] px-4 py-3.5 text-[14px] leading-relaxed text-[#c6d1e8]"
              >
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8b45a]" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-9 rounded-2xl bg-[#121a2c] px-4 py-3.5 text-[12.5px] leading-relaxed text-[#8fa3cc]">
          Opening hours and service availability here are curated editorial data for this prototype, not live status.
          Confirm before relying on a late-night service. Helpline numbers are India’s published national numbers.
        </p>
      </div>
    </div>
  );
}
