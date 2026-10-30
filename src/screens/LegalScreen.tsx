import { useLayoutEffect, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  MapPin,
  Scale,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { AppLink, navigateTo } from '../components/AppLink';
import { SeoHead } from '../components/SeoHead';

export type LegalDocType = 'terms' | 'privacy';

interface LegalScreenProps {
  activeDoc: LegalDocType;
  onBack?: () => void;
  onSelectDoc?: (doc: LegalDocType) => void;
}

export function LegalScreen({ activeDoc, onBack, onSelectDoc }: LegalScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scrollToTop = () => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
      if (containerRef.current) {
        let parent = containerRef.current.parentElement;
        while (parent) {
          if (parent.scrollTop > 0) {
            parent.scrollTop = 0;
          }
          parent = parent.parentElement;
        }
      }
    };

    scrollToTop();
    const rafId = requestAnimationFrame(scrollToTop);
    const timerId = setTimeout(scrollToTop, 60);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [activeDoc]);

  const handleDocChange = (doc: LegalDocType) => {
    if (onSelectDoc) {
      onSelectDoc(doc);
    } else {
      navigateTo(doc === 'terms' ? '/regulamin' : '/polityka-prywatnosci');
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-full w-full bg-mist text-ink select-text py-6 px-4 sm:px-6 md:px-8 lg:px-12"
    >
      <SeoHead
        title={
          activeDoc === 'terms'
            ? 'Regulamin serwisu — mójMińsk.app'
            : 'Polityka Prywatności i RODO — mójMińsk.app'
        }
        description={
          activeDoc === 'terms'
            ? 'Regulamin korzystania z platformy sąsiedzkiej mójMińsk dla mieszkańców Mińska Mazowieckiego i Gminy Mińsk Mazowiecki: ogłoszenia, przejazdy, tożsamość sąsiedzka.'
            : 'Zasady ochrony prywatności, szyfrowania adresów AES-256 oraz przetwarzania danych osobowych w aplikacji mójMińsk.app w Mińsku Mazowieckim.'
        }
        canonicalPath={activeDoc === 'terms' ? '/regulamin' : '/polityka-prywatnosci'}
      />

      <div className="w-full space-y-6">
        {/* Navigation Bar / Back */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AppLink
            to="/"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-xs border border-mist-200 hover:bg-mist-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span>Wróć do serwisu</span>
          </AppLink>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-500 bg-white/70 px-3 py-1.5 rounded-full border border-mist-200">
            <MapPin className="h-3.5 w-3.5 text-coral-600" aria-hidden />
            <span>Mińsk Mazowiecki · Gmina Mińsk Mazowiecki</span>
          </div>
        </div>

        {/* Hero Card with Document Switcher */}
        <div className="rounded-3xl md:rounded-4xl bg-white p-6 md:p-8 border border-mist-200 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-mist-100">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-600">
                <Scale className="h-3.5 w-3.5 text-coral-600" aria-hidden />
                <span>Dokumenty Prawne Platformy</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-950 tracking-tight">
                {activeDoc === 'terms' ? 'Regulamin Platformy mójMińsk' : 'Polityka Prywatności i RODO'}
              </h1>
              <p className="text-xs md:text-sm text-ink-500">
                Ostatnia aktualizacja: 29 października 2026 r. · Obowiązuje od dnia publikacji
              </p>
            </div>

            {/* Document Switcher Tabs */}
            <div className="flex p-1.5 bg-mist rounded-2xl border border-mist-200 shrink-0 select-none">
              <button
                type="button"
                onClick={() => handleDocChange('terms')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeDoc === 'terms'
                    ? 'bg-white text-ink-950 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <FileText className="h-4 w-4 text-coral-600" aria-hidden />
                <span>Regulamin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDocChange('privacy')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeDoc === 'privacy'
                    ? 'bg-white text-ink-950 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <Shield className="h-4 w-4 text-emerald-600" aria-hidden />
                <span>Prywatność & RODO</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-coral-50/60 border border-coral-200/60 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-coral-600 shrink-0 mt-0.5" aria-hidden />
            <div className="text-xs text-ink-700 space-y-1">
              <p className="font-bold text-ink-900">
                {activeDoc === 'terms'
                  ? 'Kluczowa zasada mójMińsk: Bezpieczna tożsamość sąsiedzka'
                  : 'Gwarancja prywatności: Szyfrowanie danych adresowych AES-256'}
              </p>
              <p className="leading-relaxed">
                {activeDoc === 'terms'
                  ? 'Wszyscy użytkownicy występują publicznie w formacie „Imię z ulicy” (np. Kasia ze Spacerowej). Pełne dane adresowe podlegają ścisłej tajemnicy i służą wyłącznie doręczeniu tradycyjnego listu weryfikacyjnego.'
                  : 'Twój dokładny adres (numer domu, lokalu) jest zaszyfrowany w bazie danych i nigdy nie jest prezentowany publicznie innym mieszkańcom. Nie handlujemy danymi ani nie udostępniamy ich podmiotom trzecim.'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Document Content */}
        <div className="rounded-3xl md:rounded-4xl bg-white p-6 md:p-10 border border-mist-200 shadow-card">
          {activeDoc === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Contact & Support Footer Card */}
        <div className="rounded-3xl bg-sand-100 p-6 md:p-8 border border-sand-300 text-ink space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-2xs">
              <Mail className="h-5 w-5 text-coral-600" aria-hidden />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink-950">
                Pytania dotyczące Regulaminu lub Ochrony Danych?
              </h3>
              <p className="text-xs text-ink-600">
                Jesteśmy lokalnym zespołem z Mińska Mazowieckiego. Odpowiadamy na wszystkie zgłoszenia mieszkańców.
              </p>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-ink-800">
            <span>
              E-mail:{' '}
              <a
                href="mailto:kontakt@mojminsk.app"
                className="font-bold text-coral-700 underline hover:text-coral-800"
              >
                kontakt@mojminsk.app
              </a>
            </span>
            <span>•</span>
            <span>Mińsk Mazowiecki, Polska</span>
            <span>•</span>
            <span>Czas odpowiedzi: do 24 godzin w dni robocze</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <article className="prose prose-sm max-w-none text-ink-800 space-y-8 leading-relaxed">
      <div className="p-4 rounded-2xl bg-mist border border-mist-200 text-xs text-ink-600">
        <p className="font-bold text-ink-900 mb-1">Spis treści Regulaminu:</p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 list-decimal list-inside">
          <li>Postanowienia ogólne i definicje</li>
          <li>Warunki techniczne i charakter PWA</li>
          <li>Rejestracja i weryfikacja pocztowa</li>
          <li>Tablica Ogłoszeń Sąsiedzkich (C2C)</li>
          <li>Strefa Rozmów i kultura sąsiedzka</li>
          <li>Wspólne przejazdy (Carpooling) & ZDiTM</li>
          <li>Oferty pracy i usługi dla firm (B2B)</li>
          <li>Odpowiedzialność i zgłaszanie naruszeń</li>
          <li>Reklamacje i postanowienia końcowe</li>
        </ol>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 1. Postanowienia ogólne i definicje
        </h2>
        <p>
          1. Niniejszy Regulamin określa zasady korzystania z hiperlokalnej platformy sąsiedzkiej{' '}
          <strong>mójMińsk.app</strong> (zwanej dalej „Platformą” lub „Serwisem”), dedykowanej
          mieszkańcom Mińska Mazowieckiego oraz Gminy Mińsk Mazowiecki.
        </p>
        <p>
          2. Operatorem Serwisu i Usługodawcą jest operator platformy mójMińsk.app z siedzibą w Mińsku
          Mazowieckim, kontakt e-mail:{' '}
          <a href="mailto:kontakt@mojminsk.app" className="text-coral-600 underline font-semibold">
            kontakt@mojminsk.app
          </a>
          .
        </p>
        <p>
          3. <strong>Definicje:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-ink-700">
          <li>
            <strong>Użytkownik</strong> – każda osoba fizyczna korzystająca z zasobów Serwisu.
          </li>
          <li>
            <strong>Zweryfikowany Mieszkaniec</strong> – Użytkownik, który pomyślnie przeszedł procedurę
            potwierdzenia adresu zamieszkania w Mińsku Mazowieckim lub Gminie Mińsk Mazowiecki za pomocą
            kodu PIN z listu doręczonego do skrzynki pocztowej.
          </li>
          <li>
            <strong>Dostęp Tymczasowy</strong> – okres 14 dni od momentu rejestracji, umożliwiający pełne
            zapoznanie się z platformą i jej funkcjami w oczekiwaniu na doręczenie listu weryfikacyjnego.
          </li>
          <li>
            <strong>Tożsamość Sąsiedzka</strong> – format publicznej identyfikacji Użytkownika oparty
            wyłącznie na regule <em>„[Imię] z ulicy [Nazwa Ulicy]”</em> (np. Wojtek ze Spacerowej, Anna
            ze Stojadeł).
          </li>
          <li>
            <strong>Obszar Działania</strong> – Miasto Mińsk Mazowiecki (kody pocztowe: 05-300, 05-301,
            05-302, 05-303) oraz sołectwa Gminy Mińsk Mazowiecki (m.in. Stojadła, Karolina, Huta Mińska,
            Nowe Osiny, Stare Osiny, Arynów, Barcząca, Brzóze, Budy Barcząckie, Gliniak, Janów,
            Marianka, Niedziałka, Podrudzie, Tartak, Wólka Mińska, Zamienie i pokrewne).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 2. Warunki techniczne i charakter aplikacji PWA
        </h2>
        <p>
          1. Serwis funkcjonuje jako nowoczesna aplikacja internetowa klasy{' '}
          <strong>Progressive Web App (PWA)</strong>, dostępna za pośrednictwem aktualnych wersji
          przeglądarek internetowych (m.in. Apple Safari, Google Chrome, Mozilla Firefox, Microsoft
          Edge) na telefonach, tabletach oraz komputerach osobistych.
        </p>
        <p>
          2. Użytkownik ma możliwość zainstalowania aplikacji na ekranie początkowym urządzenia bez
          konieczności pobierania pakietów ze sklepów z aplikacjami.
        </p>
        <p>
          3. Korzystanie z platformy wymaga urządzenia z dostępem do sieci Internet. Do wybranych zasobów
          (np. przeglądanie rozkładów jazdy ZDiTM offline) wykorzystywana jest lokalna pamięć podręczna
          urządzenia (Service Worker Cache).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 3. Rejestracja, weryfikacja pocztowa i tożsamość sąsiedzka
        </h2>
        <p>
          1. W celu ochrony społeczności przed hejtem, spamem i anonimowością, platforma mójMińsk.app
          wprowadza mechanizm weryfikacji faktycznego zamieszkania na terenie Mińska Mazowieckiego lub
          Gminy Mińsk Mazowiecki.
        </p>
        <p>
          2. Rejestracja wymaga podania: imienia, wskazania ulicy lub miejscowości zamieszkania oraz
          pełnego adresu doręczeń (numer budynku, ewentualnie lokalu oraz nazwisko adresata) na potrzeby
          wysyłki bezpłatnego listu weryfikacyjnego.
        </p>
        <p>
          3. <strong>Tajemnica danych adresowych:</strong> Dokładny numer budynku, mieszkania oraz
          nazwisko adresata podlegają ścisłemu szyfrowaniu kryptograficznemu (AES-256), są dostępne
          wyłącznie dla upoważnionego administratora do celów wysyłki pocztowej i{' '}
          <strong>nigdy nie są publikowane ani udostępniane innym użytkownikom</strong>.
        </p>
        <p>
          4. <strong>Zasada 14 dni dostępu:</strong> Nowo zarejestrowany użytkownik uzyskuje pełny dostęp
          do funkcji społecznościowych na okres 14 dni kalendarzowych. Po tym terminie publikacja nowych
          treści wymaga wpisania 6-cyfrowego kodu PIN doręczonego w liście powitalnym.
        </p>
        <p>
          5. <strong>Reguła domowników:</strong> Jeden list weryfikacyjny dostarczony pod fizyczny adres
          umożliwia aktywację do 3 niezależnych kont pełnoletnich domowników (np. małżonkowie, dorosłe
          dzieci).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 4. Tablica Ogłoszeń Sąsiedzkich (C2C)
        </h2>
        <p>
          1. Użytkownicy mogą bezpłatnie publikować ogłoszenia sąsiedzkie w kategoriach m.in.: Oddam za
          darmo, Sprzedam lokalnie, Kupię / Szukam, Zgubiono / Znaleziono oraz Pomoc sąsiedzka.
        </p>
        <p>
          2. Usługodawca nie jest stroną umów sprzedaży, darowizny ani zamiany zawieranych pomiędzy
          mieszkańcami i nie pobiera żadnych prowizji od transakcji C2C.
        </p>
        <p>
          3. Komunikacja pomiędzy ogłoszeniodawcą a zainteresowanym sąsiadem odbywa się za pośrednictwem
          wbudowanego w aplikację bezpiecznego komunikatora (Czat), dzięki czemu użytkownicy nie muszą
          upubliczniać swoich prywatnych numerów telefonów.
        </p>
        <p>
          4. Zabrania się wystawiania przedmiotów, których obrót narusza obowiązujące przepisy prawa
          polskiego (np. leki na receptę, wyroby tytoniowe, alkohol, broń, materiały niebezpieczne lub
          pochodzące z kradzieży).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 5. Strefa Rozmów i kultura sąsiedzka
        </h2>
        <p>
          1. Strefa Rozmów to lokalne forum dyskusyjne służące wymianie informacji o sprawach miejskich,
          inwestycjach, alertach pogodowych i wydarzeniach w Mińsku Mazowieckim.
        </p>
        <p>
          2. Wpisy mają formę krótkich wiadomości do 280 znaków z opcją dołączenia 1 fotografii. Każdy
          wpis jest jednoznacznie podpisany tożsamością sąsiedzką autora (np.{' '}
          <em>„Marek z Sosnkowskiego”</em>).
        </p>
        <p>
          3. Obowiązuje bezwzględny zakaz publikowania treści wulgarnych, nawołujących do nienawiści,
          zniesławiających sąsiadów, spamu komercyjnego oraz celowej dezinformacji.
        </p>
        <p>
          4. Usługodawca stosuje filtry antyspamowe oraz procedurę moderacji sąsiedzkiej. Treści
          naruszające dobre obyczaje będą usuwane, a konta recydywistów mogą zostać zablokowane.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 6. Wspólne przejazdy (Carpooling) & ZDiTM
        </h2>
        <p>
          1. Moduł Wspólnych Przejazdów służy niezarobkowemu łączeniu kierowców i pasażerów podróżujących
          na trasach pomiędzy Mińskiem Mazowieckim a Warszawą oraz w granicach powiatu mińskiego.
        </p>
        <p>
          2. Ewentualny zwrot kosztów paliwa odbywa się bezpośrednio pomiędzy pasażerem a kierowcą poza
          aplikacją. Usługodawca nie pośredniczy w płatnościach za przejazdy i nie pobiera z tego tytułu
          żadnych opłat.
        </p>
        <p>
          3. Moduł ZDiTM prezentuje publicznie dostępne dane rozkładowe miejskich linii autobusowych
          Mińska Mazowieckiego (M2, M3, M4) mające charakter wyłącznie informacyjny.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 7. Oferty pracy i usługi dla firm (B2B)
        </h2>
        <p>
          1. Przedsiębiorcy mogą publikować płatne ogłoszenia o pracę skierowane do mieszkańców Mińska
          Mazowieckiego. Opłata wynosi 10 zł brutto za publikację oferty na 14 dni.
        </p>
        <p>
          2. Płatności są obsługiwane automatycznie za pośrednictwem certyfikowanych operatorów płatności
          online (m.in. szybki BLIK).
        </p>
        <p>
          3. Usługodawca wystawia faktury VAT zgodnie z obowiązującymi przepisami prawa podatkowego.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 8. Odpowiedzialność i procedura zgłaszania naruszeń
        </h2>
        <p>
          1. Usługodawca świadczy usługi drogą elektroniczną w rozumieniu ustawy z dnia 18 lipca 2002 r.
          o świadczeniu usług drogą elektroniczną oraz unijnego Aktu o Usługach Cyfrowych (DSA).
        </p>
        <p>
          2. Usługodawca nie ponosi odpowiedzialności za treści zamieszczane przez Użytkowników pod
          warunkiem, że w przypadku otrzymania wiarygodnej wiadomości o bezprawnym charakterze danych
          niezwłocznie uniemożliwi do nich dostęp (zasada <em>Notice and Take Down</em>).
        </p>
        <p>
          3. Każdy Użytkownik ma możliwość zgłoszenia naruszenia za pomocą przycisku „Zgłoś ogłoszenie”
          lub poprzez bezpośredni kontakt pod adresem:{' '}
          <a href="mailto:kontakt@mojminsk.app" className="text-coral-600 underline font-semibold">
            kontakt@mojminsk.app
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 9. Reklamacje i postanowienia końcowe
        </h2>
        <p>
          1. Wszelkie reklamacje dotyczące funkcjonowania Serwisu należy kierować drogą elektroniczną na
          adres e-mail: <strong>kontakt@mojminsk.app</strong>.
        </p>
        <p>
          2. Reklamacja powinna zawierać opis problemu oraz dane identyfikujące konto Użytkownika.
          Usługodawca rozpatruje reklamacje w terminie do 14 dni roboczych.
        </p>
        <p>
          3. Prawem właściwym dla umów zawieranych na podstawie niniejszego Regulaminu jest prawo polskie.
        </p>
        <p>
          4. Usługodawca zastrzega sobie prawo do zmiany Regulaminu z ważnych przyczyn prawnych lub
          technologicznych. Informacja o zmianach zostanie opublikowana w Serwisie z co najmniej 7-dniowym
          wyprzedzeniem.
        </p>
      </section>
    </article>
  );
}

function PrivacyContent() {
  return (
    <article className="prose prose-sm max-w-none text-ink-800 space-y-8 leading-relaxed">
      <div className="p-4 rounded-2xl bg-mist border border-mist-200 text-xs text-ink-600">
        <p className="font-bold text-ink-900 mb-1">Spis treści Polityki Prywatności:</p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 list-decimal list-inside">
          <li>Administrator Danych Osobowych</li>
          <li>Cele i podstawy prawne przetwarzania</li>
          <li>Szyfrowanie adresów i tożsamość sąsiedzka</li>
          <li>Odbiorcy danych i brak profilowania komercyjnego</li>
          <li>Okres przechowywania danych</li>
          <li>Twoje prawa w świetle RODO</li>
          <li>Pliki cookies i technologie PWA</li>
          <li>Bezpieczeństwo i kontakt z Inspektorem</li>
        </ol>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 1. Administrator Danych Osobowych
        </h2>
        <p>
          1. Administratorem Twoich danych osobowych w rozumieniu Rozporządzenia Parlamentu Europejskiego
          i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) jest operator platformy{' '}
          <strong>mójMińsk.app</strong> z siedzibą w Mińsku Mazowieckim.
        </p>
        <p>
          2. W sprawach związanych z ochroną danych osobowych, realizacją przysługujących praw lub
          usunięciem konta możesz skontaktować się z nami pod dedykowanym adresem e-mail:{' '}
          <a href="mailto:kontakt@mojminsk.app" className="text-coral-600 underline font-semibold">
            kontakt@mojminsk.app
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 2. Cele i podstawy prawne przetwarzania danych
        </h2>
        <p>Przetwarzamy dane osobowe wyłącznie w prawnie uzasadnionych celach:</p>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-mist border border-mist-200">
            <p className="font-bold text-ink-950">A. Świadczenie usług platformy sąsiedzkiej</p>
            <p className="text-ink-600 mt-0.5">
              Imię, nazwa ulicy, awatar, treść ogłoszeń i wpisów na forum — podstawa prawna: art. 6 ust.
              1 lit. b RODO (wykonanie umowy o świadczenie usług drogą elektroniczną).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-mist border border-mist-200">
            <p className="font-bold text-ink-950">B. Fizyczna weryfikacja adresu zamieszkania</p>
            <p className="text-ink-600 mt-0.5">
              Pełne dane adresowe (ulica, numer domu i lokalu, kod pocztowy, nazwisko dla doręczyciela)
              wykorzystywane wyłącznie do wysłania listu z kodem PIN — podstawa prawna: art. 6 ust. 1
              lit. f RODO (prawnie uzasadniony interes Administratora polegający na ochronie społeczności
              przed trollami i fałszywymi kontami).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-mist border border-mist-200">
            <p className="font-bold text-ink-950">C. Bezpieczeństwo i rozpatrywanie reklamacji</p>
            <p className="text-ink-600 mt-0.5">
              Adres e-mail, logi techniczne, zgłoszenia naruszeń — podstawa prawna: art. 6 ust. 1 lit. c
              oraz f RODO (obowiązki prawne i ochrona przed roszczeniami).
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 3. Szyfrowanie adresów i tożsamość sąsiedzka
        </h2>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          <Lock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
          <div className="space-y-1">
            <p className="font-bold text-emerald-950">Standard Szyfrowania AES-256</p>
            <p>
              Wszystkie szczegółowe dane adresowe podane w formularzu rejestracyjnym są szyfrowane w
              bezpiecznej bazie danych w standardzie AES-256. Dostęp do nich posiada wyłącznie
              upoważniony personel realizujący wysyłkę korespondencji pocztowej.
            </p>
          </div>
        </div>
        <p>
          1. <strong>Zasada minimalizmu tożsamości:</strong> Inni mieszkańcy Mińska Mazowieckiego widzą
          wyłącznie Twoje imię oraz nazwę ulicy (np. <em>Wojtek ze Spacerowej</em>).
        </p>
        <p>
          2. Twój numer domu, lokalu oraz nazwisko nigdy nie są wyświetlane w aplikacji ani udostępniane
          innym osobom.
        </p>
        <p>
          3. Kontakt w sprawie ogłoszeń odbywa się przez wewnętrzny czat, bez konieczności ujawniania
          numeru telefonu.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 4. Odbiorcy danych i brak odsprzedaży
        </h2>
        <p>
          1. <strong>Żadnych komercyjnych baz marketingowych:</strong> Stanowczo gwarantujemy, że Twoje
          dane osobowe, adresy e-mail ani numery telefonów{' '}
          <strong>nigdy nie są sprzedawane, wypożyczane ani udostępniane podmiotom trzecim</strong> w
          celach marketingowych.
        </p>
        <p>2. Dane mogą być przekazywane wyłącznie zaufanym podmiotom przetwarzającym:</p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-ink-700">
          <li>
            <strong>Poczta Polska S.A.</strong> – wyłącznie dane niezbędne do doręczenia koperty z listem
            weryfikacyjnym.
          </li>
          <li>
            <strong>Dostawcy infrastruktury serwerowej i bazodanowej</strong> – serwery bazodanowe
            zlokalizowane na terenie Unii Europejskiej spełniające najwyższe wymogi RODO (ISO 27001).
          </li>
          <li>
            <strong>Operatorzy płatności</strong> – w przypadku realizowania płatnych ogłoszeń firmowych.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 5. Okres przechowywania danych
        </h2>
        <p>
          1. Dane profilowe Użytkownika są przechowywane przez czas posiadania aktywnego konta w
          Serwisie.
        </p>
        <p>
          2. W przypadku usunięcia konta dane osobowe są trwale anonimizowane lub kasowane, z wyjątkiem
          danych, których obowiązek przechowywania wynika z przepisów prawa podatkowego (dot. transakcji
          B2B) lub w celu obrony przed ewentualnymi roszczeniami do upływu terminu ich przedawnienia.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 6. Twoje prawa w świetle RODO
        </h2>
        <p>Zgodnie z przepisami RODO przysługują Ci następujące prawa:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-700 list-none pl-0">
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-mist border border-mist-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
            <span>Prawo dostępu do swoich danych oraz otrzymania ich kopii</span>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-mist border border-mist-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
            <span>Prawo do sprostowania (poprawienia) nieprawidłowych danych</span>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-mist border border-mist-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
            <span>Prawo do usunięcia danych („prawo do bycia zapomnianym”)</span>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-mist border border-mist-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
            <span>Prawo do ograniczenia przetwarzania danych</span>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-mist border border-mist-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
            <span>Prawo do przenoszenia danych do innego usługodawcy</span>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-mist border border-mist-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
            <span>Prawo do wniesienia sprzeciwu wobec przetwarzania</span>
          </li>
        </ul>
        <p className="text-xs text-ink-600 pt-1">
          W przypadku uznania, że przetwarzanie narusza przepisy RODO, przysługuje Ci prawo wniesienia
          skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO), ul. Stawki 2, 00-193 Warszawa.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 7. Pliki cookies i technologie PWA
        </h2>
        <p>
          1. Platforma mójMińsk.app nie stosuje inwazyjnych cookies śledzących Twoją aktywność na innych
          stronach www.
        </p>
        <p>
          2. W celu zapewnienia prawidłowego działania aplikacji PWA wykorzystujemy pamięć podręczną
          przeglądarki:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-ink-700">
          <li>
            <strong>Pamięć lokalna (localStorage):</strong> przechowywanie stanu zalogowania, ulubionych
            przystanków ZDiTM w Mińsku Mazowieckim oraz oddanych głosów w ankietach mieszkańców.
          </li>
          <li>
            <strong>Service Worker Cache:</strong> zapisywanie plików statycznych aplikacji w celu
            błyskawicznego ładowania i możliwości przeglądania rozkładów w trybie offline.
          </li>
        </ul>
        <p className="text-xs text-ink-600">
          Możesz w każdej chwili usunąć dane zapisane przez aplikację w ustawieniach swojej przeglądarki
          internetowej (opcja „Wyczyść pamięć podręczną i pliki cookie”).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-display font-extrabold text-ink-950 border-b border-mist-200 pb-2">
          § 8. Bezpieczeństwo i kontakt
        </h2>
        <p>
          1. Stosujemy zaawansowane środki techniczne i organizacyjne chroniące dane przed
          nieuprawnionym dostępem, w tym szyfrowane połączenia HTTPS (certyfikat SSL), izolację baz
          danych oraz szyfrowanie wrażliwych pól algorytmem AES-256.
        </p>
        <p>
          2. W przypadku pytań dotyczących prywatności napisz do nas:{' '}
          <a href="mailto:kontakt@mojminsk.app" className="text-coral-600 underline font-semibold">
            kontakt@mojminsk.app
          </a>
          .
        </p>
      </section>
    </article>
  );
}
