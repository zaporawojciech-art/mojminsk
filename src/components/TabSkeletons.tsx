import { Suspense, type ReactNode } from 'react';
import type { TabId } from './BottomNav';
import { cn } from './ui';

function Bone({ className }: { className?: string }) {
  return <div className={cn('skeleton-shimmer rounded-2xl', className)} aria-hidden />;
}

function HeaderSkeleton({ hasSearch = false }: { hasSearch?: boolean }) {
  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2 select-none">
      <div className="flex h-12 items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Bone className="h-3 w-28 rounded-full" />
          <Bone className="h-6 w-40 rounded-xl" />
        </div>
        <Bone className="h-11 w-11 shrink-0 rounded-full" />
      </div>
      {hasSearch && <Bone className="mt-3 h-11 w-full rounded-2xl" />}
    </div>
  );
}

/** Dokładny odpowiednik wymiarowy komponentu NativeHeader (h-14 + safe-area-inset-top) */
function NativeBarSkeleton() {
  return (
    <header className="z-20 shrink-0 border-b border-mist-300 bg-white pt-[max(env(safe-area-inset-top),12px)]">
      <div className="flex h-14 items-center justify-between px-3">
        <Bone className="h-8 w-16 rounded-full" />
        <Bone className="h-5 w-32 rounded-lg" />
        <div className="w-16" />
      </div>
    </header>
  );
}

/* ============================================================================
 * 1. GŁÓWNE ZAKŁADKI (BOTTOM NAV)
 * ========================================================================== */

export function HomeSkeleton() {
  return (
    <div className="space-y-5 pb-36" role="status" aria-label="Ładowanie ekranu Start">
      <HeaderSkeleton />

      {/* Weather Card Skeleton */}
      <div className="px-5">
        <Bone className="h-44 w-full rounded-4xl" />
      </div>

      {/* Bus Module Skeleton */}
      <div className="px-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <Bone className="h-5 w-40 rounded-lg" />
          <Bone className="h-7 w-24 rounded-full" />
        </div>
        <Bone className="h-24 w-full rounded-3xl" />
      </div>

      {/* Poll / News Card Skeleton */}
      <div className="px-5 space-y-3">
        <Bone className="h-5 w-36 rounded-lg" />
        <Bone className="h-52 w-full rounded-4xl" />
      </div>
    </div>
  );
}

export function AdsSkeleton() {
  return (
    <div className="space-y-4 pb-36" role="status" aria-label="Ładowanie Ogłoszeń">
      <HeaderSkeleton hasSearch />

      {/* Categories Card Skeleton */}
      <div className="px-5">
        <Bone className="h-52 w-full rounded-3xl" />
      </div>

      {/* Quick Filter Chips */}
      <div className="flex gap-2 overflow-hidden px-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      {/* 2-Column C2C Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3 px-5 pt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-56 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export function RidesSkeleton() {
  return (
    <div className="space-y-5 pb-36" role="status" aria-label="Ładowanie Strefy Przejazdu">
      <HeaderSkeleton />

      {/* Nova Taxi Banner Skeleton */}
      <div className="px-5">
        <Bone className="h-44 w-full rounded-4xl" />
      </div>

      {/* Route Picker Card Skeleton */}
      <div className="px-5 space-y-3">
        <Bone className="h-11 w-full rounded-full" />
        <Bone className="h-48 w-full rounded-4xl" />
      </div>

      {/* Ride Listings Skeleton */}
      <div className="px-5 space-y-3">
        <Bone className="h-20 w-full rounded-3xl" />
        <Bone className="h-20 w-full rounded-3xl" />
      </div>
    </div>
  );
}

export function TalksSkeleton() {
  return (
    <div className="space-y-4 pb-36" role="status" aria-label="Ładowanie Strefy Rozmów">
      <HeaderSkeleton />

      {/* Composer Box Skeleton */}
      <div className="px-5">
        <Bone className="h-32 w-full rounded-4xl" />
      </div>

      {/* Hashtag Chips Skeleton */}
      <div className="flex gap-2 overflow-hidden px-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      {/* Feed Posts Skeleton */}
      <div className="px-5 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone key={i} className="h-36 w-full rounded-4xl" />
        ))}
      </div>
    </div>
  );
}

export function TabSkeleton({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'home':
      return <HomeSkeleton />;
    case 'ads':
      return <AdsSkeleton />;
    case 'rides':
      return <RidesSkeleton />;
    case 'talks':
      return <TalksSkeleton />;
  }
}

/* ============================================================================
 * 2. WIDOKI PODSTRON, PROFILU I MODALI (KAŻDY WIDOK W APLIKACJI)
 * ========================================================================== */

/**
 * Skeleton widoku „Mój profil” (ProfileScreen):
 * Dokładnie odwzorowuje układ bez białego kontenera wokół awatara (awatar leży bezpośrednio na bg-mist).
 */
