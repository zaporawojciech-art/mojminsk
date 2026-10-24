import { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  Heart,
  MessageCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Img, NativeHeader, cn, zl } from '../components/ui';
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
              onClick={() => {
                onClose();
                onAddNew();
              }}
              aria-label="Dodaj ogłoszenie"
              className="mr-1 flex h-11 items-center gap-1 rounded-full bg-coral px-4 text-[13px] font-bold text-ink shadow-coral transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Dodaj
            </button>
          }
        />

        {/* Stats summary bar */}
        <div className="grid grid-cols-2 gap-2 bg-white px-4 pb-3 border-b border-mist">
          <div className="rounded-2xl bg-mist p-2.5 text-center">
            <p className="font-display text-[18px] font-extrabold text-ink">{totalViews}</p>
            <p className="text-[11px] font-semibold text-ink-500 flex items-center justify-center gap-1">
              <Eye className="h-3 w-3" /> Wyświetleń ofert
            </p>
          </div>
          <div className="rounded-2xl bg-mist p-2.5 text-center">
            <p className="font-display text-[18px] font-extrabold text-ink">{myAds.length * 3}</p>
            <p className="text-[11px] font-semibold text-ink-500 flex items-center justify-center gap-1">
              <MessageCircle className="h-3 w-3" /> Zapytań sąsiadów
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-mist-300 bg-white px-4 py-2.5 no-scrollbar shrink-0">
          {(
            [
              { id: 'all', label: 'Wszystkie', count: myAds.length },
              { id: 'active', label: 'Aktywne', count: activeCount },
              {
                id: 'reserved',
                label: 'Zarezerwowane',
                count: myAds.filter((a) => a.status === 'reserved').length,
              },
              {
                id: 'sold',
                label: 'Zakończone',
                count: myAds.filter((a) => a.status === 'sold').length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'flex items-center gap-1 min-h-11 rounded-full px-4 text-[12px] font-bold transition-colors whitespace-nowrap',
                filter === tab.id
                  ? 'bg-ink text-white'
                  : 'bg-mist text-ink-500 hover:text-ink',
              )}
            >
              {tab.label}
              <span className={cn('text-[10px] rounded-full px-1.5 py-0.2', filter === tab.id ? 'bg-coral text-ink' : 'bg-mist-300 text-ink-700')}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List of Ads */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 pb-[max(env(safe-area-inset-bottom),20px)]">
          {filteredAds.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-card">
              <p className="font-display text-[16px] font-bold text-ink">Brak ogłoszeń w tej kategorii</p>
              <p className="mt-1 text-[13px] text-ink-500">
                Wystaw niepotrzebne przedmioty, meble lub sprzęt i zrób miejsce w domu.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onAddNew();
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-[13px] font-bold text-ink shadow-coral"
              >
                <Plus className="h-4 w-4" />
                Wystaw pierwsze ogłoszenie
              </button>
            </div>
          ) : (
            filteredAds.map((ad) => {
              const status = ad.status ?? 'active';
              return (
                <article
                  key={ad.id}
                  className="overflow-hidden rounded-3xl bg-white p-3.5 shadow-card transition-shadow"
                >
                  <div className="flex gap-3">
                    <div
                      onClick={() => {
                        onClose();
                        onOpenAd(ad);
                      }}
                      className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-mist"
                    >
                      <Img src={ad.image} alt={ad.title} className="h-full w-full object-cover" />
                      {status === 'reserved' && (
                        <div className="absolute inset-0 bg-amber-500/70 flex items-center justify-center text-[10px] font-extrabold text-white text-center p-1">
                          Zarezerwowane
                        </div>
                      )}
                      {status === 'sold' && (
                        <div className="absolute inset-0 bg-ink/75 flex items-center justify-center text-[10px] font-extrabold text-white text-center p-1">
                          Sprzedane
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-display text-[16px] font-bold text-ink">
                          {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Zgłoszenie'}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10.5px] text-ink-400">
                          <Clock className="h-3 w-3" />
                          {ad.time}
                        </span>
                      </div>
                      <p
                        onClick={() => {
                          onClose();
                          onOpenAd(ad);
                        }}
                        className="cursor-pointer text-[13px] font-semibold text-ink-700 truncate mt-0.5 hover:text-coral transition-colors"
                      >
                        {ad.title}
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {ad.views ?? 35}
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

                  {/* Owner Action Buttons: Edit & Promote */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditAd?.(ad);
                      }}
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-mist text-[12px] font-bold text-ink hover:bg-mist-200 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-ink-600" />
                      Edytuj
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onPromoteAd?.(ad);
                      }}
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-100 text-[12px] font-bold text-amber-900 hover:bg-amber-200 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      Wyróżnij (BLIK)
                    </button>
                  </div>

                  {/* Quick Action Controls */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-mist pt-2">
                    <div className="flex items-center gap-1.5">
                      {status !== 'active' && (
                        <button
                          onClick={() => onStatusChange(ad.id, 'active')}
                          className="flex items-center gap-1 rounded-full bg-mist min-h-11 px-3 text-[11px] font-bold text-ink hover:bg-mist-200"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Aktywuj
                        </button>
                      )}
                      {status !== 'reserved' && (
                        <button
                          onClick={() => onStatusChange(ad.id, 'reserved')}
                          className="flex items-center gap-1 rounded-full bg-amber-100 min-h-11 px-3 text-[11px] font-bold text-amber-900 hover:bg-amber-200"
                        >
                          Rezerwacja
                        </button>
                      )}
                      {status !== 'sold' && (
                        <button
                          onClick={() => onStatusChange(ad.id, 'sold')}
                          className="flex items-center gap-1 rounded-full bg-mist-300 min-h-11 px-3 text-[11px] font-bold text-ink hover:bg-mist-200"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Sprzedane
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAd(ad);
                        }}
                        className="rounded-full min-h-11 px-3 text-[11px] font-bold text-ink-700 hover:bg-mist"
                      >
                        Podgląd
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Usunąć to ogłoszenie?')) {
                            onDeleteAd(ad.id);
                          }
                        }}
                        className="grid h-11 w-11 place-items-center rounded-full text-coral active:bg-coral-50"
                        aria-label="Usuń ogłoszenie"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
