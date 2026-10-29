import type { TabId } from './BottomNav';
import type { LineId } from '../data/mockData';
import { TAB_PATHS } from '../router/urlUtils';
import { AppLink } from './AppLink';

export interface FooterProps {
  onTabChange?: (tab: TabId) => void;
  onOpenZditm?: (line?: LineId) => void;
  onOpenPolls?: () => void;
  onAddNewAd?: () => void;
  onOpenInstallApp?: () => void;
  onOpenLegal?: (doc: 'terms' | 'privacy') => void;
}

const EMERGENCY_NUMBERS = [
  { label: 'SOR / Szpital', phone: '25 506 51 00', tel: '255065100' },
  { label: 'PWiK', phone: '994', tel: '994' },
  { label: 'PGE', phone: '991', tel: '991' },
  { label: 'Policja', phone: '47 72 49 200', tel: '477249200' },
  { label: 'Straż Miejska', phone: '25 759 53 11', tel: '257595311' },
];

export function Footer({
  onTabChange,
  onOpenZditm,
  onOpenPolls,
  onOpenInstallApp,
  onOpenLegal,
}: FooterProps) {
  const handleNavClick = (tabId: TabId, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onTabChange?.(tabId);
  };

  return (
    <footer className="w-full border-t border-mist-200 bg-white text-ink select-none pb-28 md:pb-10 pt-10 mt-16 transition-colors">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Upper row: Brand & Primary Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-mist-200">
          <div>
            <a
              href="/"
              onClick={(e) => handleNavClick('home', e)}
              className="inline-flex items-center gap-1 group"
            >
              <span className="font-display text-xl font-black tracking-tight text-ink-950">
                mój<span className="text-coral-600">Mińsk</span>
                <span className="text-sand-600">.</span>
              </span>
            </a>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-ink-600">
            <a
              href={TAB_PATHS.home}
              onClick={(e) => handleNavClick('home', e)}
              className="hover:text-coral-600 transition-colors"
            >
              Start
            </a>
            <a
              href={TAB_PATHS.ads}
              onClick={(e) => handleNavClick('ads', e)}
              className="hover:text-coral-600 transition-colors"
            >
              Ogłoszenia
            </a>
            <button
              type="button"
              onClick={() => onOpenZditm?.('M2')}
              className="hover:text-coral-600 transition-colors"
            >
              Rozkład ZDiTM
            </button>
            <a
              href={TAB_PATHS.rides}
              onClick={(e) => handleNavClick('rides', e)}
              className="hover:text-coral-600 transition-colors"
            >
              Przejazdy
            </a>
            <a
              href={TAB_PATHS.talks}
              onClick={(e) => handleNavClick('talks', e)}
              className="hover:text-coral-600 transition-colors"
            >
              Rozmowy
            </a>
            <button
              type="button"
              onClick={() => onOpenPolls?.()}
              className="hover:text-coral-600 transition-colors"
            >
              Ankiety
            </button>
            <a
              href="mailto:kontakt@mojminsk.app"
              className="hover:text-coral-600 transition-colors"
            >
              Dla firm & kontakt
            </a>
            {onOpenInstallApp && (
              <button
                type="button"
                onClick={onOpenInstallApp}
                className="text-ink-400 hover:text-ink-700 transition-colors"
              >
                Zainstaluj PWA
              </button>
            )}
          </nav>
        </div>

        {/* Middle row: Minimal Emergency numbers line */}
        <div className="py-4 border-b border-mist-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink-500">
          <span className="font-semibold text-ink-700">Ważne telefony:</span>
          {EMERGENCY_NUMBERS.map((item) => (
            <a
              key={item.label}
              href={`tel:${item.tel}`}
              className="hover:text-coral-600 transition-colors"
            >
              {item.label}: <span className="font-mono font-semibold text-ink-800">{item.phone}</span>
            </a>
          ))}
        </div>

        {/* Bottom row: Legal & Copyright */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ink-400">
          <div className="flex items-center gap-2">
            <span>© 2026 mójMińsk.app</span>
            <span>•</span>
            <span>Zweryfikowana społeczność sąsiedzka</span>
          </div>

          <div className="flex items-center gap-4 text-ink-500">
            <AppLink
              to="/regulamin"
              onClick={() => onOpenLegal?.('terms')}
              className="hover:text-ink-900 transition-colors"
            >
              Regulamin
            </AppLink>
            <span>•</span>
            <AppLink
              to="/polityka-prywatnosci"
              onClick={() => onOpenLegal?.('privacy')}
              className="hover:text-ink-900 transition-colors"
            >
              Polityka prywatności
            </AppLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
