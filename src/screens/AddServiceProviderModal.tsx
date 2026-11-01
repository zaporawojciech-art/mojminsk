import { useRef, useState } from 'react';
import {
  Camera,
  Check,
  Image as ImageIcon,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  User as UserIcon,
  Wrench,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import { avatarUrl, streets, type User } from '../data/mockData';
import {
  SERVICE_CATEGORIES,
  createCompanyLogoDataUri,
  getServiceCategoryById,
  type ServiceCategoryId,
  type ServicePortfolioItem,
  type ServiceProvider,
} from '../data/servicesData';
import { SERVICE_CATEGORY_ICONS } from './ServicesScreen';

interface AddServiceProviderModalProps {
  user: User;
  onClose: () => void;
  onSave: (provider: ServiceProvider) => void;
  isClosing?: boolean;
}

const SAMPLE_PORTFOLIO_BY_CATEGORY: Record<
  Exclude<ServiceCategoryId, 'all'>,
  { imageUrl: string; caption: string; locationLabel: string }
> = {
  instalacje: {
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80',
    caption: 'Montaż kotłowni i instalacji u klienta',
    locationLabel: 'Mińsk Mazowiecki',
  },
  remonty: {
    imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80',
    caption: 'Kompleksowe wykończenie wnętrza i łazienki pod klucz',
    locationLabel: 'Mińsk Mazowiecki',
  },
  stolarz: {
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    caption: 'Realizacja zabudowy meblowej na wymiar',
    locationLabel: 'Mińsk Mazowiecki',
  },
  ogrod: {
    imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80',
    caption: 'Ułożenie kostki brukowej i zagospodarowanie ogrodu',
    locationLabel: 'Mińsk Mazowiecki',
  },
  auto: {
    imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
    caption: 'Diagnostyka i serwis mechaniczny pojazdu',
    locationLabel: 'Mińsk Mazowiecki',
  },
};

export function AddServiceProviderModal({
  user,
  onClose,
  onSave,
  isClosing = false,
}: AddServiceProviderModalProps) {
  const selectableCategories = SERVICE_CATEGORIES.filter(
    (c): c is typeof c & { id: Exclude<ServiceCategoryId, 'all'> } => c.id !== 'all',
  );

  const [name, setName] = useState(user.name);
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState<Exclude<ServiceCategoryId, 'all'>>('instalacje');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Pogotowie hydrauliczne',
    'Instalacje wod-kan i CO',
  ]);
  const [customTag, setCustomTag] = useState('');
  const [street, setStreet] = useState(user.street.name);
  const [city] = useState('Mińsk Mazowiecki');
  const [phone, setPhone] = useState('+48 ');
  const [yearsExperience, setYearsExperience] = useState<number>(8);
  const [description, setDescription] = useState('');

  // Logo vs Resident Avatar state
  const [brandMode, setBrandMode] = useState<'avatar' | 'logo'>('avatar');
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);

  const [portfolio, setPortfolio] = useState<ServicePortfolioItem[]>([]);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoLocation, setNewPhotoLocation] = useState(`ul. ${user.street.name}, Mińsk Maz.`);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const currentCatMeta = getServiceCategoryById(categoryId);

  // Auto-generated brand logo preview when brandMode === 'logo' and no file uploaded yet
  const generatedLogoPreview = createCompanyLogoDataUri({
    monogram:
      businessName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('') || 'MM',
    subtext: currentCatMeta.shortLabel.slice(0, 10).toUpperCase(),
    bgStart: '#101820',
    bgEnd: '#1e293b',
    accent: '#f4694c',
  });

  const effectiveLogoUrl =
    brandMode === 'logo' ? uploadedLogoUrl || generatedLogoPreview : null;

  const handleCategoryChange = (nextCat: Exclude<ServiceCategoryId, 'all'>) => {
    setCategoryId(nextCat);
    const meta = getServiceCategoryById(nextCat);
    setSelectedTags(meta.suggestedTags.slice(0, 2));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 6),
    );
  };

  const handleAddCustomTag = () => {
    const t = customTag.trim();
    if (!t) return;
    if (!selectedTags.includes(t) && selectedTags.length < 6) {
      setSelectedTags((prev) => [...prev, t]);
    }
    setCustomTag('');
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedLogoUrl(reader.result);
        setBrandMode('logo');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || portfolio.length >= 6) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPortfolio((prev) => [
          ...prev,
          {
            id: `port_${Date.now()}`,
            imageUrl: reader.result as string,
            caption: newPhotoCaption.trim() || `Realizacja — ${currentCatMeta.shortLabel}`,
            locationLabel: newPhotoLocation.trim() || 'Mińsk Mazowiecki',
          },
        ]);
        setNewPhotoCaption('');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddSamplePhoto = () => {
    if (portfolio.length >= 6) return;
    const sample = SAMPLE_PORTFOLIO_BY_CATEGORY[categoryId];
    setPortfolio((prev) => [
      ...prev,
      {
        id: `port_${Date.now()}`,
        imageUrl: sample.imageUrl,
        caption: newPhotoCaption.trim() || sample.caption,
        locationLabel: newPhotoLocation.trim() || sample.locationLabel,
      },
    ]);
    setNewPhotoCaption('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim().length < 3) {
      setError('Podaj nazwę firmy lub tytuł wizytówki wykonawcy (min. 3 znaki).');
      return;
    }
    if (phone.replace(/\D/g, '').length < 9) {
      setError('Podaj poprawny, 9-cyfrowy numer telefonu do kontaktu dla sąsiadów.');
      return;
    }
    if (description.trim().length < 20) {
      setError('Opisz zakres świadczonych usług i doświadczenie (min. 20 znaków).');
      return;
    }

    const newProvider: ServiceProvider = {
      id: `sp_${Date.now()}`,
      authorId: user.profileId,
      name: name.trim() || user.name,
      businessName: businessName.trim(),
      categoryId,
      tags: selectedTags.length > 0 ? selectedTags : [currentCatMeta.shortLabel],
      street,
      city,
      avatarSeed: user.seed || `${name}-${street}`,
      logoUrl: effectiveLogoUrl,
      description: description.trim(),
      phone: phone.trim(),
      yearsExperience: Math.max(1, Number(yearsExperience) || 1),
      verifiedByAdmin: false,
      status: 'pending_verification',
      promoted: false,
      portfolio,
      reviews: [],
      createdAt: new Date().toISOString(),
    };

    onSave(newProvider);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Dodaj profil wykonawcy"
          backLabel="Anuluj"
          onBack={onClose}
        />

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overscroll-contain p-5 md:px-8 lg:px-12 md:py-7 space-y-5 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 lg:gap-8 md:items-start pb-32 md:pb-16"
        >
          {/* LEFT COLUMN (Sections 1 & 2 on Desktop) */}
          <div className="space-y-5 md:col-span-7 lg:col-span-8">
          {/* 1. PODSTAWOWE DANE WYKONAWCY / FIRMY & LOGOTYP */}
          <div className="rounded-3xl bg-white p-5 md:p-6 shadow-card border border-mist-200 space-y-4">
            <h2 className="font-display text-[17px] font-bold text-ink flex items-center gap-2">
              <Wrench className="h-4.5 w-4.5 text-coral-700" />
              <span>1. Dane wykonawcy, logotyp i branża</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                  Imię i nazwisko fachowca
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Marek Kowalski"
                  className="h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3.5 text-[13.5px] font-semibold text-ink focus:border-ink focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                  Nazwa firmy / Tytuł wizytówki *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="np. MK-Instal Hydraulika & Pompy Ciepła"
                  className="h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3.5 text-[13.5px] font-semibold text-ink focus:border-ink focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* LOGO FIRMY VS AWATAR MIESZKAŃCA */}
            <div className="rounded-2xl bg-mist/50 p-3.5 border border-mist-200 space-y-3">
              <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500">
                Identyfikacja wizualna w katalogu (Logotyp lub Awatar)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBrandMode('logo')}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer',
                    brandMode === 'logo'
                      ? 'border-ink bg-white shadow-xs ring-1 ring-ink'
                      : 'border-mist-300 bg-white/60 hover:bg-white',
                  )}
                >
                  <img
                    src={uploadedLogoUrl || generatedLogoPreview}
                    alt="Podgląd logotypu"
                    className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-mist-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-ink flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5 text-coral-700" />
                        Logotyp firmy
                      </span>
                      {brandMode === 'logo' && <Check className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-ink-500 leading-tight mt-0.5">
                      Wyświetla oficjalne logo lub monogram Twojej firmy
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBrandMode('avatar')}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer',
                    brandMode === 'avatar'
                      ? 'border-ink bg-white shadow-xs ring-1 ring-ink'
                      : 'border-mist-300 bg-white/60 hover:bg-white',
                  )}
                >
                  <img
                    src={avatarUrl(user.seed || `${name}-${street}`)}
                    alt="Awatar mieszkańca"
                    className="h-12 w-12 shrink-0 rounded-xl bg-sand-100 object-cover ring-1 ring-sand-300"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-ink flex items-center gap-1">
                        <UserIcon className="h-3.5 w-3.5 text-sky-700" />
                        Brak logo (Awatar)
                      </span>
                      {brandMode === 'avatar' && <Check className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-ink-500 leading-tight mt-0.5">
                      Dla osób fizycznych — wyświetla Twój awatar sąsiada
                    </p>
                  </div>
                </button>
              </div>

              {brandMode === 'logo' && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-xl bg-ink px-3.5 py-1.5 text-[11.5px] font-bold text-white hover:bg-ink-800 cursor-pointer"
                  >
                    Wgraj własny plik z logotypem (PNG/JPG/SVG)
                  </button>
                  {uploadedLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setUploadedLogoUrl(null)}
                      className="rounded-xl bg-white border border-mist-300 px-3 py-1.5 text-[11.5px] font-semibold text-ink-600 hover:text-ink cursor-pointer"
                    >
                      Użyj monogramu automatycznego
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Category Selection with Colorful Icons */}
            <div>
              <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-2">
                Wybierz kategorię usług *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectableCategories.map((cat) => {
                  const active = categoryId === cat.id;
                  const Icon = SERVICE_CATEGORY_ICONS[cat.id] || Wrench;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        'flex items-center justify-between rounded-2xl border p-2.5 text-left transition-all cursor-pointer',
                        active
                          ? 'border-ink bg-ink text-white shadow-xs'
                          : 'border-mist-300 bg-white text-ink hover:bg-mist/50',
                      )}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            'grid h-8 w-8 shrink-0 place-items-center rounded-xl',
                            active ? 'bg-white/20 text-white' : cn(cat.tone.bg, cat.tone.text),
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-[12.5px] font-bold truncate">{cat.label}</span>
                      </span>
                      {active && <Check className="h-4 w-4 text-coral shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialization Tags */}
            <div>
              <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                Specjalizacje (wybierz do 6 tagów)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {currentCatMeta.suggestedTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'rounded-xl px-3 py-1.5 text-[12px] font-bold transition-colors cursor-pointer',
                        active
                          ? 'bg-emerald-700 text-white'
                          : 'bg-mist text-ink-700 hover:bg-mist-300',
                      )}
                    >
                      {active ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Dodaj własną specjalizację..."
                  className="h-10 flex-1 rounded-xl border border-mist-300 bg-mist/40 px-3 text-[12.5px] text-ink focus:border-ink focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="rounded-xl bg-mist px-3.5 text-[12px] font-bold text-ink hover:bg-mist-300 cursor-pointer"
                >
                  Dodaj tag
                </button>
              </div>
            </div>
          </div>

          {/* 2. LOKALIZACJA, KONTAKT I OPIS */}
          <div className="rounded-3xl bg-white p-5 shadow-card border border-mist-200 space-y-4">
            <h2 className="font-display text-[17px] font-bold text-ink flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-coral-700" />
              <span>2. Lokalizacja, kontakt i opis usług</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                  Ulica / Sołectwo
                </label>
                <select
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3 text-[13px] font-semibold text-ink focus:border-ink focus:bg-white focus:outline-none"
                >
                  {streets.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                  Telefon kontaktowy *
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+48 500 000 000"
                    className="h-11 w-full rounded-xl border border-mist-300 bg-mist/40 pl-9 pr-3 text-[13px] font-semibold text-ink focus:border-ink focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                  Staż w branży (lata)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3.5 text-[13px] font-semibold text-ink focus:border-ink focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                Opis działalności i realizowanych usług *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opisz swoje doświadczenie, posiadane uprawnienia oraz jakie zlecenia realizujesz dla mieszkańców Mińska i okolic..."
                className="w-full rounded-2xl border border-mist-300 bg-mist/40 p-3.5 text-[13px] text-ink placeholder:text-ink-400 focus:border-ink focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          </div>

          {/* RIGHT COLUMN (Portfolio & Submit on Desktop) */}
          <div className="space-y-5 md:col-span-5 lg:col-span-4 md:sticky md:top-4">
          {/* 3. PORTFOLIO ZDJĘĆ Z REALIZACJI (DO 6 ZDJĘĆ) */}
          <div className="rounded-3xl bg-white p-5 md:p-6 shadow-card border border-mist-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-[17px] font-bold text-ink flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-coral-700" />
                  <span>3. Zdjęcia z realizacji ({portfolio.length}/6)</span>
                </h2>
                <p className="text-[12px] text-ink-500">
                  Pokaż sąsiadom efekty swojej pracy (do 6 zdjęć z krótkim podpisem)
                </p>
              </div>
            </div>

            {portfolio.length < 6 && (
              <div className="rounded-2xl bg-mist/60 p-3.5 border border-mist-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Podpis zdjęcia (np. Montaż kotłowni)"
                    className="h-10 rounded-xl border border-mist-300 bg-white px-3 text-[12.5px] text-ink focus:border-ink focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newPhotoLocation}
                    onChange={(e) => setNewPhotoLocation(e.target.value)}
                    placeholder="Lokalizacja (np. ul. Spacerowa, Mińsk Maz.)"
                    className="h-10 rounded-xl border border-mist-300 bg-white px-3 text-[12.5px] text-ink focus:border-ink focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-[12px] font-bold text-white hover:bg-ink-800 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-coral" />
                    <span>Wgraj zdjęcie z urządzenia</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSamplePhoto}
                    className="flex items-center gap-1.5 rounded-xl border border-mist-300 bg-white px-3.5 py-2 text-[12px] font-bold text-ink hover:bg-mist cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Dodaj zdjęcie poglądowe realizacji</span>
                  </button>
                </div>
              </div>
            )}

            {portfolio.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-2xl border border-mist-200 bg-mist/40"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.caption}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPortfolio((prev) => prev.filter((p) => p.id !== item.id))
                      }
                      aria-label="Usuń zdjęcie"
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-ink/80 text-white hover:bg-coral cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="p-2">
                      <p className="truncate text-[11px] font-bold text-ink">{item.caption}</p>
                      <p className="truncate text-[10px] text-ink-500">{item.locationLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-2xl bg-coral-100 border border-coral-300 p-3.5 text-[12.5px] font-bold text-coral-900">
              {error}
            </div>
          )}

          {/* SUBMIT CARD / BUTTONS */}
          <div className="rounded-3xl bg-white p-5 shadow-card border border-mist-200 space-y-3">
            <div className="flex items-start gap-2.5 text-[12px] text-ink-600 leading-relaxed">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Wizytówka trafi do katalogu <b>Zaufanych Usług</b> dla mieszkańców Mińska Mazowieckiego i gminy.
              </span>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 pt-1">
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coral px-6 text-[14px] font-extrabold text-ink shadow-card hover:bg-coral-400 active:scale-[0.98] transition-all cursor-pointer"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                <span>Wyślij profil do weryfikacji</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-11 w-full rounded-2xl border border-mist-300 bg-mist/40 px-5 text-[13px] font-bold text-ink-600 hover:bg-mist-200 transition-colors cursor-pointer"
              >
                Anuluj
              </button>
            </div>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}
