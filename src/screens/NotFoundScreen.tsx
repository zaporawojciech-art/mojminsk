import { ArrowLeft, Bus, Compass, House, Megaphone, Car, MessagesSquare } from 'lucide-react';
import { AppLink } from '../components/AppLink';
import { SeoHead } from '../components/SeoHead';

export function NotFoundScreen({ onBackHome }: { onBackHome?: () => void }) {
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center px-5 py-16 text-center">
      <SeoHead
        title="Strona nie została znaleziona (404)"
        description="Szukana podstrona lub ogłoszenie w serwisie mójMińsk.app nie istnieje lub wygasło."
        noindex
      />

      <div className="w-full max-w-md rounded-4xl bg-white p-7 md:p-9 shadow-card border border-mist-200 space-y-5">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-coral-100 text-coral-700 shadow-xs">
          <Compass className="h-8 w-8" aria-hidden />
        </div>

        <div className="space-y-1.5">
          <span className="inline-block rounded-full bg-mist px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
            Błąd 404 · Mińsk Mazowiecki
          </span>
          <h1 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
            Nie znaleźliśmy tej ulicy ani strony
          </h1>
          <p className="text-[13.5px] leading-relaxed text-ink-500">
            Ogłoszenie mogło zostać już sprzedane sąsiadowi albo wpisany adres URL zawiera literówkę.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2 text-left">
          <AppLink
            to="/"
            onClick={onBackHome}
            className="flex items-center gap-2.5 rounded-2xl bg-mist/70 p-3 hover:bg-mist transition-colors"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-ink shadow-2xs">
              <House className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-bold text-ink">Pulpit Mińska</p>
              <p className="text-[10.5px] text-ink-400">Pogoda i alerty</p>
            </div>
          </AppLink>

          <AppLink
            to="/ogloszenia"
            className="flex items-center gap-2.5 rounded-2xl bg-mist/70 p-3 hover:bg-mist transition-colors"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-coral-700 shadow-2xs">
              <Megaphone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-bold text-ink">Ogłoszenia</p>
              <p className="text-[10.5px] text-ink-400">Kup, sprzedaj, oddaj</p>
            </div>
          </AppLink>

          <AppLink
            to="/zditm"
            className="flex items-center gap-2.5 rounded-2xl bg-mist/70 p-3 hover:bg-mist transition-colors"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sky-700 shadow-2xs">
              <Bus className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-bold text-ink">Rozkład ZDiTM</p>
              <p className="text-[10.5px] text-ink-400">Linie M2, M3, M4</p>
            </div>
          </AppLink>

          <AppLink
            to="/przejazdy"
            className="flex items-center gap-2.5 rounded-2xl bg-mist/70 p-3 hover:bg-mist transition-colors"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-ink shadow-2xs">
              <Car className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-bold text-ink">Przejazdy</p>
              <p className="text-[10.5px] text-ink-400">Mińsk ↔ Warszawa</p>
            </div>
          </AppLink>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
          <AppLink
            to="/"
            onClick={onBackHome}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-5 text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-95 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Wróć na stronę główną</span>
          </AppLink>
          <AppLink
            to="/rozmowy"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-sand px-4 text-[13px] font-bold text-ink hover:bg-sand-200 transition-colors"
          >
            <MessagesSquare className="h-4 w-4" />
            <span>Rozmowy</span>
          </AppLink>
        </div>
      </div>
    </div>
  );
}
