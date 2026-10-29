import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';
import { BottomNav, type TabId } from './components/BottomNav';
import {
  AdDetailSkeleton,
  AsyncViewBoundary,
  ChatSkeleton,
  ConversationsSkeleton,
  ModalFormSkeleton,
  MyAdsSkeleton,
  OverlaySkeleton,
  PartnerSkeleton,
  ProfileSkeleton,
  SellerProfileSkeleton,
  ZditmSkeleton,
} from './components/TabSkeletons';
import {
  ads as initialAds,
  rides as initialRides,
  streets,
  type Ad,
  type AdConversation,
  type FavoriteBusStop,
  FAVORITE_BUS_STOPS_KEY,
  type LineId,
  type Ride,
  type User,
  type PollItem,
  initialPolls,
  isPollActive,
} from './data/mockData';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AdsScreen } from './screens/AdsScreen';
import { RidesScreen } from './screens/RidesScreen';
import { TalksScreen } from './screens/TalksScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';
import type { AdFilterState } from './screens/AdFiltersModal';
import { AuthRequiredModal } from './components/AuthRequiredModal';
import { DesktopTopNavbar } from './components/DesktopTopNavbar';
import { Footer } from './components/Footer';
import { SeoHead, type SeoHeadProps } from './components/SeoHead';
import { navigateTo } from './components/AppLink';
import {
  buildAdUrl,
  buildNeighborUrl,
  buildZditmUrl,
  CATEGORY_SEO_META,
  CATEGORY_URL_MAP,
  extractAdIdFromSlug,
  slugify,
  SLUG_TO_CATEGORY_ID,
  TAB_PATHS,
} from './router/urlUtils';
import {
  castPollVoteInSupabase,
  createAdInSupabase,
  createPollInSupabase,
  createRideInSupabase,
  deleteAdInSupabase,
  deleteRideInSupabase,
  fetchAdsFromSupabase,
  fetchPollsFromSupabase,
  fetchRidesFromSupabase,
  updateAdInSupabase,
  updateAdStatusInSupabase,
} from './lib/supabase';
import {
  fetchMyProfile,
  onAuthSessionChange,
  signOut,
  updateMyProfileInSupabase,
} from './lib/auth';
import {
  fetchConversations,
  reserveAdWithMessage,
  subscribeToInboxChanges,
} from './lib/chat';

// Asynchronicznie ładowane widoki podstron i modali (Lazy Modals)
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })));
const PartnerScreen = lazy(() => import('./screens/PartnerScreen').then((m) => ({ default: m.PartnerScreen })));
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
const LegalScreen = lazy(() => import('./screens/LegalScreen').then((m) => ({ default: m.LegalScreen })));
import type { LegalDocType } from './screens/LegalScreen';

