import type {
  Ad,
  PollItem,
  Post,
  Ride,
  Street,
} from '../data/mockData';
import { supabaseRest, supabaseRpc } from './supabaseClient';

async function restFetch<T>(
  path: string,
  options: RequestInit = {},
  prefer?: string,
): Promise<T | null> {
  return supabaseRest<T>(path, options, prefer);
}

/* ---------------- 1. Ulice i Sołectwa ---------------- */

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
  author_id: string | null;
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
  if (!rows) return null;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    price: r.price !== null ? Number(r.price) : null,
    kind: r.kind,
    author: r.author,
    authorId: r.author_id,
    street: r.street,
    time: r.time_label,
    image: r.image,
    images: r.images?.length ? r.images : [r.image],
    description: r.description ?? undefined,
    category: r.category ?? undefined,
    condition: r.condition ?? undefined,
    status: r.status,
    views: r.views,
    negotiable: r.negotiable,
  }));
}

export async function createAdInSupabase(ad: Ad): Promise<boolean> {
  const payload: Record<string, unknown> = {
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
    negotiable: ad.negotiable ?? false,
  };
  if (ad.authorId) {
    payload.author_id = ad.authorId;
  }

  const res = await restFetch<DbAd[]>(
    'ads',
    {
      method: 'POST',
      body: JSON.stringify(payload),
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

export async function incrementAdViewsInSupabase(adId: string): Promise<number | null> {
  const res = await supabaseRpc<number>('increment_ad_views', { p_ad_id: adId });
  return res.data;
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
  if (!rows) return null;
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
  if (!rows) return null;
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
