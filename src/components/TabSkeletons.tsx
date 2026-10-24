import { Suspense, useEffect, useState, type ReactNode } from 'react';
import type { TabId } from './BottomNav';
import { cn } from './ui';

function Bone({ className }: { className?: string }) {
  return <div className={cn('skeleton-shimmer rounded-2xl', className)} aria-hidden />;
}

function HeaderSkeleton({ hasSearch = false }: { hasSearch?: boolean }) {
  return (
    <div className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Bone className="h-3.5 w-32 rounded-full" />
          <Bone className="h-7 w-44 rounded-xl" />
        </div>
        <Bone className="h-11 w-11 shrink-0 rounded-full" />
      </div>
      {hasSearch && <Bone className="mt-4 h-12 w-full rounded-full" />}
    </div>
  );
}

function NativeBarSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-mist bg-white/90 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
      <Bone className="h-9 w-20 rounded-full" />
      <Bone className="h-5 w-36 rounded-lg" />
      <div className="w-20" />
    </div>
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
        <div className="rounded-4xl bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2.5">
              <Bone className="h-3 w-28 rounded-full" />
              <Bone className="h-12 w-24 rounded-2xl" />
              <Bone className="h-4 w-36 rounded-full" />
            </div>
            <Bone className="h-24 w-28 rounded-3xl" />
          </div>
          <div className="flex gap-2 pt-1">
            <Bone className="h-8 flex-1 rounded-full" />
            <Bone className="h-8 flex-1 rounded-full" />
          </div>
        </div>
      </div>

      {/* Bus Module Skeleton */}
      <div className="px-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <Bone className="h-5 w-40 rounded-lg" />
          <Bone className="h-7 w-24 rounded-full" />
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bone className="h-8 w-11 rounded-xl" />
              <div className="space-y-1.5">
                <Bone className="h-4 w-32 rounded-md" />
                <Bone className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <Bone className="h-7 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Poll / News Card Skeleton */}
      <div className="px-5 space-y-3">
        <Bone className="h-5 w-36 rounded-lg" />
        <div className="rounded-4xl bg-white p-5 shadow-card space-y-3">
          <Bone className="h-5 w-4/5 rounded-lg" />
          <Bone className="h-10 w-full rounded-2xl" />
          <Bone className="h-10 w-full rounded-2xl" />
          <Bone className="h-10 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function KitchenSkeleton() {
  return (
    <div className="space-y-6 pb-36" role="status" aria-label="Ładowanie Strefy Kuchni">
      <HeaderSkeleton hasSearch />

      {/* Category Bubbles (Glovo style) */}
      <div className="flex gap-3 overflow-hidden px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <Bone className="h-16 w-16 rounded-full" />
            <Bone className="h-3 w-12 rounded-full" />
          </div>
        ))}
      </div>

      {/* Order / Promo Banner Skeleton */}
      <div className="px-5">
        <div className="rounded-4xl bg-white p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Bone className="h-3 w-28 rounded-full" />
              <Bone className="h-6 w-48 rounded-lg" />
            </div>
            <Bone className="h-14 w-14 rounded-full shrink-0" />
          </div>
          <Bone className="h-10 w-full rounded-2xl" />
        </div>
      </div>

      {/* Dish / Restaurant Cards */}
      <div className="px-5 space-y-3">
        <Bone className="h-5 w-44 rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-white p-3 shadow-card space-y-2.5">
              <Bone className="aspect-[4/3] w-full rounded-2xl" />
              <Bone className="h-4 w-4/5 rounded-md" />
              <Bone className="h-3 w-1/2 rounded-md" />
              <div className="flex items-center justify-between pt-1">
                <Bone className="h-5 w-14 rounded-md" />
                <Bone className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdsSkeleton() {
  return (
    <div className="space-y-4 pb-36" role="status" aria-label="Ładowanie Ogłoszeń">
      <HeaderSkeleton hasSearch />

      {/* Segmented Switcher & Action Bar */}
      <div className="px-5 space-y-3">
        <Bone className="h-11 w-full rounded-full" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      {/* 2-Column C2C Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3 px-5 pt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl bg-white p-2.5 shadow-card space-y-2.5">
            <Bone className="aspect-[4/3] w-full rounded-2xl" />
            <div className="px-1 space-y-2">
              <Bone className="h-5 w-20 rounded-md" />
              <Bone className="h-4 w-full rounded-md" />
              <Bone className="h-3.5 w-2/3 rounded-full" />
            </div>
          </div>
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
        <div className="rounded-4xl bg-white p-5 shadow-card space-y-3">
          <Bone className="h-3 w-28 rounded-full" />
          <Bone className="h-7 w-40 rounded-lg" />
          <Bone className="h-4 w-52 rounded-md" />
          <div className="flex gap-2 pt-2">
            <Bone className="h-12 flex-1 rounded-full" />
            <Bone className="h-12 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Route Picker Card Skeleton */}
      <div className="px-5 space-y-3">
        <Bone className="h-11 w-full rounded-full" />
        <div className="rounded-4xl bg-white p-4 shadow-card space-y-2.5">
          <Bone className="h-14 w-full rounded-2xl" />
          <Bone className="h-14 w-full rounded-2xl" />
          <div className="flex gap-2 pt-1">
            <Bone className="h-10 flex-1 rounded-full" />
            <Bone className="h-10 flex-1 rounded-full" />
            <Bone className="h-10 flex-1 rounded-full" />
          </div>
        </div>
      </div>

      {/* Ride Listings Skeleton */}
      <div className="px-5 space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-3xl bg-white p-4 shadow-card flex items-center gap-3">
            <Bone className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-36 rounded-md" />
              <Bone className="h-3.5 w-48 rounded-md" />
            </div>
            <Bone className="h-9 w-20 rounded-full" />
          </div>
        ))}
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
        <div className="rounded-4xl bg-white p-4 shadow-card space-y-3">
          <div className="flex gap-3">
            <Bone className="h-10 w-10 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2 pt-1">
              <Bone className="h-4 w-3/4 rounded-md" />
              <Bone className="h-4 w-1/2 rounded-md" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-mist pt-3">
            <Bone className="h-9 w-9 rounded-full" />
            <Bone className="h-10 w-28 rounded-full" />
          </div>
        </div>
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
          <div key={i} className="rounded-4xl bg-white p-4 shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <Bone className="h-10 w-10 shrink-0 rounded-2xl" />
              <div className="space-y-1.5 flex-1">
                <Bone className="h-4 w-40 rounded-md" />
                <Bone className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              <Bone className="h-4 w-full rounded-md" />
              <Bone className="h-4 w-5/6 rounded-md" />
            </div>
            <div className="flex justify-between pt-1">
              <Bone className="h-6 w-14 rounded-full" />
              <Bone className="h-6 w-14 rounded-full" />
              <Bone className="h-6 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabSkeleton({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'home':
      return <HomeSkeleton />;
    case 'kitchen':
      return <KitchenSkeleton />;
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

