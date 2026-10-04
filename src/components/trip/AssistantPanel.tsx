import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader, Send, Sparkles } from 'lucide-react';
import type { CurrentWeather, Destination, Trip } from '@/types';
import {
  SUGGESTED_QUESTIONS, travelAssistant, type AssistantAnswer,
} from '@/services/assistant/travelAssistant';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/**
 * The assistant surface. Deliberately not a chat window: it answers from the
 * trip's own data, says which basis it used, and always points at the screen
 * where the traveller can act.
 */
export function AssistantPanel({
  trip,
  destination,
  weather,
}: {
  trip: Trip;
  destination: Destination;
  weather?: CurrentWeather;
}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AssistantAnswer>();
  const [thinking, setThinking] = useState(false);

  const ask = async (value: string) => {
    const text = value.trim();
    if (!text) return;
    setThinking(true);
    setQuestion(text);
    try {
      setAnswer(await travelAssistant.ask(text, { trip, destination, weather }));
    } finally {
      setThinking(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Ask about this trip"
        subtitle={travelAssistant.usesModel ? 'Model-backed, grounded in your trip data' : 'Answered from your trip data and the destination guide'}
        icon={<Sparkles size={16} />}
      />

      <form
        className="px-5 pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
      >
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Am I on track with my budget?"
            aria-label="Ask about this trip"
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-[14px] placeholder:text-ink-faint/70 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/25"
          />
          <button
            type="submit"
            disabled={thinking || !question.trim()}
            aria-label="Ask"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition hover:bg-ink/90 disabled:opacity-40"
          >
            {thinking ? <Loader size={16} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-1.5 px-5 pt-3">
        {SUGGESTED_QUESTIONS.slice(0, 4).map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => void ask(suggestion)}
            className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-soft transition hover:border-line-strong hover:text-ink"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="px-5 pb-5 pt-4" aria-live="polite">
        {thinking ? (
          <p className="text-[13.5px] text-ink-faint">Checking your trip…</p>
        ) : answer ? (
          <div className="rounded-2xl bg-surface-2/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-medium leading-snug text-ink">{answer.headline}</p>
              <Badge tone={answer.basis === 'model' ? 'indigo' : 'neutral'} className="shrink-0">
                {answer.basis === 'model' ? 'Model' : 'Rules'}
              </Badge>
            </div>
            {answer.detail.length ? (
              <ul className="mt-2.5 space-y-1.5">
                {answer.detail.map((line, index) => (
                  <li key={index} className="text-[13.5px] leading-relaxed text-ink-soft">
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
            {answer.action ? (
              <Link
                to={answer.action.to}
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-saffron transition hover:gap-2.5"
              >
                {answer.action.label} <ArrowRight size={13} />
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-ink-faint">
            Budget, weather, food, safety, packing, transport and nearby help are all answered deterministically from
            your own trip — no model required, nothing invented.
          </p>
        )}
      </div>
    </Card>
  );
}

export function BriefingList({
  trip,
  destination,
  weather,
}: {
  trip: Trip;
  destination: Destination;
  weather?: CurrentWeather;
}) {
  const briefing = travelAssistant.dailyBriefing({ trip, destination, weather });
  if (!briefing.length) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {briefing.slice(0, 4).map((entry, index) => (
        <li key={index} className="rounded-card border border-line bg-surface p-4">
          <p className="text-[14.5px] font-medium leading-snug text-ink">{entry.headline}</p>
          {entry.detail[0] ? (
            <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">{entry.detail[0]}</p>
          ) : null}
          {entry.action ? (
            <Link
              to={entry.action.to}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-saffron transition hover:gap-2"
            >
              {entry.action.label} <ArrowRight size={12} />
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
