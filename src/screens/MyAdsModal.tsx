import { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  Heart,
  MessageCircle,
  Plus,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { NativeHeader, cn, zl } from '../components/ui';
import type { Ad, Job, User } from '../data/mockData';

interface MyAdsModalProps {
  user: User;
  ads: Ad[];
  jobs: Job[];
  onClose: () => void;
  onOpenAd: (ad: Ad) => void;
  onAddNew: () => void;
  onStatusChange: (adId: string, status: 'active' | 'reserved' | 'sold') => void;
  onDeleteAd: (adId: string) => void;
  onEditAd?: (ad: Ad) => void;
  onPromoteAd?: (ad: Ad) => void;
  isClosing?: boolean;
}

export function MyAdsModal({
  user,
  ads,
  jobs: _jobs,
  onClose,
  onOpenAd,
  onAddNew,
  onStatusChange,
  onDeleteAd,
  onEditAd,
  onPromoteAd,
  isClosing = false,
}: MyAdsModalProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'reserved' | 'sold'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter ads created by this user
  const myAds = ads.filter(
    (a) => a.isOwner || a.author.toLowerCase().includes(user.name.toLowerCase()),
  );

  const filteredAds = myAds.filter((a) => {
    const status = a.status ?? 'active';
    if (filter === 'all') return true;
    return status === filter;
  });

  const totalViews = myAds.reduce((sum, a) => sum + (a.views ?? 25), 0);
  const activeCount = myAds.filter((a) => (a.status ?? 'active') === 'active').length;
  const reservedCount = myAds.filter((a) => a.status === 'reserved').length;
  const soldCount = myAds.filter((a) => a.status === 'sold').length;

  const tabs = [
    { id: 'all', label: 'Wszystkie', count: myAds.length },
    { id: 'active', label: 'Aktywne', count: activeCount },
    { id: 'reserved', label: 'Rezerwacje', count: reservedCount },
    { id: 'sold', label: 'Sprzedane', count: soldCount },
  ] as const;

  const statusMeta = {
    active: {
      label: 'Aktywne',
      cls: 'bg-emerald-100 text-emerald-900',
      dot: 'bg-emerald-600',
    },
    reserved: {
      label: 'Zarezerwowane',
      cls: 'bg-amber-100 text-amber-900',
      dot: 'bg-amber-500',
    },
    sold: {
      label: 'Sprzedane',
      cls: 'bg-mist-300 text-ink-700',
      dot: 'bg-ink-500',
    },
  } as const;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Native Top Navigation Bar */}
        <NativeHeader
          title="Moje ogłoszenia"
          backLabel="Profil"
          onBack={onClose}
          right={
            <button
              type="button"
              onClick={onAddNew}
              aria-label="Dodaj ogłoszenie"
              className="mr-1 flex h-9 items-center gap-1 rounded-full bg-ink px-3.5 text-[12px] font-bold text-white transition-transform active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Dodaj
            </button>
          }
        />

        {/* Compact Mobile Summary & Segmented Filter Control */}
        <div className="border-b border-mist-300 bg-white px-4 pb-3 pt-1 shrink-0 space-y-2.5">
          {/* Slim stats strip */}
          <div className="flex items-center justify-between rounded-2xl bg-mist/70 px-3.5 py-2 text-[11.5px] font-semibold text-ink-600">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-ink-400" />
              Łącznie wyświetleń: <strong className="font-extrabold text-ink">{totalViews}</strong>
            </span>
            <span className="h-3 w-px bg-mist-300" />
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-sky-700" />
              Zapytania: <strong className="font-extrabold text-ink">{myAds.length * 3}</strong>
            </span>
          </div>

          {/* 4-column Segmented Tabs fitting 100% mobile width */}
          <div className="grid grid-cols-4 gap-1 rounded-2xl bg-mist p-1">
            {tabs.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl py-1.5 px-1 transition-all active:scale-95',
                    active
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-ink-500 hover:text-ink',
                  )}
                >
                  <span className="text-[11px] font-bold leading-tight truncate max-w-full">
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 rounded-full px-1.5 text-[9.5px] font-extrabold leading-tight',
                      active ? 'bg-ink text-white' : 'bg-mist-300/80 text-ink-600',
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean List of User Ads (No bloated photos) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5 pb-28">
          {filteredAds.length === 0 ? (
            <div className="mt-4 rounded-3xl bg-white p-7 text-center shadow-card">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sand-100 text-ink">
                <Tag className="h-5 w-5" />
              </div>
              <p className="mt-3 font-display text-[16px] font-bold text-ink">
                Brak ogłoszeń w tej zakładce
              </p>
              <p className="mt-1 text-[12.5px] text-ink-500 leading-relaxed">
                Wystaw niepotrzebne przedmioty, rower lub meble i przekaż je sąsiadom z Mińska.
              </p>
              <button
                type="button"
                onClick={onAddNew}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-[13px] font-bold text-ink shadow-coral active:scale-95 transition-transform"
              >
                <Plus className="h-4 w-4" />
                Wystaw ogłoszenie
              </button>
            </div>
          ) : (
            filteredAds.map((ad) => {
              const status = ad.status ?? 'active';
              const meta = statusMeta[status];
              const isConfirmingDelete = confirmDeleteId === ad.id;

              return (
                <article
                  key={ad.id}
                  className={cn(
                    'overflow-hidden rounded-3xl bg-white shadow-card transition-all border',
                    ad.promoted ? 'border-amber-300 ring-1 ring-amber-200/60' : 'border-transparent',
                  )}
                >
                  {/* Main List Item Row -> Tapping opens Offer View */}
                  <button
                    type="button"
                    onClick={() => onOpenAd(ad)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-mist/30 active:bg-mist/50"
                  >
                    <div className="min-w-0 flex-1">
                      {/* Top badges: Status + Promoted + Time */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                            meta.cls,
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                          {meta.label}
                        </span>

                        {ad.promoted && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                            <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                            Wyróżnione
                          </span>
                        )}

                        <span className="flex items-center gap-0.5 text-[10.5px] font-medium text-ink-400">
                          <Clock className="h-3 w-3" />
                          {ad.time}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="mt-1.5 truncate font-display text-[15.5px] font-bold text-ink">
                        {ad.title}
                      </p>

                      {/* Price & Counters */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[13.5px] font-extrabold text-coral-700">
                          {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Zgłoszenie'}
                        </span>
                        <span className="text-mist-300">•</span>
                        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-ink-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-ink-400" /> {ad.views ?? 35}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5 text-coral" /> 4
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5 text-sky-700" /> 2
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Arrow CTA -> Go to Offer View */}
                    <div className="flex shrink-0 items-center gap-1 rounded-2xl bg-mist px-3 py-2 text-[11.5px] font-bold text-ink">
                      <span>Oferta</span>
                      <ChevronRight className="h-4 w-4 text-ink-500" />
                    </div>
                  </button>

                  {/* 1-Tap Mobile Status Switcher */}
                  <div className="px-4 pb-2.5">
                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-mist p-1">
                      <button
                        type="button"
                        onClick={() => onStatusChange(ad.id, 'active')}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all active:scale-95',
                          status === 'active'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-ink-500 hover:text-ink',
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            status === 'active' ? 'bg-white' : 'bg-emerald-500',
                          )}
                        />
                        Aktywne
                      </button>

                      <button
                        type="button"
                        onClick={() => onStatusChange(ad.id, 'reserved')}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all active:scale-95',
                          status === 'reserved'
                            ? 'bg-amber-500 text-ink shadow-xs'
                            : 'text-ink-500 hover:text-ink',
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        Rezerwacja
                      </button>

                      <button
                        type="button"
                        onClick={() => onStatusChange(ad.id, 'sold')}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition-all active:scale-95',
                          status === 'sold'
                            ? 'bg-ink text-white shadow-xs'
                            : 'text-ink-500 hover:text-ink',
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Sprzedane
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action Bar or Inline Delete Confirmation */}
                  {isConfirmingDelete ? (
                    <div className="flex items-center justify-between gap-2 border-t border-coral-100 bg-coral-50/70 px-4 py-2.5">
                      <span className="text-[12px] font-bold text-coral-900">
                        Na pewno usunąć ofertę?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-xl bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink shadow-xs active:scale-95"
                        >
                          Anuluj
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteId(null);
                            onDeleteAd(ad.id);
                          }}
                          className="rounded-xl bg-coral px-3 py-1.5 text-[11.5px] font-bold text-ink shadow-xs active:scale-95"
                        >
                          Tak, usuń
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 border-t border-mist px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => onEditAd?.(ad)}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-mist text-[11.5px] font-bold text-ink active:scale-95 transition-transform hover:bg-mist-200"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-ink-600" />
                        Edytuj
                      </button>

                      <button
                        type="button"
                        onClick={() => onPromoteAd?.(ad)}
                        className={cn(
                          'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-[11.5px] font-bold active:scale-95 transition-transform',
                          ad.promoted
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200',
                        )}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        {ad.promoted ? 'Promowane' : 'Wyróżnij'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(ad.id)}
                        aria-label="Usuń ogłoszenie"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mist text-ink-400 hover:bg-coral-50 hover:text-coral active:scale-95 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Sticky Bottom CTA Bar */}
        <div className="border-t border-mist-300 bg-white/95 px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] backdrop-blur shrink-0">
          <button
            type="button"
            onClick={onAddNew}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink font-display text-[14.5px] font-semibold text-white shadow-float transition-transform active:scale-98"
          >
            <Plus className="h-4 w-4 text-sand" />
            Wystaw nowe ogłoszenie
          </button>
        </div>
      </div>
    </div>
  );
}
