import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Vote,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import type { PollItem, PollOption, User } from '../data/mockData';

interface AddPollModalProps {
  user: User;
  onClose: () => void;
  onPollCreated: (poll: PollItem) => void;
  isClosing?: boolean;
}

interface DurationOpt {
  days: number;
  label: string;
  desc: string;
  isRecommended?: boolean;
}

const DURATION_OPTIONS: DurationOpt[] = [
  { days: 1, label: '24 godziny', desc: 'Szybkie pytanie' },
  { days: 3, label: '3 dni', desc: 'Weekendowe' },
  { days: 7, label: '7 dni', desc: 'Rekomendowane', isRecommended: true },
  { days: 14, label: '14 dni', desc: 'Dłuższa debata' },
];

export function AddPollModal({
  user,
  onClose,
  onPollCreated,
  isClosing: _isClosing = false,
}: AddPollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['Tak, zdecydowanie', 'Nie, jestem przeciw']);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [isCreated, setIsCreated] = useState(false);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions((prev) => [...prev, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const isValid =
    question.trim().length >= 5 &&
    options.filter((o) => o.trim().length > 0).length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const validOptions: PollOption[] = options
      .filter((o) => o.trim().length > 0)
      .map((name, i) => ({
        id: `opt_${Date.now()}_${i}`,
        name: name.trim(),
        votes: 0,
      }));

    const now = Date.now();
    const expiresAt = new Date(now + durationDays * 86400000).toISOString();

    const newPoll: PollItem = {
      id: `poll_${Date.now()}`,
      title: question.trim(),
      author: user.name,
      authorStreet: user.street.as,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      durationDays,
      options: validOptions,
      totalVotes: 0,
      category: 'neighborhood',
      isOfficial: false,
    };

    setIsCreated(true);
    window.setTimeout(() => {
      onPollCreated(newPoll);
      onClose();
    }, 450);
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-mist select-none">
      <NativeHeader
        title="Nowa ankieta"
        backLabel="Wróć"
        onBack={onClose}
      />

        {isCreated ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 font-display text-[22px] font-bold text-ink">
              Ankieta opublikowana!
            </h3>
            <p className="mt-1 text-[13.5px] text-ink-500 max-w-[280px]">
              Sąsiedzi z ulicy {user.street.name} i całego Mińska mogą już oddawać swoje głosy.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:px-8 lg:px-12 md:py-6 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 md:items-start">
              {/* LEFT COLUMN (Question & Options) */}
              <div className="space-y-4 md:col-span-7 lg:col-span-8">
                {/* Question Input Card */}
                <div className="rounded-3xl md:rounded-2xl bg-white p-4 md:p-5 shadow-card md:shadow-xs space-y-2 border border-mist-300 md:border-mist-200">
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-ink-500">
                    Pytanie ankiety
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Np. Czy na naszej ulicy powinien powstać próg zwalniający?"
                    rows={3}
                    maxLength={140}
                    className="w-full resize-none rounded-2xl md:rounded-xl bg-mist/60 p-3 text-[14px] text-ink outline-none placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-ink transition-all"
                  />
                  <div className="flex items-center justify-between text-[11px] text-ink-400">
                    <span>Minimum 5 znaków</span>
                    <span>{question.length}/140</span>
                  </div>
                </div>

                {/* Options Card */}
                <div className="rounded-3xl md:rounded-2xl bg-white p-4 md:p-5 shadow-card md:shadow-xs space-y-3 border border-mist-300 md:border-mist-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                      Warianty odpowiedzi (od 2 do 5)
                    </label>
                    <span className="text-[11px] font-semibold text-ink-400">
                      {options.length}/5
                    </span>
                  </div>

                  <div className="space-y-2">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-mist font-bold text-[12px] text-ink-500">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Wariant ${String.fromCharCode(65 + idx)}`}
                          className="h-10 min-w-0 flex-1 rounded-xl bg-mist/60 px-3 text-[13.5px] text-ink outline-none placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-ink transition-all"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            aria-label="Usuń wariant"
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-400 hover:bg-mist hover:text-coral transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-mist-400 py-2.5 text-[12.5px] font-bold text-ink-600 hover:bg-mist/40 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Dodaj kolejny wariant
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN (Duration, Identity & Submit) */}
              <div className="space-y-4 md:col-span-5 lg:col-span-4 md:sticky md:top-2">
                {/* Expiration / Duration Card */}
                <div className="rounded-3xl md:rounded-2xl bg-white p-4 md:p-5 shadow-card md:shadow-xs space-y-2.5 border border-mist-300 md:border-mist-200">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-500">
                      <Clock className="h-3.5 w-3.5 text-ink-500" />
                      Terminowość ankiety
                    </label>
                    <span className="text-[11px] text-ink-400">
                      Czas na oddanie głosu
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {DURATION_OPTIONS.map((d) => {
                      const isSelected = durationDays === d.days;
                      return (
                        <button
                          key={d.days}
                          type="button"
                          onClick={() => setDurationDays(d.days)}
                          className={cn(
                            'flex flex-col items-start rounded-2xl md:rounded-xl p-3 text-left transition-all border cursor-pointer',
                            isSelected
                              ? 'bg-ink text-white border-ink shadow-card'
                              : 'bg-mist/40 text-ink-700 border-mist-200 hover:bg-mist/80',
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[13px] font-bold">{d.label}</span>
                            {d.isRecommended && !isSelected && (
                              <span className="rounded-full bg-sand-200 px-1.5 py-0.2 text-[8.5px] font-extrabold text-sand-900">
                                Hit
                              </span>
                            )}
                          </div>
                          <span
                            className={cn(
                              'text-[10.5px] mt-0.5',
                              isSelected ? 'text-white/70' : 'text-ink-400',
                            )}
                          >
                            {d.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-ink-400 pt-1 leading-snug">
                    Po upływie tego czasu ankieta zostanie automatycznie zamknięta i przeniesiona do archiwum wyników.
                  </p>

                  {/* Author badge */}
                  <div className="mt-3 flex items-center gap-2 rounded-2xl md:rounded-xl bg-sand-100 p-3 text-[11.5px] text-ink-700">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-sand text-ink">
                      <Vote className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      Ankieta zostanie podpisana Twoją tożsamością:{' '}
                      <b>{user.name} {user.street.as}</b>.
                    </span>
                  </div>

                  {/* Desktop Submit Button */}
                  <div className="hidden md:block pt-3 border-t border-mist-200">
                    <button
                      type="submit"
                      disabled={!isValid}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-800 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                      <Vote className="h-4 w-4" />
                      Opublikuj ankietę ({durationDays} {durationDays === 1 ? 'dzień' : 'dni'})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden border-t border-mist-300 bg-white p-4 pb-[max(env(safe-area-inset-bottom),16px)] shrink-0">
              <button
                type="submit"
                disabled={!isValid}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14.5px] font-bold text-white shadow-card transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Vote className="h-4 w-4" />
                Opublikuj ankietę ({durationDays} {durationDays === 1 ? 'dzień' : durationDays < 5 ? 'dni' : 'dni'})
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }
