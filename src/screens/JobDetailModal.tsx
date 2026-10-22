import { useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Share2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { StreetPill, cn, toneBg } from '../components/ui';
import type { Job, User } from '../data/mockData';

interface JobDetailModalProps {
  job: Job;
  user: User;
  hasApplied?: boolean;
  onClose: () => void;
  onApplyClick: (job: Job) => void;
}

export function JobDetailModal({
  job,
  user: _user,
  hasApplied = false,
  onClose,
  onApplyClick,
}: JobDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [job.id]);

  const handleShare = async () => {
    const shareData = {
      title: `${job.position} w ${job.company} — mójMińsk`,
      text: `Oferta pracy w Mińsku Mazowieckim: ${job.position} w firmie ${job.company}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[94dvh] w-full max-w-[440px] flex-col rounded-t-[36px] bg-mist shadow-float sm:rounded-[36px] overflow-hidden">
        {/* Sticky Header */}
        <header className="flex items-center justify-between border-b border-mist-300 bg-white px-5 py-3.5 shrink-0">
          <button
            onClick={onClose}
            aria-label="Wróć"
            className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink hover:bg-mist-200 transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-display text-[15px] font-bold text-ink">Oferta pracy w Mińsku</span>
          <button
            onClick={handleShare}
            aria-label="Udostępnij ofertę"
            className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink hover:bg-mist-200 transition-transform active:scale-95"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
          </button>
        </header>

        {/* Content */}
        <div ref={scrollRef} className="overflow-y-auto p-5 space-y-4">
          {/* Company & Role Hero Card */}
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <div className="flex items-start gap-3.5">
              <span
                className={cn(
                  'grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-[20px] font-bold',
                  toneBg[job.tone],
                )}
              >
                {job.company.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-ink-400" />
                  <p className="text-[13px] font-semibold text-ink-500">{job.company}</p>
                </div>
                <h1 className="mt-1 font-display text-[20px] font-bold leading-tight text-ink">{job.position}</h1>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-mist p-3.5">
              <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">Wynagrodzenie</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-[24px] font-extrabold text-ink">{job.salary}</span>
                <span className="text-[13px] font-medium text-ink-500">{job.period}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.tags.map((t) => (
                <span key={t} className="rounded-full bg-sand-100 px-3 py-1 text-[11.5px] font-bold text-ink-700">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-mist pt-3">
              <StreetPill street={job.address || 'Mińsk Mazowiecki'} className="bg-mist text-ink-600" />
              <span className="flex items-center gap-1 text-[11px] font-medium text-ink-400">
                <Clock className="h-3.5 w-3.5" />
                Opublikowano: {job.time}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">O stanowisku</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-700">
              {job.description ||
                'Lokalna oferta pracy w Mińsku Mazowieckim. Pracodawca poszukuje zmotywowanych kandydatów do stałej współpracy.'}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="rounded-3xl bg-white p-5 shadow-card">
              <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-400">
                <CheckCircle2 className="h-4 w-4 text-sky-700" />
                Wymagania
              </h3>
              <ul className="mt-3 space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-ink-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="rounded-3xl bg-white p-5 shadow-card">
              <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-400">
                <Sparkles className="h-4 w-4 text-coral" />
                Co oferuje pracodawca
              </h3>
              <ul className="mt-3 space-y-2">
                {job.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-ink-700">
                    <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 1-Click Feature Banner */}
          <div className="flex items-start gap-3 rounded-3xl bg-sky-100 p-4">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
            <div className="text-[12px] text-ink-700">
              <p className="font-bold">Błyskawiczna rekrutacja 1-Click</p>
              <p className="mt-0.5 text-ink-500">
                Nie musisz wgrywać CV w PDF. Pracodawca z Mińska otrzyma Twoje imię, ulicę zamieszkania oraz numer telefonu.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="border-t border-mist-300 bg-white p-4 shrink-0">
          {hasApplied ? (
            <div className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-sky-100 text-[14.5px] font-bold text-sky-700">
              <Check className="h-5 w-5" />
              Twoja aplikacja została już przesłana
            </div>
          ) : (
            <button
              onClick={() => onApplyClick(job)}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-bold text-white shadow-card transition-transform active:scale-98"
            >
              <Zap className="h-4 w-4 text-amber-300" />
              Aplikuj 1-kliknięciem
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
