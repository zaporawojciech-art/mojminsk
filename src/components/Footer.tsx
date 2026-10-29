import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Bus,
  Car,
  ChevronDown,
  Download,
  Mail,
  MessagesSquare,
  Phone,
  ShieldCheck,
  Vote,
} from 'lucide-react';
import type { TabId } from './BottomNav';
import type { LineId } from '../data/mockData';
import { TAB_PATHS } from '../router/urlUtils';
import { cn } from './ui';

export interface FooterProps {
  onTabChange?: (tab: TabId) => void;
  onOpenZditm?: (line?: LineId) => void;
  onOpenPolls?: () => void;
  onAddNewAd?: () => void;
  onOpenInstallApp?: () => void;
}

interface EmergencyContact {
  name: string;
  phone: string;
  address?: string;
  shortDesc: string;
  highlight?: boolean;
}

const EMERGENCY_SERVICES: EmergencyContact[] = [
  {
    name: 'Szpital Powiatowy / SOR',
    phone: '25 506 51 00',
    address: 'ul. Szpitalna 37',
    shortDesc: 'Pomoc doraźna i nocna opieka',
    highlight: true,
  },
  {
    name: 'PWiK – Pogotowie Wodociągowe',
    phone: '994',
    address: 'tel. 25 758 58 60',
    shortDesc: 'Awarie sieci wod-kan 24/7',
  },
  {
    name: 'Pogotowie Energetyczne (PGE)',
    phone: '991',
    shortDesc: 'Awarie i przerwy w dostawie prądu',
  },
  {
    name: 'Komenda Powiatowa Policji',
    phone: '47 72 49 200',
    address: 'ul. Piłsudskiego 44',
    shortDesc: 'Dyżurny KPP Mińsk Mazowiecki',
  },
  {
    name: 'Straż Miejska w Mińsku Maz.',
    phone: '25 759 53 11',
    address: 'ul. Konstytucji 3 Maja 1',
    shortDesc: 'Porządek i interwencje miejskie',
  },
  {
    name: 'Urząd Miasta Mińsk Mazowiecki',
    phone: '25 759 53 00',
    address: 'ul. Konstytucji 3 Maja 1',
    shortDesc: 'Kancelaria i obsługa mieszkańca',
  },
];

