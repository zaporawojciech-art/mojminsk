import {
  formatRelativeChatTime,
  type Ad,
  type PollItem,
  type Post,
  type PostComment,
  type Ride,
  type Street,
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
  status: 'active' | 'reserved' | 'sold' | 'expired';
  views: number;
  is_owner: boolean;
  negotiable: boolean;
  created_at: string;
  expires_at?: string | null;
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
    time: formatRelativeChatTime(r.created_at) || r.time_label,
    image: r.image,
    images: r.images?.length ? r.images : [r.image],
    description: r.description ?? undefined,
    category: r.category ?? undefined,
    condition: r.condition ?? undefined,
    status: r.status,
    views: r.views,
    negotiable: r.negotiable,
    createdAt: r.created_at,
    expiresAt: r.expires_at ?? undefined,
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
    time_label: ad.time || 'przed chwilą',
    image: ad.image,
    images: ad.images?.length ? ad.images : [ad.image],
    description: ad.description ?? null,
    category: ad.category ?? 'Inne',
    condition: ad.condition ?? null,
    status: ad.status ?? 'active',
    views: ad.views ?? 1,
    negotiable: ad.negotiable ?? false,
    expires_at: ad.expiresAt ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
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

export async function renewAd14DaysInSupabase(adId: string): Promise<string | null> {
  const res = await restFetch<string>('rpc/renew_ad_14_days', {
    method: 'POST',
    body: JSON.stringify({ p_ad_id: adId }),
  });
  return res;
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

export interface AdReportItem {
  id: string;
  adId: string;
  reason: string;
  details?: string | null;
  createdAt: string;
}

export async function fetchAdReportsFromSupabase(): Promise<AdReportItem[] | null> {
  const rows = await restFetch<
    Array<{
      id: string;
      ad_id: string;
      reason: string;
      details: string | null;
      created_at: string;
    }>
  >('ad_reports?select=*&order=created_at.desc');
  if (!rows) return null;
  return rows.map((r) => ({
    id: r.id,
    adId: r.ad_id,
    reason: r.reason,
    details: r.details,
    createdAt: r.created_at,
  }));
}

export async function dismissAdReportInSupabase(reportId: string): Promise<boolean> {
  await restFetch(
    `ad_reports?id=eq.${encodeURIComponent(reportId)}`,
    { method: 'DELETE' },
    'return=minimal',
  );
  return true;
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
  author_profile_id?: string | null;
  time_label: string;
  content: string;
  image: string | null;
  likes: number;
  replies: number;
  reposts: number;
  views: number;
  created_at: string;
}

interface DbPostComment {
  id: string;
  post_id: string;
  author: string;
  author_as: string;
  author_profile_id?: string | null;
  content: string;
  created_at: string;
}

export async function fetchPostsFromSupabase(): Promise<Post[] | null> {
  const rows = await restFetch<DbPost[]>('posts?select=*&order=created_at.desc');
  if (!rows || rows.length === 0) return [];
  return rows.map((r) => ({
    id: r.id,
    author: r.author,
    authorAs: r.author_as,
    authorProfileId: r.author_profile_id ?? undefined,
    time: formatRelativeChatTime(r.created_at) || r.time_label,
    content: r.content,
    image: r.image ?? undefined,
    likes: r.likes,
    replies: r.replies,
    reposts: r.reposts,
    views: r.views,
    createdAt: r.created_at,
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
        author_profile_id: post.authorProfileId ?? null,
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

export async function deletePostInSupabase(postId: string): Promise<boolean> {
  const res = await restFetch(`posts?id=eq.${encodeURIComponent(postId)}`, {
    method: 'DELETE',
  });
  return res !== null;
}

export async function incrementPostViewsInSupabase(postId: string): Promise<void> {
  await restFetch('rpc/increment_post_views', {
    method: 'POST',
    body: JSON.stringify({ p_post_id: postId }),
  });
}

export async function fetchCommentsForPost(postId: string): Promise<PostComment[]> {
  const rows = await restFetch<DbPostComment[]>(
    `post_comments?post_id=eq.${encodeURIComponent(postId)}&select=*&order=created_at.asc`,
  );
  if (!rows || rows.length === 0) return [];
  return rows.map((r) => ({
    id: r.id,
    postId: r.post_id,
    author: r.author,
    authorAs: r.author_as,
    authorProfileId: r.author_profile_id ?? undefined,
    content: r.content,
    createdAt: r.created_at,
    time: formatRelativeChatTime(r.created_at),
  }));
}

export async function createCommentInSupabase(comment: {
  id: string;
  postId: string;
  author: string;
  authorAs: string;
  authorProfileId?: string;
  content: string;
}): Promise<boolean> {
  const res = await restFetch(
    'post_comments',
    {
      method: 'POST',
      body: JSON.stringify({
        id: comment.id,
        post_id: comment.postId,
        author: comment.author,
        author_as: comment.authorAs,
        author_profile_id: comment.authorProfileId ?? null,
        content: comment.content,
      }),
    },
    'return=minimal',
  );
  return res !== null;
}

export async function deleteCommentInSupabase(commentId: string): Promise<boolean> {
  const res = await restFetch(`post_comments?id=eq.${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  });
  return res !== null;
}

export async function fetchUserLikedPostIds(profileId: string): Promise<string[]> {
  interface DbLike {
    post_id: string;
  }
  const rows = await restFetch<DbLike[]>(
    `post_likes?profile_id=eq.${encodeURIComponent(profileId)}&select=post_id`,
  );
  if (!rows) return [];
  return rows.map((r) => r.post_id);
}

export async function togglePostLikeInSupabase(
  postId: string,
  profileId?: string,
): Promise<{ liked: boolean; likesDelta: number }> {
  if (profileId) {
    const isLiked = await supabaseRpc<boolean>('toggle_post_user_like', {
      p_post_id: postId,
      p_profile_id: profileId,
    });
    return { liked: Boolean(isLiked), likesDelta: isLiked ? 1 : -1 };
  }
  await restFetch('rpc/increment_post_likes', {
    method: 'POST',
    body: JSON.stringify({
      p_post_id: postId,
      p_delta: 1,
    }),
  });
  return { liked: true, likesDelta: 1 };
}

export async function reportPostInSupabase(report: {
  postId: string;
  reporterProfileId?: string;
  reason: string;
  details?: string;
}): Promise<boolean> {
  const res = await restFetch(
    'post_reports',
    {
      method: 'POST',
      body: JSON.stringify({
        post_id: report.postId,
        reporter_profile_id: report.reporterProfileId ?? null,
        reason: report.reason,
        details: report.details ?? null,
      }),
    },
    'return=minimal',
  );
  return res !== null;
}
