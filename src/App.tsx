import { useCallback, useState } from 'react';
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

  // Dynamic ads & jobs lists
  const [adsList, setAdsList] = useState<Ad[]>(initialAds);
  const [jobsList, setJobsList] = useState<Job[]>(initialJobs);

  // Modals for Ads & Chat
  const [addAdOpen, setAddAdOpen] = useState(false);
  const [chatAd, setChatAd] = useState<Ad | null>(null);

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
        onAddClick={() => setAddAdOpen(true)}
        onChatClick={(ad) => setChatAd(ad)}
      />
    );
  } else if (tab === 'rides') {
    content = <RidesScreen />;
  } else {
    content = <TalksScreen user={user} />;
  }

  const showChrome = !!user && !overlay;

  return (
    <div className="min-h-[100dvh] w-full bg-mist md:grid md:place-items-center md:bg-[radial-gradient(circle_at_15%_20%,#FDDFDB,transparent_40%),radial-gradient(circle_at_85%_80%,#E0E8F4,transparent_45%),radial-gradient(circle_at_80%_10%,#F7ECDA,transparent_35%)] md:py-8">
      <div
        ref={setFrame}
        className="relative mx-auto flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-mist [transform:translateZ(0)] md:h-[860px] md:w-[400px] md:rounded-[56px] md:border-[10px] md:border-ink md:shadow-[0_40px_80px_-30px_rgba(31,29,43,.55)]"
      >
        {/* Pasek statusu — tylko w ramce desktopowej */}
        <div className="relative hidden h-11 shrink-0 items-center justify-between px-8 text-[13px] font-bold md:flex" aria-hidden>
          <span>21:41</span>
          <span className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-ink" />
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-4 rounded-sm bg-ink" />
            <span className="h-2.5 w-6 rounded-[3px] border-2 border-ink" />
          </span>
        </div>

        <main key={user ? (overlay ?? tab) : 'onboarding'} className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
          {content}
        </main>

        {showChrome && count > 0 && (tab === 'kitchen' || tab === 'home') && (
          <CartPill count={count} total={total} onOpen={() => setCartOpen(true)} />
        )}
        {showChrome && <BottomNav tab={tab} onChange={setTab} />}

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

        {/* Add Ad Modal */}
        {user && addAdOpen && (
          <AddAdModal
            user={user}
            onClose={() => setAddAdOpen(false)}
            onAdCreated={(newAd) => setAdsList((prev) => [newAd, ...prev])}
            onJobCreated={(newJob) => setJobsList((prev) => [newJob, ...prev])}
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
      </div>
    </div>
  );
}
