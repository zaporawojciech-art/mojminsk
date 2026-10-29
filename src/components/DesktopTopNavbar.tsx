import {
  Bus,
  Car,
  House,
  LogOut,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Plus,
  Vote,
} from 'lucide-react';
import type { TabId } from './BottomNav';
import { avatarUrl, type User } from '../data/mockData';
import { TAB_PATHS } from '../router/urlUtils';
import { cn } from './ui';

interface DesktopTopNavbarProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  onCloseAllLayers?: () => void;
  hasActiveSubpage?: boolean;
  user: User | null;
  unreadCount?: number;
  onOpenConversations: () => void;
  onAddNewAd: () => void;
  onOpenZditm: () => void;
  onOpenPolls: () => void;
  onProfileClick: () => void;
  onLogout?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearchClear?: () => void;
}

export function DesktopTopNavbar({
  currentTab,
  onTabChange,
  onCloseAllLayers,
  hasActiveSubpage = false,
  user,
  unreadCount = 0,
  onOpenConversations,
  onAddNewAd,
  onOpenZditm,
  onOpenPolls,
  onProfileClick,
  onLogout,
}: DesktopTopNavbarProps) {
  const navItems: { id: TabId; label: string; shortLabel?: string; href: string; icon: typeof House }[] = [
    { id: 'home', label: 'Start', href: TAB_PATHS.home, icon: House },
    { id: 'ads', label: 'Ogłoszenia', href: TAB_PATHS.ads, icon: Megaphone },
    { id: 'rides', label: 'Wspólne przejazdy', shortLabel: 'Przejazdy', href: TAB_PATHS.rides, icon: Car },
    { id: 'talks', label: 'Rozmowy', href: TAB_PATHS.talks, icon: MessagesSquare },
  ];

  const handleNavClick = (tabId: TabId) => {
    onCloseAllLayers?.();
    onTabChange(tabId);
  };

  return (
    <header className="sticky top-0 z-[65] hidden md:block w-full border-b border-mist-300 bg-white/95 backdrop-blur-md select-none">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-8 lg:px-12">
        {/* 1. LEFT: Brand + Main Navigation Links */}
        <div className="flex items-center gap-6 min-w-0">
          <a
            href="/"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-1.5 text-left shrink-0 transition-transform active:scale-95 cursor-pointer"
          >
            <span className="font-display text-[23px] font-extrabold tracking-tight text-ink leading-none">
              mój<span className="text-coral-700">Mińsk</span>
              <span className="text-sand-600">.</span>
            </span>
          </a>

          <nav aria-label="Nawigacja główna" className="flex items-center gap-1.5 min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = !hasActiveSubpage && currentTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer',
                    active
                      ? 'bg-ink text-white shadow-xs'
                      : 'text-ink-600 hover:bg-mist hover:text-ink',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={active ? 2.4 : 2} />
                  {item.shortLabel ? (
                    <>
                      <span className="hidden lg:inline">{item.label}</span>
                      <span className="lg:hidden">{item.shortLabel}</span>
                    </>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </a>
              );
            })}

            <div className="mx-1.5 h-4 w-px bg-mist-300 shrink-0" />

            <a
              href="/zditm"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onCloseAllLayers?.();
                onOpenZditm();
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold text-ink-600 hover:bg-mist hover:text-ink transition-all whitespace-nowrap cursor-pointer"
            >
              <Bus className="h-3.5 w-3.5 text-sky-700 shrink-0" />
              <span>Komunikacja miejska</span>
            </a>

            <a
              href="/ankiety"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onCloseAllLayers?.();
                onOpenPolls();
              }}
              className="hidden lg:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold text-ink-600 hover:bg-mist hover:text-ink transition-all whitespace-nowrap cursor-pointer"
            >
              <Vote className="h-3.5 w-3.5 text-coral-700 shrink-0" />
              <span>Ankiety</span>
            </a>
          </nav>
        </div>

        {/* 2. RIGHT: Actions + Neighbor Identity */}
        <div className="flex items-center justify-end gap-2.5 shrink-0">
          {/* Messages / Chat Button */}
          <button
            type="button"
            onClick={() => {
              onCloseAllLayers?.();
              onOpenConversations();
            }}
            title="Wiadomości sąsiedzkie"
            className="relative flex h-9 items-center gap-1.5 rounded-lg border border-mist-300 bg-white px-3 text-[12.5px] font-bold text-ink hover:bg-mist/60 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5 text-ink-700" />
            <span>Wiadomości</span>
            {unreadCount > 0 && (
              <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-coral px-1 text-[10px] font-extrabold text-ink">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Primary CTA: Dodaj ogłoszenie */}
          <button
            type="button"
            onClick={() => {
              onCloseAllLayers?.();
              onAddNewAd();
            }}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-coral px-3.5 text-[12.5px] font-extrabold text-ink shadow-xs hover:bg-coral-400 active:scale-95 transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.6]" />
            <span>Dodaj ogłoszenie</span>
          </button>

          {/* Neighbor Profile Pill */}
          {user ? (
            <div className="flex items-center gap-2 pl-2.5 ml-0.5 border-l border-mist-300 shrink-0">
              <button
                type="button"
                onClick={onProfileClick}
                className="flex items-center gap-2.5 rounded-xl bg-mist/70 py-1 pl-1.5 pr-3 border border-mist-300/70 hover:bg-mist transition-colors text-left cursor-pointer"
              >
                <img
                  src={avatarUrl(user.seed)}
                  alt={user.name}
                  className="h-7 w-7 shrink-0 rounded-full bg-sand-100 object-cover ring-1 ring-mist-300"
                />
                <div className="leading-tight max-w-[120px]">
                  <p className="truncate text-[12px] font-bold text-ink">{user.name}</p>
                  <p className="truncate text-[10px] font-medium text-ink-500">ul. {user.street.name}</p>
                </div>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Wyloguj się"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-coral-100 hover:text-coral-800 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2.5 ml-0.5 border-l border-mist-300 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onCloseAllLayers?.();
                  onProfileClick();
                }}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-ink bg-ink px-3 text-[12.5px] font-bold text-white hover:bg-ink-700 active:scale-95 transition-all cursor-pointer"
              >
                <span>Zaloguj się</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