export function Footer({
  onTabChange,
  onOpenZditm,
  onOpenPolls,
  onAddNewAd,
  onOpenInstallApp,
}: FooterProps) {
  // Mobile accordion state for compact view
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    services: false,
    nav: false,
    business: false,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleNavClick = (tabId: TabId, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onTabChange?.(tabId);
  };

  return (
    <footer className="w-full border-t border-mist-300 bg-white/95 text-ink select-none pb-28 md:pb-12 pt-10 md:pt-14 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* 1. TOP HIGHLIGHT: LOCAL TRUST & PHYSICAL VERIFICATION BANNER */}
        <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-mist-100 via-sand-50 to-coral-50/40 border border-mist-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500/10 border border-coral-500/20 flex items-center justify-center shrink-0 text-coral-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-ink-950">
                  Platforma Zweryfikowanych Sąsiadów
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-coral-500 text-white uppercase tracking-wider">
                  Bez anonimowości
                </span>
              </div>
              <p className="text-xs text-ink-600 mt-0.5">
                Koniec z anonimowym hejtem i botami. Każdy mieszkaniec jest weryfikowany fizycznym kodem PIN doręczanym do skrzynki pocztowej.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-ink-700 bg-white/80 px-3 py-1.5 rounded-xl border border-mist-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zasięg: Miasto i Gmina Mińsk Mazowiecki</span>
          </div>
        </div>

        {/* 2. MAIN 4-COLUMN GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-mist-200">
          {/* COL 1: BRAND, MISSION & VERIFICATION (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="/"
              onClick={(e) => handleNavClick('home', e)}
              className="inline-flex items-center gap-1.5 text-left group"
            >
              <span className="font-display text-[26px] font-black tracking-tight text-ink-950 leading-none">
                mój<span className="text-coral-600">Mińsk</span>
                <span className="text-sand-600">.</span>
              </span>
            </a>

            <p className="text-xs text-ink-600 leading-relaxed max-w-sm">
              Niezależna platforma społecznościowo-usługowa stworzona wyłącznie dla mieszkańców Mińska Mazowieckiego oraz Gminy Mińsk Mazowiecki.
            </p>

            <div className="space-y-2 pt-1 text-xs text-ink-700">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
                <span>Format publiczny: <strong>Imię z ulicy</strong> (np. Kasia ze Spacerowej)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
                <span>Dane adresowe chronione szyfrowaniem <strong>AES-256 (RODO)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
                <span>Stacja pomiarowa <strong>GIOŚ Mińsk Maz.</strong> & rozkłady <strong>ZDiTM</strong></span>
              </div>
            </div>

            {/* PWA Install Button */}
            {onOpenInstallApp && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenInstallApp}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ink-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-coral-400" />
                  <span>Zainstaluj aplikację na telefonie (PWA)</span>
                </button>
              </div>
            )}
          </div>

          {/* COL 2: MUNICIPAL SERVICES & EMERGENCY (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <div
              onClick={() => toggleSection('services')}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-coral-600" />
                <span>Służby i Pogotowie (Mińsk)</span>
              </h3>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-ink-400 md:hidden transition-transform',
                  openSections.services && 'rotate-180',
                )}
              />
            </div>

            <div
              className={cn(
                'space-y-2.5 text-xs transition-all',
                !openSections.services && 'hidden md:block',
              )}
            >
              {EMERGENCY_SERVICES.map((srv) => (
                <div
                  key={srv.name}
                  className="p-2 rounded-xl bg-mist-50/80 border border-mist-200/70 hover:border-coral-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-900 truncate">{srv.name}</span>
                    <a
                      href={`tel:${srv.phone.replace(/\s+/g, '')}`}
                      className="font-mono font-bold text-coral-600 hover:text-coral-700 bg-white px-2 py-0.5 rounded-lg border border-mist-300 text-[11px] shrink-0 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{srv.phone}</span>
                    </a>
                  </div>
                  <div className="text-[11px] text-ink-500 flex items-center justify-between mt-0.5">
                    <span>{srv.shortDesc}</span>
                    {srv.address && <span className="text-[10px] text-ink-400">{srv.address}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COL 3: RESIDENT NAVIGATION (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <div
              onClick={() => toggleSection('nav')}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-ink-900">
                Strefy Mieszkańca
              </h3>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-ink-400 md:hidden transition-transform',
                  openSections.nav && 'rotate-180',
                )}
              />
            </div>

            <ul
              className={cn(
                'space-y-2 text-xs transition-all',
                !openSections.nav && 'hidden md:block',
              )}
            >
              <li>
                <a
                  href={TAB_PATHS.home}
                  onClick={(e) => handleNavClick('home', e)}
                  className="text-ink-600 hover:text-ink-950 font-medium transition-colors flex items-center gap-2"
                >
                  <span>Start (Pulpit informacyjny)</span>
                </a>
              </li>
              <li>
                <a
                  href={TAB_PATHS.ads}
                  onClick={(e) => handleNavClick('ads', e)}
                  className="text-ink-600 hover:text-ink-950 font-medium transition-colors flex items-center gap-2"
                >
                  <span>Ogłoszenia lokalne C2C</span>
                </a>
              </li>
              <li>
                <a
                  href="/zditm"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenZditm?.('M2');
                  }}
                  className="text-ink-600 hover:text-ink-950 font-medium transition-colors flex items-center gap-2"
                >
                  <Bus className="w-3.5 h-3.5 text-sky-600" />
                  <span>Rozkład ZDiTM (M2, M3, M4)</span>
                </a>
              </li>
              <li>
                <a
                  href={TAB_PATHS.rides}
                  onClick={(e) => handleNavClick('rides', e)}
                  className="text-ink-600 hover:text-ink-950 font-medium transition-colors flex items-center gap-2"
                >
                  <Car className="w-3.5 h-3.5 text-coral-500" />
                  <span>Przejazdy & Nova Taxi (−10%)</span>
                </a>
              </li>
              <li>
                <a
                  href={TAB_PATHS.talks}
                  onClick={(e) => handleNavClick('talks', e)}
                  className="text-ink-600 hover:text-ink-950 font-medium transition-colors flex items-center gap-2"
                >
                  <MessagesSquare className="w-3.5 h-3.5 text-sand-700" />
                  <span>Rozmowy & Forum sąsiedzkie</span>
                </a>
              </li>
              <li>
                <a
                  href="/ankiety"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolls?.();
                  }}
                  className="text-ink-600 hover:text-ink-950 font-medium transition-colors flex items-center gap-2"
                >
                  <Vote className="w-3.5 h-3.5 text-coral-600" />
                  <span>Ankieta Tygodnia & Rankingi</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COL 4: B2B & BUSINESS IN MIŃSK (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <div
              onClick={() => toggleSection('business')}
              className="flex items-center justify-between cursor-pointer md:cursor-default"
            >
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-ink-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-coral-600" />
                <span>Dla Mińskich Firm (B2B)</span>
              </h3>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-ink-400 md:hidden transition-transform',
                  openSections.business && 'rotate-180',
                )}
              />
            </div>

            <div
              className={cn(
                'space-y-3 text-xs transition-all',
                !openSections.business && 'hidden md:block',
              )}
            >
              <div className="p-3 rounded-xl bg-sand-50 border border-mist-300 space-y-1.5">
                <div className="font-bold text-ink-900 flex items-center justify-between">
                  <span>Praca w Mińsku (10 zł)</span>
                  <span className="text-[10px] bg-coral-500 text-white font-extrabold px-1.5 py-0.2 rounded">
                    BLIK 1-Click
                  </span>
                </div>
                <p className="text-[11px] text-ink-600 leading-snug">
                  Szukasz pracownika, sprzedawcy lub kierowcy? Opublikuj ofertę pracy widoczną dla zweryfikowanych mieszkańców.
                </p>
                {onAddNewAd && (
                  <button
                    type="button"
                    onClick={onAddNewAd}
                    className="text-coral-600 hover:text-coral-700 font-bold text-[11px] underline block pt-0.5"
                  >
                    Dodaj ogłoszenie o pracę →
                  </button>
                )}
              </div>

              <div className="space-y-1 text-ink-700">
                <div className="font-semibold text-ink-900">Program Partnerski:</div>
                <p className="text-[11px] text-ink-500 leading-relaxed">
                  Kupony rabatowe w listach powitalnych, banery oraz dedykowane ankiety konsumenckie.
                </p>
                <div className="pt-1">
                  <a
                    href="mailto:kontakt@mojminsk.app?subject=Wspolpraca B2B mojMinsk.app"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-900 hover:text-coral-600 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-coral-500" />
                    <span>kontakt@mojminsk.app</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM BAR: LEGAL, WCAG & COPYRIGHT */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-500 text-center md:text-left">
          <div className="flex items-center gap-1.5">
            <span>© 2026</span>
            <span className="font-bold text-ink-800">mójMińsk.app</span>
            <span>— stworzone z dumą dla mieszkańców Mińska Mazowieckiego.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-ink-600">
            <a href="/regulamin" className="hover:text-ink-900 transition-colors">
              Regulamin platformy
            </a>
            <span className="text-mist-400">•</span>
            <a href="/polityka-prywatnosci" className="hover:text-ink-900 transition-colors">
              Polityka Prywatności & RODO
            </a>
            <span className="text-mist-400">•</span>
            <a href="/standardy" className="hover:text-ink-900 transition-colors">
              Standardy Społeczności
            </a>
            <span className="text-mist-400">•</span>
            <span className="text-ink-400">Wersja 1.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
