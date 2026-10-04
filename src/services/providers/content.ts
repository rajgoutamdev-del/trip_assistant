import type { DataEnvelope, Destination, TravelVideo } from '@/types';

export interface ContentProvider {
  readonly name: string;
  getDestinationContent(destination: Destination): Promise<DataEnvelope<TravelVideo[]>>;
}

const TOPICS = [
  { topic: 'City guide', query: (name: string) => `${name} travel guide` },
  { topic: 'Street food', query: (name: string) => `${name} street food tour` },
  { topic: 'Itinerary', query: (name: string) => `${name} 3 day itinerary` },
  { topic: 'Budget tips', query: (name: string) => `${name} budget travel tips` },
  { topic: 'Safety & scams', query: (name: string) => `${name} travel scams what to avoid` },
  { topic: 'Culture', query: (name: string) => `${name} culture and festivals` },
];

/**
 * Demo content provider. Rather than inventing video titles, channels and view
 * counts, it hands back real YouTube *search* links per topic — honest, useful,
 * and replaced wholesale once a Data API key is configured.
 */
export class SearchLinkContentProvider implements ContentProvider {
  readonly name = 'YouTube search links (demo)';

  async getDestinationContent(destination: Destination): Promise<DataEnvelope<TravelVideo[]>> {
    const data: TravelVideo[] = TOPICS.map(({ topic, query }) => {
      const q = query(`${destination.name} ${destination.state === destination.name ? '' : destination.state}`.trim());
      return {
        id: `${destination.id}-${topic.toLowerCase().replace(/\W+/g, '-')}`,
        title: `${topic} — ${destination.name}`,
        channel: 'Search on YouTube',
        durationLabel: 'Opens a search',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
        topic,
      };
    });

    return {
      data,
      source: 'demo',
      provider: this.name,
      fetchedAt: new Date().toISOString(),
      note: 'These open YouTube searches rather than specific videos. Connect the YouTube Data API to rank and embed real results.',
    };
  }
}

export const contentProvider: ContentProvider = new SearchLinkContentProvider();