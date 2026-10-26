import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';
import { BottomNav, type TabId } from './components/BottomNav';
import {
  AdDetailSkeleton,
  AsyncViewBoundary,
  ChatSkeleton,
  CheckoutSkeleton,
  ConversationsSkeleton,
  ModalFormSkeleton,
  MyAdsSkeleton,
  OverlaySkeleton,
  PartnerSkeleton,
  ProfileSkeleton,
  SellerProfileSkeleton,
  ZditmSkeleton,
} from './components/TabSkeletons';
import { ProductSheet } from './components/ProductSheet';
import { CartPill, CartSheet, type CartLine } from './components/Cart';
import {
  allProducts,
  ads as initialAds,
  initialAdConversations,
  rides as initialRides,
  type Ad,
  type AdConversation,
  type FavoriteBusStop,
  FAVORITE_BUS_STOPS_KEY,
  type LineId,
  type Product,
  type Ride,
  type User,
  type PollItem,
  initialPolls,
  isPollActive,
} from './data/mockData';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ShopScreen } from './screens/ShopScreen';
import { AdsScreen } from './screens/AdsScreen';
import { RidesScreen } from './screens/RidesScreen';
import { TalksScreen } from './screens/TalksScreen';
import type { AdFilterState } from './screens/AdFiltersModal';

// Asynchronicznie ładowane widoki podstron i modali (Lazy Modals)
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })));
const PartnerScreen = lazy(() => import('./screens/PartnerScreen').then((m) => ({ default: m.PartnerScreen })));
const CheckoutScreen = lazy(() => import('./screens/CheckoutScreen').then((m) => ({ default: m.CheckoutScreen })));
const ZditmScreen = lazy(() => import('./screens/ZditmScreen').then((m) => ({ default: m.ZditmScreen })));
const AddAdModal = lazy(() => import('./screens/AddAdModal').then((m) => ({ default: m.AddAdModal })));
const AddRideModal = lazy(() => import('./screens/AddRideModal').then((m) => ({ default: m.AddRideModal })));
const ChatModal = lazy(() => import('./screens/ChatModal').then((m) => ({ default: m.ChatModal })));
const AdDetailModal = lazy(() => import('./screens/AdDetailModal').then((m) => ({ default: m.AdDetailModal })));
const MyAdsModal = lazy(() => import('./screens/MyAdsModal').then((m) => ({ default: m.MyAdsModal })));
const ReportAdModal = lazy(() => import('./screens/ReportAdModal').then((m) => ({ default: m.ReportAdModal })));
const EditAdModal = lazy(() => import('./screens/EditAdModal').then((m) => ({ default: m.EditAdModal })));
const AdConversationsModal = lazy(() => import('./screens/AdConversationsModal').then((m) => ({ default: m.AdConversationsModal })));
const SellerProfileModal = lazy(() => import('./screens/SellerProfileModal').then((m) => ({ default: m.SellerProfileModal })));
const AdFiltersModal = lazy(() => import('./screens/AdFiltersModal').then((m) => ({ default: m.AdFiltersModal })));
const ReserveAdModal = lazy(() => import('./screens/ReserveAdModal').then((m) => ({ default: m.ReserveAdModal })));
const InstallAppModal = lazy(() => import('./screens/InstallAppModal').then((m) => ({ default: m.InstallAppModal })));
const AddFavoriteBusModal = lazy(() => import('./screens/AddFavoriteBusModal').then((m) => ({ default: m.AddFavoriteBusModal })));
const PollsModal = lazy(() => import('./screens/PollsModal').then((m) => ({ default: m.PollsModal })));
const AddPollModal = lazy(() => import('./screens/AddPollModal').then((m) => ({ default: m.AddPollModal })));

