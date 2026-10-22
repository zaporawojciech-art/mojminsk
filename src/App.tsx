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
    <div className="min-h-screen w-full bg-mist">
      <div
        ref={setFrame}
        className="relative mx-auto min-h-screen w-full max-w-md bg-mist"
      >
        <main key={user ? (overlay ?? tab) : 'onboarding'} className="w-full">
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
