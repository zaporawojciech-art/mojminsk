import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCheck, Send, ShieldCheck, X } from 'lucide-react';
import { Img, cn, zl } from '../components/ui';
import type { Ad, User } from '../data/mockData';

interface ChatModalProps {
  ad: Ad;
  user: User;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'me' | 'neighbor';
  text: string;
  time: string;
}

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (!textToSend) setInputText('');

    // Simulate realistic neighbor response after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_reply_${Date.now()}`,
          sender: 'neighbor',
          text: 'Super, możemy się umówić! Dziś po 17:30 będę w domu. Podaję numer klatki i domofon na priv: klatka B, domofon 18. Do zobaczenia sąsiedzie! 👋',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const quickReplies = [
    'Czy ogłoszenie jest nadal aktualne?',
    'Kiedy i gdzie mogę podejść odebrać?',
    'Czy cena podlega małej negocjacji?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 backdrop-blur-sm sm:items-center">
      <div className="flex h-[88dvh] w-full max-w-[440px] flex-col rounded-t-[36px] bg-mist shadow-float sm:h-[720px] sm:rounded-[36px] overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-mist-300 bg-white px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink hover:bg-mist-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-coral font-bold text-ink">
                {ad.author.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-display text-[15px] font-bold text-ink">{ad.author}</p>
                  <ShieldCheck className="h-4 w-4 text-sky-700" />
                </div>
                <p className="text-[11.5px] text-ink-500">ul. {ad.street} · Aktywny dzisiaj</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-mist text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Ad Context Bar */}
        <div className="flex items-center gap-3 border-b border-mist-300 bg-white/70 px-5 py-2.5 backdrop-blur shrink-0">
          <Img src={ad.image} alt="" className="h-11 w-11 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">{ad.title}</p>
            <p className="text-[12px] font-extrabold text-coral-700">
              {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Zgłoszenie'}
            </p>
          </div>
          <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-bold text-sand-700">
            ul. {ad.street}
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          <div className="text-center my-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-ink-500 shadow-sm">
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
                    'max-w-[80%] rounded-3xl p-3.5 text-[13.5px] leading-relaxed shadow-sm',
                    isMe
                      ? 'rounded-br-sm bg-ink text-white'
                      : 'rounded-bl-sm bg-white text-ink border border-mist',
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
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 w-28 text-[12px] text-ink-500 shadow-sm">
              <span className="animate-pulse">Pisze</span>
              <span className="flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ink animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-ink animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-ink animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Quick reply chips */}
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 bg-white/50 no-scrollbar shrink-0">
          {quickReplies.map((qr) => (
            <button
              key={qr}
              onClick={() => handleSend(qr)}
              className="shrink-0 rounded-full bg-white px-3 py-1 text-[11.5px] font-medium text-ink shadow-sm hover:bg-mist transition-colors"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="border-t border-mist bg-white p-3 shrink-0">
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
              className="h-11 flex-1 rounded-full bg-mist px-4 text-[13.5px] outline-none focus:ring-2 focus:ring-ink"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="grid h-11 w-11 place-items-center rounded-full bg-coral text-ink shadow-coral transition-transform active:scale-95 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
