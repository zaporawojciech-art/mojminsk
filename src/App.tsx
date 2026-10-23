import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';
import { BottomNav, type TabId } from './components/BottomNav';
import { ProductSheet } from './components/ProductSheet';
import { CartPill, CartSheet, type CartLine } from './components/Cart';
import {
  allProducts,
  ads as initialAds,
  jobs as initialJobs,
  type Ad,
  type Job,
  type LineId,
  type Product,
  type User,
} from './data/mockData';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { KitchenScreen } from './screens/KitchenScreen';
import { AdsScreen } from './screens/AdsScreen';
import { RidesScreen } from './screens/RidesScreen';
import { TalksScreen } from './screens/TalksScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PartnerScreen } from './screens/PartnerScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { MotylekScreen } from './screens/MotylekScreen';
import { ZditmScreen } from './screens/ZditmScreen';
import { AddAdModal } from './screens/AddAdModal';
import { ChatModal } from './screens/ChatModal';
import { AdDetailModal } from './screens/AdDetailModal';
import { JobDetailModal } from './screens/JobDetailModal';
import { JobApplyModal } from './screens/JobApplyModal';
import { MyAdsModal } from './screens/MyAdsModal';
import { ReportAdModal } from './screens/ReportAdModal';

type Overlay = null | 'profile' | 'partner' | 'checkout' | 'motylek' | 'zditm';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<TabId>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedZditmLine, setSelectedZditmLine] = useState<LineId>('M2');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [sheet, setSheet] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Dynamic ads & jobs lists
  const [adsList, setAdsList] = useState<Ad[]>(initialAds);
  const [jobsList, setJobsList] = useState<Job[]>(initialJobs);
  const [likedAds, setLikedAds] = useState<Record<string, boolean>>({});
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});

  // Modals for Ads logic
  const [addAdOpen, setAddAdOpen] = useState(false);
  const [chatAd, setChatAd] = useState<Ad | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [myAdsOpen, setMyAdsOpen] = useState(false);
  const [reportAd, setReportAd] = useState<Ad | null>(null);

  // 1. Reset main container scroll immediately upon navigating between tabs or overlays
  useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [tab, overlay]);

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
    overlay || selectedAd || selectedJob || applyJob || myAdsOpen || reportAd || addAdOpen || chatAd
  );

  // Navigation stack: layers ordered from the topmost (closed first) to the bottom one
  const layers = [
    { active: !!reportAd, close: () => setReportAd(null) },
    { active: !!chatAd, close: () => setChatAd(null) },
    { active: !!applyJob, close: () => setApplyJob(null) },
    { active: !!selectedJob, close: () => setSelectedJob(null) },
    { active: !!selectedAd, close: () => setSelectedAd(null) },
    { active: addAdOpen, close: () => setAddAdOpen(false) },
    { active: myAdsOpen, close: () => setMyAdsOpen(false) },
    { active: !!overlay, close: () => setOverlay(null) },
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

  const handleJobApplied = useCallback((jobId: string) => {
    setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
  }, []);

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

  const userActiveAdsCount = user
    ? adsList
        .filter((a) => a.isOwner || a.author.toLowerCase().includes(user.name.toLowerCase()))
        .filter((a) => (a.status ?? 'active') === 'active').length
    : 0;

  let content;
  if (!user) {
    content = <OnboardingScreen onDone={setUser} />;
  } else if (overlay === 'checkout') {
    content = (
      <CheckoutScreen
        lines={lines}
        user={user}
        onBack={() => setOverlay(null)}
        onSuccess={() => setCart({})}
      />
    );
  } else if (overlay === 'motylek') {
    content = (
      <MotylekScreen
        onBack={() => setOverlay(null)}
        onOpenProduct={setSheet}
        onAdd={(p) => add(p)}
        qtyOf={(id) => cart[id] ?? 0}
        totalCartValue={total}
      />
    );
  } else if (overlay === 'zditm') {
    content = (
      <ZditmScreen
        initialLine={selectedZditmLine}
        onBack={() => setOverlay(null)}
      />
    );
  } else if (overlay === 'profile') {
    content = (
      <ProfileScreen
        user={user}
        onBack={() => setOverlay(null)}
        onUpdate={setUser}
        onPartner={() => setOverlay('partner')}
        onMyAds={() => setMyAdsOpen(true)}
        myAdsCount={userActiveAdsCount}
      />
    );
  } else if (overlay === 'partner') {
    content = <PartnerScreen onBack={() => setOverlay(null)} />;
  } else if (tab === 'home') {
    content = (
      <HomeScreen
        user={user}
        onTab={setTab}
        onProfile={() => setOverlay('profile')}
        onPartner={() => setOverlay('partner')}
        onZditm={(line) => {
          setSelectedZditmLine(line ?? 'M2');
          setOverlay('zditm');
        }}
        onMotylek={() => setOverlay('motylek')}
      />
    );
  } else if (tab === 'kitchen') {
    content = (
      <KitchenScreen
        onOpen={setSheet}
        onAdd={(p) => add(p)}
        qtyOf={(id) => cart[id] ?? 0}
        onOpenMotylek={() => setOverlay('motylek')}
      />
    );
  } else if (tab === 'ads') {
    content = (
      <AdsScreen
        adsList={adsList}
        jobsList={jobsList}
        likedAds={likedAds}
        appliedJobs={appliedJobs}
        onToggleLike={handleToggleLike}
        onAdClick={(ad) => setSelectedAd(ad)}
        onJobClick={(job) => setSelectedJob(job)}
        onApplyJob={(job) => setApplyJob(job)}
        onAddClick={() => setAddAdOpen(true)}
        onChatClick={(ad) => setChatAd(ad)}
        onMyAdsClick={() => setMyAdsOpen(true)}
      />
    );
  } else if (tab === 'rides') {
    content = <RidesScreen />;
  } else {
    content = <TalksScreen user={user} />;
  }

  const showChrome = !!user && !overlay;

  return (
    <div className="h-full h-[100dvh] w-full overflow-hidden bg-mist select-none">
      <div
        ref={setFrame}
        className="relative mx-auto flex h-full h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-mist shadow-2xl"
      >
        <main
          ref={mainRef}
          key={user ? (overlay ?? tab) : 'onboarding'}
          className="h-full w-full flex-1 overflow-y-auto overscroll-contain"
        >
          {content}
        </main>

        {showChrome && !isChildScreenActive && count > 0 && (tab === 'kitchen' || tab === 'home') && (
          <CartPill count={count} total={total} onOpen={() => setCartOpen(true)} />
        )}
        {showChrome && !isChildScreenActive && <BottomNav tab={tab} onChange={setTab} />}

        {depth > 0 && (
          <div
            aria-hidden
            onTouchStart={onEdgeTouchStart}
            onTouchEnd={onEdgeTouchEnd}
            className="fixed inset-y-0 left-0 z-[60] w-4"
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

        {/* Add Ad Modal with BLIK payment flow */}
        {user && addAdOpen && (
          <AddAdModal
            user={user}
            onClose={() => setAddAdOpen(false)}
            onAdCreated={(newAd) => setAdsList((prev) => [newAd, ...prev])}
            onJobCreated={(newJob) => setJobsList((prev) => [newJob, ...prev])}
          />
        )}

        {/* Ad Detail Modal */}
        {user && selectedAd && (
          <AdDetailModal
            ad={selectedAd}
            user={user}
            isLiked={!!likedAds[selectedAd.id]}
            onClose={() => setSelectedAd(null)}
            onToggleLike={handleToggleLike}
            onChatClick={(ad) => setChatAd(ad)}
            onReportClick={(ad) => setReportAd(ad)}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteAd}
          />
        )}

        {/* Job Detail Modal */}
        {user && selectedJob && (
          <JobDetailModal
            job={selectedJob}
            user={user}
            hasApplied={!!appliedJobs[selectedJob.id]}
            onClose={() => setSelectedJob(null)}
            onApplyClick={(job) => {
              setSelectedJob(null);
              setApplyJob(job);
            }}
          />
        )}

        {/* 1-Click Job Apply Modal */}
        {user && applyJob && (
          <JobApplyModal
            job={applyJob}
            user={user}
            onClose={() => setApplyJob(null)}
            onSuccess={handleJobApplied}
          />
        )}

        {/* My Ads Modal */}
        {user && myAdsOpen && (
          <MyAdsModal
            user={user}
            ads={adsList}
            jobs={jobsList}
            onClose={() => setMyAdsOpen(false)}
            onOpenAd={(ad) => setSelectedAd(ad)}
            onAddNew={() => setAddAdOpen(true)}
            onStatusChange={handleStatusChange}
            onDeleteAd={handleDeleteAd}
          />
        )}

        {/* Report Ad Modal */}
        {user && reportAd && (
          <ReportAdModal
            ad={reportAd}
            onClose={() => setReportAd(null)}
          />
        )}

        {/* 1:1 Neighbor Chat Modal */}
        {user && chatAd && (
          <ChatModal
            ad={chatAd}
            user={user}
            onClose={() => setChatAd(null)}
          />
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
