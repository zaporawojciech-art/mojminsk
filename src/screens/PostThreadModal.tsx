import { Fragment, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BarChart2,
  Check,
  CornerDownRight,
  Heart,
  MessageCircle,
  MoreVertical,
  Repeat2,
  Send,
  Share2,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { avatarUrl, streets, type Post, type PostComment, type User } from '../data/mockData';
import { Img, cn } from '../components/ui';
import {
  createCommentInSupabase,
  deleteCommentInSupabase,
  deletePostInSupabase,
  fetchCommentsForPost,
  incrementPostViewsInSupabase,
  reportPostInSupabase,
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

const REPORT_REASONS = [
  'Spam lub treść komercyjna',
  'Mowa nienawiści / wulgaryzmy',
  'Fałszywe informacje / dezinformacja',
  'Naruszenie prywatności',
  'Inny powód',
];

interface PostThreadModalProps {
  post: Post;
  user: User | null;
  isLiked?: boolean;
  onClose: () => void;
  onToggleLike?: (postId: string) => void;
  onNeighborClick?: (name: string, street: string) => void;
  onDeletePost?: (postId: string) => void;
  onAuthRequired?: (title: string, desc: string) => void;
  isClosing?: boolean;
}

export function PostThreadModal({
  post,
  user,
  isLiked = false,
  onClose,
  onToggleLike,
  onNeighborClick,
  onDeletePost,
  onAuthRequired,
  isClosing = false,
}: PostThreadModalProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Inkrementacja wyświetleń i załadowanie komentarzy
  useEffect(() => {
    void incrementPostViewsInSupabase(post.id);
    let isMounted = true;
    void fetchCommentsForPost(post.id).then((data) => {
      if (isMounted) {
        setComments(data);
        setLoadingComments(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [post.id]);

  const matchedStreet =
    streets.find((s) => s.as === post.authorAs)?.name ?? post.authorAs.replace(/^ze?\s+/i, '');

  const isAuthor =
    Boolean(user) &&
    ((post.authorProfileId && post.authorProfileId === user?.profileId) ||
      (post.author === user?.name && post.authorAs === user?.street.as));

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/rozmowy?post=${post.id}` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Wpis ${post.author} ${post.authorAs} — mójMińsk`,
          text: post.content,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleAddReply = async () => {
    if (!user) {
      onAuthRequired?.(
        'Odpowiedź w wątku',
        'Aby odpowiadać sąsiadom w Strefie Rozmów, musisz być zalogowanym mieszkańcem.',
      );
      return;
    }
    const trimmed = replyText.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    const newComment: PostComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      postId: post.id,
      author: user.name,
      authorAs: user.street.as,
      authorProfileId: user.profileId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      time: 'przed chwilą',
    };

    setComments((prev) => [...prev, newComment]);
    setReplyText('');

    await createCommentInSupabase(newComment);
    setIsSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę odpowiedź?')) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await deleteCommentInSupabase(commentId);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć swój wpis i wszystkie odpowiedzi?')) return;
    await deletePostInSupabase(post.id);
    onDeletePost?.(post.id);
    onClose();
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await reportPostInSupabase({
      postId: post.id,
      reporterProfileId: user?.profileId,
      reason: reportReason,
      details: reportDetails.trim() || undefined,
    });
    setReportSubmitted(true);
  };

  const left = MAX - replyText.length;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center bg-ink/60 backdrop-blur-xs md:p-6 overflow-y-auto',
        isClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-200',
      )}
    >
      <div className="relative flex w-full max-w-2xl flex-col bg-white shadow-2xl md:rounded-3xl min-h-screen md:min-h-0 md:max-h-[92vh] overflow-hidden">
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-mist-300 bg-white/95 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist transition-colors cursor-pointer"
              aria-label="Wróć do listy wpisów"
            >
              <ArrowLeft className="h-5 w-5 text-ink" />
            </button>
            <div>
              <h2 className="font-display text-[15px] font-bold text-ink">Wątek sąsiedzki</h2>
              <p className="text-[11px] text-ink-400">
                {comments.length === 1 ? '1 odpowiedź' : `${comments.length} odpowiedzi`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist text-ink-600 transition-colors"
              title="Udostępnij wpis"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist text-ink-600 transition-colors cursor-pointer"
              aria-label="Więcej opcji"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* POPUP MENU */}
            {showMenu && (
              <div className="absolute right-0 top-11 z-30 w-48 rounded-2xl border border-mist-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95">
                {isAuthor ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      void handleDeletePost();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-bold text-coral-700 hover:bg-coral-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Usuń swój wpis</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportDialog(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-bold text-ink-700 hover:bg-mist transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="h-4 w-4 text-ink-500" />
                    <span>Zgłoś wpis do moderacji</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {copiedLink && (
          <div className="bg-emerald-600 text-white text-[12px] font-bold text-center py-1.5 animate-in slide-in-from-top">
            Skopiowano link do wpisu do schowka!
          </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 divide-y divide-mist">
          {/* MAIN POST */}
          <article className="pb-5">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNeighborClick?.(post.author, matchedStreet);
                }}
                className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity"
              >
                <img
                  src={avatarUrl(post.author)}
                  alt=""
                  className="h-13 w-13 rounded-2xl bg-sand-100 object-cover shadow-2xs"
                />
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink leading-tight">
                    {post.author}
                  </h3>
                  <p className="text-[13px] font-medium text-ink-500">{post.authorAs}</p>
                </div>
              </button>
              <span className="text-[12px] text-ink-400 font-medium">{post.time}</span>
            </div>

            <p className="mt-4 text-[16.5px] leading-relaxed text-ink-800 break-words font-normal">
              <RichText text={post.content} />
            </p>

            {post.image && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-mist-200">
                <Img src={post.image} alt="" className="w-full max-h-[420px] object-cover" />
              </div>
            )}

            {/* ACTION METRICS BAR */}
            <div className="mt-5 flex items-center justify-between border-t border-mist pt-4 text-[13.5px] text-ink-500">
              <button
                type="button"
                onClick={() => replyInputRef.current?.focus()}
                className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer"
              >
                <MessageCircle className="h-5 w-5 text-ink-400" />
                <span className="font-semibold">{comments.length}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer"
              >
                <Repeat2 className="h-5 w-5 text-ink-400" />
                <span className="font-semibold">{post.reposts}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleLike?.(post.id)}
                className={cn(
                  'flex items-center gap-1.5 transition-transform active:scale-90 cursor-pointer',
                  isLiked ? 'font-bold text-coral-700' : 'hover:text-ink',
                )}
              >
                <Heart className={cn('h-5 w-5', isLiked && 'fill-coral text-coral')} />
                <span className="font-semibold">{post.likes + (isLiked ? 1 : 0)}</span>
              </button>

              <div className="flex items-center gap-1.5 text-ink-400">
                <BarChart2 className="h-5 w-5" />
                <span className="font-semibold">{post.views + 1}</span>
              </div>
            </div>
          </article>

          {/* COMMENTS LIST */}
          <div className="pt-4 space-y-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-ink-400 px-1">
              Odpowiedzi sąsiadów ({comments.length})
            </h4>

            {loadingComments ? (
              <div className="py-8 text-center text-[13px] text-ink-400">Ładowanie odpowiedzi...</div>
            ) : comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-mist-300 bg-mist/20 p-6 text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-400 shadow-2xs">
                  <CornerDownRight className="h-5 w-5 text-coral-600" />
                </div>
                <p className="mt-2 text-[14px] font-bold text-ink">Brak odpowiedzi</p>
                <p className="mt-1 text-[12px] text-ink-500">
                  Bądź pierwszym sąsiadem, który włączy się do tej dyskusji!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const commentStreet =
                    streets.find((s) => s.as === comment.authorAs)?.name ??
                    comment.authorAs.replace(/^ze?\s+/i, '');
                  const isCommentAuthor =
                    Boolean(user) &&
                    ((comment.authorProfileId && comment.authorProfileId === user?.profileId) ||
                      (comment.author === user?.name && comment.authorAs === user?.street.as));

                  return (
                    <div
                      key={comment.id}
                      className="group flex items-start gap-3 rounded-2xl bg-mist/30 p-3.5 hover:bg-mist/50 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNeighborClick?.(comment.author, commentStreet);
                        }}
                        className="shrink-0"
                      >
                        <img
                          src={avatarUrl(comment.author)}
                          alt=""
                          className="h-10 w-10 rounded-xl bg-sand-100 object-cover"
                        />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNeighborClick?.(comment.author, commentStreet);
                            }}
                            className="flex flex-wrap items-center gap-1.5 text-left text-[13.5px] hover:underline"
                          >
                            <b className="text-ink">{comment.author}</b>
                            <span className="text-ink-500 font-medium">{comment.authorAs}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-[11.5px] text-ink-400">{comment.time}</span>
                            {isCommentAuthor && (
                              <button
                                type="button"
                                onClick={() => void handleDeleteComment(comment.id)}
                                className="text-ink-400 hover:text-coral-700 transition-colors cursor-pointer"
                                title="Usuń swoją odpowiedź"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="mt-1 text-[14px] leading-relaxed text-ink-800 break-words">
                          <RichText text={comment.content} />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM STICKY REPLY INPUT */}
        <footer className="sticky bottom-0 z-20 border-t border-mist-300 bg-white p-3 md:p-4">
          <div className="flex items-center gap-2.5">
            <img
              src={avatarUrl(user ? user.seed : 'gosc')}
              alt=""
              className="h-10 w-10 shrink-0 rounded-xl bg-sand-100 object-cover"
            />
            <div className="relative flex-1">
              <textarea
                ref={replyInputRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value.slice(0, MAX))}
                onFocus={() => {
                  if (!user) {
                    onAuthRequired?.(
                      'Odpowiedź w wątku',
                      'Wpisy i odpowiedzi mogą publikować wyłącznie zarejestrowani mieszkańcy Mińska.',
                    );
                  }
                }}
                rows={1}
                placeholder={
                  user
                    ? `Odpowiedz sąsiadowi ${post.author}...`
                    : 'Zaloguj się, aby odpowiedzieć...'
                }
                className="w-full resize-none rounded-2xl border border-mist-300 bg-mist/30 py-2.5 pl-3.5 pr-14 text-[14px] text-ink placeholder:text-ink-400 outline-none focus:border-ink focus:bg-white transition-all"
              />
              <span
                className={cn(
                  'absolute right-3 top-3 text-[10.5px] font-bold tabular-nums',
                  left < 20 ? 'text-coral-700' : 'text-ink-400',
                )}
              >
                {left}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddReply}
              disabled={!replyText.trim() || isSubmitting}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-coral text-ink shadow-coral hover:bg-coral-400 disabled:opacity-40 transition-all cursor-pointer"
              aria-label="Wyślij odpowiedź"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </footer>

        {/* MODAL: ZGŁOŚ WPIS */}
        {showReportDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-mist">
                <div className="flex items-center gap-2 text-ink">
                  <ShieldAlert className="h-5 w-5 text-coral-600" />
                  <h3 className="font-display text-[16px] font-bold">Zgłoś wpis do moderacji</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportDialog(false)}
                  className="rounded-full p-1 hover:bg-mist text-ink-500 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {reportSubmitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-display text-[16px] font-bold text-ink">Dziękujemy za zgłoszenie</h4>
                  <p className="text-[13px] text-ink-500">
                    Administratorzy zweryfikują ten wpis zgodnie z regulaminem Strefy Rozmów.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportDialog(false);
                      setReportSubmitted(false);
                    }}
                    className="mt-2 rounded-xl bg-ink px-5 py-2 text-[13px] font-bold text-white cursor-pointer"
                  >
                    Zamknij
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="mt-4 space-y-3.5">
                  <div>
                    <label className="text-[12px] font-bold text-ink-600">Powód zgłoszenia:</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-mist-300 p-2.5 text-[13.5px] font-medium text-ink bg-white outline-none"
                    >
                      {REPORT_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-ink-600">Szczegóły (opcjonalnie):</label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      rows={2}
                      placeholder="Opisz krótko, dlaczego treść narusza zasady sąsiedzkie..."
                      className="mt-1 w-full resize-none rounded-xl border border-mist-300 p-2.5 text-[13px] text-ink outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportDialog(false)}
                      className="flex-1 rounded-xl bg-mist py-2.5 text-[13px] font-bold text-ink-700 hover:bg-mist-300 cursor-pointer"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-coral py-2.5 text-[13px] font-bold text-ink shadow-coral hover:bg-coral-400 cursor-pointer"
                    >
                      Wyślij zgłoszenie
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
