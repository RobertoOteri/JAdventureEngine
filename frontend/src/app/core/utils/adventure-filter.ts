import { GraphicAdventureDto } from '../models';

export type AdventureSort = 'recent' | 'oldest' | 'title-asc' | 'title-desc';
export type PublicationFilter = 'all' | 'never' | 'published';

export interface AdventureFilter {
  query: string;
  sort: AdventureSort;
  publication?: PublicationFilter;
}

export const ADVENTURE_SORT_OPTIONS: { value: AdventureSort; label: string }[] = [
  { value: 'recent', label: 'Più recenti' },
  { value: 'oldest', label: 'Meno recenti' },
  { value: 'title-asc', label: 'Titolo A-Z' },
  { value: 'title-desc', label: 'Titolo Z-A' }
];

export const PUBLICATION_OPTIONS: { value: PublicationFilter; label: string }[] = [
  { value: 'all', label: 'Tutte' },
  { value: 'never', label: 'Inedite' },
  { value: 'published', label: 'Pubblicate' }
];

export function filterAdventures(
  adventures: GraphicAdventureDto[],
  filter: AdventureFilter
): GraphicAdventureDto[] {
  const query = normalize(filter.query);

  return adventures
    .filter((a) => !query || matchesQuery(a, query))
    .filter((a) => matchesPublication(a, filter.publication ?? 'all'))
    .sort(comparator(filter.sort));
}

function matchesQuery(adventure: GraphicAdventureDto, query: string): boolean {
  return [adventure.title, adventure.description, adventure.authorUsername]
    .some((field) => !!field && normalize(field).includes(query));
}

function matchesPublication(adventure: GraphicAdventureDto, publication: PublicationFilter): boolean {
  const version = adventure.versionNumber ?? 1;
  switch (publication) {
    case 'never':
      return version === 1;
    case 'published':
      return version > 1;
    default:
      return true;
  }
}

function comparator(sort: AdventureSort): (a: GraphicAdventureDto, b: GraphicAdventureDto) => number {
  switch (sort) {
    case 'oldest':
      return (a, b) => dateOf(a) - dateOf(b);
    case 'title-asc':
      return (a, b) => a.title.localeCompare(b.title, 'it', { sensitivity: 'base' });
    case 'title-desc':
      return (a, b) => b.title.localeCompare(a.title, 'it', { sensitivity: 'base' });
    default:
      return (a, b) => dateOf(b) - dateOf(a);
  }
}

function dateOf(adventure: GraphicAdventureDto): number {
  return Date.parse(adventure.publishedAt ?? adventure.createdAt ?? '') || 0;
}

/** minuscolo e senza accenti: "Città" trova "citta" */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
