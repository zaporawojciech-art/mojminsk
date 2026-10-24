import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  Bus,
  Clock,
  Compass,
  Info,
  MapPin,
  Phone,
} from 'lucide-react';
import { cn } from '../components/ui';
import { type LineId, busLines } from '../data/mockData';

interface ZditmScreenProps {
  onBack: () => void;
  initialLine?: LineId;
  isClosing?: boolean;
}

export function ZditmScreen({ onBack, initialLine = 'M2', isClosing = false }: ZditmScreenProps) {
  const [lineId, setLineId] = useState<LineId>(initialLine);
  const [directionIdx, setDirectionIdx] = useState<0 | 1>(0);
  const [dayType, setDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');
  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(0);

  const line = busLines.find((l) => l.id === lineId)!;
  const currentDirection = line.directions[directionIdx];
  const stops = line.stopsDetails;
  const selectedStop = stops[selectedStopIdx] ?? stops[0];

  // Colors for line badges
  const lineBadgeColors: Record<LineId, string> = {
    M2: 'bg-sky text-ink',
    M3: 'bg-sand text-ink',
    M4: 'bg-coral text-ink',
  };

  // Generate SVG path points from stopsDetails
  const pathD = stops.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x * 3.4 + 20} ${pt.y * 1.8 + 20}` : `${acc} L ${pt.x * 3.4 + 20} ${pt.y * 1.8 + 20}`;
  }, '');

  // Calculate live upcoming departures for selected stop
  const shift = (selectedStopIdx * 3) % 20;
  const liveOffsets = line.offsets.map((o) => (o + shift) % 60);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain bg-mist pb-24">
        {/* Header */}
      <header className="sticky top-0 z-20 border-b border-mist-300 bg-white/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Wróć"
            className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[18px] font-semibold text-ink">Rozkład ZDiTM</h1>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800">
                100% Bezpłatna
              </span>
            </div>
            <p className="text-[11.5px] text-ink-500">Komunikacja Miejska w Mińsku Mazowieckim</p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-5">
        {/* Line Tabs */}
        <div className="grid grid-cols-3 gap-2 rounded-3xl bg-white p-2 shadow-card">
          {busLines.map((l) => {
            const active = lineId === l.id;
            return (
              <button
                key={l.id}
                onClick={() => {
                  setLineId(l.id);
                  setSelectedStopIdx(0);
                }}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-all active:scale-95',
                  active ? 'bg-ink text-white shadow-card' : 'bg-mist text-ink hover:bg-mist-200',
                )}
              >
                <span className={cn('rounded-lg px-2.5 py-0.5 text-[13px] font-extrabold', lineBadgeColors[l.id])}>
                  {l.id}
                </span>
                <span className="text-[11px] font-semibold opacity-80 truncate max-w-[85px]">
                  {l.id === 'M2' ? 'Serbinów' : l.id === 'M3' ? 'Osiedlowa' : 'Anielina'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Direction & Day Selector */}
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Trasa i kierunek</span>
            <button
              onClick={() => setDirectionIdx((d) => (d === 0 ? 1 : 0))}
              className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-[11.5px] font-bold text-ink transition-transform active:scale-95 hover:bg-mist-200"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-coral" />
              Zmień kierunek
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-100 text-coral-700">
              <Bus className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-bold text-ink truncate">{currentDirection.destination}</p>
              <p className="text-[12px] text-ink-500 truncate">{currentDirection.name} · {currentDirection.frequency}</p>
            </div>
          </div>

          {/* Day Type Selector */}
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-mist p-1">
            <button
              onClick={() => setDayType('weekday')}
              className={cn(
                'rounded-xl py-2 text-[12px] font-bold transition-all',
                dayType === 'weekday' ? 'bg-white text-ink shadow-sm' : 'text-ink-500',
              )}
            >
              Dni robocze
            </button>
            <button
              onClick={() => setDayType('saturday')}
              className={cn(
                'rounded-xl py-2 text-[12px] font-bold transition-all',
                dayType === 'saturday' ? 'bg-white text-ink shadow-sm' : 'text-ink-500',
              )}
            >
              Soboty
            </button>
            <button
              onClick={() => setDayType('sunday')}
              className={cn(
                'rounded-xl py-2 text-[12px] font-bold transition-all',
                dayType === 'sunday' ? 'bg-white text-ink shadow-sm' : 'text-ink-500',
              )}
            >
              Niedziele
            </button>
          </div>
        </div>

        {/* Interactive SVG Route Map with Live Bus GPS Pin */}
        <div className="relative overflow-hidden rounded-4xl bg-ink p-4 text-white shadow-float">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-sand" />
              <span className="text-[12px] font-bold tracking-wider text-sand uppercase">
                Mapa trasy linii {line.id}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-coral">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
              </span>
              Autobus na trasie
            </span>
          </div>

          {/* SVG Map Container */}
          <div className="relative my-2 h-44 w-full rounded-3xl bg-[#171520] p-2 overflow-hidden border border-white/10">
            {/* Grid background lines */}
            <svg className="absolute inset-0 h-full w-full opacity-10" width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* City landmark labels */}
            <div className="pointer-events-none absolute left-4 top-3 text-[10px] font-extrabold tracking-wider text-white/30 uppercase">
              PKP Mińsk Mazowiecki
            </div>
            <div className="pointer-events-none absolute right-4 bottom-3 text-[10px] font-extrabold tracking-wider text-white/30 uppercase">
              Serbinów / FUD
            </div>

            {/* Route Polyline and Points */}
            <svg viewBox="0 0 380 180" className="relative h-full w-full">
              {/* Glow line */}
              <path
                d={pathD}
                fill="none"
                stroke={line.colorHex}
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-20 blur-sm"
              />
              {/* Solid line */}
              <path
                d={pathD}
                fill="none"
                stroke={line.colorHex}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 4"
              />

              {/* Stop Nodes */}
              {stops.map((st, i) => {
                const cx = st.x * 3.4 + 20;
                const cy = st.y * 1.8 + 20;
                const active = i === selectedStopIdx;
                return (
                  <g
                    key={st.name}
                    className="cursor-pointer"
                    onClick={() => setSelectedStopIdx(i)}
                  >
                    {active && (
                      <circle cx={cx} cy={cy} r="10" fill={line.colorHex} opacity="0.35" className="animate-ping" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={active ? '6' : '4'}
                      fill={active ? '#FFFFFF' : line.colorHex}
                      stroke="#1F1D2B"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}

              {/* Live Bus Marker floating at stop 3 */}
              <g transform="translate(180, 100)" className="animate-pulse">
                <circle cx="0" cy="0" r="12" fill="#F26659" opacity="0.4" />
                <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#F26659" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#1F1D2B" fontSize="9" fontWeight="bold">
                  🚌
                </text>
              </g>
            </svg>
          </div>

          <p className="text-center text-[11.5px] text-white/70">
            Kliknij punkt na trasie, aby sprawdzić godziny odjazdów z wybranego przystanku.
          </p>
        </div>

        {/* Selected Stop Timetable Detail */}
        <div className="rounded-3xl bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-white">
                <MapPin className="h-5 w-5 text-coral" />
              </span>
              <div>
                <span className="text-[11.5px] font-bold text-coral-700 uppercase tracking-wider">
                  Przystanek {selectedStopIdx + 1} z {stops.length}
                </span>
                <h2 className="font-display text-[18px] font-bold text-ink">{selectedStop.name}</h2>
                <p className="text-[12px] text-ink-500">Strefa: {selectedStop.zone}</p>
              </div>
            </div>

            {selectedStop.isTransfer && (
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-800">
                Węzeł przesiadkowy
              </span>
            )}
          </div>

          {/* Live Next Departures Pill Bar */}
          <div className="mt-4 rounded-2xl bg-coral-50 p-3.5">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-coral-700">
              <Clock className="h-4 w-4" />
              Najbliższe odjazdy na żywo:
            </div>
            <div className="mt-2 flex gap-2">
              {liveOffsets.slice(0, 3).map((mins, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-xl bg-white p-2.5 text-center shadow-sm"
                >
                  <p className="font-display text-[19px] font-extrabold text-coral-700">
                    za {mins} min
                  </p>
                  <span className="text-[10px] font-semibold text-ink-400">Punktualnie</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Schedule Hours Matrix */}
          <div className="mt-4 border-t border-mist pt-4">
            <p className="text-[12.5px] font-bold uppercase tracking-wider text-ink-400">
              Pełny rozkład ({dayType === 'weekday' ? 'Dni robocze' : dayType === 'saturday' ? 'Soboty' : 'Niedziele'})
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {currentDirection.departures[dayType].map((time) => (
                <div
                  key={time}
                  className="rounded-xl bg-mist p-2 text-center text-[13px] font-bold text-ink"
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Free Ride Info & Contact Dispatcher */}
        <div className="rounded-3xl bg-sand-100 p-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-sand-700" />
            <p className="text-[13px] font-bold text-ink">Bezpłatne przejazdy dla każdego</p>
          </div>
          <p className="mt-1 text-[12px] text-ink-700 leading-snug">
            Nie potrzebujesz biletu ani kasownika. Komunikacja miejska w Mińsku Mazowieckim jest w 100%
            finansowana z budżetu miasta.
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-sand-200 pt-2 text-[12px]">
            <span className="font-medium text-ink-500">Dyspozytornia ZDiTM:</span>
            <a href="tel:257582044" className="font-bold text-ink flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              25 758 20 44
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
