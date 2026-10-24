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

export function OverlaySkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mist">
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist p-5 space-y-4">
        <div className="flex items-center justify-between pt-[max(env(safe-area-inset-top),8px)]">
          <Bone className="h-10 w-20 rounded-full" />
          <Bone className="h-6 w-36 rounded-lg" />
          <div className="w-10" />
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-card space-y-3">
          <Bone className="h-6 w-2/3 rounded-lg" />
          <Bone className="h-4 w-full rounded-md" />
          <Bone className="h-4 w-4/5 rounded-md" />
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-card space-y-3">
          <Bone className="h-28 w-full rounded-2xl" />
          <Bone className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
