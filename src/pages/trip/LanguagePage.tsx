import { useTripContext } from '@/hooks/useTripContext';
import { PhraseBook } from '@/components/destination/panels';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { ComingSoon } from '@/components/ui/States';

export default function LanguagePage() {
  const { destination } = useTripContext();

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Language"
        title={`Getting by in ${destination.name}`}
        description={`Spoken here: ${destination.languages.join(', ')}. English works in most tourist-facing places; a few words of the local language changes how you are treated.`}
      />

      <PhraseBook packs={destination.languagePacks} />

      <Card className="mt-6">
        <CardHeader title="Worth knowing" subtitle="Beyond the phrases" />
        <ul className="space-y-2.5 px-5 pb-5 pt-3 text-[13.5px] leading-relaxed text-ink-soft">
          <li>Head movements differ: a side-to-side tilt often means yes or “go on”, not no.</li>
          <li>“Ji” added to a name or a yes is a politeness marker, and lands well everywhere in the north.</li>
          <li>Numbers are often spoken in lakhs and crores — one lakh is 100,000, one crore is 10 million.</li>
          <li>Writing a destination down in the local script is the fastest way past a language gap with a driver.</li>
        </ul>
      </Card>

      <div className="mt-5">
        <ComingSoon
          title="Live translation & offline packs"
          description="Camera translation, two-way speech and downloadable offline phrase packs sit behind a translation provider interface. The phrasebook here is hand-written per destination and works with no network."
        />
      </div>
    </div>
  );
}
