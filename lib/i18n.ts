/**
 * Lightweight i18n for Phase 1.
 */

export type Language = 'de' | 'en';

export const dictionaries = {
  de: {
    'header.title': 'wo2go',
    'header.subtitle': 'Direkte Bahnverbindungen in ganz Deutschland',
    'home.tagline':
      'Wähle einen Bahnhof — sieh alle Ziele mit Direktverbindung in den nächsten 12 Stunden.',
    'home.searchPlaceholder': 'Bahnhof suchen…',
    'home.searching': 'Suche…',
    'home.searchEmpty': 'Kein Bahnhof gefunden',
    'home.suggestion': 'Vorschlag',
    'home.popularTitle': 'Beliebte Bahnhöfe',
    'station.back': 'Alle Bahnhöfe',
    'station.from': 'Direktverbindungen ab',
    'filter.regional': 'Nur Regionalverkehr (D-Ticket)',
    'filter.majorStations': 'Nur Hbf und große Bahnhöfe',
    'filter.highSpeed': 'Nur Hochgeschwindigkeitszüge (IC, ICE)',
    'filter.countLabel': 'Ziele · nächste 12 Stunden',
    'filter.clear': 'Filter zurücksetzen',
    'empty.title': 'Keine Ziele entsprechen diesen Filtern',
    'empty.cta': 'Filter zurücksetzen',
    'error.title': 'Daten konnten nicht geladen werden',
    'error.subtitle':
      'Wir können im Moment keine Zugdaten laden. Bitte versuche es erneut oder lade die Seite neu. Wenn das Problem bestehen bleibt, warte ein paar Minuten.',
    'error.retry': 'Erneut versuchen',
    'destination.connections': 'Verbindungen',
    'footer.builtBy': 'Erstellt von',
    'footer.dataSource': 'Daten von',
    'footer.inspiration': 'Inspiriert von',
  },
  en: {
    'header.title': 'wo2go',
    'header.subtitle': 'Direct train connections across Germany',
    'home.tagline':
      'Pick a station — see every destination reachable on a direct train in the next 12 hours.',
    'home.searchPlaceholder': 'Search for a station…',
    'home.searching': 'Searching…',
    'home.searchEmpty': 'No station found',
    'home.suggestion': 'Suggestion',
    'home.popularTitle': 'Popular stations',
    'station.back': 'All stations',
    'station.from': 'Direct connections from',
    'filter.regional': 'Regional only (D-Ticket)',
    'filter.majorStations': 'Hbf and major stations only',
    'filter.highSpeed': 'High-speed only (IC, ICE)',
    'filter.countLabel': 'destinations · next 12 hours',
    'filter.clear': 'Clear filters',
    'empty.title': 'No destinations match these filters',
    'empty.cta': 'Clear filters',
    'error.title': 'Could not load data',
    'error.subtitle':
      'We can’t load train data right now. Please try again or reload the page. If the problem continues, try again in a few minutes.',
    'error.retry': 'Retry',
    'destination.connections': 'connections',
    'footer.builtBy': 'Built by',
    'footer.dataSource': 'Data from',
    'footer.inspiration': 'Inspired by',
  },
} as const;

export type TranslationKey = keyof (typeof dictionaries)['de'];