/** Skeleton widoku „Mój profil” (ProfileScreen) */
export function ProfileSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie profilu">
      <NativeBarSkeleton />
      <div className="flex-1 overflow-hidden p-5 space-y-4">
        {/* Identity & Avatar Card */}
        <div className="rounded-4xl bg-white p-5 shadow-card flex flex-col items-center space-y-3">
          <Bone className="h-24 w-24 rounded-3xl" />
          <Bone className="h-6 w-48 rounded-lg" />
          <Bone className="h-6 w-32 rounded-full" />
          <div className="flex gap-2 pt-1 w-full justify-center">
            <Bone className="h-9 w-36 rounded-full" />
            <Bone className="h-9 w-28 rounded-full" />
          </div>
        </div>

        {/* Postal Verification Card */}
        <div className="rounded-4xl bg-white p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <Bone className="h-4 w-36 rounded-md" />
            <Bone className="h-6 w-24 rounded-full" />
          </div>
          <Bone className="h-4 w-full rounded-md" />
          <Bone className="h-4 w-4/5 rounded-md" />
          <Bone className="h-11 w-full rounded-full" />
        </div>

        {/* My Ads & Conversations Section */}
        <div className="rounded-4xl bg-white p-4 shadow-card space-y-3">
          <Bone className="h-4 w-32 rounded-md" />
          <div className="grid grid-cols-2 gap-2.5">
            <Bone className="h-20 w-full rounded-3xl" />
            <Bone className="h-20 w-full rounded-3xl" />
          </div>
        </div>

        {/* Settings Rows */}
        <div className="rounded-4xl bg-white p-4 shadow-card space-y-3">
          <Bone className="h-11 w-full rounded-2xl" />
          <Bone className="h-11 w-full rounded-2xl" />
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
        <div className="relative z-20 -mt-7 rounded-t-[28px] bg-white px-5 pb-5 pt-4 shadow-card space-y-3">
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
          <div className="rounded-3xl bg-white p-4 shadow-card space-y-2.5">
            <Bone className="h-3.5 w-28 rounded-md" />
            <Bone className="h-4 w-full rounded-md" />
            <Bone className="h-4 w-5/6 rounded-md" />
            <Bone className="h-4 w-2/3 rounded-md" />
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-card flex items-center gap-3">
            <Bone className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Bone className="h-4 w-32 rounded-md" />
              <Bone className="h-3 w-44 rounded-md" />
            </div>
          </div>
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
      <div className="bg-white px-4 pt-3 pb-3 border-b border-mist space-y-2.5">
        <div className="grid grid-cols-4 gap-1.5">
          <Bone className="h-12 rounded-2xl" />
          <Bone className="h-12 rounded-2xl" />
          <Bone className="h-12 rounded-2xl" />
          <Bone className="h-12 rounded-2xl" />
        </div>
      </div>
      <div className="flex-1 p-3.5 space-y-2.5 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl bg-white p-4 shadow-card space-y-3">
            <div className="flex justify-between">
              <Bone className="h-5 w-24 rounded-full" />
              <Bone className="h-7 w-20 rounded-xl" />
            </div>
            <Bone className="h-5 w-3/4 rounded-md" />
            <div className="flex justify-between">
              <Bone className="h-6 w-24 rounded-md" />
              <Bone className="h-4 w-32 rounded-md" />
            </div>
            <Bone className="h-8 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton widoku „Motylek Market” (MotylekScreen) */
