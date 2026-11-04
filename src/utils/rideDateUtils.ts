// Utility functions for Carpooling ride dates

const MONTH_NAMES_SHORT = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
];

const DAY_NAMES_SHORT = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
const DAY_NAMES_FULL = [
  'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa',
  'Czwartek', 'Piątek', 'Sobota',
];

export function toIsoDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayIso(): string {
  return toIsoDateString(new Date());
}

export function getTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toIsoDateString(d);
}

export function parseIsoDate(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map((v) => parseInt(v, 10));
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Returns human-friendly Polish label for a ride date
 * Examples:
 * - "Dziś, 4 lis"
 * - "Jutro, 5 lis"
 * - "Pt, 6 lis"
 * - "Pn – Pt (dni robocze)"
 */
export function formatRideDate(rawDate?: string): string {
  if (!rawDate) return 'Jutro';

  const todayIso = getTodayIso();
  const tomorrowIso = getTomorrowIso();

  const lower = rawDate.toLowerCase().trim();
  if (lower === 'today' || lower === 'dziś' || lower === 'dzis' || rawDate === todayIso) {
    const today = new Date();
    return `Dziś, ${today.getDate()} ${MONTH_NAMES_SHORT[today.getMonth()]}`;
  }

  if (lower === 'tomorrow' || lower === 'jutro' || rawDate === tomorrowIso) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `Jutro, ${tomorrow.getDate()} ${MONTH_NAMES_SHORT[tomorrow.getMonth()]}`;
  }

  if (lower === 'weekdays' || lower.includes('pn') || lower.includes('robocz')) {
    return 'Pn – Pt (dni robocze)';
  }

  const parsed = parseIsoDate(rawDate);
  if (parsed) {
    const dayName = DAY_NAMES_SHORT[parsed.getDay()];
    const dayNum = parsed.getDate();
    const month = MONTH_NAMES_SHORT[parsed.getMonth()];
    return `${dayName}, ${dayNum} ${month}`;
  }

  return rawDate;
}

/**
 * Returns full readable label (e.g. for input display or confirmation)
 */
export function formatRideDateFull(rawDate?: string): string {
  if (!rawDate) return 'Jutro';

  const lower = rawDate.toLowerCase().trim();
  if (lower === 'weekdays' || lower.includes('pn') || lower.includes('robocz')) {
    return 'Codziennie: Pn – Pt (dni robocze)';
  }

  const todayIso = getTodayIso();
  const tomorrowIso = getTomorrowIso();

  if (lower === 'today' || lower === 'dziś' || lower === 'dzis' || rawDate === todayIso) {
    const today = new Date();
    return `Dziś (${DAY_NAMES_FULL[today.getDay()]}, ${today.getDate()} ${MONTH_NAMES_SHORT[today.getMonth()]})`;
  }

  if (lower === 'tomorrow' || lower === 'jutro' || rawDate === tomorrowIso) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `Jutro (${DAY_NAMES_FULL[tomorrow.getDay()]}, ${tomorrow.getDate()} ${MONTH_NAMES_SHORT[tomorrow.getMonth()]})`;
  }

  const parsed = parseIsoDate(rawDate);
  if (parsed) {
    const dayName = DAY_NAMES_FULL[parsed.getDay()];
    const dayNum = parsed.getDate();
    const month = MONTH_NAMES_SHORT[parsed.getMonth()];
    return `${dayName}, ${dayNum} ${month}`;
  }

  return rawDate;
}

export function getRideDateBadgeStyle(rawDate?: string): {
  bg: string;
  text: string;
  border: string;
} {
  const formatted = formatRideDate(rawDate);
  if (formatted.startsWith('Dziś')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200/90',
    };
  }
  if (formatted.includes('Pn – Pt')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-200/90',
    };
  }
  return {
    bg: 'bg-sky-50',
    text: 'text-sky-900',
    border: 'border-sky-200/90',
  };
}

/**
 * Checks if a ride matches the given filter
 */
export function doesRideMatchDateFilter(rideDate: string | undefined, filter: string): boolean {
  if (!filter || filter === 'all') return true;

  const todayIso = getTodayIso();
  const tomorrowIso = getTomorrowIso();

  const rDate = (rideDate || 'tomorrow').toLowerCase().trim();
  const isRideToday = rDate === 'today' || rDate === 'dziś' || rDate === 'dzis' || rDate === todayIso;
  const isRideTomorrow = rDate === 'tomorrow' || rDate === 'jutro' || rDate === tomorrowIso;
  const isRideWeekdays = rDate === 'weekdays' || rDate.includes('pn') || rDate.includes('robocz');

  if (filter === 'today') {
    return isRideToday;
  }
  if (filter === 'tomorrow') {
    return isRideTomorrow;
  }
  if (filter === 'weekdays') {
    return isRideWeekdays;
  }

  // Exact ISO date filter (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(filter)) {
    if (filter === todayIso && isRideToday) return true;
    if (filter === tomorrowIso && isRideTomorrow) return true;
    if (rDate === filter) return true;

    // If ride is a weekday ride, check if filter date is a weekday (Mon-Fri)
    if (isRideWeekdays) {
      const filterDate = parseIsoDate(filter);
      if (filterDate) {
        const day = filterDate.getDay();
        return day >= 1 && day <= 5; // Monday to Friday
      }
    }
  }

  return false;
}
