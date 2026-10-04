# Safar — an AI travel assistant for India

> “Tell us where you’re going and how you travel. We’ll help you plan, navigate, eat, stay safe,
> manage your budget, and make the most of the trip.”

Safar is a travel planning and assistance platform built specifically for India, for both Indian
travellers and international visitors. Instead of juggling a maps app, a food app, a booking app,
a currency app and a half-remembered safety blog post, one trip object carries you through the
whole journey: **discover → plan → prepare → travel → explore → stay safe → manage → return.**

This repository is the working MVP of that product.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

That is the whole setup. **No API keys are required.** Every external integration has a demo
implementation, and the UI labels demo data as demo data everywhere it appears.

```bash
npm run build        # typecheck + production build
npm run preview      # serve the production build
npm run typecheck    # TypeScript only
npm run check        # runnable self-checks for the budget / packing / planner logic
```

Requires Node 20+.

---

## What works today

| Area | What it does |
| --- | --- |
| **Landing** | Product story, capability overview, destination strip, honest statement of what is and isn’t live. |
| **Onboarding** | Nine-step flow: destination, dates and origin, who’s travelling (and mobility needs), budget tier and total, interests, diet and spice tolerance, activities and pace, stay and transport, review. Progress bar, per-step validation, resumable back-navigation. |
| **Trip dashboard** | Greeting, countdown, trip card with weather, today’s plan, assistant briefing, budget snapshot, quick-access modules, all saved trips. |
| **Itinerary** | Generated day-by-day plan with times, durations, travel estimates, per-stop costs and a plain-language *why*. Reorder, retime, re-cost, delete, add a listed place or a custom stop, regenerate. Day route plotted on a schematic map. |
| **Budget** | Allocation donut by category, spend tracking, projection, 85% warning threshold, expense log, adjustable total, and a currency converter for international travellers. |
| **Weather** | Current conditions, trip-dates forecast, month-by-month climate table and a rules-based “is this good for what you planned?” verdict. |
| **Food & culture** | Dishes rather than restaurant cards: what it is, where to try it, price, dietary tags, and the cultural reason it exists. Filtered by diet and chilli tolerance. |
| **Safety centre** | Per-destination scams and hazards graded by severity, cultural norms, areas and hours to avoid, after-dark guidance, solo women travellers notes. |
| **Packing** | Checklist generated from destination, month, trip length, travel type, mobility needs and chosen activities — each item carries its reason. Checkable, extendable, regenerable. |
| **Photo spots** | Scenic locations with the hour the light works, shot type, how known they are, and permit notes. |
| **Language** | Per-destination phrasebook in the local languages, by category, with romanisation, clipboard copy and browser speech. |
| **Stays & parking** | Neighbourhood-level guidance with price bands and trade-offs, plus real parking locations and published rates. |
| **Nearby help** | Hospitals, police, pharmacies, ATMs, groceries, restrooms and tourist help desks, plotted and listed, alongside India’s national helplines. |
| **Night travel mode** | A visually distinct after-dark screen: big emergency targets, what is open late, how to get around, where not to be. |
| **Settings** | Integration status per provider, theme, data export, trip deletion, and a plain statement of the data-honesty rules. |

Eight destinations ship with full data: **Jaipur, Goa, Kerala, Mumbai, Delhi, Varanasi, Manali, Pune.**

---

## The data honesty rule

This is the constraint the architecture is built around: **nothing fabricated is ever presented as
live.**

* Every provider returns a `DataEnvelope<T>` carrying `source: 'live' | 'demo'`, the provider name,
  a timestamp and a note. The UI renders that envelope through `<DataSourceNote>`, so a panel
  cannot show sample data without saying so.
* **Weather** is modelled from each destination’s published monthly climate averages with a stable
  per-day jitter. It is never called a forecast.
* **Facility directories** name real, well-known public institutions and are ordered by
  straight-line distance. They are not live search results, and phone numbers appear only where a
  published helpline exists.
* **Travel times** are straight-line distance with a detour factor, flagged `routed: false`.
* **Exchange rates** are indicative and carry the date they were recorded.
* **Crowd levels** are typical visiting patterns, not live headcounts.
* **Stays** show neighbourhood price bands, and `StayProvider.canBook` is `false`, so no booking
  flow is offered.
