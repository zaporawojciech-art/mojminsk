import { useState, useRef } from 'react';
import {
  Check,
  Copy,
  MapPin,
  Phone,
  ExternalLink,
  Clock,
  ShieldCheck,
  Sparkles,
  Ruler,
  Send,
} from 'lucide-react';
import { partner } from '../data/mockData';
import { BackHeader, Img, cn } from '../components/ui';

interface PartnerScreenProps {
  onBack: () => void;
  isClosing?: boolean;
}

export function PartnerScreen({ onBack, isClosing = false }: PartnerScreenProps) {
  const [copied, setCopied] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<string>(partner.products[0]?.name || '');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLocation, setContactLocation] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);

  const formRefDesktop = useRef<HTMLDivElement>(null);
  const formRefMobile = useRef<HTMLDivElement>(null);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(partner.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToForm = (solutionName?: string) => {
    if (solutionName) {
      setSelectedSolution(solutionName);
    }
    const isDesktop = window.innerWidth >= 768;
    const target = isDesktop ? formRefDesktop.current : formRefMobile.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim()) return;
    setQuoteSent(true);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-ink select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-y-auto overscroll-contain pb-20 text-white">
        {/* =====================================================================
            DESKTOP VIEW (>= 768px): 12-Column Architectural Showcase
            ===================================================================== */}
        <div className="hidden md:block">
          <BackHeader onBack={onBack} dark />
          <div className="px-8 lg:px-12 py-6 grid grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN (4 cols): Sticky Hero Showcase, Discount Card & Contact */}
            <div className="col-span-4 space-y-5 sticky top-6">
              {/* Brand Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                <Img
                  src={partner.hero}
                  alt={partner.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
                <div className="relative z-10 pt-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-sand px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink">
                      <Sparkles className="h-3 w-3" /> Partner Tygodnia
                    </span>
                    <span className="text-[11px] font-bold text-white/70">Mińsk Mazowiecki</span>
                  </div>
                  <h1 className="mt-2.5 font-display text-[28px] font-bold leading-tight text-white">
                    {partner.shortName}
                  </h1>
                  <p className="mt-1 text-[13px] font-medium text-sand">
                    Okna · Drzwi · Pergole · Rolety
                  </p>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/75">
                    {partner.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-[12px] text-white/80">
                    <a
                      href="https://maps.google.com/?q=Siennicka+47+Mi%C5%84sk+Mazowiecki"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-sand transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-sand shrink-0" aria-hidden />
                      <span>{partner.address}</span>
                    </a>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="h-4 w-4 text-sand shrink-0" aria-hidden />
                      <span>{partner.openingHours}</span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:+48${partner.phone.replace(/\s+/g, '')}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2.5 text-[12px] font-bold text-white transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-sand" />
                      {partner.phone}
                    </a>
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2.5 text-[12px] font-bold text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-sand" />
                      grupaadk.pl
                    </a>
                  </div>
                </div>
              </div>

              {/* Neighborhood Discount Card */}
              <div className="rounded-3xl bg-sand p-6 text-ink shadow-card">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/60">
                  Dla mieszkańców mójMińsk
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="font-display text-[46px] font-bold leading-none">{partner.discount}</p>
                  <span className="text-[13px] font-bold text-ink/80">na zamówienie z montażem</span>
                </div>
                <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-ink/80">
                  + <strong>Bezpłatny profesjonalny pomiar laserowy</strong> na Twojej działce w Mińsku Mazowieckim i okolicznych miejscowościach.
                </p>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="mt-4 flex h-12 w-full items-center justify-between rounded-2xl border-2 border-dashed border-ink/30 bg-white/80 pl-4 pr-2 hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="font-display text-[17px] font-bold tracking-wider text-ink">
                    {partner.code}
                  </span>
                  <span className="flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3.5 text-[12px] font-bold text-white">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Skopiowano!' : 'Kopiuj kod'}
                  </span>
                </button>

                <ul className="mt-4 pt-3.5 border-t border-ink/15 space-y-1.5 text-[11.5px] font-medium text-ink/80">
                  {partner.perks.slice(0, 3).map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-ink">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN (8 cols): Catalog, Interactive Form & Trust Badges */}
            <div className="col-span-8 space-y-8">
              {/* Header */}
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-[24px] font-bold text-white">
                      Katalog Rozwiązań Grupy ADK
                    </h2>
                    <p className="mt-1 text-[13px] text-white/60">
                      Nowoczesne systemy stolarki otworowej i przeszkleń z montażem w Mińsku Mazowieckim
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToForm()}
                    className="flex items-center gap-2 rounded-xl bg-sand px-4 py-2 text-[12.5px] font-bold text-ink hover:bg-sand-200 transition-colors cursor-pointer"
                  >
                    <Ruler className="h-4 w-4" />
                    Umów bezpłatny pomiar
                  </button>
                </div>
              </div>

              {/* Solutions Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {partner.products.map((item) => (
                  <article
                    key={item.id}
                    className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[.05] p-3.5 hover:bg-white/[.08] hover:border-white/20 transition-all duration-200"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink">
                        <Img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {item.badge && (
                          <span className="absolute top-2 left-2 rounded-md bg-ink/85 backdrop-blur-sm px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sand border border-white/10">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-[10.5px] font-bold uppercase tracking-wider text-sand">
                        {item.category}
                      </p>
                      <h3 className="mt-0.5 font-display text-[15px] font-bold text-white leading-snug">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-[12px] text-white/70 font-medium">
                        {item.material}
                      </p>
                      <p className="mt-1 text-[11px] text-white/50 leading-relaxed">
                        {item.specs}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => scrollToForm(item.name)}
                        className="w-full h-9 rounded-xl bg-white/10 hover:bg-sand hover:text-ink text-white text-[12px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Zapytaj o to rozwiązanie
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Interactive Quote & Measurement Lead Form */}
              <div
                ref={formRefDesktop}
                className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/[.08] to-white/[.02] p-7 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand text-ink">
                    <Ruler className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="rounded bg-sand/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sand">
                      Dla mieszkańców Mińska i powiatu
                    </span>
                    <h3 className="mt-1 font-display text-[20px] font-bold text-white">
                      Umów bezpłatny pomiar na budowie lub w domu
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-white/70">
                      Doradca Grupy ADK z salonu przy Siennickiej 47 przygotuje bezpłatny projekt i wycenę z kodem <strong>{partner.code}</strong> (−10%).
                    </p>
                  </div>
                </div>

                {quoteSent ? (
                  <div className="mt-6 rounded-2xl bg-sand/15 border border-sand/30 p-5 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sand text-ink mb-2">
                      <Check className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-[16px] font-bold text-white">
                      Zgłoszenie wysłane pomyślnie!
                    </h4>
                    <p className="mt-1 text-[12.5px] text-white/80 max-w-md mx-auto">
                      Dziękujemy{contactName ? `, ${contactName}` : ''}! Doradca techniczny Grupy ADK skontaktuje się z Tobą telefonicznie w ciągu 24h na numer {contactPhone || 'podany w zgłoszeniu'}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setQuoteSent(false)}
                      className="mt-3 text-[11.5px] font-bold text-sand hover:underline cursor-pointer"
                    >
                      Wyślij kolejne zapytanie
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuoteSubmit} className="mt-6 space-y-4">
                    {/* Solution Selector */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">
                        Wybierz zakres inwestycji
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {partner.products.map((p) => {
                          const active = selectedSolution === p.name;
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => setSelectedSolution(p.name)}
                              className={cn(
                                'rounded-xl px-3 py-1.5 text-[11.5px] font-bold transition-all cursor-pointer',
                                active
                                  ? 'bg-sand text-ink shadow-sm'
                                  : 'bg-white/10 text-white/80 hover:bg-white/15',
                              )}
                            >
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-white/70 mb-1">
                          Twoje Imię
                        </label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="np. Wojtek"
                          className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-[13px] text-white placeholder-white/40 focus:border-sand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-white/70 mb-1">
                          Telefon kontaktowy *
                        </label>
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="np. 500 000 000"
                          className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-[13px] text-white placeholder-white/40 focus:border-sand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-white/70 mb-1">
                          Lokalizacja w Mińsku / gminie
                        </label>
                        <input
                          type="text"
                          value={contactLocation}
                          onChange={(e) => setContactLocation(e.target.value)}
                          placeholder="np. ul. Spacerowa / Stojadła"
                          className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-[13px] text-white placeholder-white/40 focus:border-sand focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11.5px] text-white/50">
                        * Bez zobowiązań. Doradca skontaktuje się w celu potwierdzenia dogodnego terminu pomiaru.
                      </p>
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-sand hover:bg-sand-200 px-5 py-2.5 text-[13px] font-bold text-ink transition-colors cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        Wyślij zapytanie z kodem {partner.code}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-4 gap-3 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-center">
                  <MapPin className="h-5 w-5 text-sand mx-auto mb-2" />
                  <h4 className="text-[12.5px] font-bold text-white">Salon Siennicka 47</h4>
                  <p className="mt-1 text-[11px] text-white/60">Ekspozycja profili i automatyki na miejscu</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-center">
                  <ShieldCheck className="h-5 w-5 text-sand mx-auto mb-2" />
                  <h4 className="text-[12.5px] font-bold text-white">Mińska ekipa</h4>
                  <p className="mt-1 text-[11px] text-white/60">Własny montaż bez podwykonawców</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-center">
                  <Sparkles className="h-5 w-5 text-sand mx-auto mb-2" />
                  <h4 className="text-[12.5px] font-bold text-white">Czyste Powietrze</h4>
                  <p className="mt-1 text-[11px] text-white/60">Komplet dokumentów do dofinansowania</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-center">
                  <Ruler className="h-5 w-5 text-sand mx-auto mb-2" />
                  <h4 className="text-[12.5px] font-bold text-white">Darmowy Pomiar</h4>
                  <p className="mt-1 text-[11px] text-white/60">Audyt laserowy na Twojej budowie</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            MOBILE VIEW (< 768px): Native Mobile-First Layout
            ===================================================================== */}
        <div className="md:hidden space-y-5">
          {/* Mobile Hero Header */}
          <div className="relative">
            <Img
              src={partner.hero}
              alt={partner.name}
              className="absolute inset-0 h-80 w-full object-cover opacity-45 [mask-image:linear-gradient(to_bottom,black_50%,transparent)]"
            />
            <div className="relative">
              <BackHeader onBack={onBack} dark />
              <div className="px-5 pb-5 pt-20">
                <div className="inline-flex items-center gap-1 rounded-md bg-sand px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-ink">
                  <Sparkles className="h-3 w-3" /> Partner Tygodnia
                </div>
                <h1 className="mt-2 font-display text-[32px] font-bold leading-tight">
                  {partner.shortName}
                </h1>
                <p className="mt-1 text-[13px] font-semibold text-sand">
                  Okna · Drzwi · Pergole · Rolety
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-white/80">
                  <MapPin className="h-4 w-4 text-sand shrink-0" aria-hidden />
                  <span>{partner.address}</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-white/60">
                  <Clock className="h-3.5 w-3.5 text-sand shrink-0" aria-hidden />
                  <span>{partner.openingHours}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-5 grid grid-cols-2 gap-2.5">
            <a
              href={`tel:+48${partner.phone.replace(/\s+/g, '')}`}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-[12.5px] font-bold text-white hover:bg-white/15 transition-colors"
            >
              <Phone className="h-4 w-4 text-sand" />
              Zadzwoń do salonu
            </a>
            <a
              href="https://maps.google.com/?q=Siennicka+47+Mi%C5%84sk+Mazowiecki"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-[12.5px] font-bold text-white hover:bg-white/15 transition-colors"
            >
              <MapPin className="h-4 w-4 text-sand" />
              Nawiguj (Siennicka)
            </a>
          </div>

          {/* Mobile Discount Card */}
          <div className="mx-5 rounded-3xl bg-sand p-5 text-ink shadow-card">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/60">
              Dla mieszkańców mójMińsk
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-display text-[42px] font-bold leading-none">{partner.discount}</p>
              <span className="text-[13px] font-bold text-ink/80">z kodem sąsiedzkim</span>
            </div>
            <p className="mt-1 text-[12px] font-medium leading-snug text-ink/80">
              Na całą stolarkę i montaż + <strong>darmowy pomiar laserowy</strong> w Mińsku Mazowieckim i gminie.
            </p>

            <button
              type="button"
              onClick={handleCopyCode}
              className="mt-3.5 flex h-11 w-full items-center justify-between rounded-xl border-2 border-dashed border-ink/30 bg-white/80 pl-4 pr-1.5"
            >
              <span className="font-display text-[16px] font-bold tracking-wider text-ink">
                {partner.code}
              </span>
              <span className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[11.5px] font-bold text-white">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Skopiowano!' : 'Kopiuj'}
              </span>
            </button>
          </div>

          {/* Mobile Interactive Quote Form */}
          <div
            ref={formRefMobile}
            className="mx-5 rounded-3xl border border-white/15 bg-white/[.06] p-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-ink">
                <Ruler className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-[16px] font-bold text-white leading-tight">
                  Bezpłatny pomiar na budowie
                </h3>
                <p className="text-[11.5px] text-white/60">Doradca z Siennickiej 47 skontaktuje się z Tobą</p>
              </div>
            </div>

            {quoteSent ? (
              <div className="mt-4 rounded-xl bg-sand/15 border border-sand/30 p-4 text-center">
                <Check className="h-6 w-6 text-sand mx-auto mb-1" />
                <p className="font-display text-[14px] font-bold text-white">Zgłoszenie wysłane!</p>
                <p className="mt-0.5 text-[11px] text-white/80">
                  Doradca Grupy ADK skontaktuje się telefonicznie w ciągu 24h.
                </p>
                <button
                  type="button"
                  onClick={() => setQuoteSent(false)}
                  className="mt-2 text-[10.5px] font-bold text-sand hover:underline"
                >
                  Wyślij kolejne zapytanie
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-white/70 mb-1">
                    Czego potrzebujesz?
                  </label>
                  <select
                    value={selectedSolution}
                    onChange={(e) => setSelectedSolution(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-[12.5px] text-white focus:border-sand focus:outline-none"
                  >
                    {partner.products.map((p) => (
                      <option key={p.id} value={p.name} className="bg-ink text-white">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-white/70 mb-1">
                    Numer telefonu *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="np. 500 000 000"
                    className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-[12.5px] text-white placeholder-white/40 focus:border-sand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-white/70 mb-1">
                    Ulica w Mińsku / miejscowość
                  </label>
                  <input
                    type="text"
                    value={contactLocation}
                    onChange={(e) => setContactLocation(e.target.value)}
                    placeholder="np. Spacerowa / Stojadła"
                    className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-[12.5px] text-white placeholder-white/40 focus:border-sand focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-sand text-ink text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  Zamów pomiar z kodem {partner.code}
                </button>
              </form>
            )}
          </div>

          {/* Mobile Catalog of Solutions */}
          <div className="px-5 pt-2">
            <h2 className="font-display text-[20px] font-semibold">Oferta i Rozwiązania</h2>
            <p className="text-[12px] text-white/60">Profile, przeszklenia i pergole Grupy ADK</p>

            <div className="mt-3 space-y-3">
              {partner.products.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.05] p-3"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-ink">
                    <Img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {item.badge && (
                      <span className="absolute top-2 left-2 rounded bg-ink/80 px-2 py-0.5 text-[9.5px] font-bold text-sand border border-white/10">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sand">
                      {item.category}
                    </p>
                    <h3 className="font-display text-[15px] font-bold text-white">
                      {item.name}
                    </h3>
                    <p className="text-[11.5px] text-white/70 font-medium">
                      {item.material}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/50">
                      {item.specs}
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollToForm(item.name)}
                      className="mt-3 w-full h-9 rounded-xl bg-white/10 hover:bg-sand hover:text-ink text-white text-[12px] font-bold transition-colors"
                    >
                      Zapytaj o wycenę
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Mobile Trust Points */}
          <div className="mx-5 rounded-2xl border border-white/10 bg-white/[.03] p-4 space-y-2.5 text-[11.5px] text-white/70">
            <p className="font-bold text-white text-[12px]">Dlaczego Grupa ADK?</p>
            <p>✓ Showroom przy ul. Siennickiej 47 w Mińsku Mazowieckim</p>
            <p>✓ Własny montaż i serwis w 15 minut od zgłoszenia</p>
            <p>✓ Pomoc w dofinansowaniu z programu „Czyste Powietrze”</p>
          </div>
        </div>
      </div>
    </div>
  );
}
