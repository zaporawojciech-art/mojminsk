import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  User as UserIcon,
  X,
  Zap,
} from 'lucide-react';
import type { Job, User } from '../data/mockData';

interface JobApplyModalProps {
  job: Job;
  user: User;
  onClose: () => void;
  onSuccess: (jobId: string) => void;
}

export function JobApplyModal({ job, user, onClose, onSuccess }: JobApplyModalProps) {
  const [phone, setPhone] = useState('501 234 567');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      onSuccess(job.id);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92dvh] w-full max-w-[440px] flex-col rounded-t-[36px] bg-white shadow-float sm:rounded-[36px] overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-mist px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-mist text-ink hover:bg-mist-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">Szybka aplikacja 1-Click</p>
              <p className="font-display text-[15px] font-bold text-ink truncate max-w-[240px]">{job.position}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-mist text-ink hover:bg-mist-200"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {isDone ? (
          /* Success Screen */
          <div className="p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 font-display text-[22px] font-extrabold text-ink">Aplikacja wysłana!</h3>
            <p className="mt-2 text-[13.5px] text-ink-500">
              Firma <b>{job.company}</b> otrzymała Twoje zgłoszenie. Skontaktują się z Tobą telefonicznie pod numerem <b>{phone}</b>.
            </p>

            <div className="mt-5 rounded-2xl bg-sand-100 p-4 text-left">
              <div className="flex items-center gap-2 font-bold text-[13px] text-ink">
                <Clock className="h-4 w-4 text-sand-700" />
                Co dzieje się teraz?
              </div>
              <p className="mt-1 text-[12px] text-ink-500 leading-relaxed">
                Pracodawcy w Mińsku odpowiadają na zgłoszenia 1-Click średnio w ciągu 24–48 godzin. Status aplikacji znajdziesz w swoim profilu.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-ink text-[14px] font-bold text-white transition-transform active:scale-95"
            >
              Wróć do ogłoszeń
            </button>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
            <div className="rounded-2xl bg-sand-100 p-3.5 flex items-start gap-3">
              <Zap className="h-5 w-5 text-sand-700 shrink-0 mt-0.5" />
              <p className="text-[12px] text-ink-700 leading-snug">
                Aplikujesz jako <b>zweryfikowany mieszkaniec Mińska Mazowieckiego</b>. Twoje dane zostaną przekazane bezpośrednio do osoby rekrutującej w {job.company}.
              </p>
            </div>

            {/* Candidate Summary Card */}
            <div className="space-y-3 rounded-2xl bg-mist p-4">
              <div className="flex items-center gap-2.5">
                <UserIcon className="h-4 w-4 text-ink-400" />
                <span className="text-[13px] font-bold text-ink">{user.name}</span>
                <span className="flex items-center gap-1 rounded-full bg-sky px-2 py-0.5 text-[10.5px] font-bold text-ink">
                  <ShieldCheck className="h-3 w-3" />
                  Zweryfikowany
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-coral" />
                <span className="text-[13px] text-ink-700">ul. {user.street.name} (Mińsk Mazowiecki)</span>
              </div>
            </div>

            {/* Phone Input */}
            <label className="block">
              <span className="text-[12px] font-bold text-ink flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-ink-400" />
                Numer telefonu do kontaktu
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="np. 500 123 456"
                className="mt-1 h-12 w-full rounded-2xl bg-mist px-4 text-[14px] font-semibold text-ink outline-none focus:ring-2 focus:ring-ink"
              />
              <span className="mt-1 block text-[11px] text-ink-400">Na ten numer zadzwoni pracodawca</span>
            </label>

            {/* Optional message/note */}
            <label className="block">
              <span className="text-[12px] font-bold text-ink">
                Krótka notatka dla rekrutera <span className="text-ink-400 font-normal">(opcjonalnie)</span>
              </span>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Np. Mam doświadczenie na podobnym stanowisku, mieszkam 10 minut spacerem od miejsca pracy, mogę zacząć od poniedziałku."
                className="mt-1 w-full rounded-2xl bg-mist p-3.5 text-[13.5px] outline-none focus:ring-2 focus:ring-ink"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !phone.trim()}
              className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-bold text-white shadow-card transition-transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Wysyłanie zgłoszenia...'
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Prześlij zgłoszenie do {job.company}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
