import type {
  Ad,
  AdConversation,
  PollItem,
  Post,
  Ride,
  Street,
  User,
} from '../data/mockData';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://jqortivwlvsjuiiexvro.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxb3J0aXZ3bHZzanVpaWV4dnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMTU2MjgsImV4cCI6MjEwODc5MTYyOH0.mjqNwNnBKRouohPOp3Pa6LKu6m37Qy9xaAdWWdFA-CM';

function getHeaders(prefer?: string): HeadersInit {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
  if (prefer) {
    headers.Prefer = prefer;
  }
  return headers;
}

async function restFetch<T>(
  path: string,
  options: RequestInit = {},
  prefer?: string,
): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        ...getHeaders(prefer),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      return null;
    }
    if (res.status === 204) {
      return null;
    }
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/* ---------------- 1. Rejestracja i Weryfikacja Pocztowa (RODO AES-256) ---------------- */

export async function registerNeighborInSupabase(user: User): Promise<{
  profileId?: string;
  activationPin?: string;
  trialDaysLeft?: number;
} | null> {
  if (!user) return null;

  const result = await restFetch<{
    profile_id: string;
    activation_pin: string;
    trial_days_left: number;
  }>('rpc/register_neighbor_postal', {
    method: 'POST',
    body: JSON.stringify({
      p_name: user.name,
      p_surname: user.surname ?? '',
      p_email: user.email ?? '',
      p_street_name: user.street.name,
      p_street_as: user.street.as,
      p_house_number: user.houseNumber ?? '',
      p_flat_number: user.flatNumber ?? '',
      p_postal_code: user.postalCode ?? '05-300',
      p_city: user.city ?? 'Mińsk Mazowiecki',
      p_phone: user.phone ?? '',
      p_seed: user.seed,
    }),
  });

  if (!result) return null;
  return {
    profileId: result.profile_id,
    activationPin: result.activation_pin,
    trialDaysLeft: result.trial_days_left,
  };
}

export async function fetchStreetsFromSupabase(): Promise<Street[] | null> {
  interface DbStreet {
    name: string;
    as_form: string;
    neighbors: number;
  }
  const rows = await restFetch<DbStreet[]>('streets?select=name,as_form,neighbors&order=neighbors.desc');
  if (!rows || rows.length === 0) return null;
  return rows.map((r) => ({
    name: r.name,
    as: r.as_form,
    neighbors: r.neighbors,
  }));
}

/* ---------------- 2. Ogłoszenia Lokalne (C2C) & Czat ---------------- */

interface DbAd {
  id: string;
  title: string;
  price: number | null;
  kind: 'sell' | 'free' | 'lost';
  author: string;
  street: string;
  time_label: string;
  image: string;
  images: string[] | null;
  description: string | null;
  category: string | null;
  condition: 'Nowe' | 'Używane' | 'Bardzo dobry' | null;
  status: 'active' | 'reserved' | 'sold';
  views: number;
  is_owner: boolean;
  negotiable: boolean;
}

export async function fetchAdsFromSupabase(): Promise<Ad[] | null> {
  const rows = await restFetch<DbAd[]>('ads?select=*&order=created_at.desc');
  if (!rows || rows.length === 0) return null;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    price: r.price !== null ? Number(r.price) : null,
    kind: r.kind,
    author: r.author,
    street: r.street,
    time: r.time_label,
    image: r.image,
    images: r.images?.length ? r.images : [r.image],
    description: r.description ?? undefined,
    category: r.category ?? undefined,
    condition: r.condition ?? undefined,
    status: r.status,
    views: r.views,
    isOwner: r.is_owner,
    negotiable: r.negotiable,
  }));
}

export async function createAdInSupabase(ad: Ad): Promise<boolean> {
  const res = await restFetch<DbAd[]>(
    'ads',
    {
      method: 'POST',
      body: JSON.stringify({
        id: ad.id,
        title: ad.title,
        price: ad.price,
        kind: ad.kind,
        author: ad.author,
        street: ad.street,
        time_label: ad.time || 'teraz',
        image: ad.image,
        images: ad.images?.length ? ad.images : [ad.image],
        description: ad.description ?? null,
        category: ad.category ?? 'Inne',
        condition: ad.condition ?? null,
        status: ad.status ?? 'active',
        views: ad.views ?? 1,
        is_owner: ad.isOwner ?? true,
        negotiable: ad.negotiable ?? false,
      }),
    },
    'return=representation',
  );
  return !!res;
}

