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
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-[#0e243f] select-none text-white',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-y-auto overscroll-contain pb-20 text-white">
        {/* =====================================================================
            DESKTOP VIEW (>= 768px): 12-Column Grupa ADK Showcase
            ===================================================================== */}
        <div className="hidden md:block">
          <BackHeader onBack={onBack} dark />
          <div className="px-8 lg:px-12 py-6 grid grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN (4 cols): Sticky Brand Showcase & Discount Card */}
            <div className="col-span-4 space-y-5 sticky top-6">
              {/* Brand Card with Grupa ADK Palette (#162438 & #4abbc3) */}
              <div className="relative overflow-hidden rounded-3xl border border-[#4abbc3]/30 bg-gradient-to-br from-[#162438] to-[#0e243f] p-6 shadow-2xl">
                <Img
                  src={partner.hero}
                  alt={partner.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-20"
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#4abbc3] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0e243f]">
                      <Sparkles className="h-3 w-3" /> Partner Tygodnia
                    </span>
                    <span className="text-[11.5px] font-bold text-[#4abbc3]">grupaadk.pl</span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/10 p-2 border border-white/20 backdrop-blur-sm">
                      <Img src={partner.logo} alt="" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <h1 className="font-display text-[26px] font-bold leading-tight text-white">
                        {partner.shortName}
                      </h1>
                      <p className="text-[12px] font-semibold text-[#4abbc3]">
                        ADK Okna & Aluminium
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 font-display text-[15px] italic text-[#4abbc3] font-semibold leading-snug">
                    „{partner.tagline}”
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-white/75">
                    {partner.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-[12px] text-white/80">
                    <a
                      href="https://maps.google.com/?q=Siennicka+47+Mi%C5%84sk+Mazowiecki"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-[#4abbc3] transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-[#4abbc3] shrink-0" aria-hidden />
                      <span>{partner.address}</span>
                    </a>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="h-4 w-4 text-[#4abbc3] shrink-0" aria-hidden />
                      <span>{partner.openingHours}</span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:+48${partner.phone.replace(/\s+/g, '')}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-[#4abbc3] hover:text-[#0e243f] px-3 py-2.5 text-[12px] font-bold text-white transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#4abbc3] hover:text-inherit" />
                      {partner.phone}
                    </a>
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#4abbc3] hover:bg-[#3daab2] px-3 py-2.5 text-[12px] font-extrabold text-[#0e243f] transition-colors shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      grupaadk.pl
                    </a>
                  </div>
                </div>
              </div>

              {/* Neighborhood Discount Card in Grupa ADK Teal (#4abbc3) */}
              <div className="rounded-3xl bg-gradient-to-br from-[#4abbc3] to-[#36a6ae] p-6 text-[#0e243f] shadow-xl">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0e243f]/70">
                  Dla mieszkańców mójMińsk
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="font-display text-[46px] font-bold leading-none">{partner.discount}</p>
                  <span className="text-[13px] font-extrabold text-[#0e243f]">na zamówienie z montażem</span>
                </div>
                <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-[#0e243f]/90">
                  + <strong>Bezpłatny profesjonalny pomiar laserowy</strong> na Twojej budowie w Mińsku Mazowieckim i gminie.
                </p>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="mt-4 flex h-12 w-full items-center justify-between rounded-2xl border-2 border-dashed border-[#0e243f]/30 bg-white/90 pl-4 pr-2 hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="font-display text-[17px] font-bold tracking-wider text-[#0e243f]">
                    {partner.code}
                  </span>
                  <span className="flex h-9 items-center gap-1.5 rounded-xl bg-[#0e243f] px-3.5 text-[12px] font-bold text-white">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Skopiowano!' : 'Kopiuj kod'}
                  </span>
                </button>

                <ul className="mt-4 pt-3.5 border-t border-[#0e243f]/20 space-y-1.5 text-[11.5px] font-semibold text-[#0e243f]/85">
                  {partner.perks.slice(0, 3).map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-extrabold text-[#0e243f]">✓</span>
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
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4abbc3]">
                      grupaadk.pl · Mińsk Mazowiecki
                    </span>
                    <h2 className="font-display text-[26px] font-bold text-white leading-tight">
                      Katalog Rozwiązań Grupy ADK
                    </h2>
                    <p className="mt-1 text-[13px] text-white/70">
                      Nowoczesne systemy stolarki otworowej i pergoli z certyfikowanym montażem w Mińsku
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToForm()}
                    className="flex items-center gap-2 rounded-xl bg-[#4abbc3] hover:bg-[#3daab2] px-4 py-2.5 text-[12.5px] font-extrabold text-[#0e243f] transition-colors cursor-pointer shadow-sm"
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
                    className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#162438]/80 p-3.5 hover:border-[#4abbc3]/50 hover:bg-[#162438] transition-all duration-200"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#0e243f]">
                        <Img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {item.badge && (
                          <span className="absolute top-2 left-2 rounded-md bg-[#0e243f]/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#4abbc3] border border-[#4abbc3]/30">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-[10.5px] font-bold uppercase tracking-wider text-[#4abbc3]">
                        {item.category}
                      </p>
                      <h3 className="mt-0.5 font-display text-[15px] font-bold text-white leading-snug">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-[12px] text-white/80 font-medium">
                        {item.material}
                      </p>
                      <p className="mt-1 text-[11px] text-white/55 leading-relaxed">
                        {item.specs}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => scrollToForm(item.name)}
                        className="w-full h-9 rounded-xl bg-white/10 hover:bg-[#4abbc3] hover:text-[#0e243f] text-white text-[12px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Zapytaj o to rozwiązanie
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Interactive Quote & Measurement Lead Form (#132b47 & #4abbc3) */}
              <div
                ref={formRefDesktop}
                className="rounded-3xl border border-[#4abbc3]/40 bg-gradient-to-br from-[#162438] to-[#132b47] p-7 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4abbc3] text-[#0e243f]">
                    <Ruler className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="rounded bg-[#4abbc3]/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#4abbc3]">
                      Dla mieszkańców Mińska i powiatu
                    </span>
                    <h3 className="mt-1 font-display text-[21px] font-bold text-white">
                      Umów bezpłatny pomiar na budowie lub w domu
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-white/70">
                      Doradca Grupy ADK z salonu przy Siennickiej 47 przygotuje bezpłatny projekt i wycenę z kodem <strong className="text-[#4abbc3]">{partner.code}</strong> (−10%).
                    </p>
                  </div>
                </div>

                {quoteSent ? (
                  <div className="mt-6 rounded-2xl bg-[#4abbc3]/15 border border-[#4abbc3]/40 p-5 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#4abbc3] text-[#0e243f] mb-2">
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
                      className="mt-3 text-[11.5px] font-bold text-[#4abbc3] hover:underline cursor-pointer"
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
                                  ? 'bg-[#4abbc3] text-[#0e243f] shadow-sm font-extrabold'
                                  : 'bg-[#0e243f] text-white/80 hover:bg-white/10 border border-white/10',
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
                          className="h-10 w-full rounded-xl border border-[#364e6b] bg-[#0e243f] px-3 text-[13px] text-white placeholder-white/40 focus:border-[#4abbc3] focus:outline-none"
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
                          className="h-10 w-full rounded-xl border border-[#364e6b] bg-[#0e243f] px-3 text-[13px] text-white placeholder-white/40 focus:border-[#4abbc3] focus:outline-none"
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
                          className="h-10 w-full rounded-xl border border-[#364e6b] bg-[#0e243f] px-3 text-[13px] text-white placeholder-white/40 focus:border-[#4abbc3] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11.5px] text-white/50">
                        * Bez zobowiązań. Doradca skontaktuje się w celu potwierdzenia dogodnego terminu pomiaru.
                      </p>
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-[#4abbc3] hover:bg-[#3daab2] px-5 py-2.5 text-[13px] font-extrabold text-[#0e243f] transition-colors cursor-pointer shadow-lg shadow-[#4abbc3]/20"
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
                <div className="rounded-2xl border border-white/10 bg-[#162438] p-4 text-center">
                  <MapPin className="h-5 w-5 text-[#4abbc3] mx-auto mb-2" />
                  <h4 className="text-[12.5px] font-bold text-white">Salon Siennicka 47</h4>
                  <p className="mt-1 text-[11px] text-white/60">Ekspozycja profili i automatyki na miejscu</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#162438] p-4 text-center">
                  <ShieldCheck className="h-5 w-5 text-[#4abbc3] mx-auto mb-2" />
                  <h4 className="text-[12.5px] font-bold text-white">Mińska ekipa</h4>
                  <p className="mt-1 text-[11px] text-white/60">Własny montaż bez podwykonawców</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#162438] p-4 text-center">
                  <Sparkles className="h-5 w-5 text-[#4abbc3] mx-auto mb-2" />
                  <h4 className="text-[12.5px] font-bold text-white">Czyste Powietrze</h4>
                  <p className="mt-1 text-[11px] text-white/60">Komplet dokumentów do dofinansowania</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#162438] p-4 text-center">
                  <Ruler className="h-5 w-5 text-[#4abbc3] mx-auto mb-2" />
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
              className="absolute inset-0 h-80 w-full object-cover opacity-35 [mask-image:linear-gradient(to_bottom,black_50%,transparent)]"
            />
            <div className="relative">
              <BackHeader onBack={onBack} dark />
              <div className="px-5 pb-5 pt-16">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#4abbc3] px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#0e243f]">
                    <Sparkles className="h-3 w-3" /> Partner Tygodnia
                  </span>
                  <span className="text-[11px] font-bold text-[#4abbc3]">grupaadk.pl</span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 p-1.5 border border-white/20">
                    <Img src={partner.logo} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h1 className="font-display text-[28px] font-bold leading-tight">
                      {partner.shortName}
                    </h1>
                    <p className="text-[12px] font-semibold text-[#4abbc3]">
                      ADK Okna & Aluminium
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-[12px] italic text-[#4abbc3] font-semibold">
                  „{partner.tagline}”
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-white/80">
                  <MapPin className="h-4 w-4 text-[#4abbc3] shrink-0" aria-hidden />
                  <span>{partner.address}</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-white/60">
                  <Clock className="h-3.5 w-3.5 text-[#4abbc3] shrink-0" aria-hidden />
                  <span>{partner.openingHours}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-5 grid grid-cols-2 gap-2.5">
            <a
              href={`tel:+48${partner.phone.replace(/\s+/g, '')}`}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-[12.5px] font-bold text-white hover:bg-[#4abbc3] hover:text-[#0e243f] transition-colors"
            >
              <Phone className="h-4 w-4 text-[#4abbc3]" />
              Zadzwoń do salonu
            </a>
            <a
              href="https://maps.google.com/?q=Siennicka+47+Mi%C5%84sk+Mazowiecki"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-[12.5px] font-bold text-white hover:bg-[#4abbc3] hover:text-[#0e243f] transition-colors"
            >
              <MapPin className="h-4 w-4 text-[#4abbc3]" />
              Nawiguj (Siennicka)
            </a>
          </div>

          {/* Mobile Discount Card in Grupa ADK Teal */}
          <div className="mx-5 rounded-3xl bg-gradient-to-br from-[#4abbc3] to-[#36a6ae] p-5 text-[#0e243f] shadow-xl">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0e243f]/70">
              Dla mieszkańców mójMińsk
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-display text-[42px] font-bold leading-none">{partner.discount}</p>
              <span className="text-[13px] font-extrabold text-[#0e243f]">z kodem sąsiedzkim</span>
            </div>
            <p className="mt-1 text-[12px] font-medium leading-snug text-[#0e243f]/90">
              Na całą stolarkę i montaż + <strong>darmowy pomiar laserowy</strong> w Mińsku Mazowieckim i gminie.
            </p>

            <button
              type="button"
              onClick={handleCopyCode}
              className="mt-3.5 flex h-11 w-full items-center justify-between rounded-xl border-2 border-dashed border-[#0e243f]/30 bg-white/90 pl-4 pr-1.5"
            >
              <span className="font-display text-[16px] font-bold tracking-wider text-[#0e243f]">
                {partner.code}
              </span>
              <span className="flex h-8 items-center gap-1.5 rounded-lg bg-[#0e243f] px-3 text-[11.5px] font-bold text-white">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Skopiowano!' : 'Kopiuj'}
              </span>
            </button>
          </div>

          {/* Mobile Interactive Quote Form */}
          <div
            ref={formRefMobile}
            className="mx-5 rounded-3xl border border-[#4abbc3]/40 bg-[#162438] p-5 shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4abbc3] text-[#0e243f]">
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
              <div className="mt-4 rounded-xl bg-[#4abbc3]/15 border border-[#4abbc3]/40 p-4 text-center">
                <Check className="h-6 w-6 text-[#4abbc3] mx-auto mb-1" />
                <p className="font-display text-[14px] font-bold text-white">Zgłoszenie wysłane!</p>
                <p className="mt-0.5 text-[11px] text-white/80">
                  Doradca Grupy ADK skontaktuje się telefonicznie w ciągu 24h.
                </p>
                <button
                  type="button"
                  onClick={() => setQuoteSent(false)}
                  className="mt-2 text-[10.5px] font-bold text-[#4abbc3] hover:underline"
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
                    className="h-10 w-full rounded-xl border border-[#364e6b] bg-[#0e243f] px-3 text-[12.5px] text-white focus:border-[#4abbc3] focus:outline-none"
                  >
                    {partner.products.map((p) => (
                      <option key={p.id} value={p.name} className="bg-[#0e243f] text-white">
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
                    className="h-10 w-full rounded-xl border border-[#364e6b] bg-[#0e243f] px-3 text-[12.5px] text-white placeholder-white/40 focus:border-[#4abbc3] focus:outline-none"
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
                    className="h-10 w-full rounded-xl border border-[#364e6b] bg-[#0e243f] px-3 text-[12.5px] text-white placeholder-white/40 focus:border-[#4abbc3] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#4abbc3] text-[#0e243f] text-[13px] font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-[#4abbc3]/20"
                >
                  <Send className="h-4 w-4" />
                  Zamów pomiar z kodem {partner.code}
                </button>
              </form>
            )}
          </div>

          {/* Mobile Catalog of Solutions */}
          <div className="px-5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4abbc3]">grupaadk.pl</span>
            <h2 className="font-display text-[20px] font-semibold">Oferta i Rozwiązania</h2>
            <p className="text-[12px] text-white/60">Profile, przeszklenia i pergole Grupy ADK</p>

            <div className="mt-3 space-y-3">
              {partner.products.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#162438] p-3"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0e243f]">
                    <Img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {item.badge && (
                      <span className="absolute top-2 left-2 rounded bg-[#0e243f]/90 px-2 py-0.5 text-[9.5px] font-bold text-[#4abbc3] border border-[#4abbc3]/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#4abbc3]">
                      {item.category}
                    </p>
                    <h3 className="font-display text-[15px] font-bold text-white">
                      {item.name}
                    </h3>
                    <p className="text-[11.5px] text-white/80 font-medium">
                      {item.material}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/50">
                      {item.specs}
                    </p>
                    <button
                      type="button"
                      onClick={() => scrollToForm(item.name)}
                      className="mt-3 w-full h-9 rounded-xl bg-white/10 hover:bg-[#4abbc3] hover:text-[#0e243f] text-white text-[12px] font-bold transition-colors"
                    >
                      Zapytaj o wycenę
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Mobile Trust Points */}
          <div className="mx-5 rounded-2xl border border-white/10 bg-[#162438] p-4 space-y-2.5 text-[11.5px] text-white/70">
            <p className="font-bold text-white text-[12px] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#4abbc3]" /> Dlaczego Grupa ADK?
            </p>
            <p>✓ Showroom przy ul. Siennickiej 47 w Mińsku Mazowieckim</p>
            <p>✓ Własny montaż i serwis w 15 minut od zgłoszenia</p>
            <p>✓ Pomoc w dofinansowaniu z programu „Czyste Powietrze”</p>
            <p>✓ Bezpłatny pomiar laserowy na budowie z kodem {partner.code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
