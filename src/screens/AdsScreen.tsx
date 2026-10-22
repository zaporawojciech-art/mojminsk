import { useState } from 'react';
import { Briefcase, Check, Heart, MessageCircle, Plus } from 'lucide-react';
import { ads as initialAds, jobs as initialJobs, type Ad, type Job } from '../data/mockData';
import { Chip, Img, ScreenHeader, SearchField, Segmented, StreetPill, cn, toneBg, zl } from '../components/ui';

const filters = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'sell', label: 'Sprzedam' },
  { id: 'free', label: 'Oddam' },
  { id: 'lost', label: 'Zgubione' },
] as const;

interface AdsScreenProps {
  adsList?: Ad[];
  jobsList?: Job[];
  onAddClick?: () => void;
  onChatClick?: (ad: Ad) => void;
}

export function AdsScreen({
  adsList = initialAds,
  jobsList = initialJobs,
  onAddClick,
  onChatClick,
}: AdsScreenProps) {
  const [mode, setMode] = useState<'c2c' | 'jobs'>('c2c');
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const list = filter === 'all' ? adsList : adsList.filter((a) => a.kind === filter);

  return (
    <div className="pb-36">
      <ScreenHeader
        title="Ogłoszenia"
        subtitle="Od sąsiadów i mińskich firm"
        right={
          <button
            onClick={onAddClick}
            className="flex h-11 items-center gap-1.5 rounded-full bg-coral px-4 text-[13.5px] font-bold text-ink shadow-coral transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Dodaj
          </button>
        }
      />
      <div className="space-y-4 px-5">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { id: 'c2c', label: 'Sąsiedzkie', badge: adsList.length },
            { id: 'jobs', label: 'Praca', badge: jobsList.length },
          ]}
        />
        <SearchField placeholder={mode === 'c2c' ? 'Szukaj wśród ogłoszeń…' : 'Stanowisko, firma…'} />
      </div>

      {mode === 'c2c' ? (
        <>
          <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
            {filters.map((f) => (
              <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 px-5">
            {list.map((a) => (
              <article key={a.id} className="rounded-3xl bg-white p-2.5 shadow-card">
                <div className="relative overflow-hidden rounded-2xl">
                  <Img src={a.image} alt={a.title} className="aspect-[4/5] w-full" />
                  <button
                    onClick={() => setLiked((l) => ({ ...l, [a.id]: !l[a.id] }))}
                    aria-label="Obserwuj"
                    aria-pressed={!!liked[a.id]}
                    className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur"
                  >
                    <Heart className={cn('h-4 w-4', liked[a.id] && 'fill-coral text-coral')} aria-hidden />
                  </button>
                  {a.kind !== 'sell' && (
                    <span className={cn('absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10.5px] font-bold', a.kind === 'free' ? 'bg-sky' : 'bg-coral')}>
                      {a.kind === 'free' ? 'Oddam' : 'Zaginął'}
                    </span>
                  )}
                </div>
                <div className="px-1 pb-1 pt-2.5">
                  <p className="font-display text-[18px] font-semibold leading-none">{a.price ? zl(a.price) : a.kind === 'free' ? 'Za darmo' : 'Pomóż'}</p>
                  <p className="mt-1 line-clamp-2 min-h-[2.5em] text-[13px] font-semibold leading-snug text-ink-700">{a.title}</p>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <StreetPill street={a.street} />
                    <span className="text-[10.5px] text-ink-400">{a.time}</span>
                  </div>
                  <button
                    onClick={() => onChatClick?.(a)}
                    className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-mist text-[12.5px] font-bold text-ink hover:bg-mist-200 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Napisz do {a.author}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-3 px-5">
          {jobsList.map((j) => (
            <article key={j.id} className="rounded-4xl bg-white p-4 shadow-card">
              <div className="flex items-start gap-3">
                <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-[18px] font-semibold', toneBg[j.tone])}>
                  {j.company.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-ink-400">{j.company}</p>
                  <p className="text-[16.5px] font-bold leading-tight">{j.position}</p>
                </div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">{j.time}</span>
              </div>
              <p className="mt-3 font-display text-[22px] font-semibold">
                {j.salary} <span className="font-sans text-[12px] font-medium text-ink-400">{j.period}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {j.tags.map((t) => (
                  <span key={t} className="rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-semibold text-ink-700">
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setApplied((s) => ({ ...s, [j.id]: true }))}
                disabled={applied[j.id]}
                className={cn(
                  'mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold transition-colors',
                  applied[j.id] ? 'bg-sky-100 text-sky-700' : 'bg-ink text-white active:scale-[.99]',
                )}
              >
                {applied[j.id] ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden /> Zgłoszenie wysłane
                  </>
                ) : (
                  'Aplikuj jednym kliknięciem'
                )}
              </button>
              {!applied[j.id] && <p className="mt-2 text-center text-[11px] text-ink-400">Pracodawca dostanie: imię, ulicę i telefon</p>}
            </article>
          ))}

          <div className="flex items-center gap-3 rounded-4xl bg-sand-100 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand">
              <Briefcase className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-bold">Szukasz pracownika?</p>
              <p className="text-[12px] text-ink-500">Oferta na 14 dni za 10 zł</p>
            </div>
            <button className="rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-bold text-white">BLIK</button>
          </div>
        </div>
      )}
    </div>
  );
}