export async function updateAdInSupabase(ad: Ad): Promise<boolean> {
  await restFetch(
    `ads?id=eq.${encodeURIComponent(ad.id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        title: ad.title,
        price: ad.price,
        kind: ad.kind,
        image: ad.image,
        images: ad.images?.length ? ad.images : [ad.image],
        description: ad.description ?? null,
        category: ad.category ?? 'Inne',
        condition: ad.condition ?? null,
        status: ad.status ?? 'active',
        negotiable: ad.negotiable ?? false,
      }),
    },
    'return=minimal',
  );
  return true;
}

export async function updateAdStatusInSupabase(
  adId: string,
  status: 'active' | 'reserved' | 'sold',
): Promise<boolean> {
  await restFetch(
    `ads?id=eq.${encodeURIComponent(adId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    'return=minimal',
  );
  return true;
}

export async function deleteAdInSupabase(adId: string): Promise<boolean> {
  await restFetch(
    `ads?id=eq.${encodeURIComponent(adId)}`,
    { method: 'DELETE' },
    'return=minimal',
  );
  return true;
}

export async function reserveAdInSupabase(
  ad: Ad,
  buyer: User,
  details: { spot: string; time: string; phone: string; note: string },
  conversation: AdConversation,
): Promise<void> {
  await Promise.all([
    updateAdStatusInSupabase(ad.id, 'reserved'),
    restFetch(
      'ad_reservations',
      {
        method: 'POST',
        body: JSON.stringify({
          ad_id: ad.id,
          buyer_name: buyer.name,
          buyer_street: buyer.street.name,
          spot: details.spot,
          pickup_time: details.time,
          phone: details.phone,
          note: details.note,
        }),
      },
      'return=minimal',
    ),
    restFetch(
      'ad_conversations',
      {
        method: 'POST',
        body: JSON.stringify({
          id: conversation.id,
          ad_id: conversation.adId,
          ad_title: conversation.adTitle,
          ad_price: conversation.adPrice,
          ad_image: conversation.adImage,
          ad_street: conversation.adStreet,
          other_user_name: conversation.otherUser.name,
          other_user_street: conversation.otherUser.street,
          other_user_avatar_seed: conversation.otherUser.avatarSeed ?? null,
          role: conversation.role,
          last_message: conversation.lastMessage,
          last_message_time: conversation.lastMessageTime,
          unread_count: conversation.unreadCount,
        }),
      },
      'resolution=merge-duplicates,return=minimal',
    ),
  ]);
}

export async function reportAdInSupabase(
  adId: string,
  reason: string,
  details?: string,
): Promise<void> {
  await restFetch(
    'ad_reports',
    {
      method: 'POST',
      body: JSON.stringify({
        ad_id: adId,
        reason,
        details: details ?? null,
      }),
    },
    'return=minimal',
  );
}

interface DbConversation {
  id: string;
  ad_id: string;
  ad_title: string;
  ad_price: number | null;
  ad_image: string;
  ad_street: string;
  other_user_name: string;
  other_user_street: string;
  other_user_avatar_seed: string | null;
  role: 'buyer' | 'seller';
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export async function fetchConversationsFromSupabase(): Promise<AdConversation[] | null> {
  const rows = await restFetch<DbConversation[]>(
    'ad_conversations?select=*&order=updated_at.desc',
  );
  if (!rows || rows.length === 0) return null;
  return rows.map((r) => ({
    id: r.id,
    adId: r.ad_id,
    adTitle: r.ad_title,
    adPrice: r.ad_price !== null ? Number(r.ad_price) : null,
    adImage: r.ad_image,
    adStreet: r.ad_street,
    otherUser: {
      name: r.other_user_name,
      street: r.other_user_street,
      avatarSeed: r.other_user_avatar_seed ?? undefined,
    },
    role: r.role,
    lastMessage: r.last_message,
    lastMessageTime: r.last_message_time,
    unreadCount: r.unread_count,
  }));
}

export interface ChatMessageItem {
  id: string;
  sender: 'me' | 'neighbor';
  text: string;
  time: string;
}

interface DbMessage {
  id: string;
  ad_id: string;
  sender: 'me' | 'neighbor';
  sender_name: string;
  text: string;
  time_label: string;
}

export async function fetchAdMessagesFromSupabase(
  adId: string,
): Promise<ChatMessageItem[] | null> {
  const rows = await restFetch<DbMessage[]>(
    `ad_messages?ad_id=eq.${encodeURIComponent(adId)}&select=*&order=created_at.asc`,
  );
  if (!rows || rows.length === 0) return null;
  return rows.map((r) => ({
    id: r.id,
    sender: r.sender,
    text: r.text,
    time: r.time_label,
  }));
}

export async function sendAdMessageInSupabase(
  adId: string,
  msg: ChatMessageItem,
  senderName: string,
): Promise<void> {
  await restFetch(
    'ad_messages',
    {
      method: 'POST',
      body: JSON.stringify({
        id: msg.id,
        ad_id: adId,
        sender: msg.sender,
        sender_name: senderName,
        text: msg.text,
        time_label: msg.time,
      }),
    },
    'return=minimal',
  );
}

/* ---------------- 3. Ankiety Społecznościowe (Polls) ---------------- */

interface DbPollOption {
  option_id: string;
  name: string;
  votes: number;
  sort_order: number;
}

interface DbPoll {
  id: string;
  title: string;
  author: string;
  author_street: string;
  category: 'city' | 'neighborhood' | 'culture' | 'investments';
  is_official: boolean;
  duration_days: number;
  total_votes: number;
  created_at: string;
  expires_at: string;
  poll_options: DbPollOption[];
}

export async function fetchPollsFromSupabase(): Promise<PollItem[] | null> {
  const rows = await restFetch<DbPoll[]>(
    'polls?select=*,poll_options(option_id,name,votes,sort_order)&order=created_at.desc',
  );
  if (!rows || rows.length === 0) return null;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    author: r.author,
    authorStreet: r.author_street,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    durationDays: r.duration_days,
    totalVotes: r.total_votes,
    category: r.category,
    isOfficial: r.is_official,
    options: (r.poll_options || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({
        id: o.option_id,
        name: o.name,
        votes: o.votes,
      })),
  }));
}

