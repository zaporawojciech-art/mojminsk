import { Fragment, useEffect, useState } from 'react';
import { BarChart2, Heart, ImageIcon, MessageCircle, Repeat2 } from 'lucide-react';
import { avatarUrl, posts as seedPosts, streets, talkTags, type Post, type User } from '../data/mockData';
import { Chip, Img, StandardTopBar, cn } from '../components/ui';
import {
  createPostInSupabase,
  fetchPostsFromSupabase,
  togglePostLikeInSupabase,
} from '../lib/supabase';

const MAX = 280;

function RichText({ text }: { text: string }) {
  const parts = text.split(/(#[\p{L}\d_]+)/u);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('#') ? (
          <span key={i} className="font-semibold text-sky-700">
            {p}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export function TalksScreen({
  user,
  onProfile,
  onNeighborClick,
  onAuthRequired,
}: {
  user: User | null;
  onProfile?: () => void;
  onNeighborClick?: (name: string, street: string) => void;
  onAuthRequired?: (title: string, desc: string) => void;
}) {
  const [list, setList] = useState<Post[]>(seedPosts);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('Wszystko');
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void fetchPostsFromSupabase().then((remotePosts) => {
      if (remotePosts && remotePosts.length > 0) {
        setList(remotePosts);
      }
    });
  }, []);

  const visible = tag === 'Wszystko' ? list : list.filter((p) => p.content.includes(tag));
  const left = MAX - text.length;

  const publish = () => {
    if (!user) {
      onAuthRequired?.(
        'Publikowanie w Strefie Rozmów',
        'Wpisy w mińskiej strefie dyskusji mogą dodawać wyłącznie zarejestrowani mieszkańcy, aby wyeliminować anonimowy hejt i boty.',
      );
      return;
    }
    if (!text.trim()) return;
    const newPost: Post = {
      id: `p_${Date.now()}`,
      author: user.name,
      authorAs: user.street.as,
      time: 'teraz',
      content: text.trim(),
      likes: 0,
      replies: 0,
      reposts: 0,
      views: 1,
    };
    setList((l) => [newPost, ...l]);
    void createPostInSupabase(newPost);
    setText('');
  };

  const toggleLike = (postId: string) => {
    if (!user) {
      onAuthRequired?.(
        'Polubienie wpisu',
        'Reakcje na wpisy sąsiadów są dostępne wyłącznie dla zalogowanych mieszkańców.',
      );
      return;
    }
    const nextLiked = !liked[postId];
    setLiked((l) => ({ ...l, [postId]: nextLiked }));
    void togglePostLikeInSupabase(postId, nextLiked ? 1 : -1);
  };

  return (
    <div className="w-full pb-36 md:px-8 lg:px-12 md:py-6 md:pb-16">
      <StandardTopBar
        user={user}
        onProfile={onProfile}
        title="Rozmowy"
        subtitle="Forum mieszkańców Mińska"
      />

      {/* Desktop Header */}
      <div className="hidden md:flex items-end justify-between border-b border-mist-300/80 pb-4 mb-5">
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
            Strefa Rozmów · Hiperlokalny puls miasta
          </p>
          <h1 className="mt-0.5 font-display text-[23px] font-extrabold tracking-tight text-ink">
            Rozmowy sąsiedzkie w Mińsku Mazowieckim
          </h1>
        </div>
        <p className="text-[12.5px] font-medium text-ink-500">
          Każdy wpis podpisany imieniem i ulicą · Zero anonimowego hejtu
        </p>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-6 lg:gap-7 items-start">
        {/* MAIN FEED COLUMN */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="mx-5 md:mx-0 rounded-4xl bg-white p-4 md:p-6 shadow-card border border-mist-200">
            <div className="flex gap-3.5">
              <img
                src={avatarUrl(user ? user.seed : 'gosc')}
                alt=""
                className="h-11 w-11 shrink-0 rounded-2xl bg-sand-100"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX))}
                onFocus={() => {
                  if (!user) {
                    onAuthRequired?.(
                      'Publikowanie w Strefie Rozmów',
                      'Wpisy w mińskiej strefie dyskusji mogą dodawać wyłącznie zarejestrowani mieszkańcy, aby wyeliminować anonimowy hejt i boty.',
                    );
                  }
                }}
                rows={2}
                placeholder={
                  user
                    ? `Co słychać ${user.street.as.replace(/^ze? /, 'na ')}? Podziel się z sąsiadami...`
                    : 'Zaloguj się, aby podzielić się wiadomością z sąsiadami...'
                }
                aria-label="Treść wpisu"
                className="min-h-[56px] flex-1 resize-none bg-transparent pt-2 text-[15px] outline-none placeholder:text-ink-400"
              />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-mist pt-3">
              <button aria-label="Dodaj zdjęcie" className="flex items-center gap-2 rounded-full bg-mist px-3.5 py-2 text-[12px] font-bold text-ink-600 hover:bg-mist-300 transition-colors">
                <ImageIcon className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">Dodaj zdjęcie</span>
              </button>
              <div className="flex items-center gap-3">
                <span className={cn('text-[12px] font-semibold tabular-nums', left < 20 ? 'text-coral-700' : 'text-ink-400')}>{left}</span>
                <button
                  onClick={publish}
                  disabled={!text.trim()}
                  className="h-10 rounded-full bg-coral px-6 text-[13.5px] font-extrabold text-ink shadow-coral hover:bg-coral-400 disabled:opacity-40 transition-all"
                >
                  Opublikuj wpis
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto md:flex-wrap px-5 md:px-0 pb-1 no-scrollbar">
            {talkTags.map((t) => (
              <Chip key={t} active={tag === t} onClick={() => setTag(t)}>
                {t}
              </Chip>
            ))}
          </div>

          <div className="mx-5 md:mx-0 mt-4 divide-y divide-mist overflow-hidden rounded-4xl bg-white shadow-card border border-mist-200">
            {visible.map((p) => {
              const isLiked = !!liked[p.id];
              const matchedStreet = streets.find((s) => s.as === p.authorAs)?.name ?? p.authorAs.replace(/^ze?\s+/i, '');
              return (
                <article key={p.id} className="flex gap-4 p-4 md:p-6 hover:bg-mist/25 transition-colors">
                  <button
                    type="button"
                    onClick={() => onNeighborClick?.(p.author, matchedStreet)}
                    className="shrink-0 self-start transition-transform active:scale-95"
                    title={`Zobacz profil: ${p.author}`}
                  >
                    <img src={avatarUrl(p.author)} alt="" className="h-12 w-12 rounded-2xl bg-sand-100" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onNeighborClick?.(p.author, matchedStreet)}
                      className="flex flex-wrap items-center gap-x-1.5 text-left text-[14.5px] hover:underline"
                    >
                      <b className="text-ink">
                        {p.author} {p.authorAs}
                      </b>
                      <span className="text-ink-400 text-[13px]">· {p.time}</span>
                    </button>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">
                      <RichText text={p.content} />
                    </p>
                    {p.image && <Img src={p.image} alt="" className="mt-3.5 h-56 md:h-72 w-full rounded-3xl object-cover" />}
                    <div className="mt-4 flex items-center justify-between max-w-md pr-2 text-[13px] text-ink-400">
                      <button className="flex items-center gap-1.5 hover:text-ink transition-colors" aria-label="Odpowiedz">
                        <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
                        {p.replies}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-ink transition-colors" aria-label="Udostępnij dalej">
                        <Repeat2 className="h-[18px] w-[18px]" aria-hidden />
                        {p.reposts}
                      </button>
                      <button
                        onClick={() => toggleLike(p.id)}
                        aria-pressed={isLiked}
                        aria-label="Polub"
                        className={cn('flex items-center gap-1.5 transition-transform active:scale-90', isLiked ? 'font-bold text-coral-700' : 'hover:text-ink')}
                      >
                        <Heart className={cn('h-[18px] w-[18px]', isLiked && 'fill-coral text-coral')} aria-hidden />
                        {p.likes + (isLiked ? 1 : 0)}
                      </button>
                      <span className="flex items-center gap-1.5">
                        <BarChart2 className="h-[18px] w-[18px]" aria-hidden />
                        {p.views}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Trending Street Hashtags & Active Streets (Desktop Only) */}
        <aside className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col gap-4 sticky top-5">
          <div className="rounded-4xl bg-white p-6 shadow-card border border-mist-200">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
              Tematy i ulice w Mińsku
            </p>
            <h3 className="mt-1 font-display text-[19px] font-bold text-ink">
              Popularne hasztagi
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {talkTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={cn(
                    'rounded-2xl px-3.5 py-2 text-[13px] font-bold transition-all',
                    tag === t
                      ? 'bg-ink text-white shadow-xs'
                      : 'bg-mist text-ink-700 hover:bg-mist-300',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-4xl bg-white p-6 shadow-card border border-mist-200">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
              Aktywne sąsiedztwa
            </p>
            <h3 className="mt-1 font-display text-[19px] font-bold text-ink">
              Najwięcej sąsiadów
            </h3>
            <div className="mt-4 divide-y divide-mist">
              {streets.slice(0, 6).map((s, idx) => (
                <div key={s.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-sand-100 text-[11px] font-extrabold text-ink">
                      {idx + 1}
                    </span>
                    <span className="text-[13.5px] font-bold text-ink">ul. {s.name}</span>
                  </div>
                  <span className="rounded-full bg-mist px-2.5 py-0.5 text-[11.5px] font-bold text-ink-500">
                    {s.neighbors} mieszk.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
