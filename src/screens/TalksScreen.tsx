import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart2,
  Check,
  Heart,
  ImageIcon,
  MessageCircle,
  MoreVertical,
  Repeat2,
  Trash2,
  X,
} from 'lucide-react';
import {
  avatarUrl,
  formatResidentLabel,
  getPostAuthorSeed,
  resolveStreetName,
  streets,
  talkTags as defaultTags,
  type Post,
  type User,
} from '../data/mockData';
import { Chip, Img, StandardTopBar, cn } from '../components/ui';
import {
  createPostInSupabase,
  deletePostInSupabase,
  fetchPostsFromSupabase,
  fetchUserLikedPostIds,
  togglePostLikeInSupabase,
} from '../lib/supabase';
import { PostThreadModal } from './PostThreadModal';

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
  const [list, setList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tag, setTag] = useState('Wszystko');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [activeThreadPost, setActiveThreadPost] = useState<Post | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Ładowanie wpisów z bazy danych Supabase
  const loadPosts = async () => {
    try {
      const remotePosts = await fetchPostsFromSupabase();
      if (remotePosts) {
        setList(remotePosts);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
  }, []);

  // 2. Ładowanie polubień zalogowanego użytkownika
  useEffect(() => {
    if (!user?.profileId) {
      setLikedMap({});
      return;
    }
    void fetchUserLikedPostIds(user.profileId).then((postIds) => {
      const map: Record<string, boolean> = {};
      for (const id of postIds) {
        map[id] = true;
      }
      setLikedMap(map);
    });
  }, [user?.profileId]);

  // 3. Sprawdzenie query param ?post= w URL (np. przy wejściu z udostępnionego linku)
  useEffect(() => {
    if (typeof window === 'undefined' || list.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const targetPostId = params.get('post');
    if (targetPostId) {
      const found = list.find((p) => p.id === targetPostId);
      if (found) {
        setActiveThreadPost(found);
      }
    }
  }, [list]);

  // Hasztag ulicy zalogowanego użytkownika
  const userStreetTag = user?.street?.name ? `#${user.street.name.replace(/\s+/g, '')}` : null;

  // Dynamiczne hasztagi z priorytetem dla ulicy zalogowanego użytkownika
  const dynamicTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of list) {
      const matches = p.content.match(/#[\p{L}\d_]+/gu);
      if (matches) {
        for (const m of matches) {
          counts.set(m, (counts.get(m) ?? 0) + 1);
        }
      }
    }
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .filter((t) => t !== userStreetTag);

    const base = ['Wszystko'];
    if (userStreetTag) {
      base.push(userStreetTag);
    }
    const cleanDefaults = defaultTags.filter(
      (t) => t !== 'Wszystko' && t !== '#Spacerowa' && t !== userStreetTag,
    );
    const combined = [...base, ...new Set([...sorted, ...cleanDefaults])];
    return combined.slice(0, 8);
  }, [list, userStreetTag]);

  // Aktywne ulice z priorytetem dla ulicy użytkownika na samej górze
  const activeStreets = useMemo(() => {
    const listCopy = [...streets].sort((a, b) => b.neighbors - a.neighbors);
    if (!user?.street?.name) return listCopy.slice(0, 6);
    const userStreetObj = streets.find((s) => s.name === user.street.name) ?? user.street;
    const others = listCopy.filter((s) => s.name !== user.street.name);
    return [userStreetObj, ...others].slice(0, 6);
  }, [user?.street?.name]);

  const visible = tag === 'Wszystko' ? list : list.filter((p) => p.content.includes(tag));
  const left = MAX - text.length;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Zdjęcie jest za duże. Maksymalny rozmiar to 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const publish = async () => {
    if (!user) {
      onAuthRequired?.(
        'Publikowanie w Strefie Rozmów',
        'Wpisy w mińskiej strefie dyskusji mogą dodawać wyłącznie zarejestrowani mieszkańcy, aby wyeliminować anonimowy hejt i boty.',
      );
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;

    const newPost: Post = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: user.name,
      authorAs: user.street.name,
      authorProfileId: user.profileId,
      authorAvatarSeed: user.seed,
      time: 'przed chwilą',
      content: trimmed,
      image: selectedImage ?? undefined,
      likes: 0,
      replies: 0,
      reposts: 0,
      views: 1,
      createdAt: new Date().toISOString(),
    };

    setList((prev) => [newPost, ...prev]);
    setText('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    await createPostInSupabase(newPost);
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      onAuthRequired?.(
        'Polubienie wpisu',
        'Reakcje na wpisy sąsiadów są dostępne wyłącznie dla zalogowanych mieszkańców.',
      );
      return;
    }

    const currentlyLiked = Boolean(likedMap[postId]);
    const nextLiked = !currentlyLiked;

    // Optymistyczna aktualizacja UI
    setLikedMap((prev) => ({ ...prev, [postId]: nextLiked }));
    setList((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const delta = nextLiked ? 1 : -1;
          return { ...p, likes: Math.max(0, p.likes + delta) };
        }
        return p;
      }),
    );

    if (activeThreadPost?.id === postId) {
      setActiveThreadPost((prev) =>
        prev ? { ...prev, likes: Math.max(0, prev.likes + (nextLiked ? 1 : -1)) } : null,
      );
    }

    try {
      const res = await togglePostLikeInSupabase(postId, user.profileId);
      if (res.liked !== nextLiked) {
        setLikedMap((prev) => ({ ...prev, [postId]: res.liked }));
      }
    } catch {
      // rollback w razie błędu
      setLikedMap((prev) => ({ ...prev, [postId]: currentlyLiked }));
    }
  };

  const handleSharePost = async (p: Post) => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/rozmowy?post=${p.id}` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Wpis ${p.author} (${formatResidentLabel(p.authorAs)}) — mójMińsk`,
          text: p.content,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedPostId(p.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    setList((prev) => prev.filter((p) => p.id !== postId));
    if (activeThreadPost?.id === postId) {
      setActiveThreadPost(null);
    }
    await deletePostInSupabase(postId);
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
          {/* NOWY WPIS */}
          <div className="mx-5 md:mx-0 rounded-4xl bg-white p-4 md:p-6 shadow-card border border-mist-200">
            <div className="flex gap-3.5">
              <img
                src={avatarUrl(user ? user.seed : 'gosc')}
                alt=""
                className="h-11 w-11 shrink-0 rounded-2xl bg-sand-100 object-cover"
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
                    ? `${user.name}, co nowego w Twojej okolicy? Podziel się z sąsiadami...`
                    : 'Zaloguj się, aby podzielić się wiadomością z sąsiadami...'
                }
                aria-label="Treść wpisu"
                className="min-h-[56px] flex-1 resize-none bg-transparent pt-2 text-[15px] outline-none placeholder:text-ink-400"
              />
            </div>

            {/* PODGLĄD ZAŁĄCZONEGO ZDJĘCIA */}
            {selectedImage && (
              <div className="mt-3 relative inline-block">
                <img
                  src={selectedImage}
                  alt="Podgląd załącznika"
                  className="h-28 w-28 rounded-2xl object-cover border border-mist-300 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-white hover:bg-coral-700 transition-colors cursor-pointer shadow-md"
                  aria-label="Usuń zdjęcie"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-mist pt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                aria-label="Wybierz plik zdjęcia"
              />
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    onAuthRequired?.(
                      'Dodawanie zdjęć',
                      'Zdjęcia w Strefie Rozmów mogą dodawać wyłącznie zalogowani mieszkańcy.',
                    );
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                aria-label="Dodaj zdjęcie"
                className="flex items-center gap-2 rounded-full bg-mist px-3.5 py-2 text-[12px] font-bold text-ink-600 hover:bg-mist-300 transition-colors cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" aria-hidden />
                <span className="hidden md:inline">Dodaj zdjęcie</span>
              </button>

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-[12px] font-semibold tabular-nums',
                    left < 20 ? 'text-coral-700' : 'text-ink-400',
                  )}
                >
                  {left}
                </span>
                <button
                  onClick={publish}
                  disabled={!text.trim()}
                  className="h-10 rounded-full bg-coral px-6 text-[13.5px] font-extrabold text-ink shadow-coral hover:bg-coral-400 disabled:opacity-40 transition-all cursor-pointer"
                >
                  Opublikuj wpis
                </button>
              </div>
            </div>
          </div>

          {/* HASZTAGI */}
          <div className="mt-4 flex gap-2 overflow-x-auto md:flex-wrap px-5 md:px-0 pb-1 no-scrollbar">
            {dynamicTags.map((t) => (
              <Chip key={t} active={tag === t} onClick={() => setTag(t)}>
                {t}
              </Chip>
            ))}
          </div>

          {/* STAN ŁADOWANIA / PUSTY FEED / LISTA WPISÓW */}
          {loading ? (
            <div className="mx-5 md:mx-0 mt-4 rounded-4xl bg-white p-8 text-center shadow-card border border-mist-200">
              <p className="text-[14px] font-semibold text-ink-500">Wczytywanie wpisów mieszkańców...</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="mx-5 md:mx-0 mt-4 rounded-4xl bg-white p-8 text-center shadow-card border border-mist-200">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-coral">
                <MessageCircle className="h-6 w-6" />
              </div>
              <p className="mt-3 font-display text-[17px] font-bold text-ink">
                Strefa Rozmów czeka na pierwszy wpis
              </p>
              <p className="mt-1 text-[13px] text-ink-500 max-w-md mx-auto">
                Bądź pierwszą osobą, która przywita się z sąsiadami lub podzieli się informacją ze swojej ulicy!
              </p>
              {tag !== 'Wszystko' && (
                <button
                  type="button"
                  onClick={() => setTag('Wszystko')}
                  className="mt-3.5 rounded-lg bg-ink px-4 py-2 text-[12.5px] font-bold text-white shadow-card active:scale-95 cursor-pointer"
                >
                  Pokaż wszystkie wpisy
                </button>
              )}
            </div>
          ) : (
            <div className="mx-5 md:mx-0 mt-4 divide-y divide-mist overflow-hidden rounded-4xl bg-white shadow-card border border-mist-200">
              {visible.map((p) => {
                const isLiked = Boolean(likedMap[p.id]);
                const matchedStreet = resolveStreetName(p.authorAs);
                const isAuthor =
                  Boolean(user) &&
                  ((p.authorProfileId && p.authorProfileId === user?.profileId) ||
                    (p.author === user?.name && matchedStreet === user?.street.name));

                return (
                  <article key={p.id} className="relative flex gap-4 p-4 md:p-6 hover:bg-mist/20 transition-colors">
                    {/* AVATAR */}
                    <button
                      type="button"
                      onClick={() => onNeighborClick?.(p.author, matchedStreet)}
                      className="shrink-0 self-start transition-transform active:scale-95 cursor-pointer"
                      title={`Zobacz profil: ${p.author}`}
                    >
                      <img
                        src={avatarUrl(getPostAuthorSeed(p, user))}
                        alt=""
                        className="h-12 w-12 rounded-2xl bg-sand-100 object-cover"
                      />
                    </button>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onNeighborClick?.(p.author, matchedStreet)}
                          className="flex flex-wrap items-center gap-x-1.5 text-left text-[14.5px] hover:underline cursor-pointer"
                        >
                          <b className="text-ink">{p.author}</b>
                          <span className="text-ink-500 text-[13px] font-medium">
                            {formatResidentLabel(p.authorAs)}
                          </span>
                          <span className="text-ink-400 text-[13px]">· {p.time}</span>
                        </button>

                        {/* MENU POSTA */}
                        {isAuthor && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuPostId((prev) => (prev === p.id ? null : p.id))
                              }
                              className="rounded-full p-1 text-ink-400 hover:text-ink hover:bg-mist transition-colors cursor-pointer"
                              aria-label="Opcje wpisu"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {activeMenuPostId === p.id && (
                              <div className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-mist-200 bg-white p-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuPostId(null);
                                    void handleDeletePost(p.id);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-bold text-coral-700 hover:bg-coral-50 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Usuń wpis</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* KLIKALNA TREŚĆ OTWIERAJĄCA WĄTEK */}
                      <div
                        onClick={() => setActiveThreadPost(p)}
                        className="cursor-pointer"
                        title="Kliknij, aby otworzyć wątek i odpowiedzi"
                      >
                        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700 break-words">
                          <RichText text={p.content} />
                        </p>
                        {p.image && (
                          <Img
                            src={p.image}
                            alt=""
                            className="mt-3.5 h-56 md:h-72 w-full rounded-3xl object-cover"
                          />
                        )}
                      </div>

                      {/* PASEK AKCJI */}
                      <div className="mt-4 flex items-center justify-between max-w-md pr-2 text-[13px] text-ink-400">
                        {/* WĄTEK / ODPOWIEDZ */}
                        <button
                          type="button"
                          onClick={() => setActiveThreadPost(p)}
                          className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer"
                          aria-label="Odpowiedz w wątku"
                        >
                          <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
                          <span className="font-semibold">{p.replies}</span>
                        </button>

                        {/* UDOSTĘPNIJ */}
                        <button
                          type="button"
                          onClick={() => handleSharePost(p)}
                          className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer"
                          aria-label="Udostępnij wpis"
                          title="Udostępnij wpis"
                        >
                          {copiedPostId === p.id ? (
                            <Check className="h-[18px] w-[18px] text-emerald-600" />
                          ) : (
                            <Repeat2 className="h-[18px] w-[18px]" aria-hidden />
                          )}
                          <span className="font-semibold">{p.reposts}</span>
                        </button>

                        {/* POLUBIENIE */}
                        <button
                          type="button"
                          onClick={() => toggleLike(p.id)}
                          aria-pressed={isLiked}
                          aria-label="Polub"
                          className={cn(
                            'flex items-center gap-1.5 transition-transform active:scale-90 cursor-pointer',
                            isLiked ? 'font-bold text-coral-700' : 'hover:text-ink',
                          )}
                        >
                          <Heart
                            className={cn('h-[18px] w-[18px]', isLiked && 'fill-coral text-coral')}
                            aria-hidden
                          />
                          <span className="font-semibold">{p.likes}</span>
                        </button>

                        {/* WYŚWIETLENIA */}
                        <span className="flex items-center gap-1.5">
                          <BarChart2 className="h-[18px] w-[18px]" aria-hidden />
                          <span className="font-semibold">{p.views}</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: Trending Street Hashtags & Active Streets (Desktop Only) */}
        <aside className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col gap-4 sticky top-5">
          <div className="rounded-4xl bg-white p-6 shadow-card border border-mist-200">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
              Tematy i ulice w Mińsku
            </p>
            <h3 className="mt-1 font-display text-[19px] font-bold text-ink">Popularne hasztagi</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {dynamicTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={cn(
                    'rounded-2xl px-3.5 py-2 text-[13px] font-bold transition-all cursor-pointer',
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
            <h3 className="mt-1 font-display text-[19px] font-bold text-ink">Najwięcej sąsiadów</h3>
            <div className="mt-4 divide-y divide-mist">
              {activeStreets.map((s, idx) => {
                const isUserStreet = user?.street?.name === s.name;
                return (
                  <div key={s.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'grid h-6 w-6 place-items-center rounded-full text-[11px] font-extrabold',
                          isUserStreet ? 'bg-coral text-ink' : 'bg-sand-100 text-ink',
                        )}
                      >
                        {idx + 1}
                      </span>
                      <span className={cn('text-[13.5px] font-bold', isUserStreet ? 'text-coral-700' : 'text-ink')}>
                        ul. {s.name}
                      </span>
                      {isUserStreet && (
                        <span className="rounded-md bg-coral-50 px-1.5 py-0.5 text-[10px] font-extrabold text-coral-700">
                          Twoja
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-mist px-2.5 py-0.5 text-[11.5px] font-bold text-ink-500">
                      {s.neighbors} mieszk.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* WIDOK WĄTKU (THREAD MODAL) */}
      {activeThreadPost && (
        <PostThreadModal
          post={activeThreadPost}
          user={user}
          isLiked={Boolean(likedMap[activeThreadPost.id])}
          onClose={() => setActiveThreadPost(null)}
          onToggleLike={toggleLike}
          onNeighborClick={onNeighborClick}
          onDeletePost={handleDeletePost}
          onAuthRequired={onAuthRequired}
        />
      )}
    </div>
  );
}