export function MotylekSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie Motylek Market">
      <NativeBarSkeleton />
      <div className="flex-1 overflow-hidden p-4 space-y-4">
        <Bone className="h-36 w-full rounded-4xl" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-white p-3 shadow-card space-y-2.5">
              <Bone className="aspect-square w-full rounded-2xl" />
              <Bone className="h-4 w-4/5 rounded-md" />
              <div className="flex items-center justify-between">
                <Bone className="h-5 w-16 rounded-md" />
                <Bone className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
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
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-3">
          <Bone className="h-5 w-44 rounded-md" />
          <Bone className="h-11 w-full rounded-2xl" />
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Bone className="h-16 rounded-2xl" />
            <Bone className="h-16 rounded-2xl" />
            <Bone className="h-16 rounded-2xl" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bone key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Skeleton widoku „Strefa Partnera” (PartnerScreen) */
export function PartnerSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie Strefy Partnera">
      <NativeBarSkeleton />
      <div className="flex-1 overflow-hidden p-5 space-y-4">
        <Bone className="h-44 w-full rounded-4xl" />
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-3">
          <Bone className="h-5 w-40 rounded-md" />
          <Bone className="h-4 w-full rounded-md" />
          <Bone className="h-11 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Bone className="h-44 rounded-3xl" />
          <Bone className="h-44 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton widoku „Kasa / Podsumowanie zamówienia” (CheckoutScreen) */
