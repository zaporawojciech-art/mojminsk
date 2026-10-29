import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCheck, Clock, Info, RotateCcw, Send } from 'lucide-react';
import { Img, NativeHeader, cn, zl } from '../components/ui';
import type { Ad, User } from '../data/mockData';
import {
  fetchMessages,
  markConversationRead,
  sendMessage,
  startConversation,
  subscribeToConversationMessages,
  type ChatMessageItem,
} from '../lib/chat';

interface ChatModalProps {
  ad: Ad;
  user: User;
  conversationId?: string | null;
  otherUser?: {
    name: string;
    street: string;
    streetAs?: string;
    avatarSeed?: string;
  };
  onClose: () => void;
  onConversationUpdated?: () => void;
  isClosing?: boolean;
}

export function ChatModal({
  ad,
  user,
  conversationId: initialConversationId = null,
  otherUser,
  onClose,
  onConversationUpdated,
}: ChatModalProps) {
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const isDemoAd = !initialConversationId && !ad.authorId;
  const isOwnAdWithoutConv =
    !initialConversationId && Boolean(user.profileId && ad.authorId === user.profileId);

  const headerName = otherUser?.name || ad.author;
  const headerStreet = otherUser?.street || ad.street;

  // Inicjalizacja lub pobranie ID rozmowy
  useEffect(() => {
    let cancelled = false;
    setInitError(null);

    if (initialConversationId) {
      setActiveConvId(initialConversationId);
      return;
    }

    if (isDemoAd || isOwnAdWithoutConv) {
      setActiveConvId(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    void startConversation(ad.id).then(({ conversationId, error }) => {
      if (cancelled) return;
      if (error || !conversationId) {
        setInitError(error || 'Nie udało się otworzyć rozmowy.');
        setLoading(false);
        return;
      }
      setActiveConvId(conversationId);
      onConversationUpdated?.();
    });

    return () => {
      cancelled = true;
    };
  }, [ad.id, initialConversationId, isDemoAd, isOwnAdWithoutConv, onConversationUpdated]);

  const loadMessages = useCallback(
    async (convId: string) => {
      const list = await fetchMessages(convId);
      setMessages((prev) => {
        const pendingOnly = prev.filter((m) => m.pending || m.failed);
        const merged = [...list];
        pendingOnly.forEach((p) => {
          if (!merged.some((m) => m.id === p.id)) {
            merged.push(p);
          }
        });
        return merged;
      });
      setLoading(false);
      void markConversationRead(convId).then(() => {
        onConversationUpdated?.();
      });
    },
    [onConversationUpdated],
  );

  // Pobranie wiadomości oraz subskrypcja Realtime
  useEffect(() => {
    if (!activeConvId) return;

    setLoading(true);
    void loadMessages(activeConvId);

    const unsubscribe = subscribeToConversationMessages(
      activeConvId,
      (incoming) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) {
            return prev;
          }
          // Jeśli to potwierdzenie naszej wiadomości optymistycznej, zastąp pierwszą oczekującą o tej samej treści
          const pendingIdx = prev.findIndex(
            (m) =>
              m.pending &&
              m.senderId === incoming.senderId &&
              m.body.trim() === incoming.body.trim(),
          );
          if (pendingIdx !== -1) {
            const copy = [...prev];
            copy[pendingIdx] = incoming;
            return copy;
          }
          return [...prev, incoming];
        });

        if (incoming.senderId !== user.profileId) {
          void markConversationRead(activeConvId).then(() => {
            onConversationUpdated?.();
          });
        } else {
          onConversationUpdated?.();
        }
      },
      () => {
        void loadMessages(activeConvId);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [activeConvId, loadMessages, onConversationUpdated, user.profileId]);

  // Przewijanie kontenera wiadomości na dół
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      container.scrollTop = container.scrollHeight;
      return;
    }
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const sendTextMessage = async (text: string, retryTempId?: string) => {
    const trimmed = text.trim();
    if (!trimmed || !activeConvId || !user.profileId) return;

    const tempId = retryTempId || `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();
    const optimisticMsg: ChatMessageItem = {
      id: tempId,
      conversationId: activeConvId,
      senderId: user.profileId,
      body: trimmed,
      kind: 'text',
      createdAt: nowIso,
      timeLabel: new Date().toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      pending: true,
      failed: false,
    };

    setMessages((prev) => {
      if (retryTempId) {
        return prev.map((m) => (m.id === retryTempId ? optimisticMsg : m));
      }
      return [...prev, optimisticMsg];
    });

    const { message: saved, error } = await sendMessage(activeConvId, user.profileId, trimmed);

    if (error || !saved) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, pending: false, failed: true } : m,
        ),
      );
      return;
    }

    setMessages((prev) => {
      // Jeśli Realtime już dodał wiadomość o docelowym ID, usuń duplikat tymczasowy
      if (prev.some((m) => m.id === saved.id)) {
        return prev.filter((m) => m.id !== tempId);
      }
      return prev.map((m) => (m.id === tempId ? saved : m));
    });
    onConversationUpdated?.();
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend ?? inputText;
    if (!text.trim()) return;
    if (!textToSend) setInputText('');
    void sendTextMessage(text);
  };

  const quickReplies = [
    'Czy ogłoszenie jest nadal aktualne?',
    'Kiedy i gdzie mogę podejść odebrać?',
    'Czy cena podlega małej negocjacji?',
  ];

  const canSend = Boolean(activeConvId && user.profileId && !isDemoAd && !isOwnAdWithoutConv && !initError);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist select-none">
      {/* Native Top Header */}
      <NativeHeader
        title={`${headerName} · ul. ${headerStreet}`}
        backLabel="Wróć"
        onBack={onClose}
      />

      {/* Ad Context Bar */}
      <div className="flex items-center gap-3 border-b border-mist-300 bg-white/95 px-4 py-2.5 shrink-0">
        <Img src={ad.image} alt="" className="h-11 w-11 rounded-xl object-cover shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-bold text-ink">{ad.title}</p>
          <p className="text-[11.5px] font-extrabold text-coral-700">
            {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Zgłoszenie'}
          </p>
        </div>
        <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[10.5px] font-bold text-sand-700">
          ul. {ad.street}
        </span>
      </div>

      {/* Messages List */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 no-scrollbar"
      >
        <div className="text-center my-1">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-[10.5px] font-medium text-ink-500 shadow-2xs">
            Bezpieczny czat 1:1 · Tylko uczestnicy widzą tę rozmowę
          </span>
        </div>

        {isDemoAd && (
          <div className="rounded-2xl bg-sand-100 border border-sand-300 p-4 text-center space-y-1.5">
            <Info className="h-5 w-5 text-sand-700 mx-auto" />
            <p className="font-display text-[13.5px] font-bold text-ink">
              Ogłoszenie demonstracyjne
            </p>
            <p className="text-[12px] text-ink-600 leading-relaxed">
              To przykładowe ogłoszenie startowe nie ma przypisanego konta mieszkańca. Możesz prowadzić rozmowy na żywo we wszystkich ogłoszeniach dodanych przez zarejestrowanych sąsiadów.
            </p>
          </div>
        )}

        {isOwnAdWithoutConv && (
          <div className="rounded-2xl bg-white border border-mist-300 p-4 text-center space-y-1.5">
            <Info className="h-5 w-5 text-coral mx-auto" />
            <p className="font-display text-[13.5px] font-bold text-ink">
              To jest Twoje ogłoszenie
            </p>
            <p className="text-[12px] text-ink-600 leading-relaxed">
              Gdy sąsiedzi napiszą do Ciebie w sprawie tego przedmiotu, ich wiadomości pojawią się w Twojej skrzynce „Wiadomości”.
            </p>
          </div>
        )}

        {initError && (
          <div className="rounded-2xl bg-coral-50 border border-coral-200 p-4 text-center space-y-1">
            <AlertCircle className="h-5 w-5 text-coral-700 mx-auto" />
            <p className="text-[12.5px] font-semibold text-coral-800">{initError}</p>
          </div>
        )}

        {loading && activeConvId && (
          <div className="py-8 text-center text-[12.5px] font-medium text-ink-400">
            Wczytywanie rozmowy…
          </div>
        )}

        {!loading && canSend && messages.length === 0 && (
          <div className="rounded-2xl bg-white/80 border border-mist-200 p-5 text-center space-y-1 my-4">
            <p className="font-display text-[13.5px] font-bold text-ink">
              Napisz pierwszą wiadomość do sąsiada
            </p>
            <p className="text-[12px] text-ink-500">
              Zapytaj o szczegóły lub zaproponuj wygodny termin odbioru przy ul. {ad.street}.
            </p>
          </div>
        )}

        {messages.map((m) => {
          if (m.kind === 'system') {
            return (
              <div key={m.id} className="flex justify-center my-2">
                <div className="rounded-2xl bg-sand-100 border border-sand-300 px-3.5 py-2 text-[11.5px] font-semibold text-ink-800 text-center max-w-[90%] shadow-2xs">
                  {m.body}
                </div>
              </div>
            );
          }

          const isMe = m.senderId === user.profileId;
          return (
            <div
              key={m.id}
              className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[82%] rounded-2xl p-3.5 text-[13.5px] leading-relaxed shadow-2xs select-text',
                  isMe
                    ? 'rounded-br-xs bg-ink text-white'
                    : 'rounded-bl-xs bg-white text-ink border border-mist',
                  m.failed && 'border-2 border-coral bg-coral-50 text-coral-900',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
              </div>
              <div className="mt-1 flex items-center gap-1.5 px-1 text-[10.5px] text-ink-400">
                <span>{m.timeLabel}</span>
                {isMe && m.pending && <Clock className="h-3 w-3 text-ink-400 animate-pulse" />}
                {isMe && !m.pending && !m.failed && (
                  <CheckCheck className="h-3 w-3 text-sky-700" />
                )}
                {isMe && m.failed && (
                  <button
                    type="button"
                    onClick={() => void sendTextMessage(m.body, m.id)}
                    className="inline-flex items-center gap-1 text-coral-700 font-bold hover:underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Nie wysłano — ponów</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick reply chips */}
      {canSend && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 bg-white/85 no-scrollbar shrink-0 border-t border-mist">
          {quickReplies.map((qr) => (
            <button
              key={qr}
              type="button"
              onClick={() => handleSend(qr)}
              className="shrink-0 rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-semibold text-ink hover:bg-mist-200 transition-colors active:scale-95"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t border-mist bg-white p-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            disabled={!canSend}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              canSend
                ? 'Napisz do sąsiada…'
                : 'Czat niedostępny dla tego ogłoszenia'
            }
            className="h-12 flex-1 rounded-full bg-mist px-4 text-[14px] outline-none focus:ring-2 focus:ring-ink disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canSend || !inputText.trim()}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-coral text-ink shadow-coral transition-transform active:scale-95 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