* The map component states “schematic plot — not a live map” and links out to the traveller’s own
  map app.

The one exception: **India’s national emergency helplines** (112, 100, 108, 101, 1091, 1363, …) are
published, stable numbers and are stated as fact.

---

## Tech stack

| Choice | Why |
| --- | --- |
| **React 19 + TypeScript** | Asked for, and the domain model benefits from strict typing. |
| **Vite 8** | Fast dev server, native ESM, trivial env handling. No SSR need — this is an app behind a landing page, not a content site. |
| **Tailwind CSS v4** | Design tokens live in `@theme`; light/dark are two token sets, not an inverted filter. |
| **react-router-dom 7** | Nested layouts map exactly onto the trip-module structure. |
| **lucide-react** | Icons. |

Four runtime dependencies in total. No component library, no state library, no animation library —
React context plus `localStorage` covers the state, and CSS covers the motion.

---

## Architecture

```
src/
  components/
    destination/   panels shared by the destination page and the trip modules
    explore/       destination cards
    map/           SchematicMap (the swap point for a real maps SDK)
    onboarding/    wizard steps
    trip/          timeline, assistant panel, emergency access, nav config
    ui/            design-system primitives (Button, Card, Field, Sheet, …)
  data/            destination catalogue, language packs, helplines, preference options
  hooks/           useAsync, useLocalStorage, useMediaQuery, useTripContext
  layouts/         MarketingLayout, AppShell, TripLayout
  pages/           route components (all lazy except the landing page)
  services/
    assistant/     TravelAssistantService + rules engine + optional model proxy
    planner/       itinerary generator, budget maths, packing rules
    providers/     weather, places, maps, stays, currency, content
    config.ts      single place that decides whether a provider is live
  store/           TripProvider (trips, itinerary editing, expenses, packing), ThemeProvider
  types/           the whole domain model
  utils/           dates, formatting, geo, class names
```

### Provider interfaces

Each provider is an interface with a demo implementation and, where an obvious public API exists,
a live one. Swapping implementations never touches a component.

```ts
interface WeatherProvider {
  getCurrentWeather(destination: Destination, dateISO?: string): Promise<DataEnvelope<CurrentWeather>>;
  getForecast(destination: Destination, startISO: string, days: number): Promise<DataEnvelope<ForecastDay[]>>;
}

// src/services/providers/weather.ts
export const weatherProvider = PROVIDER_KEYS.openWeather
  ? new OpenWeatherProvider(PROVIDER_KEYS.openWeather, demoWeather)  // falls back on failure
  : demoWeather;
```

The same shape applies to `PlacesProvider`, `MapsProvider`, `StayProvider`, `CurrencyProvider`,
`ContentProvider` and `TravelAssistantService`.

### AI architecture

The product is AI-assisted, not LLM-dependent. Anything that is maths or rules stays deterministic:

| Deterministic | Where |
| --- | --- |
| Budget allocation, projection, warnings | `services/planner/budget.ts` |
| Packing list generation | `services/planner/packing.ts` |
| Itinerary generation, scoring, day grouping, re-timing | `services/planner/itinerary.ts` |
| Weather suitability verdicts | `services/providers/weather.ts` |
| Distance and travel time | `services/providers/maps.ts` |
| Crowd windows, emergency lookup | `services/providers/places.ts` |

`TravelAssistantService` is where a model can add value — natural-language questions about a trip.
`RuleBasedAssistant` is the default and answers from the trip’s own data. Setting
`VITE_ANTHROPIC_PROXY_URL` activates `ProxyModelAssistant`, which handles open-ended questions and
falls back to the rules engine on any failure. Itineraries, budgets and packing lists stay
deterministic either way.

### State and auth

One `TripProvider` context holds the traveller, the trips and the night-mode flag, persisted to
`localStorage`. There is **no authentication** in the MVP: a demo `Traveller` object has the same
shape a signed-in user would, so adding sign-in later means changing where that object comes from
and nothing else.

---

## Environment variables

Copy `.env.example` to `.env.local` and add whichever keys you have. All are optional; each missing
key simply leaves the corresponding provider on clearly-labelled demo data.

| Variable | Enables | Fallback without it |
| --- | --- | --- |
| `VITE_OPENWEATHER_API_KEY` | Live current conditions and forecast | Monthly climate averages, labelled as modelled |
| `VITE_GOOGLE_MAPS_API_KEY` | Interactive maps and real routing | Schematic coordinate plot, straight-line estimates |
| `VITE_GOOGLE_PLACES_API_KEY` | Live nearby hospitals, ATMs, pharmacies | Curated per-destination directory |
| `VITE_EXCHANGERATE_API_KEY` | Live FX rates | Indicative rates with their recorded date |
| `VITE_YOUTUBE_API_KEY` | Ranked destination videos | Pre-built YouTube search links |
| `VITE_HOTEL_API_KEY` | Live availability and booking | Neighbourhood price bands, nothing bookable |
| `VITE_ANTHROPIC_PROXY_URL` | Natural-language trip questions | Rules-based assistant |

`Settings → Integrations` shows the live/demo status of each one at runtime.

### Integration points

| To connect | Implement | Register in |
| --- | --- | --- |
| A weather API | `WeatherProvider` | `services/providers/weather.ts` |
| Maps / routing | `MapsProvider` + replace `SchematicMap`’s plot with a tile layer | `services/providers/maps.ts`, `components/map/SchematicMap.tsx` |
| Places / nearby help | `PlacesProvider` | `services/providers/places.ts` |
| Hotel booking | `StayProvider` (set `canBook: true` to unlock booking UI) | `services/providers/stays.ts` |
| Currency | `CurrencyProvider` | `services/providers/currency.ts` |
| Travel content | `ContentProvider` | `services/providers/content.ts` |
| An LLM | `TravelAssistantService` | `services/assistant/travelAssistant.ts` |

A model proxy should accept `POST { question, trip }` and return `{ headline, detail: string[] }`.
Keep your API key on the server; the client never sees it.

---

## Roadmap

Architected with UI entry points in place, waiting on integrations rather than design:

1. **Hotel and room booking** — live rates and reservations behind `StayProvider`.
2. **Crowd intelligence** — real-time popular-times data replacing typical patterns.
3. **Currency** — live FX, and guidance on authorised exchange.
4. **Health-aware planning** — condition-aware destination filtering, medication reminders.
5. **Travel content** — ranked, embeddable destination videos.
6. **Traveller matching** — opt-in connections between compatible travellers (needs accounts,
   consent and moderation before it ships).
7. **One-tap emergency assist** — live location sharing with a chosen contact; deliberately not
   faked, since it needs consent flows, a backend and regulatory review.
8. **Documents and visa guidance** — per-nationality visa, permit and ID requirements.
9. **Accounts and sync** — so a trip follows you to your phone.

---

## Accessibility and performance notes

* Semantic HTML with exactly one `<h1>` per route; `<dialog>` for modals (focus trap, Escape and
  backdrop for free); `<details>` for disclosures.
* Keyboard-navigable throughout, visible focus rings, ARIA roles on custom checkboxes, radio groups
  and progress bars.
* `prefers-reduced-motion` disables animation globally.
* Every route except the landing page is lazy-loaded; images ship at two widths with `srcset`, lazy
  loading and a tinted placeholder.
* Loading, empty and error states with retry on every provider-backed panel.

---

## Testing

```bash
npm run check
```

Runs the self-checks embedded in the budget, packing and itinerary modules — allocation maths,
spend tracking, over-budget detection, packing rule triggers and day distribution. They are plain
`assert`-style checks with no test framework.

The build was additionally validated end to end in a headless browser: every route, the full
onboarding flow, itinerary editing, budget logging, packing persistence, filters, the dark theme,
mobile layout at 390px, internal link integrity and a zero-console-error check.

---

## Image credits

Destination photography in `public/img/` comes from Wikimedia Commons and is resized for this
build. Each file’s source page is listed in `public/img/SOURCES.txt`; licences are as published on
Commons. Check the individual file page before any commercial use.