type Overlay = null | 'profile' | 'zditm';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Załaduj zweryfikowany profil jeśli istnieje aktywna sesja w Supabase Auth
  useEffect(() => {
    void fetchMyProfile().then((profile) => {
      if (profile) setUser(profile);
    });

    const unsub = onAuthSessionChange((session) => {
      if (!session) {
        setUser(null);
      } else {
        void fetchMyProfile().then((profile) => {
          if (profile) setUser(profile);
        });
      }
    });

    return () => unsub();
  }, []);

  const [authScreenOpen, setAuthScreenOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p === '/dolacz' || p === '/rejestracja' || p === '/logowanie';
    }
    return false;
  });

  const [authScreenMode, setAuthScreenMode] = useState<'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p === '/dolacz' || p === '/rejestracja' ? 'register' : 'login';
    }
    return 'login';
  });

  const [legalView, setLegalView] = useState<LegalDocType | null>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/regulamin') return 'terms';
      if (p === '/polityka-prywatnosci') return 'privacy';
    }
    return null;
  });

  const handleUpdateUser = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    if (!nextUser) {
      void signOut();
      navigateTo('/dolacz');
    } else {
      void updateMyProfileInSupabase(nextUser);
      if (
        typeof window !== 'undefined' &&
        (window.location.pathname === '/dolacz' ||
          window.location.pathname === '/rejestracja' ||
          window.location.pathname === '/logowanie')
      ) {
        navigateTo('/');
      }
    }
  }, []);
  const [tab, setTab] = useState<TabId>('home');
  const [routeNotFound, setRouteNotFound] = useState(false);
  const [routeCategoryId, setRouteCategoryId] = useState<string>('all');
  const [routeStreetName, setRouteStreetName] = useState<string>('all');
  const [visitedTabs, setVisitedTabs] = useState<Record<TabId, boolean>>({
    home: true,
    ads: true,
    rides: false,
    talks: false,
  });
  const scrollPositions = useRef<Record<TabId, number>>({
    home: 0,
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
  const [chatConversation, setChatConversation] = useState<AdConversation | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [myAdsOpen, setMyAdsOpen] = useState(false);
  const [reportAd, setReportAd] = useState<Ad | null>(null);

  // Extended Classifieds Views State
  const [conversations, setConversations] = useState<AdConversation[]>([]);
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
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('');

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
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    actionTitle?: string;
    actionDesc?: string;
  }>({ isOpen: false });

  const requireAuth = useCallback(
    (actionTitle: string, actionDesc: string, onAuthorized: () => void) => {
      if (!user) {
        setAuthModal({
          isOpen: true,
          actionTitle,
          actionDesc,
        });
        return false;
      }
      onAuthorized();
      return true;
    },
    [user],
  );

  // Inicjalna synchronizacja danych z bazy Supabase (PostgreSQL)
  useEffect(() => {
    void fetchAdsFromSupabase().then((remoteAds) => {
      if (remoteAds && remoteAds.length > 0) setAdsList(remoteAds);
    });
    void fetchRidesFromSupabase().then((remoteRides) => {
      if (remoteRides && remoteRides.length > 0) setRidesList(remoteRides);
    });
    void fetchPollsFromSupabase().then((remotePolls) => {
      if (remotePolls && remotePolls.length > 0) setPolls(remotePolls);
    });
  }, []);

  const refreshConversations = useCallback(() => {
    if (!user?.profileId) return;
    void fetchConversations(user.profileId, adsList).then((list) => {
      setConversations(list);
    });
  }, [user?.profileId, adsList]);

  useEffect(() => {
    if (!user?.profileId) {
      setConversations([]);
      return;
    }
    refreshConversations();
    const unsub = subscribeToInboxChanges(user.profileId, () => {
      refreshConversations();
    });
    return () => unsub();
  }, [user?.profileId, refreshConversations]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'OPEN_CHAT_URL' && typeof e.data?.url === 'string') {
        navigateTo(e.data.url);
      }
    };
    navigator.serviceWorker.addEventListener('message', handleMsg);
    return () => navigator.serviceWorker.removeEventListener('message', handleMsg);
  }, []);

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

  const handleVote = useCallback(
    (pollId: string, optionId: string) => {
      requireAuth(
        'Głosowanie w ankietach',
        'Głosować mogą wyłącznie mieszkańcy Mińska Mazowieckiego, aby zapewnić rzetelne i reprezentatywne wyniki.',
        () => {
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
          const voterKey = user ? `${user.name}_${user.street.name}` : 'anon';
          void castPollVoteInSupabase(pollId, optionId, voterKey);
        },
      );
    },
    [requireAuth, user],
  );

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
  const closeChatAd = useCallback(
    () =>
      closeWithAnimation('chatAd', () => {
        setChatAd(null);
        setChatConversation(null);
      }),
    [closeWithAnimation],
  );
  const closeEditAd = useCallback(() => closeWithAnimation('editAd', () => setEditAd(null)), [closeWithAnimation]);
  const closeSellerProfile = useCallback(
    () =>
      closeWithAnimation('sellerProfile', () => {
        setSellerProfile(null);
        if (window.location.pathname.startsWith('/sasiad/')) {
          navigateTo(TAB_PATHS[tab], { replace: true });
        }
      }),
    [closeWithAnimation, tab],
  );
  const closeConversations = useCallback(
    () =>
      closeWithAnimation('conversations', () => {
        setConversationsOpen(false);
        if (window.location.pathname === '/wiadomosci') {
          navigateTo(TAB_PATHS[tab], { replace: true });
        }
      }),
    [closeWithAnimation, tab],
  );
  const closeSelectedAd = useCallback(
    () =>
      closeWithAnimation('selectedAd', () => {
        setSelectedAd(null);
        if (window.location.pathname.startsWith('/ogloszenia/') && !window.location.pathname.startsWith('/ogloszenia/kategoria/') && !window.location.pathname.startsWith('/ogloszenia/ulica/')) {
          const fallbackUrl =
            routeCategoryId !== 'all'
              ? CATEGORY_URL_MAP[routeCategoryId] ?? '/ogloszenia'
              : routeStreetName !== 'all'
                ? `/ogloszenia/ulica/${slugify(routeStreetName)}`
                : TAB_PATHS[tab] === '/'
                  ? '/'
                  : '/ogloszenia';
          navigateTo(fallbackUrl, { replace: true });
        }
      }),
    [closeWithAnimation, routeCategoryId, routeStreetName, tab],
  );
  const closeAddRide = useCallback(() => closeWithAnimation('addRide', () => setAddRideOpen(false)), [closeWithAnimation]);
  const closeAddAd = useCallback(
    () =>
      closeWithAnimation('addAd', () => {
        setAddAdOpen(false);
        if (window.location.pathname === '/ogloszenia/dodaj') {
          navigateTo(TAB_PATHS[tab], { replace: true });
        }
      }),
    [closeWithAnimation, tab],
  );
  const closeAddPoll = useCallback(() => closeWithAnimation('addPoll', () => setAddPollModalOpen(false)), [closeWithAnimation]);
  const closePollsModal = useCallback(
    () =>
      closeWithAnimation('pollsModal', () => {
        setPollsModalOpen(false);
        if (window.location.pathname === '/ankiety') {
          navigateTo(TAB_PATHS[tab], { replace: true });
        }
      }),
    [closeWithAnimation, tab],
  );
  const closeMyAds = useCallback(
    () =>
      closeWithAnimation('myAds', () => {
        setMyAdsOpen(false);
        if (window.location.pathname === '/moje-ogloszenia') {
          navigateTo('/profil', { replace: true });
        }
      }),
    [closeWithAnimation],
  );
  const closePartner = useCallback(
    () =>
      closeWithAnimation('partner', () => {
        setPartnerOpen(false);
        if (window.location.pathname.startsWith('/partnerzy')) {
          navigateTo(TAB_PATHS[tab], { replace: true });
        }
      }),
    [closeWithAnimation, tab],
  );
  const closeOverlay = useCallback(
    () =>
      closeWithAnimation('overlay', () => {
        setOverlay(null);
        if (
          window.location.pathname.startsWith('/zditm') ||
          window.location.pathname === '/profil'
        ) {
          navigateTo(TAB_PATHS[tab], { replace: true });
        }
      }),
    [closeWithAnimation, tab],
  );

  const handleOpenProfileOrAuth = useCallback(() => {
    if (!user) {
      setAuthScreenMode('login');
      setAuthScreenOpen(true);
      navigateTo('/dolacz');
    } else {
      setOverlay('profile');
      navigateTo('/profil');
    }
  }, [user, navigateTo]);

  const handlePollCreated = useCallback((newPoll: PollItem) => {
    setPolls((prev) => [newPoll, ...prev]);
    void createPollInSupabase(newPoll);
    closeAddPoll();
  }, [closeAddPoll]);

  // Synchronizacja paska adresu URL (Deep Linking + Browser History API) ze stanem aplikacji
  const syncStateFromLocation = useCallback(
    (pathname: string) => {
      const cleanPath = pathname.replace(/\/+$/, '') || '/';
      setRouteNotFound(false);

      // 1. Onboarding / Rejestracja / Logowanie
      if (cleanPath === '/dolacz' || cleanPath === '/rejestracja') {
        setAuthScreenMode('register');
        setAuthScreenOpen(true);
        return;
      }
      if (cleanPath === '/logowanie') {
        setAuthScreenMode('login');
        setAuthScreenOpen(true);
        return;
      }
      setAuthScreenOpen(false);

      // Reset modal layers before applying route-matched layer
      setOverlay(null);
      setPartnerOpen(false);
      setPollsModalOpen(false);
      setMyAdsOpen(false);
      setConversationsOpen(false);
      setAddAdOpen(false);
      setSellerProfile(null);

      // 1b. Regulamin & Polityka prywatności
      if (cleanPath === '/regulamin') {
        setSelectedAd(null);
        setLegalView('terms');
        return;
      }
      if (cleanPath === '/polityka-prywatnosci') {
        setSelectedAd(null);
        setLegalView('privacy');
        return;
      }
      setLegalView(null);

      // 2. Główne zakładki
      if (cleanPath === '/') {
        setSelectedAd(null);
        setTab('home');
        return;
      }

      if (cleanPath === '/ogloszenia') {
        setSelectedAd(null);
        setRouteCategoryId('all');
        setRouteStreetName('all');
        setVisitedTabs((prev) => ({ ...prev, ads: true }));
        setTab('ads');
        return;
      }

      if (cleanPath.startsWith('/ogloszenia/kategoria/')) {
        const catSlug = cleanPath.replace('/ogloszenia/kategoria/', '');
        const catId = SLUG_TO_CATEGORY_ID[catSlug];
        setSelectedAd(null);
        if (catId) {
          setRouteCategoryId(catId);
          setRouteStreetName('all');
          setVisitedTabs((prev) => ({ ...prev, ads: true }));
          setTab('ads');
        } else {
          setRouteNotFound(true);
        }
        return;
      }

      if (cleanPath.startsWith('/ogloszenia/ulica/')) {
        const streetSlug = cleanPath.replace('/ogloszenia/ulica/', '');
        const matchedStreet = streets.find((s) => slugify(s.name) === streetSlug);
        setSelectedAd(null);
        if (matchedStreet) {
          setRouteStreetName(matchedStreet.name);
          setRouteCategoryId('all');
          setVisitedTabs((prev) => ({ ...prev, ads: true }));
          setTab('ads');
        } else {
          setRouteNotFound(true);
        }
        return;
      }

      if (cleanPath === '/ogloszenia/dodaj') {
        setVisitedTabs((prev) => ({ ...prev, ads: true }));
        setTab('ads');
        setAddAdOpen(true);
        return;
      }

      if (cleanPath.startsWith('/ogloszenia/')) {
        const slugId = cleanPath.replace('/ogloszenia/', '');
        const adId = extractAdIdFromSlug(slugId);
        const foundAd = adsList.find((a) => a.id === adId || a.id === slugId);
        setVisitedTabs((prev) => ({ ...prev, ads: true }));
        setTab('ads');
        if (foundAd) {
          setSelectedAd(foundAd);
          const canonical = buildAdUrl(foundAd);
          if (cleanPath !== canonical) {
            window.history.replaceState({}, '', canonical);
          }
        } else {
          setSelectedAd(null);
          setRouteNotFound(true);
        }
        return;
      }

      if (cleanPath === '/przejazdy') {
        setSelectedAd(null);
        setVisitedTabs((prev) => ({ ...prev, rides: true }));
        setTab('rides');
        return;
      }

      if (cleanPath === '/rozmowy' || cleanPath.startsWith('/rozmowy/tag/')) {
        setSelectedAd(null);
        setVisitedTabs((prev) => ({ ...prev, talks: true }));
        setTab('talks');
        return;
      }

      // 3. Rozkład jazdy ZDiTM (/zditm, /zditm/m2, /zditm/m2/plac-dworcowy)
      if (cleanPath === '/zditm' || cleanPath.startsWith('/zditm/')) {
        const parts = cleanPath.split('/').filter(Boolean); // ['zditm', 'm2', 'plac-dworcowy']
        const lineUpper = parts[1]?.toUpperCase();
        const validLine: LineId =
          lineUpper === 'M1' || lineUpper === 'M2' || lineUpper === 'M3' || lineUpper === 'M4' ? lineUpper : 'M2';
        setSelectedZditmLine(validLine);
        setSelectedZditmStop(parts[2] ? parts[2].replace(/-/g, ' ') : undefined);
        setOverlay('zditm');
        return;
      }

      // 4. Ankiety, Partner, Profil, Moje Ogłoszenia, Wiadomości, Profil Sąsiada
      if (cleanPath === '/ankiety') {
        setPollsModalOpen(true);
        return;
      }

      if (cleanPath === '/partnerzy' || cleanPath.startsWith('/partnerzy/')) {
        setPartnerOpen(true);
        return;
      }

      if (cleanPath === '/profil') {
        if (!user) {
          setAuthScreenMode('login');
          setAuthScreenOpen(true);
        } else {
          setOverlay('profile');
        }
        return;
      }

      if (cleanPath === '/moje-ogloszenia') {
        setMyAdsOpen(true);
        return;
      }

      if (cleanPath === '/wiadomosci' || cleanPath.startsWith('/wiadomosci/')) {
        const targetConvId = cleanPath.startsWith('/wiadomosci/')
          ? cleanPath.replace('/wiadomosci/', '')
          : null;
        setConversationsOpen(true);
        if (targetConvId) {
          const matchConv = conversations.find((c) => c.id === targetConvId);
          if (matchConv) {
            const foundAd = adsList.find((a) => a.id === matchConv.adId) ?? {
              id: matchConv.adId,
              title: matchConv.adTitle,
              price: matchConv.adPrice,
              kind: matchConv.adPrice ? ('sell' as const) : ('free' as const),
              category: 'Ogłoszenie',
              street: matchConv.otherUser?.streetAs || matchConv.adStreet || 'Mińsk Mazowiecki',
              author: matchConv.otherUser.name,
              time: 'aktywne',
              image: matchConv.adImage,
              status: 'active' as const,
              description: '',
            };
            setChatConversation(matchConv);
            setChatAd(foundAd);
          }
        }
        return;
      }

      if (cleanPath.startsWith('/sasiad/')) {
        const slug = cleanPath.replace('/sasiad/', '');
        const matchedStreet = streets.find((s) => slug.endsWith(`-${slugify(s.name)}`));
        if (matchedStreet) {
          const nameSlug = slug.slice(0, slug.length - slugify(matchedStreet.name).length - 1);
          const formattedName = nameSlug
            ? nameSlug.charAt(0).toUpperCase() + nameSlug.slice(1)
            : 'Sąsiad';
          setSellerProfile({ name: formattedName, street: matchedStreet.name });
        } else {
          setSellerProfile({ name: 'Sąsiad', street: 'Spacerowa' });
        }
        return;
      }

      // 5. Fallback 404 dla nieznanych ścieżek
      setSelectedAd(null);
      setRouteNotFound(true);
    },
    [adsList],
  );

  // Inicjalny odczyt URL oraz nasłuchiwanie zdarzeń popstate (przyciski Wstecz / Dalej)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    syncStateFromLocation(window.location.pathname);

    const onPopState = () => {
      syncStateFromLocation(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [syncStateFromLocation]);

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

  // Global Escape key handler to close top active layer on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const top = layersRef.current.find((l) => l.active);
        if (top) {
          top.close();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleToggleLike = useCallback(
    (adId: string) => {
      requireAuth(
        'Zapisz w ulubionych',
        'Zarejestruj się bezpłatnie, aby dodawać ogłoszenia sąsiadów do schowka.',
        () => setLikedAds((prev) => ({ ...prev, [adId]: !prev[adId] })),
      );
    },
    [requireAuth],
  );

  const handleStatusChange = useCallback((adId: string, status: 'active' | 'reserved' | 'sold') => {
    setAdsList((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, status } : a)),
    );
    setSelectedAd((prev) => (prev && prev.id === adId ? { ...prev, status } : prev));
    void updateAdStatusInSupabase(adId, status);
  }, []);

  const handleDeleteAd = useCallback((adId: string) => {
    setAdsList((prev) => prev.filter((a) => a.id !== adId));
    setSelectedAd((prev) => (prev && prev.id === adId ? null : prev));
    void deleteAdInSupabase(adId);
  }, []);

  const handleAdUpdated = useCallback((updatedAd: Ad) => {
    setAdsList((prev) => prev.map((a) => (a.id === updatedAd.id ? updatedAd : a)));
    setSelectedAd((prev) => (prev && prev.id === updatedAd.id ? updatedAd : prev));
    void updateAdInSupabase(updatedAd);
  }, []);

  const handleDeleteRide = useCallback((rideId: string) => {
    setRidesList((prev) => prev.filter((r) => r.id !== rideId));
    void deleteRideInSupabase(rideId);
  }, []);

  const handleReservationSuccess = useCallback(
    async (ad: Ad, details: { spot: string; time: string; phone: string; note: string }) => {
      // Mark ad as reserved locally
      handleStatusChange(ad.id, 'reserved');
      setReserveAd(null);

      if (user) {
        await reserveAdWithMessage(ad.id, details);
        refreshConversations();
        const existingConv = conversations.find((c) => c.adId === ad.id);
        setChatConversation(existingConv ?? null);
        setChatAd(ad);
      }
    },
    [handleStatusChange, user, refreshConversations, conversations],
  );

  const activeFiltersCount =
    (adFilters.sortBy !== 'newest' ? 1 : 0) +
    (adFilters.minPrice ? 1 : 0) +
    (adFilters.maxPrice ? 1 : 0) +
    (adFilters.selectedCategory !== 'Wszystkie' ? 1 : 0) +
    (adFilters.selectedStreet !== 'all' ? 1 : 0) +
    (adFilters.onlyFree ? 1 : 0);

  const unreadConversationsCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const userAds = user
    ? adsList.filter(
        (a) =>
          (user.profileId && a.authorId === user.profileId) ||
          a.isOwner ||
          a.author.toLowerCase().trim() === user.name.toLowerCase().trim(),
      )
    : [];
  const userActiveAdsCount = userAds.filter((a) => (a.status ?? 'active') === 'active').length;
  const userReservedAdsCount = userAds.filter((a) => a.status === 'reserved').length;
  const userRidesCount = user
    ? ridesList.filter((r) => r.driver.toLowerCase() === user.name.toLowerCase()).length
    : 0;

  const handleTabChange = useCallback(
    (nextTab: TabId) => {
      setRouteNotFound(false);
      setLegalView(null);
      const targetUrl = TAB_PATHS[nextTab];
      if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
        navigateTo(targetUrl);
      }

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

  // Dynamiczne obliczanie metadanych SEO i danych strukturalnych JSON-LD (Schema.org) dla aktualnej trasy
  const seoProps = ((): SeoHeadProps => {
    if (legalView === 'terms') {
      return {
        title: 'Regulamin serwisu — mójMińsk.app',
        description:
          'Regulamin korzystania ze zweryfikowanej platformy sąsiedzkiej mójMińsk dla mieszkańców Mińska Mazowieckiego i Gminy Mińsk Mazowiecki.',
        canonicalPath: '/regulamin',
      };
    }

    if (legalView === 'privacy') {
      return {
        title: 'Polityka Prywatności i RODO — mójMińsk.app',
        description:
          'Zasady ochrony prywatności, szyfrowania adresów AES-256 oraz przetwarzania danych osobowych w aplikacji mójMińsk.app w Mińsku Mazowieckim.',
        canonicalPath: '/polityka-prywatnosci',
      };
    }

    if (!user) {
      return {
        title: 'Dołącz do sąsiadów w Mińsku Mazowieckim — mójMińsk.app',
        description:
          'Zarejestruj swoje konto sąsiedzkie w Mińsku Mazowieckim i gminie Mińsk Mazowiecki. Zweryfikowana społeczność bez anonimowego hejtu.',
        canonicalPath: '/dolacz',
      };
    }

    if (routeNotFound) {
      return {
        title: 'Strona nie została znaleziona (404) — mójMińsk.app',
        description: 'Szukana podstrona lub ogłoszenie w serwisie mójMińsk.app nie istnieje.',
        noindex: true,
      };
    }

    if (selectedAd) {
      const canonical = buildAdUrl(selectedAd);
      const priceLabel = selectedAd.kind === 'free' ? 'Za darmo' : `${selectedAd.price ?? 0} zł`;
      return {
        title: `${selectedAd.title} — ul. ${selectedAd.street} (${priceLabel})`,
        description:
          selectedAd.description ||
          `${selectedAd.title} — ogłoszenie sąsiedzkie od ${selectedAd.author} z ul. ${selectedAd.street} w Mińsku Mazowieckim.`,
        canonicalPath: canonical,
        ogType: 'product',
        ogImage: selectedAd.image,
        noindex: selectedAd.status === 'sold',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Start', item: 'https://mojminsk.app/' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Ogłoszenia Mińsk Mazowiecki',
                item: 'https://mojminsk.app/ogloszenia',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: selectedAd.title,
                item: `https://mojminsk.app${canonical}`,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: selectedAd.title,
            description:
              selectedAd.description ||
              `${selectedAd.title} — odbiór osobisty ul. ${selectedAd.street}, Mińsk Mazowiecki`,
            image: selectedAd.images?.length ? selectedAd.images : [selectedAd.image],
            offers: {
              '@type': 'Offer',
              priceCurrency: 'PLN',
              price: selectedAd.kind === 'free' ? 0 : (selectedAd.price ?? 0),
              availability:
                selectedAd.status === 'sold'
                  ? 'https://schema.org/SoldOut'
                  : selectedAd.status === 'reserved'
                    ? 'https://schema.org/LimitedAvailability'
                    : 'https://schema.org/InStock',
              url: `https://mojminsk.app${canonical}`,
              areaServed: { '@type': 'City', name: 'Mińsk Mazowiecki' },
            },
          },
        ],
      };
    }

    if (overlay === 'zditm') {
      const canonical = buildZditmUrl(selectedZditmLine, selectedZditmStop);
      return {
        title: selectedZditmStop
          ? `Rozkład ZDiTM Linia ${selectedZditmLine} (${selectedZditmStop}) — Mińsk Mazowiecki`
          : `Rozkład jazdy ZDiTM Mińsk Mazowiecki — Linie M2, M3, M4`,
        description:
          'Aktualny rozkład jazdy bezpłatnej komunikacji miejskiej ZDiTM w Mińsku Mazowieckim (linie M2, M3, M4). Sprawdź najbliższe odjazdy z Twojego przystanku.',
        canonicalPath: canonical,
      };
    }

    if (overlay === 'profile' || myAdsOpen || conversationsOpen || addAdOpen || editAd) {
      return {
        title: 'Panel mieszkańca — mójMińsk.app',
        description: 'Zarządzaj swoim profilem sąsiedzkim, ogłoszeniami i wiadomościami.',
        noindex: true,
      };
    }

    if (sellerProfile) {
      return {
        title: `${sellerProfile.name} z ul. ${sellerProfile.street} — Profil sąsiada`,
        description: `Zobacz ogłoszenia i aktywność sąsiedzką użytkownika ${sellerProfile.name} (ul. ${sellerProfile.street}) w Mińsku Mazowieckim.`,
        canonicalPath: buildNeighborUrl(sellerProfile.name, sellerProfile.street),
        noindex: true,
      };
    }

    if (partnerOpen) {
      return {
        title: 'Strefa Partnera — Zniżki dla mieszkańców Mińska Mazowieckiego',
        description:
          'Ekskluzywne rabaty i oferty przygotowane przez lokalnych partnerów z Mińska Mazowieckiego dla zweryfikowanych sąsiadów.',
        canonicalPath: '/partnerzy/jubiler-minsk',
      };
    }

    if (pollsModalOpen) {
      return {
        title: 'Ankiety i plebiscyty miejskie — Mińsk Mazowiecki',
        description:
          'Głosuj w ankietach sąsiedzkich i sprawdzaj wyniki rankingów mieszkańców Mińska Mazowieckiego.',
        canonicalPath: '/ankiety',
      };
    }

    if (tab === 'ads') {
      if (routeStreetName !== 'all') {
        const streetCanonical = `/ogloszenia/ulica/${slugify(routeStreetName)}`;
        return {
          title: `Ogłoszenia sąsiedzkie: ul. ${routeStreetName} — Mińsk Mazowiecki`,
          description: `Sprawdź ogłoszenia sprzedaży i oddam za darmo od sąsiadów z ulicy ${routeStreetName} w Mińsku Mazowieckim.`,
          canonicalPath: streetCanonical,
        };
      }
      const meta = CATEGORY_SEO_META[routeCategoryId] ?? CATEGORY_SEO_META.all;
      const canonical = CATEGORY_URL_MAP[routeCategoryId] ?? '/ogloszenia';
      return {
        title: meta.title,
        description: meta.description,
        canonicalPath: canonical,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: meta.title,
          description: meta.description,
          url: `https://mojminsk.app${canonical}`,
        },
      };
    }

    if (tab === 'rides') {
      return {
        title: 'Wspólne przejazdy (Carpooling) Mińsk Mazowiecki ↔ Warszawa & Nova Taxi',
        description:
          'Dojeżdżaj wygodnie z sąsiadami z Mińska Mazowieckiego do Warszawy i po powiecie mińskim lub zamów Nova Taxi z rabatem −10%.',
        canonicalPath: '/przejazdy',
      };
    }

    if (tab === 'talks') {
      return {
        title: 'Strefa Rozmów — Forum mieszkańców Mińska Mazowieckiego',
        description:
          'Lokalne dyskusje mieszkańców Mińska Mazowieckiego podpisane imieniem i ulicą. Sprawdź co dzieje się na Twoim osiedlu bez spamu i trolli.',
        canonicalPath: '/rozmowy',
      };
    }

    return {
      title: 'mójMińsk — aplikacja mieszkańców Mińska Mazowieckiego',
      description:
        'Hiperlokalna platforma sąsiedzka dla mieszkańców Mińska Mazowieckiego i Gminy Mińsk Mazowiecki: ogłoszenia lokalne, rozkład ZDiTM M2/M3/M4, pogoda GIOŚ, przejazdy i rozmowy.',
      canonicalPath: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'mójMińsk.app',
        url: 'https://mojminsk.app/',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://mojminsk.app/ogloszenia?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    };
  })();

  // Preload async modal chunks in background so opening overlays has zero delay
  useEffect(() => {
    const id = window.setTimeout(() => {
      void import('./screens/ProfileScreen');
      void import('./screens/AdDetailModal');
      void import('./screens/MyAdsModal');
      void import('./screens/ZditmScreen');
      void import('./screens/PartnerScreen');
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
      void import('./screens/LegalScreen');
    }, 100);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const showChrome = Boolean(!overlay);

  return (
    <div className="h-full h-[100dvh] w-full overflow-hidden bg-mist select-none">
      <SeoHead {...seoProps} />
      <div
        ref={setFrame}
        className="relative mx-auto flex h-full h-[100dvh] w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist shadow-2xl md:shadow-none"
      >
        {/* TOP HORIZONTAL NAVBAR (Desktop Only >= 768px) */}
        <DesktopTopNavbar
          currentTab={tab}
          onTabChange={handleTabChange}
          hasActiveSubpage={isChildScreenActive}
          onCloseAllLayers={() => {
            setOverlay(null);
            setLegalView(null);
            setPartnerOpen(false);
            setSelectedAd(null);
            setMyAdsOpen(false);
            setReportAd(null);
            setAddAdOpen(false);
            setAddRideOpen(false);
            setChatAd(null);
            setConversationsOpen(false);
            setEditAd(null);
            setSellerProfile(null);
            setReserveAd(null);
            setFiltersModalOpen(false);
            setInstallModalOpen(false);
            setAddFavBusOpen(false);
            setPollsModalOpen(false);
            setAddPollModalOpen(false);
          }}
          user={user}
          unreadCount={unreadConversationsCount}
          onOpenConversations={() =>
            requireAuth(
              'Wiadomości sąsiedzkie',
              'Dostęp do czatu wymaga konta mieszkańca.',
              () => {
                setConversationsOpen(true);
                navigateTo('/wiadomosci');
              },
            )
          }
          onAddNewAd={() =>
            requireAuth(
              'Dodaj ogłoszenie',
              'Publikacja ogłoszeń na tablicy Mińska wymaga konta mieszkańca.',
              () => {
                setAddAdOpen(true);
                navigateTo('/ogloszenia/dodaj');
              },
            )
          }
          onOpenZditm={() => {
            setSelectedZditmLine('M2');
            setSelectedZditmStop(undefined);
            setOverlay('zditm');
            navigateTo('/zditm/m2');
          }}
          onOpenPolls={() => {
            setPollsModalOpen(true);
            navigateTo('/ankiety');
          }}
          onProfileClick={handleOpenProfileOrAuth}
          onLogout={() => handleUpdateUser(null)}
          searchQuery={desktopSearchQuery}
          onSearchChange={(q) => {
            setDesktopSearchQuery(q);
            if (q && tab !== 'ads') {
              setTab('ads');
              setVisitedTabs((prev) => ({ ...prev, ads: true }));
              navigateTo('/ogloszenia');
            }
          }}
          onSearchClear={() => setDesktopSearchQuery('')}
        />

        {/* FULL-WIDTH MAIN WORKSPACE */}
        <main
          ref={mainRef}
          className="h-full w-full flex-1 overscroll-contain overflow-y-auto"
        >
          {authScreenOpen ? (
            <div className="min-h-full">
              <OnboardingScreen
                initialMode={authScreenMode}
                onDone={(newUser) => {
                  handleUpdateUser(newUser);
                  setAuthScreenOpen(false);
                }}
                onClose={() => {
                  setAuthScreenOpen(false);
                  if (
                    window.location.pathname === '/dolacz' ||
                    window.location.pathname === '/rejestracja' ||
                    window.location.pathname === '/logowanie'
                  ) {
                    navigateTo('/');
                  }
                }}
              />
            </div>
          ) : legalView ? (
            <div className="min-h-full">
              <Suspense
                fallback={
                  <div className="min-h-[50vh] flex items-center justify-center p-8 text-ink-400">
                    Wczytywanie dokumentu...
                  </div>
                }
              >
                <LegalScreen
                  activeDoc={legalView}
                  onBack={() => handleTabChange('home')}
                  onSelectDoc={(doc) => {
                    setLegalView(doc);
                    navigateTo(doc === 'terms' ? '/regulamin' : '/polityka-prywatnosci');
                  }}
                />
              </Suspense>
            </div>
          ) : routeNotFound ? (
            <div className="min-h-full">
              <NotFoundScreen onBackHome={() => handleTabChange('home')} />
            </div>
          ) : (
            <div className="min-h-full">
              <div className={tab === 'home' ? 'min-h-full' : 'hidden'}>
                <HomeScreen
                  user={user}
                  onTab={handleTabChange}
                  onProfile={handleOpenProfileOrAuth}
                  onPartner={() => {
                    setPartnerOpen(true);
                    navigateTo('/partnerzy/jubiler-minsk');
                  }}
                  onZditm={(line, stopName) => {
                    const nextLine = line ?? 'M2';
                    setSelectedZditmLine(nextLine);
                    setSelectedZditmStop(stopName);
                    setOverlay('zditm');
                    navigateTo(buildZditmUrl(nextLine, stopName));
                  }}
                  favoriteBuses={favoriteBuses}
                  onAddFavoriteBus={() => setAddFavBusOpen(true)}
                  onRemoveFavoriteBus={handleRemoveFavoriteBus}
                  polls={polls}
                  userVotes={userVotes}
                  onVote={handleVote}
                  onOpenPolls={() => {
                    setPollsModalOpen(true);
                    navigateTo('/ankiety');
                  }}
                  city={user?.city || 'Mińsk Mazowiecki'}
                  adsList={adsList}
                  ridesList={ridesList}
                  onAdClick={(ad) => {
                    setSelectedAd(ad);
                    navigateTo(buildAdUrl(ad));
                  }}
                  onAddAd={() =>
                    requireAuth(
                      'Dodaj ogłoszenie',
                      'Publikacja ogłoszeń na tablicy Mińska wymaga konta mieszkańca.',
                      () => {
                        setAddAdOpen(true);
                        navigateTo('/ogloszenia/dodaj');
                      },
                    )
                  }
                  onNeighborClick={(name, street) => {
                    setSellerProfile({ name, street });
                    navigateTo(buildNeighborUrl(name, street));
                  }}
                />
              </div>

              {visitedTabs.ads && (
                <div className={tab === 'ads' ? 'min-h-full' : 'hidden'}>
                  <AdsScreen
                    user={user}
                    onProfile={handleOpenProfileOrAuth}
                    adsList={adsList}
                    likedAds={likedAds}
                    onToggleLike={handleToggleLike}
                    onAdClick={(ad) => {
                      setSelectedAd(ad);
                      navigateTo(buildAdUrl(ad));
                    }}
                    onChatClick={(ad) =>
                      requireAuth(
                        'Napisz do sąsiada',
                        'Aby rozpocząć bezpieczną rozmowę o ogłoszeniu, zaloguj się lub załóż konto.',
                        () => setChatAd(ad),
                      )
                    }
                    onOpenFilters={() => setFiltersModalOpen(true)}
                    activeFiltersCount={activeFiltersCount}
                    onOpenConversations={() =>
                      requireAuth(
                        'Wiadomości sąsiedzkie',
                        'Dostęp do czatu i historii rozmów z sąsiadami wymaga posiadania konta.',
                        () => {
                          setConversationsOpen(true);
                          navigateTo('/wiadomosci');
                        },
                      )
                    }
                    conversationsUnreadCount={unreadConversationsCount}
                    filtersState={adFilters}
                    externalSearchQuery={desktopSearchQuery}
                    initialCategoryId={routeCategoryId}
                    initialStreetName={routeStreetName}
                    onCategoryRouteChange={setRouteCategoryId}
                    onStreetRouteChange={setRouteStreetName}
                  />
                </div>
              )}

              {visitedTabs.rides && (
                <div className={tab === 'rides' ? 'min-h-full' : 'hidden'}>
                  <RidesScreen
                    user={user}
                    onProfile={handleOpenProfileOrAuth}
                    ridesList={ridesList}
                    onDeleteRide={handleDeleteRide}
                    onAuthRequired={(title, desc) =>
                      setAuthModal({
                        isOpen: true,
                        actionTitle: title,
                        actionDesc: desc,
                      })
                    }
                  />
                </div>
              )}

              {visitedTabs.talks && (
                <div className={tab === 'talks' ? 'min-h-full' : 'hidden'}>
                  <TalksScreen
                    user={user}
                    onProfile={handleOpenProfileOrAuth}
                    onNeighborClick={(name, street) => {
                      setSellerProfile({ name, street });
                      navigateTo(buildNeighborUrl(name, street));
                    }}
                    onAuthRequired={(title, desc) =>
                      setAuthModal({
                        isOpen: true,
                        actionTitle: title,
                        actionDesc: desc,
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {!authScreenOpen && !routeNotFound && (
            <Footer
              onTabChange={handleTabChange}
              onOpenZditm={(line) => {
                setSelectedZditmLine(line ?? 'M2');
                setSelectedZditmStop(undefined);
                setOverlay('zditm');
                navigateTo('/zditm/m2');
              }}
              onOpenPolls={() => {
                setPollsModalOpen(true);
                navigateTo('/ankiety');
              }}
              onAddNewAd={() =>
                requireAuth(
                  'Dodaj ogłoszenie',
                  'Publikacja ogłoszeń na tablicy Mińska wymaga konta mieszkańca.',
                  () => {
                    setAddAdOpen(true);
                    navigateTo('/ogloszenia/dodaj');
                  },
                )
              }
              onOpenInstallApp={() => setInstallModalOpen(true)}
              onOpenLegal={(doc) => {
                setLegalView(doc);
                navigateTo(doc === 'terms' ? '/regulamin' : '/polityka-prywatnosci');
              }}
            />
          )}
        </main>

        <div className="md:hidden">
          {showChrome && !isChildScreenActive && <BottomNav tab={tab} onChange={handleTabChange} />}
        </div>

        {depth > 0 && (
          <div
            aria-hidden
            onTouchStart={onEdgeTouchStart}
            onTouchEnd={onEdgeTouchEnd}
            className="fixed inset-y-0 left-0 z-[70] w-4"
          />
        )}

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
              onUpdate={handleUpdateUser}
              onLogout={() => {
                handleUpdateUser(null);
                closeOverlay();
              }}
              onPartner={() => {
                setPartnerOpen(true);
                navigateTo('/partnerzy/jubiler-minsk');
              }}
              onAddAd={() =>
                requireAuth(
                  'Dodaj ogłoszenie',
                  'Publikacja ogłoszeń na tablicy Mińska wymaga konta mieszkańca.',
                  () => {
                    setAddAdOpen(true);
                    navigateTo('/ogloszenia/dodaj');
                  },
                )
              }
              onMyAds={() =>
                requireAuth(
                  'Twoje ogłoszenia',
                  'Zarządzanie ogłoszeniami dostępne jest po zarejestrowaniu konta.',
                  () => {
                    setMyAdsOpen(true);
                    navigateTo('/moje-ogloszenia');
                  },
                )
              }
              myAdsCount={userActiveAdsCount}
              myReservedAdsCount={userReservedAdsCount}
              onOpenConversations={() =>
                requireAuth(
                  'Wiadomości sąsiedzkie',
                  'Dostęp do czatu wymaga konta mieszkańca.',
                  () => {
                    setConversationsOpen(true);
                    navigateTo('/wiadomosci');
                  },
                )
              }
              conversations={conversations}
              onOpenChatWithNeighbor={(conv) => {
                requireAuth(
                  'Napisz do sąsiada',
                  'Aby rozmawiać na czacie, załóż konto sąsiedzkie.',
                  () => {
                    const foundAd = adsList.find((a) => a.id === conv.adId);
                    setChatConversation(conv);
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
                        description: '',
                        status: 'active',
                      });
                    }
                  },
                );
              }}
              unreadConversationsCount={unreadConversationsCount}
              onPreviewPublic={() => setSellerProfile({ name: user.name, street: user.street.name })}
              onAddRide={() =>
                requireAuth(
                  'Dodaj wspólny przejazd',
                  'Tylko mieszkańcy mogą oferować carpooling.',
                  () => setAddRideOpen(true),
                )
              }
              myRidesCount={userRidesCount}
              onOpenPolls={() => setPollsModalOpen(true)}
              onAddPoll={() =>
                requireAuth(
                  'Utwórz ankietę sąsiedzką',
                  'Tworzenie ankiet i plebiscytów wymaga konta mieszkańca.',
                  () => setAddPollModalOpen(true),
                )
              }
              activePollsCount={polls.filter(isPollActive).length}
              onInstallApp={() => setInstallModalOpen(true)}
              userAds={userAds}
            />
          </AsyncViewBoundary>
        )}

        {overlay === 'zditm' && (
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
              onAddPoll={() =>
                requireAuth(
                  'Utwórz ankietę sąsiedzką',
                  'Tworzenie ankiet i plebiscytów wymaga konta mieszkańca.',
                  () => setAddPollModalOpen(true),
                )
              }
              isClosing={!!exitingScreens['pollsModal']}
            />
          </AsyncViewBoundary>
        )}

        {/* LEVEL 2 (z-[52]): Views opened from Tabs OR nested inside Level 1 (e.g. from Profile / ZDiTM) */}
        {partnerOpen && (
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
              onAddNew={() =>
                requireAuth(
                  'Dodaj ogłoszenie',
                  'Publikacja ogłoszeń na tablicy Mińska wymaga konta mieszkańca.',
                  () => setAddAdOpen(true),
                )
              }
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
              onRefreshConversations={refreshConversations}
              onOpenChat={(ad, conv) => {
                setChatConversation(conv ?? null);
                setChatAd(ad);
              }}
            />
          </AsyncViewBoundary>
        )}

        {filtersModalOpen && (
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

        {addFavBusOpen && (
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
              onChatClick={(ad) =>
                requireAuth(
                  'Napisz do sąsiada',
                  'Aby wysłać wiadomość do autora ogłoszenia, załóż konto sąsiedzkie.',
                  () => {
                    const existingConv = conversations.find((c) => c.adId === ad.id);
                    setChatConversation(existingConv ?? null);
                    setChatAd(ad);
                  },
                )
              }
              onReportClick={(ad) => setReportAd(ad)}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteAd}
              onSellerClick={(name, street) => {
                setSellerProfile({ name, street });
                navigateTo(buildNeighborUrl(name, street));
              }}
              onEditClick={(ad) => setEditAd(ad)}
              onReserveClick={(ad) =>
                requireAuth(
                  'Rezerwacja ogłoszenia',
                  'Rezerwacja wymaga tożsamości mieszkańca, aby sprzedający wiedział, komu odkłada przedmiot.',
                  () => setReserveAd(ad),
                )
              }
              onQuickApply={(ad, details) =>
                requireAuth(
                  'Aplikacja na stanowisko',
                  'Aplikowanie o pracę wymaga tożsamości mieszkańca Mińska.',
                  () => {
                    void handleReservationSuccess(ad, {
                      spot: 'Aplikacja o pracę (1-Click)',
                      time: 'Oferta pracy',
                      phone: details.phone,
                      note: details.note,
                    });
                  },
                )
              }
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
              onAdCreated={(newAd) => {
                const adWithAuthor: Ad = {
                  ...newAd,
                  authorId: user.profileId,
                };
                setAdsList((prev) => [adWithAuthor, ...prev]);
                void createAdInSupabase(adWithAuthor);
              }}
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
              onRideCreated={(newRide) => {
                setRidesList((prev) => [newRide, ...prev]);
                void createRideInSupabase(newRide);
              }}
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
                navigateTo(buildAdUrl(ad));
              }}
              onStartChat={(ad) =>
                requireAuth(
                  'Napisz do sąsiada',
                  'Aby wysłać wiadomość do sąsiada, załóż konto sąsiedzkie.',
                  () => {
                    const existingConv = conversations.find((c) => c.adId === ad.id);
                    setChatConversation(existingConv ?? null);
                    setChatAd(ad);
                  },
                )
              }
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
              conversationId={chatConversation?.id ?? null}
              otherUser={chatConversation?.otherUser}
              onClose={closeChatAd}
              onConversationUpdated={refreshConversations}
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

        {/* Modal Wymaganej Autoryzacji / Rejestracji Mieszkańca */}
        <AuthRequiredModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ isOpen: false })}
          actionTitle={authModal.actionTitle}
          actionDesc={authModal.actionDesc}
          onRegister={() => {
            setAuthModal({ isOpen: false });
            setAuthScreenMode('register');
            setAuthScreenOpen(true);
            navigateTo('/dolacz');
          }}
          onLogin={() => {
            setAuthModal({ isOpen: false });
            setAuthScreenMode('login');
            setAuthScreenOpen(true);
            navigateTo('/dolacz');
          }}
        />

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
