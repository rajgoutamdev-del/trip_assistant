/**
 * Government-published national helplines for India. These are stable public
 * numbers, not generated demo data — they are the one category of contact
 * information the app states as fact.
 * Source: National Emergency Response System / Ministry of Home Affairs.
 */
export interface Helpline {
  id: string;
  label: string;
  number: string;
  detail: string;
  priority: boolean;
}

export const NATIONAL_HELPLINES: Helpline[] = [
  {
    id: 'ners',
    label: 'All emergencies (ERSS)',
    number: '112',
    detail: 'Single national emergency number — police, fire and ambulance.',
    priority: true,
  },
  { id: 'police', label: 'Police', number: '100', detail: 'State police control room.', priority: true },
  { id: 'ambulance', label: 'Ambulance', number: '108', detail: 'Emergency medical response.', priority: true },
  { id: 'fire', label: 'Fire', number: '101', detail: 'Fire and rescue services.', priority: false },
  {
    id: 'women',
    label: 'Women’s helpline',
    number: '1091',
    detail: 'Police women’s helpline, available nationwide.',
    priority: true,
  },
  {
    id: 'tourist',
    label: 'Tourist helpline',
    number: '1363',
    detail: 'Ministry of Tourism multilingual helpline (also +91-11-1363).',
    priority: true,
  },
  { id: 'child', label: 'Childline', number: '1098', detail: 'Help for children in distress.', priority: false },
  {
    id: 'disaster',
    label: 'Disaster management',
    number: '1078',
    detail: 'National Disaster Management helpline.',
    priority: false,
  },
  {
    id: 'railway',
    label: 'Railway security',
    number: '139',
    detail: 'Indian Railways enquiry and security helpline.',
    priority: false,
  },
  {
    id: 'road',
    label: 'Highway assistance',
    number: '1033',
    detail: 'National highway road accident and towing assistance.',
    priority: false,
  },
];