export function ProfileSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie profilu">
      <NativeBarSkeleton />
      <div className="flex-1 overflow-hidden pb-24">
        {/* 1. Hero Identity & 3D Avatar Section — bezpośrednio na bg-mist, bez białej karty! */}
        <section className="px-5 pt-5 flex flex-col items-center text-center">
          <Bone className="h-32 w-32 rounded-[40px]" />
          <Bone className="mt-3.5 h-9 w-44 rounded-full" />
          <Bone className="mt-3.5 h-7 w-28 rounded-xl" />
          <Bone className="mt-1.5 h-6 w-48 rounded-full" />
        </section>

        {/* 2. Moja aktywność i ogłoszenia (iOS Grouped List) */}
        <div className="mx-5 mt-6 space-y-2">
          <Bone className="ml-3 h-3.5 w-48 rounded-full" />
          <div className="overflow-hidden rounded-4xl bg-white shadow-card divide-y divide-mist">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Bone className="h-10 w-10 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-1.5">
                  <Bone className="h-4 w-36 rounded-md" />
                  <Bone className="h-3 w-48 rounded-md" />
                </div>
                <Bone className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton widoku szczegółów ogłoszenia w stylu OLX (AdDetailModal) */
export function AdDetailSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie oferty">
      <div className="flex-1 overflow-hidden">
        {/* Hero Carousel Image Bone */}
        <div className="relative aspect-[4/4.3] w-full">
          <Bone className="h-full w-full rounded-none" />
        </div>

        {/* Overlapping Rounded Sheet (-mt-7 rounded-t-[28px]) */}
        <div className="relative z-20 -mt-7 rounded-t-[28px] bg-white px-5 pb-5 pt-3.5 shadow-card space-y-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-mist-300" />
          <div className="flex gap-2">
            <Bone className="h-12 w-12 rounded-xl" />
            <Bone className="h-12 w-12 rounded-xl" />
            <Bone className="h-12 w-12 rounded-xl" />
          </div>
          <div className="flex justify-between">
            <Bone className="h-3.5 w-28 rounded-full" />
            <Bone className="h-5 w-24 rounded-full" />
          </div>
          <Bone className="h-6 w-4/5 rounded-lg" />
          <Bone className="h-8 w-36 rounded-xl" />
          <div className="flex justify-between border-t border-mist pt-3">
            <Bone className="h-6 w-28 rounded-full" />
            <Bone className="h-4 w-24 rounded-full" />
          </div>
        </div>

        {/* Description & Seller Cards */}
        <div className="p-4 space-y-3.5">
          <Bone className="h-28 w-full rounded-3xl" />
          <Bone className="h-24 w-full rounded-3xl" />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-mist bg-white px-5 py-3 flex gap-2">
        <Bone className="h-12 flex-1 rounded-full" />
        <Bone className="h-12 flex-1 rounded-full" />
      </div>
    </div>
  );
}

/** Skeleton widoku „Moje ogłoszenia” (MyAdsModal — czysta lista) */
export function MyAdsSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie moich ogłoszeń">
      <NativeBarSkeleton />
      <div className="bg-white px-4 pt-3 pb-3 border-b border-mist">
        <div className="grid grid-cols-4 gap-1.5">
          <Bone className="h-12 rounded-2xl" />
          <Bone className="h-12 rounded-2xl" />
          <Bone className="h-12 rounded-2xl" />
          <Bone className="h-12 rounded-2xl" />
        </div>
      </div>
      <div className="flex-1 p-3.5 space-y-2.5 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone key={i} className="h-36 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

/** Skeleton widoku „Komunikacja ZDiTM” (ZditmScreen) */
export function ZditmSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie rozkładu ZDiTM">
      <NativeBarSkeleton />
      <div className="flex-1 overflow-hidden p-5 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Bone className="h-14 rounded-2xl" />
          <Bone className="h-14 rounded-2xl" />
          <Bone className="h-14 rounded-2xl" />
        </div>
        <Bone className="h-40 w-full rounded-3xl" />
        <Bone className="h-56 w-full rounded-3xl" />
      </div>
    </div>
  );
}

/** Skeleton widoku „Strefa Partnera” (PartnerScreen — ciemne tło bg-ink) */
export function PartnerSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-ink" role="status" aria-label="Ładowanie Strefy Partnera">
      <div className="p-5 pt-[max(env(safe-area-inset-top),16px)] space-y-5">
        <Bone className="h-11 w-11 rounded-full opacity-25" />
        <div className="pt-16 space-y-2.5">
          <Bone className="h-3.5 w-28 rounded-full opacity-25" />
          <Bone className="h-10 w-56 rounded-xl opacity-25" />
          <Bone className="h-4 w-44 rounded-full opacity-25" />
        </div>
        <Bone className="h-40 w-full rounded-4xl opacity-30" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Bone className="h-48 rounded-3xl opacity-20" />
          <Bone className="h-48 rounded-3xl opacity-20" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton widoku czatu sąsiedzkiego 1:1 (ChatModal) */
