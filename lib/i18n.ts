/**
 * Lightweight i18n for Phase 1.
 *
 * A typed dictionary with ~15 strings and a context-based hook.
 * Sufficient for Phase 1; can be swapped for a real i18n library
 * (e.g., next-intl) if the dictionary grows significantly.
 */

export type Language = 'de' | 'en';

export const dictionaries = {
  de: {
    'header.title': 'wo2go',
    'header.subtitle': 'Direkte Bahnverbindungen ab Saarbrücken Hbf',
    'filter.regional': 'Nur Regionalverkehr (D-Ticket)',
    'filter.majorStations': 'Nur Hbf und große Bahnhöfe',
    'filter.countLabel': 'Ziele · nächste 12 Stunden',
    'filter.clear': 'Filter zurücksetzen',
    'empty.title': 'Keine Ziele entsprechen diesen Filtern',
    'empty.cta': 'Filter zurücksetzen',
    'error.title': 'Daten konnten nicht geladen werden',
    'error.retry': 'Erneut versuchen',
    'destination.connections': 'Verbindungen',
    'footer.builtBy': 'Erstellt von',
    'footer.dataSource': 'Daten von',
    'footer.inspiration': 'Inspiriert von',
  },
  en: {
    'header.title': 'wo2go',
    'header.subtitle': 'Direct train connections from Saarbrücken Hbf',
    'filter.regional': 'Regional only (D-Ticket)',
    'filter.majorStations': 'Hbf and major stations only',
    'filter.countLabel': 'destinations · next 12 hours',
    'filter.clear': 'Clear filters',
    'empty.title': 'No destinations match these filters',
    'empty.cta': 'Clear filters',
    'error.title': 'Could not load data',
    'error.retry': 'Retry',
    'destination.connections': 'connections',
    'footer.builtBy': 'Built by',
    'footer.dataSource': 'Data from',
    'footer.inspiration': 'Inspired by',
  },
} as const;

export type TranslationKey = keyof (typeof dictionaries)['de'];