export function CheckoutSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie zamówienia">
      <NativeBarSkeleton />
      <div className="flex-1 overflow-hidden p-5 space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-2.5">
          <Bone className="h-4 w-32 rounded-md" />
          <Bone className="h-6 w-48 rounded-md" />
          <Bone className="h-4 w-40 rounded-md" />
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-3">
          <Bone className="h-4 w-36 rounded-md" />
          <Bone className="h-12 w-full rounded-2xl" />
          <Bone className="h-12 w-full rounded-2xl" />
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-3">
          <Bone className="h-4 w-32 rounded-md" />
          <Bone className="h-14 w-full rounded-2xl" />
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
          <div key={i} className="rounded-3xl bg-white p-3.5 shadow-card flex items-center gap-3">
            <Bone className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-36 rounded-md" />
              <Bone className="h-3.5 w-full rounded-md" />
            </div>
          </div>
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
        <div className="rounded-4xl bg-white p-6 shadow-card flex flex-col items-center space-y-3">
          <Bone className="h-20 w-20 rounded-3xl" />
          <Bone className="h-6 w-40 rounded-lg" />
          <Bone className="h-6 w-32 rounded-full" />
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-card space-y-2.5">
          <Bone className="h-4 w-44 rounded-md" />
          <Bone className="h-3.5 w-full rounded-md" />
          <Bone className="h-3.5 w-4/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton szczegółów oferty pracy (JobDetailModal) */
export function JobDetailSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie oferty pracy">
      <NativeBarSkeleton />
      <div className="p-4 space-y-4 flex-1 overflow-hidden">
        <div className="rounded-3xl bg-white p-5 shadow-card space-y-3">
          <Bone className="h-4 w-28 rounded-full" />
          <Bone className="h-7 w-4/5 rounded-lg" />
          <Bone className="h-8 w-44 rounded-xl" />
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-card space-y-2.5">
          <Bone className="h-4 w-32 rounded-md" />
          <Bone className="h-4 w-full rounded-md" />
          <Bone className="h-4 w-5/6 rounded-md" />
          <Bone className="h-4 w-3/4 rounded-md" />
        </div>
      </div>
      <div className="border-t border-mist bg-white px-5 py-3">
        <Bone className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Uniwersalny Skeleton dla modali formularzy i akcji (AddAd, EditAd, PromoteAd, ReserveAd, Filtry, Zgłoś, Przystanek) */
export function ModalFormSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist" role="status" aria-label="Ładowanie widoku">
      <NativeBarSkeleton />
      <div className="flex-1 overflow-hidden p-5 space-y-4">
        <Bone className="h-11 w-full rounded-2xl" />
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-3">
          <Bone className="h-4 w-28 rounded-md" />
          <Bone className="h-12 w-full rounded-2xl" />
          <Bone className="h-4 w-24 rounded-md" />
          <Bone className="h-12 w-full rounded-2xl" />
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-card space-y-3">
          <Bone className="h-4 w-36 rounded-md" />
          <div className="grid grid-cols-3 gap-2">
            <Bone className="aspect-square rounded-2xl" />
            <Bone className="aspect-square rounded-2xl" />
            <Bone className="aspect-square rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="border-t border-mist bg-white px-5 py-3">
        <Bone className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export function OverlaySkeleton() {
  return <ModalFormSkeleton />;
}

/**
 * Kontener asynchronicznego widoku:
 * Podczas otwierania dowolnego ekranu/modalu (oraz zmiany viewKey) natychmiast wyświetla
 * dopasowany Skeleton Screen na warstwie GPU (bez blokowania animacji wjazdu), a następnie
 * płynnie podmienia go na docelowy widok.
 */
export function AsyncViewBoundary({
  viewKey,
  mode = 'screen',
  isClosing = false,
  skeleton,
  durationMs = 210,
  children,
}: {
  viewKey: string;
  mode?: 'screen' | 'modal';
  isClosing?: boolean;
  skeleton: ReactNode;
  durationMs?: number;
  children: ReactNode;
}) {
  const [readyKey, setReadyKey] = useState<string | null>(null);

  useEffect(() => {
    setReadyKey(null);
    const timer = window.setTimeout(() => {
      setReadyKey(viewKey);
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [viewKey, durationMs]);

  const isReady = readyKey === viewKey;

  const shellSkeleton = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing
          ? mode === 'modal'
            ? 'native-modal-exit'
            : 'native-screen-exit'
          : mode === 'modal'
            ? 'native-modal-slide'
            : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {skeleton}
      </div>
    </div>
  );

  if (!isReady && !isClosing) {
    return shellSkeleton;
  }

  return (
    <div className="async-view-ready">
      <Suspense fallback={shellSkeleton}>{children}</Suspense>
    </div>
  );
}
