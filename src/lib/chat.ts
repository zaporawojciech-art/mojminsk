import { formatRelativeChatTime, type Ad, type AdConversation } from '../data/mockData';
import {
  getAuthHeaders,
  SUPABASE_URL,
  supabaseRest,
  supabaseRpc,
  subscribePostgresChanges,
} from './supabaseClient';

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  kind: 'text' | 'system';
  createdAt: string;
  timeLabel: string;
  pending?: boolean;
  failed?: boolean;
}

interface DbConversationRow {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string | null;
  buyer_unread: number;
  seller_unread: number;
  created_at: string;
}

interface DbMessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  kind: 'text' | 'system';
  created_at: string;
}

interface DbPublicProfileRow {
  id: string;
  name: string;
  street_name: string;
  street_as: string;
  seed: string;
}

interface DbAdSummaryRow {
  id: string;
  title: string;
  price: number | null;
  image: string;
  street: string;
}

function formatClockTime(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return 'Teraz';
  return new Date(ts).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapDbMessage(row: DbMessageRow): ChatMessageItem {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    kind: row.kind || 'text',
    createdAt: row.created_at,
    timeLabel: formatClockTime(row.created_at),
  };
}

export async function startConversation(
  adId: string,
): Promise<{ conversationId: string | null; error: string | null }> {
  const { data, error } = await supabaseRpc<string>('start_conversation', {
    p_ad_id: adId,
  });
  return { conversationId: data, error };
}

export async function fetchConversations(
  myProfileId: string,
  localAds: Ad[] = [],
): Promise<AdConversation[]> {
  if (!myProfileId) return [];

  const convRows = await supabaseRest<DbConversationRow[]>(
    'conversations?select=*&order=last_message_at.desc.nullslast',
  );
  if (!convRows || convRows.length === 0) return [];

  const otherProfileIds = Array.from(
    new Set(
      convRows.map((c) => (c.buyer_id === myProfileId ? c.seller_id : c.buyer_id)),
    ),
  );
  const adIds = Array.from(new Set(convRows.map((c) => c.ad_id)));

  const [profiles, dbAds] = await Promise.all([
    otherProfileIds.length > 0
      ? supabaseRest<DbPublicProfileRow[]>(
          `public_profiles?id=in.(${otherProfileIds.map((id) => `"${id}"`).join(',')})&select=id,name,street_name,street_as,seed`,
        )
      : Promise.resolve([]),
    adIds.length > 0
      ? supabaseRest<DbAdSummaryRow[]>(
          `ads?id=in.(${adIds.map((id) => `"${id}"`).join(',')})&select=id,title,price,image,street`,
        )
      : Promise.resolve([]),
  ]);

  const profileMap = new Map<string, DbPublicProfileRow>();
  (profiles ?? []).forEach((p) => profileMap.set(p.id, p));

  const adMap = new Map<string, DbAdSummaryRow>();
  (dbAds ?? []).forEach((a) => adMap.set(a.id, a));

  return convRows.map((row) => {
    const isBuyer = row.buyer_id === myProfileId;
    const otherId = isBuyer ? row.seller_id : row.buyer_id;
    const otherProfile = profileMap.get(otherId);
    const dbAd = adMap.get(row.ad_id);
    const fallbackAd = localAds.find((a) => a.id === row.ad_id);

    const adTitle = dbAd?.title ?? fallbackAd?.title ?? 'Ogłoszenie sąsiedzkie';
    const adPrice =
      dbAd !== undefined
        ? dbAd.price !== null
          ? Number(dbAd.price)
          : null
        : fallbackAd?.price ?? null;
    const adImage = dbAd?.image ?? fallbackAd?.image ?? '';
    const adStreet = dbAd?.street ?? fallbackAd?.street ?? 'Mińsk Mazowiecki';

    const lastAt = row.last_message_at || row.created_at;

    return {
      id: row.id,
      adId: row.ad_id,
      adTitle,
      adPrice,
      adImage,
      adStreet,
      otherUser: {
        profileId: otherId,
        name: otherProfile?.name ?? fallbackAd?.author ?? 'Sąsiad',
        street: otherProfile?.street_name ?? adStreet,
        streetAs: otherProfile?.street_as,
        avatarSeed: otherProfile?.seed,
      },
      role: isBuyer ? 'buyer' : 'seller',
      lastMessage: row.last_message || 'Rozpoczęto rozmowę',
      lastMessageTime: formatRelativeChatTime(lastAt),
      lastMessageAt: lastAt,
      unreadCount: isBuyer ? row.buyer_unread : row.seller_unread,
    };
  });
}

export async function fetchMessages(conversationId: string): Promise<ChatMessageItem[]> {
  if (!conversationId) return [];
  const rows = await supabaseRest<DbMessageRow[]>(
    `messages?conversation_id=eq.${encodeURIComponent(conversationId)}&select=*&order=created_at.asc`,
  );
  return (rows ?? []).map(mapDbMessage);
}

export async function sendMessage(
  conversationId: string,
  senderProfileId: string,
  body: string,
): Promise<{ message: ChatMessageItem | null; error: string | null }> {
  try {
    const headers = await getAuthHeaders('return=representation');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: senderProfileId,
        body: body.trim(),
        kind: 'text',
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      let errMsg = 'Nie udało się wysłać wiadomości.';
      try {
        const parsed = JSON.parse(text);
        errMsg = parsed?.message || parsed?.error_description || errMsg;
      } catch {
        // ignore
      }
      return { message: null, error: errMsg };
    }
    const rows = JSON.parse(text) as DbMessageRow[];
    const created = rows?.[0];
    return { message: created ? mapDbMessage(created) : null, error: null };
  } catch (err) {
    return {
      message: null,
      error: err instanceof Error ? err.message : 'Błąd połączenia z serwerem.',
    };
  }
}

export async function markConversationRead(conversationId: string): Promise<void> {
  if (!conversationId) return;
  await supabaseRpc('mark_conversation_read', {
    p_conversation_id: conversationId,
  });
}

export async function reserveAdWithMessage(
  adId: string,
  details: { spot: string; time: string; phone: string; note: string },
): Promise<{ conversationId: string | null; error: string | null }> {
  const { data, error } = await supabaseRpc<string | null>('reserve_ad_with_message', {
    p_ad_id: adId,
    p_spot: details.spot,
    p_pickup_time: details.time,
    p_phone: details.phone || null,
    p_note: details.note || null,
  });
  return { conversationId: data, error };
}

export function subscribeToConversationMessages(
  conversationId: string,
  onNewMessage: (msg: ChatMessageItem) => void,
  onPoll?: () => void,
): () => void {
  return subscribePostgresChanges<DbMessageRow>({
    channelName: `messages:${conversationId}`,
    table: 'messages',
    event: 'INSERT',
    filter: `conversation_id=eq.${conversationId}`,
    onRecord: (row) => {
      if (row && row.conversation_id === conversationId) {
        onNewMessage(mapDbMessage(row));
      }
    },
    onPoll,
    pollIntervalMs: 4000,
  });
}

export function subscribeToInboxChanges(
  myProfileId: string,
  onInboxChanged: () => void,
): () => void {
  if (!myProfileId) return () => {};
  return subscribePostgresChanges<DbConversationRow>({
    channelName: `inbox:${myProfileId}`,
    table: 'conversations',
    event: '*',
    onRecord: (row) => {
      if (!row || row.buyer_id === myProfileId || row.seller_id === myProfileId) {
        onInboxChanged();
      }
    },
    onPoll: onInboxChanged,
    pollIntervalMs: 8000,
  });
}