export async function createPollInSupabase(poll: PollItem): Promise<void> {
  await restFetch(
    'polls',
    {
      method: 'POST',
      body: JSON.stringify({
        id: poll.id,
        title: poll.title,
        author: poll.author,
        author_street: poll.authorStreet,
        category: poll.category ?? 'neighborhood',
        is_official: poll.isOfficial ?? false,
        duration_days: poll.durationDays,
        total_votes: poll.totalVotes,
        created_at: poll.createdAt,
        expires_at: poll.expiresAt,
      }),
    },
    'return=minimal',
  );

  if (poll.options.length > 0) {
    await restFetch(
      'poll_options',
      {
        method: 'POST',
        body: JSON.stringify(
          poll.options.map((o, idx) => ({
            poll_id: poll.id,
            option_id: o.id,
            name: o.name,
            votes: o.votes,
            sort_order: idx + 1,
          })),
        ),
      },
      'return=minimal',
    );
  }
}

export async function castPollVoteInSupabase(
  pollId: string,
  optionId: string,
  voterKey: string,
): Promise<void> {
  await restFetch('rpc/cast_poll_vote', {
    method: 'POST',
    body: JSON.stringify({
      p_poll_id: pollId,
      p_option_id: optionId,
      p_voter_key: voterKey,
    }),
  });
}

/* ---------------- 4. Strefa Przejazdu (Carpooling) ---------------- */

interface DbRide {
  id: string;
  driver: string;
  driver_as: string;
  rating: number;
  rides_count: number;
  from_spot: string;
  to_spot: string;
  dest: string;
  depart: string;
  arrive: string;
  seats: number;
  price: number;
  car: string;
}

export async function fetchRidesFromSupabase(): Promise<Ride[] | null> {
  const rows = await restFetch<DbRide[]>('rides?select=*&order=created_at.desc');
  if (!rows || rows.length === 0) return null;
  return rows.map((r) => ({
    id: r.id,
    driver: r.driver,
    driverAs: r.driver_as,
    rating: Number(r.rating),
    rides: r.rides_count,
    from: r.from_spot,
    to: r.to_spot,
    dest: r.dest,
    depart: r.depart,
    arrive: r.arrive,
    seats: r.seats,
    price: Number(r.price),
    car: r.car,
  }));
}

export async function createRideInSupabase(ride: Ride): Promise<void> {
  await restFetch(
    'rides',
    {
      method: 'POST',
      body: JSON.stringify({
        id: ride.id,
        driver: ride.driver,
        driver_as: ride.driverAs,
        rating: ride.rating,
        rides_count: ride.rides,
        from_spot: ride.from,
        to_spot: ride.to,
        dest: ride.dest,
        depart: ride.depart,
        arrive: ride.arrive,
        seats: ride.seats,
        price: ride.price,
        car: ride.car,
      }),
    },
    'return=minimal',
  );
}

export async function deleteRideInSupabase(rideId: string): Promise<void> {
  await restFetch(
    `rides?id=eq.${encodeURIComponent(rideId)}`,
    { method: 'DELETE' },
    'return=minimal',
  );
}

/* ---------------- 5. Strefa Rozmów (Miński X / Twitter) ---------------- */

interface DbPost {
  id: string;
  author: string;
  author_as: string;
  time_label: string;
  content: string;
  image: string | null;
  likes: number;
  replies: number;
  reposts: number;
  views: number;
}

export async function fetchPostsFromSupabase(): Promise<Post[] | null> {
  const rows = await restFetch<DbPost[]>('posts?select=*&order=created_at.desc');
  if (!rows || rows.length === 0) return null;
  return rows.map((r) => ({
    id: r.id,
    author: r.author,
    authorAs: r.author_as,
    time: r.time_label,
    content: r.content,
    image: r.image ?? undefined,
    likes: r.likes,
    replies: r.replies,
    reposts: r.reposts,
    views: r.views,
  }));
}

export async function createPostInSupabase(post: Post): Promise<void> {
  await restFetch(
    'posts',
    {
      method: 'POST',
      body: JSON.stringify({
        id: post.id,
        author: post.author,
        author_as: post.authorAs,
        time_label: post.time || 'teraz',
        content: post.content,
        image: post.image ?? null,
        likes: post.likes,
        replies: post.replies,
        reposts: post.reposts,
        views: post.views,
      }),
    },
    'return=minimal',
  );
}

export async function togglePostLikeInSupabase(
  postId: string,
  delta: 1 | -1,
): Promise<void> {
  await restFetch('rpc/increment_post_likes', {
    method: 'POST',
    body: JSON.stringify({
      p_post_id: postId,
      p_delta: delta,
    }),
  });
}
