import { useEffect, useRef, useState } from 'react';
import { CheckCheck, Send } from 'lucide-react';
import { Img, NativeHeader, cn, zl } from '../components/ui';
import type { Ad, User } from '../data/mockData';
import {
  fetchAdMessagesFromSupabase,
  sendAdMessageInSupabase,
  type ChatMessageItem,
} from '../lib/supabase';

interface ChatModalProps {
  ad: Ad;
  user: User;
  onClose: () => void;
  isClosing?: boolean;
}

type Message = ChatMessageItem;

export function ChatModal({ ad, user, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'neighbor',
      text: `Dzień dobry ${user.name}! Jeśli masz pytania o "${ad.title}", śmiało pisz. Mieszkam niedaleko, przy ul. ${ad.street}.`,
      time: '14:20',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    void fetchAdMessagesFromSupabase(ad.id).then((remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setMessages(remoteMsgs);
      }
    });
  }, [ad.id]);

  // Scroll only the local messages container (never scrollIntoView which shifts off-screen transform animations)
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
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend ?? inputText;
    if (!text.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    void sendAdMessageInSupabase(ad.id, newMsg, user.name);
    if (!textToSend) setInputText('');

    // Simulate realistic neighbor response after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: Message = {
        id: `msg_reply_${Date.now()}`,
        sender: 'neighbor',
        text: 'Super, możemy się umówić! Dziś po 17:30 będę w domu. Podaję numer klatki i domofon na priv: klatka B, domofon 18. Do zobaczenia sąsiedzie! 👋',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
      void sendAdMessageInSupabase(ad.id, replyMsg, ad.author);
    }, 1500);
  };

  const quickReplies = [
    'Czy ogłoszenie jest nadal aktualne?',
    'Kiedy i gdzie mogę podejść odebrać?',
    'Czy cena podlega małej negocjacji?',
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-mist select-none">
      {/* Native Top Header */}
      <NativeHeader
        title={ad.author}
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
            Bezpieczny czat sąsiedzki · Twoje dane są chronione
          </span>
        </div>

        {messages.map((m) => {
          const isMe = m.sender === 'me';
          return (
            <div
              key={m.id}
              className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[82%] rounded-2xl p-3.5 text-[13.5px] leading-relaxed shadow-2xs',
                  isMe
                    ? 'rounded-br-xs bg-ink text-white'
                    : 'rounded-bl-xs bg-white text-ink border border-mist',
                )}
              >
                <p>{m.text}</p>
              </div>
              <div className="mt-1 flex items-center gap-1 px-1 text-[10.5px] text-ink-400">
                <span>{m.time}</span>
                {isMe && <CheckCheck className="h-3 w-3 text-sky-700" />}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 w-28 text-[12px] text-ink-500 shadow-2xs">
            <span className="animate-pulse">Pisze</span>
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ink animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        )}
      </div>

      {/* Quick reply chips */}
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
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Napisz do sąsiada…"
            className="h-12 flex-1 rounded-full bg-mist px-4 text-[14px] outline-none focus:ring-2 focus:ring-ink"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-coral text-ink shadow-coral transition-transform active:scale-95 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