export function ChatSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie czatu">
      <NativeBarSkeleton />
      <div className="border-b border-mist bg-white px-4 py-2.5 flex items-center gap-3">
        <Bone className="h-11 w-11 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Bone className="h-4 w-44 rounded-md" />
          <Bone className="h-3 w-24 rounded-md" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        <div className="flex justify-start">
          <Bone className="h-14 w-2/3 rounded-3xl" />
        </div>
        <div className="flex justify-end">
          <Bone className="h-12 w-3/5 rounded-3xl" />
        </div>
        <div className="flex justify-start">
          <Bone className="h-16 w-3/4 rounded-3xl" />
        </div>
      </div>
      <div className="border-t border-mist bg-white p-3 flex gap-2">
        <Bone className="h-11 flex-1 rounded-full" />
        <Bone className="h-11 w-11 rounded-full shrink-0" />
      </div>
    </div>
  );
}

/** Skeleton listy konwersacji (AdConversationsModal) */
export function ConversationsSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie wiadomości">
      <NativeBarSkeleton />
      <div className="p-4 space-y-3 flex-1 overflow-hidden">
        <Bone className="h-10 w-full rounded-2xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-20 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

/** Skeleton wizytówki sąsiada (SellerProfileModal) */
export function SellerProfileSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie wizytówki sąsiada">
      <NativeBarSkeleton />
      <div className="p-5 space-y-4 flex-1 overflow-hidden">
        <div className="rounded-4xl bg-white p-6 text-center shadow-card border border-mist-300 flex flex-col items-center">
          <Bone className="h-24 w-24 rounded-3xl" />
          <Bone className="mt-3.5 h-6 w-36 rounded-lg" />
          <Bone className="mt-1.5 h-4 w-44 rounded-full" />
          <Bone className="mt-3.5 h-6 w-40 rounded-full" />
        </div>
        <Bone className="h-24 w-full rounded-3xl" />
        <Bone className="h-24 w-full rounded-3xl" />
      </div>
    </div>
  );
}

/** Uniwersalny Skeleton dla podstron formularzy i akcji (AddAd, EditAd, PromoteAd, ReserveAd, Filtry, Zgłoś, Przystanek) */
export function ModalFormSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie widoku">
      <NativeBarSkeleton />
      <div className="flex-1 overflow-hidden p-4 space-y-3.5">
        <div className="space-y-1.5">
          <Bone className="h-3.5 w-32 rounded-md" />
          <div className="grid grid-cols-3 gap-2">
            <Bone className="h-11 rounded-2xl" />
            <Bone className="h-11 rounded-2xl" />
            <Bone className="h-11 rounded-2xl" />
          </div>
        </div>
        <Bone className="h-44 w-full rounded-3xl" />
        <Bone className="h-40 w-full rounded-3xl" />
        <Bone className="h-36 w-full rounded-3xl" />
      </div>
      <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0">
        <Bone className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export function OverlaySkeleton() {
  return <ModalFormSkeleton />;
}

const LEVEL_Z_CLASS: Record<number, string> = {
  1: 'z-[50]',
  2: 'z-[52]',
  3: 'z-[54]',
  4: 'z-[56]',
  5: 'z-[58]',
};

/**
 * Kontener asynchronicznego widoku (Single-Shell Native Push Transition + In-Place Skeleton):
 * Wszystkie widoki pełnoekranowe i zagnieżdżone wjeżdżają jednolicie z prawej strony
 * (.native-screen-slide) i wyjeżdżają w prawo (.native-screen-exit).
 * Parametr `level` (1..5) określa poziom zagnieżdżenia na stosie nawigacji (z-index: 50..58),
 * dzięki czemu widok nadrzędny pozostaje zamontowany pod spodem z zachowaniem pozycji scrolla.
 */
export function AsyncViewBoundary({
  viewKey: _viewKey,
  level = 1,
  isClosing = false,
  skeleton,
  children,
}: {
  viewKey: string;
  level?: 1 | 2 | 3 | 4 | 5;
  isClosing?: boolean;
  skeleton: ReactNode;
  durationMs?: number;
  children: ReactNode;
}) {
  const zClass = LEVEL_Z_CLASS[level] ?? 'z-[50]';

  return (
    <div
      data-view-level={level}
      className={cn(
        'native-view-shell fixed inset-0 flex flex-col overflow-hidden select-none',
        zClass,
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist shadow-[-12px_0_32px_rgba(18,19,26,0.18)]">
        <Suspense fallback={skeleton}>
          <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
