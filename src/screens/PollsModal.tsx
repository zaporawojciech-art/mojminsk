import { useState } from 'react';
import {
  Check,
  Clock,
  Flame,
  Plus,
  Sparkles,
  Trophy,
  Vote,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import {
  type PollItem,
  type User,
  getPollTimeLeftLabel,
  isPollActive,
} from '../data/mockData';

interface PollsModalProps {
  user: User;
  polls: PollItem[];
  userVotes: Record<string, string>;
  onVote: (pollId: string, optionId: string) => void;
  onClose: () => void;
  onAddPoll: () => void;
  isClosing?: boolean;
}

export function PollsModal({
  user: _user,
  polls,
  userVotes,
  onVote,
  onClose,
  onAddPoll,
  isClosing: _isClosing = false,
}: PollsModalProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  // Segregate polls into active and expired
  const activePolls = polls
    .filter((p) => isPollActive(p))
    // "Na liscie ankiet bedą ankiety, które mają łącznie najwięcej głosów oddanych."
    .sort((a, b) => b.totalVotes - a.totalVotes);

  const expiredPolls = polls
    .filter((p) => !isPollActive(p))
    .sort((a, b) => b.totalVotes - a.totalVotes);

  const currentPolls = activeTab === 'active' ? activePolls : expiredPolls;

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-mist select-none">
      <NativeHeader
        title="Ankiety mieszkańców"
        backLabel="Wróć"
        onBack={onClose}
        right={
          <button
            type="button"
            onClick={onAddPoll}
            aria-label="Dodaj ankietę"
            title="Dodaj nową ankietę"
            className="grid h-9 w-9 place-items-center rounded-full bg-sand text-ink shadow-xs transition-transform active:scale-95 hover:bg-sand-200"
          >
            <Plus className="h-4 w-4" />
          </button>
        }
      />

      {/* Tab switchers: Aktywne (posortowane po głosach) vs Zakończone (archiwum bez bałaganu) */}
      <div className="border-b border-mist-300 bg-white px-4 pt-3 pb-2.5 shrink-0">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-mist p-1">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-bold transition-all',
              activeTab === 'active'
                ? 'bg-white text-ink shadow-card'
                : 'text-ink-500 hover:text-ink',
            )}
          >
            <Flame className={cn('h-3.5 w-3.5', activeTab === 'active' ? 'text-coral' : 'text-ink-400')} />
            <span>Aktywne ({activePolls.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expired')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-bold transition-all',
              activeTab === 'expired'
                ? 'bg-white text-ink shadow-card'
                : 'text-ink-500 hover:text-ink',
            )}
          >
            <Trophy className={cn('h-3.5 w-3.5', activeTab === 'expired' ? 'text-amber-500' : 'text-ink-400')} />
            <span>Wyniki ({expiredPolls.length})</span>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-400">
          {activeTab === 'active'
            ? 'Posortowane według największej liczby oddanych głosów'
            : 'Zarchiwizowane ankiety miejskie z oficjalnymi wynikami'}
        </p>
      </div>

      {/* Polls List */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-8 space-y-4">
          {currentPolls.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-card border border-mist-300">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sand-100 text-ink">
                <Vote className="h-6 w-6" />
              </span>
              <p className="mt-3 font-display text-[16px] font-bold text-ink">
                {activeTab === 'active' ? 'Brak aktywnych ankiet' : 'Brak zakończonych ankiet'}
              </p>
              <p className="mt-1 text-[12.5px] text-ink-400">
                {activeTab === 'active'
                  ? 'Bądź pierwszym, który zada ważne pytanie sąsiadom z Mińska!'
                  : 'Archiwum wyników zapełni się po wygaśnięciu terminów.'}
              </p>
              {activeTab === 'active' && (
                <button
                  type="button"
                  onClick={onAddPoll}
                  className="mt-4 rounded-full bg-ink px-4 py-2 text-[12.5px] font-bold text-white shadow-card"
                >
                  Dodaj ankietę
                </button>
              )}
            </div>
          ) : (
            currentPolls.map((p, idx) => {
              const myVoteId = userVotes[p.id];
              const hasVoted = Boolean(myVoteId);
              const totalVotes = p.totalVotes;
              const isExpired = !isPollActive(p);
              const timeLeftLabel = getPollTimeLeftLabel(p);

              // Find winner in expired polls
              const winningOptionId = isExpired
                ? [...p.options].sort((a, b) => b.votes - a.votes)[0]?.id
                : null;

              return (
                <article
                  key={p.id}
                  className="rounded-3xl bg-white p-4 sm:p-5 shadow-card border border-mist-300 space-y-3"
                >
                  {/* Card Header: Badge + Ranking / Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      {idx === 0 && activeTab === 'active' && (
                        <span className="flex items-center gap-1 rounded-full bg-coral-100 px-2.5 py-0.5 text-[10.5px] font-extrabold text-coral-900 shrink-0">
                          <Flame className="h-3 w-3 text-coral" />
                          #1 w Mińsku
                        </span>
                      )}
                      {p.isOfficial ? (
                        <span className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-0.5 text-[10.5px] font-extrabold text-ink shrink-0">
                          <Sparkles className="h-3 w-3 text-amber-600" />
                          Oficjalna
                        </span>
                      ) : (
                        <span className="rounded-full bg-mist px-2.5 py-0.5 text-[10.5px] font-bold text-ink-600 shrink-0">
                          Sąsiedzka
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-500 shrink-0">
                      <Clock className="h-3.5 w-3.5 text-ink-400" />
                      <span className={cn(isExpired ? 'text-ink-400 font-bold' : 'text-amber-800 font-bold')}>
                        {timeLeftLabel}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-[17px] font-bold text-ink leading-snug break-words">
                    {p.title}
                  </h3>

                  {/* Author & Votes count */}
                  <div className="flex items-center justify-between gap-2 text-[12px] text-ink-400">
                    <span className="truncate min-w-0">
                      Autor: <b className="text-ink-700">{p.author}</b> {p.authorStreet}
                    </span>
                    <span className="shrink-0 font-bold text-ink-600 tabular-nums">
                      {totalVotes} {totalVotes === 1 ? 'głos' : totalVotes < 5 ? 'głosy' : 'głosów'}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 pt-1">
                    {p.options.map((opt) => {
                      const isMyVote = myVoteId === opt.id;
                      const isWinner = opt.id === winningOptionId;
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const showResults = hasVoted || isExpired;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={showResults}
                          onClick={() => onVote(p.id, opt.id)}
                          className={cn(
                            'group relative w-full overflow-hidden rounded-2xl border p-3.5 text-left transition-all',
                            showResults
                              ? isMyVote
                                ? 'border-ink bg-white shadow-xs'
                                : isWinner
                                  ? 'border-amber-300 bg-amber-50/50 shadow-xs'
                                  : 'border-mist-200 bg-white'
                              : 'border-mist-300 bg-mist/40 hover:bg-white hover:border-ink active:scale-[0.99]',
                          )}
                        >
                          {/* Animated Percentage Fill Bar */}
                          {showResults && (
                            <span
                              className={cn(
                                'absolute inset-y-0 left-0 transition-[width] duration-700 ease-out pointer-events-none',
                                isWinner
                                  ? 'bg-amber-100/90'
                                  : isMyVote
                                    ? 'bg-coral-100/90'
                                    : 'bg-mist-200/60',
                              )}
                              style={{ width: `${pct}%` }}
                              aria-hidden
                            />
                          )}

                          <div className="relative z-10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {isMyVote && (
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-white">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </span>
                              )}
                              {isWinner && (
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-ink">
                                  <Trophy className="h-3 w-3" />
                                </span>
                              )}
                              <span
                                className={cn(
                                  'text-[13.5px] leading-snug break-words',
                                  isMyVote || isWinner ? 'font-bold text-ink' : 'font-semibold text-ink-700',
                                )}
                              >
                                {opt.name}
                              </span>
                            </div>

                            {showResults && (
                              <div className="flex items-center gap-1.5 shrink-0 text-right">
                                <span className="text-[11px] text-ink-400">
                                  ({opt.votes})
                                </span>
                                <span className="font-display text-[13.5px] font-bold tabular-nums text-ink w-11 text-right">
                                  {pct}%
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer status notice */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-ink-400">
                    <span>
                      {hasVoted ? (
                        <span className="font-bold text-emerald-700">✓ Twój głos został zapisany</span>
                      ) : isExpired ? (
                        <span className="font-bold text-ink-500">Głosowanie zakończone</span>
                      ) : (
                        'Głosują tylko zweryfikowani mieszkańcy'
                      )}
                    </span>
                    {isExpired && winningOptionId && (
                      <span className="font-bold text-amber-900">Oficjalny wynik Mińska</span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Bottom CTA to add a poll */}
        <div className="border-t border-mist-300 bg-white p-4 pb-[max(env(safe-area-inset-bottom),16px)] shrink-0">
          <button
            type="button"
            onClick={onAddPoll}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-bold text-white shadow-card transition-all active:scale-95"
          >
            <Vote className="h-4 w-4" />
            Zadaj pytanie sąsiadom (Stwórz ankietę)
          </button>
        </div>
      </div>
    );
  }