type Overlay = null | 'profile' | 'checkout' | 'motylek' | 'zditm';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<TabId>('home');
  const [visitedTabs, setVisitedTabs] = useState<Record<TabId, boolean>>({
    home: true,
    shop: false,
    ads: false,
    rides: false,
    talks: false,
  });
  const scrollPositions = useRef<Record<TabId, number>>({
    home: 0,
    shop: 0,
    ads: 0,
    rides: 0,
    talks: 0,
  });
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [selectedZditmLine, setSelectedZditmLine] = useState<LineId>('M2');
  const [selectedZditmStop, setSelectedZditmStop] = useState<string | undefined>(undefined);
  const [favoriteBuses, setFavoriteBuses] = useState<FavoriteBusStop[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(FAVORITE_BUS_STOPS_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return [];
  });
  const [addFavBusOpen, setAddFavBusOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [sheet, setSheet] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Dynamic ads & rides list
  const [adsList, setAdsList] = useState<Ad[]>(initialAds);
  const [likedAds, setLikedAds] = useState<Record<string, boolean>>({});
  const [ridesList, setRidesList] = useState<Ride[]>(initialRides);
  const [addRideOpen, setAddRideOpen] = useState(false);

  // Modals for Ads logic
  const [addAdOpen, setAddAdOpen] = useState(false);
  const [chatAd, setChatAd] = useState<Ad | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [myAdsOpen, setMyAdsOpen] = useState(false);
  const [reportAd, setReportAd] = useState<Ad | null>(null);

  // Extended Classifieds Views State
  const [conversations, setConversations] = useState<AdConversation[]>(initialAdConversations);
  const [conversationsOpen, setConversationsOpen] = useState(false);
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [sellerProfile, setSellerProfile] = useState<{ name: string; street: string } | null>(null);
  const [reserveAd, setReserveAd] = useState<Ad | null>(null);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [adFilters, setAdFilters] = useState<AdFilterState>({
    sortBy: 'newest',
    minPrice: '',
    maxPrice: '',
    selectedCategory: 'Wszystkie',
    selectedStreet: 'all',
    onlyFree: false,
  });

  // Community Polls State
  const [polls, setPolls] = useState<PollItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mojminsk_polls');
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return initialPolls;
  });

  const [userVotes, setUserVotes] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mojminsk_poll_votes');
        if (stored) return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return {};
  });

  const [pollsModalOpen, setPollsModalOpen] = useState(false);
  const [addPollModalOpen, setAddPollModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mojminsk_polls', JSON.stringify(polls));
    } catch {}
  }, [polls]);

  useEffect(() => {
    try {
      localStorage.setItem('mojminsk_poll_votes', JSON.stringify(userVotes));
    } catch {}
  }, [userVotes]);

  const handleVote = useCallback((pollId: string, optionId: string) => {
    setUserVotes((prev) => ({ ...prev, [pollId]: optionId }));
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          totalVotes: p.totalVotes + 1,
          options: p.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
        };
      })
    );
  }, []);

  const handleAddFavoriteBus = (newFav: Omit<FavoriteBusStop, 'id'>) => {
    const id = `${newFav.lineId}_${newFav.stopName}_${newFav.directionIdx}`;
    setFavoriteBuses((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      const updated = [...filtered, { ...newFav, id }];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(FAVORITE_BUS_STOPS_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const handleRemoveFavoriteBus = (id: string) => {
    setFavoriteBuses((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(FAVORITE_BUS_STOPS_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const handleToggleFavoriteBus = (fav: Omit<FavoriteBusStop, 'id'>) => {
    const id = `${fav.lineId}_${fav.stopName}_${fav.directionIdx}`;
    const exists = favoriteBuses.some((f) => f.id === id);
    if (exists) {
      handleRemoveFavoriteBus(id);
    } else {
      handleAddFavoriteBus(fav);
    }
  };

  // 1. Reset main container scroll immediately upon opening root overlays
  useLayoutEffect(() => {
    if (overlay && mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [overlay]);

  // 2. Prevent browser from retaining scroll offsets on SPA page changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 3. Lock device in portrait orientation on supported browsers/PWAs
  useEffect(() => {
    const lockPortrait = async () => {
      try {
        const orientation = (screen.orientation ||
          (screen as unknown as { mozOrientation?: unknown }).mozOrientation ||
          (screen as unknown as { msOrientation?: unknown }).msOrientation) as
          | { lock?: (o: string) => Promise<void> }
          | undefined;

        if (orientation && typeof orientation.lock === 'function') {
          await orientation.lock('portrait-primary').catch(async () => {
            if (orientation.lock) {
              await orientation.lock('portrait').catch(() => {});
            }
          });
        }
      } catch {
        // Ignored if browser / OS restricts orientation lock (e.g. mobile Safari)
      }
    };

    lockPortrait();
    window.addEventListener('click', lockPortrait, { passive: true });
    window.addEventListener('touchstart', lockPortrait, { passive: true });
    return () => {
      window.removeEventListener('click', lockPortrait);
      window.removeEventListener('touchstart', lockPortrait);
    };
  }, []);

  const isChildScreenActive = Boolean(
    overlay ||
      partnerOpen ||
      selectedAd ||
      myAdsOpen ||
      reportAd ||
      addAdOpen ||
      addRideOpen ||
      chatAd ||
      conversationsOpen ||
      editAd ||
      sellerProfile ||
      reserveAd ||
      filtersModalOpen ||
      installModalOpen ||
      addFavBusOpen ||
      pollsModalOpen ||
      addPollModalOpen
  );

  const [exitingScreens, setExitingScreens] = useState<Record<string, boolean>>({});

  const closeWithAnimation = useCallback((key: string, closeFn: () => void) => {
    setExitingScreens((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      closeFn();
      setExitingScreens((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 220);
  }, []);

  const closeInstallModal = useCallback(() => setInstallModalOpen(false), []);
  const closeAddFavBus = useCallback(() => closeWithAnimation('addFavBus', () => setAddFavBusOpen(false)), [closeWithAnimation]);
  const closeReserveAd = useCallback(() => closeWithAnimation('reserveAd', () => setReserveAd(null)), [closeWithAnimation]);
  const closeFiltersModal = useCallback(() => closeWithAnimation('filtersModal', () => setFiltersModalOpen(false)), [closeWithAnimation]);
  const closeReportAd = useCallback(() => closeWithAnimation('reportAd', () => setReportAd(null)), [closeWithAnimation]);
  const closeChatAd = useCallback(() => closeWithAnimation('chatAd', () => setChatAd(null)), [closeWithAnimation]);
  const closeEditAd = useCallback(() => closeWithAnimation('editAd', () => setEditAd(null)), [closeWithAnimation]);
  const closeSellerProfile = useCallback(() => closeWithAnimation('sellerProfile', () => setSellerProfile(null)), [closeWithAnimation]);
  const closeConversations = useCallback(() => closeWithAnimation('conversations', () => setConversationsOpen(false)), [closeWithAnimation]);
  const closeSelectedAd = useCallback(() => closeWithAnimation('selectedAd', () => setSelectedAd(null)), [closeWithAnimation]);
  const closeAddRide = useCallback(() => closeWithAnimation('addRide', () => setAddRideOpen(false)), [closeWithAnimation]);
  const closeAddAd = useCallback(() => closeWithAnimation('addAd', () => setAddAdOpen(false)), [closeWithAnimation]);
  const closeAddPoll = useCallback(() => closeWithAnimation('addPoll', () => setAddPollModalOpen(false)), [closeWithAnimation]);
  const closePollsModal = useCallback(() => closeWithAnimation('pollsModal', () => setPollsModalOpen(false)), [closeWithAnimation]);
  const closeMyAds = useCallback(() => closeWithAnimation('myAds', () => setMyAdsOpen(false)), [closeWithAnimation]);
  const closePartner = useCallback(() => closeWithAnimation('partner', () => setPartnerOpen(false)), [closeWithAnimation]);
  const closeOverlay = useCallback(() => closeWithAnimation('overlay', () => setOverlay(null)), [closeWithAnimation]);

  const handlePollCreated = useCallback((newPoll: PollItem) => {
    setPolls((prev) => [newPoll, ...prev]);
    closeAddPoll();
  }, [closeAddPoll]);

  // Navigation stack: layers ordered strictly from the topmost nesting level (Level 5 -> Level 1)
  const layers = [
    { active: installModalOpen, close: closeInstallModal },
    { active: !!chatAd, close: closeChatAd },
    { active: !!reportAd, close: closeReportAd },
    { active: !!reserveAd, close: closeReserveAd },
    { active: !!editAd, close: closeEditAd },
    { active: !!sellerProfile, close: closeSellerProfile },
    { active: addPollModalOpen, close: closeAddPoll },
    { active: addRideOpen, close: closeAddRide },
    { active: addAdOpen, close: closeAddAd },
    { active: !!selectedAd, close: closeSelectedAd },
    { active: filtersModalOpen, close: closeFiltersModal },
    { active: addFavBusOpen, close: closeAddFavBus },
    { active: conversationsOpen, close: closeConversations },
    { active: myAdsOpen, close: closeMyAds },
    { active: partnerOpen, close: closePartner },
    { active: pollsModalOpen, close: closePollsModal },
    { active: !!overlay, close: closeOverlay },
  ];
  const depth = layers.filter((l) => l.active).length;
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const prevDepth = useRef(0);
  const closedByPop = useRef(false);
  const ignorePops = useRef(0);

  // Keep browser history in sync with the screen stack, so the system back
  // button / gesture closes the top screen instead of leaving the app.
  useEffect(() => {
    const diff = depth - prevDepth.current;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) window.history.pushState({ layer: true }, '');
    } else if (diff < 0) {
      if (closedByPop.current) closedByPop.current = false;
      else {
        ignorePops.current += 1;
        window.history.go(diff);
      }
    }
    prevDepth.current = depth;
  }, [depth]);

  useEffect(() => {
    const onPop = () => {
      if (ignorePops.current > 0) {
        ignorePops.current -= 1;
        return;
      }
      const top = layersRef.current.find((l) => l.active);
      if (top) {
        closedByPop.current = true;
        top.close();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Swipe from the left screen edge = back
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const onEdgeTouchStart = (e: React.TouchEvent) => {
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onEdgeTouchEnd = (e: React.TouchEvent) => {
    const s = swipeStart.current;
    swipeStart.current = null;
    if (!s) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const dy = Math.abs(e.changedTouches[0].clientY - s.y);
    if (dx > 70 && dy < 60) window.history.back();
  };

  const handleToggleLike = useCallback((adId: string) => {
    setLikedAds((prev) => ({ ...prev, [adId]: !prev[adId] }));
  }, []);

  const handleStatusChange = useCallback((adId: string, status: 'active' | 'reserved' | 'sold') => {
    setAdsList((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, status } : a)),
    );
    setSelectedAd((prev) => (prev && prev.id === adId ? { ...prev, status } : prev));
  }, []);

  const handleDeleteAd = useCallback((adId: string) => {
    setAdsList((prev) => prev.filter((a) => a.id !== adId));
    setSelectedAd((prev) => (prev && prev.id === adId ? null : prev));
  }, []);

  const handleAdUpdated = useCallback((updatedAd: Ad) => {
    setAdsList((prev) => prev.map((a) => (a.id === updatedAd.id ? updatedAd : a)));
    setSelectedAd((prev) => (prev && prev.id === updatedAd.id ? updatedAd : prev));
  }, []);

  const handleDeleteRide = useCallback((rideId: string) => {
    setRidesList((prev) => prev.filter((r) => r.id !== rideId));
  }, []);

  const handleReservationSuccess = useCallback(
    (ad: Ad, details: { spot: string; time: string; phone: string; note: string }) => {
      // Mark ad as reserved
      handleStatusChange(ad.id, 'reserved');

      // Add to conversations
      const newConv: AdConversation = {
        id: `conv_${Date.now()}`,
        adId: ad.id,
        adTitle: ad.title,
        adPrice: ad.price,
        adImage: ad.image,
        adStreet: ad.street,
        otherUser: {
          name: ad.author,
          street: ad.street,
        },
        role: 'buyer',
        lastMessage: `Rezerwacja: odbiór ${details.spot}, termin: ${details.time}`,
        lastMessageTime: 'Przed chwilą',
        unreadCount: 0,
      };

      setConversations((prev) => [newConv, ...prev.filter((c) => c.adId !== ad.id)]);
      setReserveAd(null);
      setChatAd(ad);
    },
    [handleStatusChange],
  );

  const activeFiltersCount =
    (adFilters.sortBy !== 'newest' ? 1 : 0) +
    (adFilters.minPrice ? 1 : 0) +
    (adFilters.maxPrice ? 1 : 0) +
    (adFilters.selectedCategory !== 'Wszystkie' ? 1 : 0) +
    (adFilters.selectedStreet !== 'all' ? 1 : 0) +
    (adFilters.onlyFree ? 1 : 0);

  const unreadConversationsCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const add = useCallback((p: Product, qty = 1) => setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + qty })), []);
  const setQty = useCallback(
    (id: string, qty: number) =>
      setCart((c) => {
        const next = { ...c };
        if (qty <= 0) delete next[id];
        else next[id] = qty;
        return next;
      }),
    [],
  );

  const lines: CartLine[] = Object.entries(cart).map(([id, qty]) => ({
    product: allProducts.find((p) => p.id === id)!,
    qty,
  })).filter((l) => Boolean(l.product));

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  const userAds = user
    ? adsList.filter((a) => a.isOwner || a.author.toLowerCase().includes(user.name.toLowerCase()))
    : [];
  const userActiveAdsCount = userAds.filter((a) => (a.status ?? 'active') === 'active').length;
  const userReservedAdsCount = userAds.filter((a) => a.status === 'reserved').length;
  const userRidesCount = user
    ? ridesList.filter((r) => r.driver.toLowerCase() === user.name.toLowerCase()).length
    : 0;

  const handleTabChange = useCallback(
    (nextTab: TabId) => {
      if (nextTab === tab) {
        if (mainRef.current) {
          mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      if (mainRef.current) {
        scrollPositions.current[tab] = mainRef.current.scrollTop;
      }
      setVisitedTabs((prev) => (prev[nextTab] ? prev : { ...prev, [nextTab]: true }));
      setTab(nextTab);
      requestAnimationFrame(() => {
        if (mainRef.current) {
          mainRef.current.scrollTop = scrollPositions.current[nextTab] || 0;
        }
      });
    },
    [tab],
  );

  // Preload async modal chunks in background so opening overlays has zero delay
  useEffect(() => {
    const id = window.setTimeout(() => {
      void import('./screens/ProfileScreen');
      void import('./screens/AdDetailModal');
      void import('./screens/MyAdsModal');
      void import('./screens/ZditmScreen');
      void import('./screens/PartnerScreen');
      void import('./screens/CheckoutScreen');
      void import('./screens/AddAdModal');
      void import('./screens/AddRideModal');
      void import('./screens/EditAdModal');
      void import('./screens/AdConversationsModal');
      void import('./screens/SellerProfileModal');
      void import('./screens/ChatModal');
      void import('./screens/AdFiltersModal');
      void import('./screens/ReserveAdModal');
      void import('./screens/ReportAdModal');
      void import('./screens/AddFavoriteBusModal');
      void import('./screens/InstallAppModal');
      void import('./screens/PollsModal');
      void import('./screens/AddPollModal');
    }, 100);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const showChrome = Boolean(user && !overlay);

  return (
    <div className="h-full h-[100dvh] w-full overflow-hidden bg-mist select-none">
      <div
        ref={setFrame}
        className="relative mx-auto flex h-full h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-mist shadow-2xl"
      >
        <main
          ref={mainRef}
          className="h-full w-full flex-1 overflow-y-auto overscroll-contain"
        >
          {!user ? (
            <div className="min-h-full">
              <OnboardingScreen onDone={setUser} />
            </div>
          ) : (
            <div className="min-h-full">
              <div className={tab === 'home' ? 'min-h-full' : 'hidden'}>
                <HomeScreen
                  user={user}
                  onTab={handleTabChange}
                  onProfile={() => setOverlay('profile')}
                  onPartner={() => setPartnerOpen(true)}
                  onZditm={(line, stopName) => {
                    setSelectedZditmLine(line ?? 'M2');
                    setSelectedZditmStop(stopName);
                    setOverlay('zditm');
                  }}
                  onMotylek={() => handleTabChange('shop')}
                  favoriteBuses={favoriteBuses}
                  onAddFavoriteBus={() => setAddFavBusOpen(true)}
                  onRemoveFavoriteBus={handleRemoveFavoriteBus}
                  polls={polls}
                  userVotes={userVotes}
                  onVote={handleVote}
                  onOpenPolls={() => setPollsModalOpen(true)}
                />
              </div>

              {visitedTabs.shop && (
                <div className={tab === 'shop' ? 'min-h-full' : 'hidden'}>
                  <ShopScreen
                    user={user}
                    onProfile={() => setOverlay('profile')}
                    onOpenProduct={setSheet}
                    onAdd={(p) => add(p)}
                    qtyOf={(id) => cart[id] ?? 0}
                    totalCartValue={total}
                  />
                </div>
              )}

              {visitedTabs.ads && (
                <div className={tab === 'ads' ? 'min-h-full' : 'hidden'}>
                  <AdsScreen
                    user={user}
                    onProfile={() => setOverlay('profile')}
                    adsList={adsList}
                    likedAds={likedAds}
                    onToggleLike={handleToggleLike}
                    onAdClick={(ad) => setSelectedAd(ad)}
                    onChatClick={(ad) => setChatAd(ad)}
                    onOpenFilters={() => setFiltersModalOpen(true)}
                    activeFiltersCount={activeFiltersCount}
                    onOpenConversations={() => setConversationsOpen(true)}
                    conversationsUnreadCount={unreadConversationsCount}
                    filtersState={adFilters}
                  />
                </div>
              )}

              {visitedTabs.rides && (
                <div className={tab === 'rides' ? 'min-h-full' : 'hidden'}>
                  <RidesScreen
                    user={user}
                    onProfile={() => setOverlay('profile')}
                    ridesList={ridesList}
                    onDeleteRide={handleDeleteRide}
                  />
                </div>
              )}

              {visitedTabs.talks && (
                <div className={tab === 'talks' ? 'min-h-full' : 'hidden'}>
                  <TalksScreen
                    user={user}
                    onProfile={() => setOverlay('profile')}
                    onNeighborClick={(name, street) => setSellerProfile({ name, street })}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        {showChrome && !isChildScreenActive && count > 0 && (tab === 'shop' || tab === 'home') && (
          <CartPill count={count} total={total} onOpen={() => setCartOpen(true)} />
        )}
        {showChrome && !isChildScreenActive && <BottomNav tab={tab} onChange={handleTabChange} />}

        {depth > 0 && (
          <div
            aria-hidden
            onTouchStart={onEdgeTouchStart}
            onTouchEnd={onEdgeTouchEnd}
            className="fixed inset-y-0 left-0 z-[70] w-4"
          />
        )}

        <ProductSheet product={sheet} onClose={() => setSheet(null)} onAdd={add} container={frame} />
        <CartSheet
          open={cartOpen}
          onOpenChange={setCartOpen}
          lines={lines}
          setQty={setQty}
          onPaid={() => setCart({})}
          onProceedToCheckout={() => setOverlay('checkout')}
          container={frame}
        />

        {/* LEVEL 1 (z-[50]): Root Pushed Screens from Tabs */}
        {user && overlay === 'profile' && (
          <AsyncViewBoundary
            viewKey="overlay-profile"
            level={1}
            isClosing={!!exitingScreens['overlay']}
            skeleton={<ProfileSkeleton />}
          >
            <ProfileScreen
              user={user}
              onBack={closeOverlay}
              isClosing={!!exitingScreens['overlay']}
              onUpdate={setUser}
              onPartner={() => setPartnerOpen(true)}
              onAddAd={() => setAddAdOpen(true)}
              onMyAds={() => setMyAdsOpen(true)}
              myAdsCount={userActiveAdsCount}
              myReservedAdsCount={userReservedAdsCount}
              onOpenConversations={() => setConversationsOpen(true)}
              conversations={conversations}
              onOpenChatWithNeighbor={(conv) => {
                const foundAd = adsList.find((a) => a.id === conv.adId);
                if (foundAd) {
                  setChatAd(foundAd);
                } else {
                  setChatAd({
                    id: conv.adId,
                    title: conv.adTitle,
                    price: conv.adPrice,
                    kind: conv.adPrice ? 'sell' : 'free',
                    author: conv.otherUser.name,
                    street: conv.adStreet,
                    time: 'Dzisiaj',
                    image: conv.adImage,
                  });
                }
              }}
              unreadConversationsCount={unreadConversationsCount}
              onPreviewPublic={() => setSellerProfile({ name: user.name, street: user.street.name })}
              onAddRide={() => setAddRideOpen(true)}
              myRidesCount={userRidesCount}
              onOpenPolls={() => setPollsModalOpen(true)}
              onAddPoll={() => setAddPollModalOpen(true)}
              activePollsCount={polls.filter(isPollActive).length}
              onInstallApp={() => setInstallModalOpen(true)}
              userAds={userAds}
            />
          </AsyncViewBoundary>
        )}

        {user && overlay === 'zditm' && (
          <AsyncViewBoundary
            viewKey={`overlay-zditm-${selectedZditmLine}-${selectedZditmStop ?? 'all'}`}
            level={1}
            isClosing={!!exitingScreens['overlay']}
            skeleton={<ZditmSkeleton />}
          >
            <ZditmScreen
              initialLine={selectedZditmLine}
              initialStopName={selectedZditmStop}
              favoriteBuses={favoriteBuses}
              onToggleFavorite={handleToggleFavoriteBus}
              onRemoveFavorite={handleRemoveFavoriteBus}
              onBack={closeOverlay}
              isClosing={!!exitingScreens['overlay']}
            />
          </AsyncViewBoundary>
        )}

        {user && overlay === 'checkout' && (
          <AsyncViewBoundary
            viewKey="overlay-checkout"
            level={1}
            isClosing={!!exitingScreens['overlay']}
            skeleton={<CheckoutSkeleton />}
          >
            <CheckoutScreen
              lines={lines}
              user={user}
              onBack={closeOverlay}
              isClosing={!!exitingScreens['overlay']}
              onSuccess={() => {
                setCart({});
                closeOverlay();
              }}
            />
          </AsyncViewBoundary>
        )}

        {user && pollsModalOpen && (
          <AsyncViewBoundary
            viewKey="modal-polls"
            level={1}
            isClosing={!!exitingScreens['pollsModal']}
            skeleton={<OverlaySkeleton />}
          >
            <PollsModal
              user={user}
              polls={polls}
              userVotes={userVotes}
              onVote={handleVote}
              onClose={closePollsModal}
              onAddPoll={() => setAddPollModalOpen(true)}
              isClosing={!!exitingScreens['pollsModal']}
            />
          </AsyncViewBoundary>
        )}

        {/* LEVEL 2 (z-[52]): Views opened from Tabs OR nested inside Level 1 (e.g. from Profile / ZDiTM) */}
        {user && partnerOpen && (
          <AsyncViewBoundary
            viewKey="overlay-partner"
            level={2}
            isClosing={!!exitingScreens['partner']}
            skeleton={<PartnerSkeleton />}
          >
            <PartnerScreen
              onBack={closePartner}
              isClosing={!!exitingScreens['partner']}
            />
          </AsyncViewBoundary>
        )}

        {user && myAdsOpen && (
          <AsyncViewBoundary
            viewKey="modal-my-ads"
            level={2}
            isClosing={!!exitingScreens['myAds']}
            skeleton={<MyAdsSkeleton />}
          >
            <MyAdsModal
              user={user}
              ads={adsList}
              onClose={closeMyAds}
              isClosing={!!exitingScreens['myAds']}
              onOpenAd={(ad) => setSelectedAd(ad)}
              onAddNew={() => setAddAdOpen(true)}
              onStatusChange={handleStatusChange}
              onDeleteAd={handleDeleteAd}
              onEditAd={(ad) => setEditAd(ad)}
            />
          </AsyncViewBoundary>
        )}

        {user && conversationsOpen && (
          <AsyncViewBoundary
            viewKey="modal-conversations"
            level={2}
            isClosing={!!exitingScreens['conversations']}
            skeleton={<ConversationsSkeleton />}
          >
            <AdConversationsModal
              user={user}
              conversations={conversations}
              ads={adsList}
              onClose={closeConversations}
              isClosing={!!exitingScreens['conversations']}
              onOpenChat={(ad) => setChatAd(ad)}
            />
          </AsyncViewBoundary>
        )}

        {user && filtersModalOpen && (
          <AsyncViewBoundary
            viewKey="modal-filters"
            level={2}
            isClosing={!!exitingScreens['filtersModal']}
            skeleton={<ModalFormSkeleton />}
          >
            <AdFiltersModal
              currentFilters={adFilters}
              totalMatching={adsList.length}
              onClose={closeFiltersModal}
              isClosing={!!exitingScreens['filtersModal']}
              onApply={(f) => setAdFilters(f)}
              onReset={() =>
                setAdFilters({
                  sortBy: 'newest',
                  minPrice: '',
                  maxPrice: '',
                  selectedCategory: 'Wszystkie',
                  selectedStreet: 'all',
                  onlyFree: false,
                })
              }
            />
          </AsyncViewBoundary>
        )}

        {user && addFavBusOpen && (
          <AsyncViewBoundary
            viewKey="modal-add-fav-bus"
            level={2}
            isClosing={!!exitingScreens['addFavBus']}
            skeleton={<ModalFormSkeleton />}
          >
            <AddFavoriteBusModal
              onClose={closeAddFavBus}
              isClosing={!!exitingScreens['addFavBus']}
              onSave={handleAddFavoriteBus}
            />
          </AsyncViewBoundary>
        )}

        {user && addPollModalOpen && (
          <AsyncViewBoundary
            viewKey="modal-add-poll"
            level={2}
            isClosing={!!exitingScreens['addPoll']}
            skeleton={<ModalFormSkeleton />}
          >
            <AddPollModal
              user={user}
              onClose={closeAddPoll}
              onPollCreated={handlePollCreated}
              isClosing={!!exitingScreens['addPoll']}
            />
          </AsyncViewBoundary>
        )}

        {/* LEVEL 3 (z-[54]): Views opened from Level 0/1/2 (e.g. AdDetail from Ads/MyAds, AddAd from Profile/MyAds) */}
        {user && selectedAd && (
          <AsyncViewBoundary
            viewKey={`ad-detail-${selectedAd.id}`}
            level={3}
            isClosing={!!exitingScreens['selectedAd']}
            skeleton={<AdDetailSkeleton />}
          >
            <AdDetailModal
              ad={selectedAd}
              user={user}
              isLiked={!!likedAds[selectedAd.id]}
              onClose={closeSelectedAd}
              isClosing={!!exitingScreens['selectedAd']}
              onToggleLike={handleToggleLike}
              onChatClick={(ad) => setChatAd(ad)}
              onReportClick={(ad) => setReportAd(ad)}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteAd}
              onSellerClick={(name, street) => setSellerProfile({ name, street })}
              onEditClick={(ad) => setEditAd(ad)}
              onReserveClick={(ad) => setReserveAd(ad)}
            />
          </AsyncViewBoundary>
        )}

        {user && addAdOpen && (
          <AsyncViewBoundary
            viewKey="modal-add-ad"
            level={3}
            isClosing={!!exitingScreens['addAd']}
            skeleton={<ModalFormSkeleton />}
          >
            <AddAdModal
              user={user}
              onClose={closeAddAd}
              isClosing={!!exitingScreens['addAd']}
              onAdCreated={(newAd) => setAdsList((prev) => [newAd, ...prev])}
            />
          </AsyncViewBoundary>
        )}

        {user && addRideOpen && (
          <AsyncViewBoundary
            viewKey="modal-add-ride"
            level={3}
            isClosing={!!exitingScreens['addRide']}
            skeleton={<ModalFormSkeleton />}
          >
            <AddRideModal
              user={user}
              rides={ridesList}
              onClose={closeAddRide}
              isClosing={!!exitingScreens['addRide']}
              onRideCreated={(newRide) => setRidesList((prev) => [newRide, ...prev])}
              onDeleteRide={handleDeleteRide}
            />
          </AsyncViewBoundary>
        )}

        {/* LEVEL 4 (z-[56]): Views nested inside AdDetail / MyAds / Profile */}
        {user && editAd && (
          <AsyncViewBoundary
            viewKey={`edit-ad-${editAd.id}`}
            level={4}
            isClosing={!!exitingScreens['editAd']}
            skeleton={<ModalFormSkeleton />}
          >
            <EditAdModal
              ad={editAd}
              user={user}
              onClose={closeEditAd}
              isClosing={!!exitingScreens['editAd']}
              onAdUpdated={handleAdUpdated}
            />
          </AsyncViewBoundary>
        )}

        {user && sellerProfile && (
          <AsyncViewBoundary
            viewKey={`seller-profile-${sellerProfile.name}-${sellerProfile.street}`}
            level={4}
            isClosing={!!exitingScreens['sellerProfile']}
            skeleton={<SellerProfileSkeleton />}
          >
            <SellerProfileModal
              sellerName={sellerProfile.name}
              sellerStreet={sellerProfile.street}
              currentUser={user}
              allAds={adsList}
              onClose={closeSellerProfile}
              isClosing={!!exitingScreens['sellerProfile']}
              onOpenAd={(ad) => {
                setSellerProfile(null);
                setSelectedAd(ad);
              }}
              onStartChat={(ad) => setChatAd(ad)}
            />
          </AsyncViewBoundary>
        )}

        {user && reserveAd && (
          <AsyncViewBoundary
            viewKey={`reserve-ad-${reserveAd.id}`}
            level={4}
            isClosing={!!exitingScreens['reserveAd']}
            skeleton={<ModalFormSkeleton />}
          >
            <ReserveAdModal
              ad={reserveAd}
              user={user}
              onClose={closeReserveAd}
              isClosing={!!exitingScreens['reserveAd']}
              onSuccess={handleReservationSuccess}
            />
          </AsyncViewBoundary>
        )}

        {user && reportAd && (
          <AsyncViewBoundary
            viewKey={`report-ad-${reportAd.id}`}
            level={4}
            isClosing={!!exitingScreens['reportAd']}
            skeleton={<ModalFormSkeleton />}
          >
            <ReportAdModal
              ad={reportAd}
              onClose={closeReportAd}
              isClosing={!!exitingScreens['reportAd']}
            />
          </AsyncViewBoundary>
        )}

        {/* LEVEL 5 (z-[58]): 1:1 Neighbor Chat (can be opened from Level 0, 2, 3, or 4) */}
        {user && chatAd && (
          <AsyncViewBoundary
            viewKey={`chat-ad-${chatAd.id}`}
            level={5}
            isClosing={!!exitingScreens['chatAd']}
            skeleton={<ChatSkeleton />}
          >
            <ChatModal
              ad={chatAd}
              user={user}
              onClose={closeChatAd}
              isClosing={!!exitingScreens['chatAd']}
            />
          </AsyncViewBoundary>
        )}

        {/* PWA Install Modal (iOS Safari & Android Chrome) */}
        {installModalOpen && (
          <Suspense fallback={<OverlaySkeleton />}>
            <InstallAppModal
              open={installModalOpen}
              onOpenChange={setInstallModalOpen}
              container={frame}
            />
          </Suspense>
        )}

        {/* Mobile Landscape Orientation Barrier */}
        <div
          role="alert"
          aria-live="assertive"
          className="landscape-barrier fixed inset-0 z-[9999] hidden flex-col items-center justify-center bg-ink/95 px-6 text-center text-white backdrop-blur-md select-none"
        >
          <div className="relative mb-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-sand text-ink shadow-lg animate-pulse">
              <Smartphone className="h-9 w-9 rotate-90" aria-hidden />
            </div>
            <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-coral text-ink shadow">
              <RotateCcw className="h-4 w-4" aria-hidden />
            </div>
          </div>
          <h2 className="font-display text-[20px] font-bold tracking-tight">Obróć telefon pionowo</h2>
          <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-white/75">
            Aplikacja mójMińsk została zaprojektowana wyłącznie do pracy w widoku pionowym.
          </p>
        </div>
      </div>
    </div>
  );
}
