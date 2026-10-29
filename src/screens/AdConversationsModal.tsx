import { useEffect, useState } from 'react';
import {
  MessagesSquare,
  Search,
  Tag,
} from 'lucide-react';
import { Img, NativeHeader, cn, zl } from '../components/ui';
import { avatarUrl, type Ad, type AdConversation, type User } from '../data/mockData';
import { ChatModal } from './ChatModal';

interface AdConversationsModalProps {
  user: User;
  conversations: AdConversation[];
  ads: Ad[];
  initialConversationId?: string | null;
  onClose: () => void;
  onOpenChat: (ad: Ad, conversation?: AdConversation) => void;
  onRefreshConversations?: () => void;
  isClosing?: boolean;
}

export function AdConversationsModal({
  user,
  conversations,
  ads,
  initialConversationId = null,
  onClose,
  onOpenChat,
  onRefreshConversations,
  isClosing = false,
}: AdConversationsModalProps) {
  const [tab, setTab] = useState<'all' | 'seller' | 'buyer'>('all');
  const [search, setSearch] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    () => initialConversationId ?? conversations[0]?.id ?? null,
  );

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConvId(initialConversationId);
    }
  }, [initialConversationId]);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredConversations = conversations.filter((c) => {
    if (tab !== 'all' && c.role !== tab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = c.adTitle.toLowerCase().includes(q);
      const matchUser = c.otherUser.name.toLowerCase().includes(q);
      const matchStreet = c.otherUser.street.toLowerCase().includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      return matchTitle || matchUser || matchStreet || matchMsg;
    }
    return true;
  });

  const unreadTotal = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const getAdForConversation = (conv: AdConversation): Ad => {
    const foundAd = ads.find((a) => a.id === conv.adId);
    if (foundAd) return foundAd;
    return {
      id: conv.adId,
      title: conv.adTitle,
      price: conv.adPrice,
      kind: conv.adPrice ? 'sell' : 'free',
      author: conv.otherUser.name,
      street: conv.adStreet,
      time: 'Dzisiaj',
      image: conv.adImage,
    };
  };

  const handleSelectConversation = (conv: AdConversation) => {
    setSelectedConvId(conv.id);
    const targetAd = getAdForConversation(conv);
    // On mobile (<768px), open the separate full-screen ChatModal layer
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onOpenChat(targetAd, conv);
    }
  };

  const activeConv = conversations.find((c) => c.id === selectedConvId) ?? conversations[0];
  const activeAd = activeConv ? getAdForConversation(activeConv) : null;

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col md:flex-row overflow-hidden bg-white">
        {/* LEFT COLUMN: Inbox & Conversations List */}
        <div className="flex h-full w-full md:w-80 lg:w-96 shrink-0 flex-col border-r border-mist-300 bg-mist">
          {/* Top Native Header */}
          <NativeHeader
            title="Czat sąsiedzki"
            backLabel="Profil"
            onBack={onClose}
            right={
              unreadTotal > 0 ? (
                <span className="mr-1 rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold text-ink">
                  {unreadTotal} nowe
                </span>
              ) : undefined
            }
          />

          {/* Tabs: Wszystkie / Sprzedaję / Kupuję */}
          <div className="bg-white px-4 pt-2 pb-3 border-b border-mist">
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-mist p-1">
              <button
                type="button"
                onClick={() => setTab('all')}
                className={cn(
                  'rounded-xl py-2 text-[12.5px] font-bold transition-all',
                  tab === 'all' ? 'bg-white text-ink shadow-sm' : 'text-ink-500 hover:text-ink',
                )}
              >
                Wszystkie ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('seller')}
                className={cn(
                  'rounded-xl py-2 text-[12.5px] font-bold transition-all',
                  tab === 'seller' ? 'bg-white text-ink shadow-sm' : 'text-ink-500 hover:text-ink',
                )}
              >
                Sprzedaję ({conversations.filter((c) => c.role === 'seller').length})
              </button>
              <button
                type="button"
                onClick={() => setTab('buyer')}
                className={cn(
                  'rounded-xl py-2 text-[12.5px] font-bold transition-all',
                  tab === 'buyer' ? 'bg-white text-ink shadow-sm' : 'text-ink-500 hover:text-ink',
                )}
              >
                Kupuję ({conversations.filter((c) => c.role === 'buyer').length})
              </button>
            </div>

            {/* Search bar inside inbox */}
            <div className="mt-2.5 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Szukaj sąsiada, przedmiotu..."
                className="h-10 w-full rounded-xl bg-mist/60 pl-9 pr-4 text-[13px] text-ink placeholder:text-ink-400 outline-none focus:bg-mist"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-ink-400" />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5">
            {filteredConversations.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center shadow-card mt-4">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mist text-ink-400">
                  <MessagesSquare className="h-7 w-7" />
                </div>
                <h3 className="mt-3 font-display text-[17px] font-bold text-ink">Brak wiadomości</h3>
                <p className="mt-1 text-[13px] text-ink-500 max-w-[240px] mx-auto">
                  {tab === 'seller'
                    ? 'Gdy sąsiedzi napiszą do Ciebie w sprawie Twoich ogłoszeń, rozmowy pojawią się tutaj.'
                    : 'Napisz do sąsiada z poziomu dowolnego ogłoszenia, aby rozpocząć konwersację.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isUnread = conv.unreadCount > 0;
                const isSelected = conv.id === selectedConvId;
                return (
                  <article
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={cn(
                      'group relative cursor-pointer rounded-3xl p-3.5 shadow-card transition-all active:scale-[0.99] hover:shadow-float',
                      isSelected
                        ? 'bg-white ring-2 ring-ink shadow-md'
                        : isUnread
                          ? 'bg-white border-2 border-coral/30'
                          : 'bg-white',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Item thumbnail */}
                      <div className="relative shrink-0">
                        <Img
                          src={conv.adImage}
                          alt={conv.adTitle}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        {/* Avatar badge on item */}
                        <img
                          src={avatarUrl(conv.otherUser.avatarSeed ?? conv.otherUser.name)}
                          alt={conv.otherUser.name}
                          className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full border-2 border-white bg-mist"
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="font-display text-[14.5px] font-bold text-ink truncate">
                              {conv.otherUser.name}
                            </p>
                            <span className="rounded-full bg-mist px-1.5 py-0.2 text-[9.5px] font-bold text-ink-500">
                              {conv.role === 'seller' ? 'Kupujący' : 'Sprzedający'}
                            </span>
                          </div>
                          <span className="text-[11px] text-ink-400 shrink-0">{conv.lastMessageTime}</span>
                        </div>

                        {/* Ad title and price */}
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-ink-600 flex items-center gap-1">
                          <Tag className="h-3 w-3 text-coral shrink-0" />
                          <span className="truncate">{conv.adTitle}</span>
                          <span className="text-coral font-bold shrink-0">
                            · {conv.adPrice ? zl(conv.adPrice) : 'Za darmo'}
                          </span>
                        </p>

                        {/* Last message snippet */}
                        <p
                          className={cn(
                            'mt-1.5 line-clamp-1 text-[13px]',
                            isUnread ? 'font-bold text-ink' : 'text-ink-500',
                          )}
                        >
                          {conv.lastMessage}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {isUnread && (
                        <div className="grid h-5 w-5 place-items-center rounded-full bg-coral text-[10px] font-bold text-ink shrink-0 mt-1">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat (Visible on Desktop >= 768px) */}
        <div className="hidden md:flex flex-1 flex-col h-full bg-mist overflow-hidden">
          {activeAd && activeConv ? (
            <ChatModal
              key={activeConv.id}
              ad={activeAd}
              user={user}
              conversationId={activeConv.id}
              otherUser={activeConv.otherUser}
              onClose={() => setSelectedConvId(null)}
              onConversationUpdated={onRefreshConversations}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-ink-400">
              <MessagesSquare className="h-12 w-12 text-ink-300 mb-3" />
              <p className="font-display text-[16px] font-bold text-ink">Wybierz rozmowę z listy</p>
              <p className="text-[13px] text-ink-400 mt-1">Czatuj bezpiecznie z sąsiadami z Twojej okolicy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
