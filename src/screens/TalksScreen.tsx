import { Fragment, useState } from 'react';
import { BadgeCheck, BarChart2, Heart, ImageIcon, MessageCircle, Repeat2 } from 'lucide-react';
import { avatarUrl, posts as seedPosts, streets, talkTags, type Post, type User } from '../data/mockData';
import { Chip, Img, StandardTopBar, cn } from '../components/ui';

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
  user: User;
  onProfile?: () => void;
  onNeighborClick?: (name: string, street: string) => void;
  onAuthRequired?: (title: string, desc: string) => void;
}) {
  const [list, setList] = useState<Post[]>(seedPosts);
  const [text, setText] = useState('');
  const [tag, setTag] = useState('Wszystko');
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const visible = tag === 'Wszystko' ? list : list.filter((p) => p.content.includes(tag));
  const left = MAX - text.length;

  const publish = () => {
    if (user.isGuest) {
      onAuthRequired?.(
        'Publikowanie w Strefie Rozmów',
        'Wpisy w mińskiej strefie dyskusji mogą dodawać wyłącznie zarejestrowani mieszkańcy, aby wyeliminować anonimowy hejt i boty.',
      );
      return;
    }
    if (!text.trim()) return;
    setList((l) => [
      { id: `new-${Date.now()}`, author: user.name, authorAs: user.street.as, time: 'teraz', content: text.trim(), likes: 0, replies: 0, reposts: 0, views: 1 },
      ...l,
    ]);
    setText('');
  };

  const toggleLike = (postId: string) => {
    if (user.isGuest) {
      onAuthRequired?.(
        'Polubienie wpisu',
        'Reakcje na wpisy sąsiadów są dostępne wyłącznie dla zalogowanych mieszkańców.',
      );
      return;
    }
    setLiked((l) => ({ ...l, [postId]: !l[postId] }));
  };

  return (
    <div className="pb-36">
      <StandardTopBar
        user={user}
        onProfile={onProfile}
        title="Rozmowy"
        subtitle="Piszą tylko zweryfikowani mieszkańcy"
      />

      <div className="mx-5 rounded-4xl bg-white p-4 shadow-card">
        <div className="flex gap-3">
          <img src={avatarUrl(user.seed)} alt="" className="h-10 w-10 shrink-0 rounded-2xl" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={2}
            placeholder={`Co słychać ${user.street.as.replace(/^ze? /, 'na ')}?`}
            aria-label="Treść wpisu"
            className="min-h-[52px] flex-1 resize-none bg-transparent pt-2 text-[15px] outline-none placeholder:text-ink-400"
          />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-mist pt-3">
          <button aria-label="Dodaj zdjęcie" className="grid h-9 w-9 place-items-center rounded-full bg-mist">
            <ImageIcon className="h-4 w-4" aria-hidden />
          </button>
          <div className="flex items-center gap-3">
            <span className={cn('text-[12px] font-semibold tabular-nums', left < 20 ? 'text-coral-700' : 'text-ink-400')}>{left}</span>
            <button onClick={publish} disabled={!text.trim()} className="h-10 rounded-full bg-coral px-5 text-[13.5px] font-bold text-ink disabled:opacity-40">
              Opublikuj
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
        {talkTags.map((t) => (
          <Chip key={t} active={tag === t} onClick={() => setTag(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mx-5 mt-4 divide-y divide-mist overflow-hidden rounded-4xl bg-white shadow-card">
        {visible.map((p) => {
          const isLiked = !!liked[p.id];
          const matchedStreet = streets.find((s) => s.as === p.authorAs)?.name ?? p.authorAs.replace(/^ze?\s+/i, '');
          return (
            <article key={p.id} className="flex gap-3 p-4">
              <button
                type="button"
                onClick={() => onNeighborClick?.(p.author, matchedStreet)}
                className="shrink-0 self-start transition-transform active:scale-95"
                title={`Zobacz profil: ${p.author}`}
              >
                <img src={avatarUrl(p.author)} alt="" className="h-11 w-11 rounded-2xl" />
              </button>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onNeighborClick?.(p.author, matchedStreet)}
                  className="flex flex-wrap items-center gap-x-1 text-left text-[14px] hover:underline"
                >
                  <b>
                    {p.author} {p.authorAs}
                  </b>
                  <BadgeCheck className="h-4 w-4 fill-sky text-white" aria-label="Zweryfikowany" />
                  <span className="text-ink-400">· {p.time}</span>
                </button>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-700">
                  <RichText text={p.content} />
                </p>
                {p.image && <Img src={p.image} alt="" className="mt-3 h-44 w-full rounded-3xl" />}
                <div className="mt-3 flex items-center justify-between pr-2 text-[12.5px] text-ink-400">
                  <button className="flex items-center gap-1.5 hover:text-ink" aria-label="Odpowiedz">
                    <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
                    {p.replies}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-ink" aria-label="Udostępnij dalej">
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
  );
}
