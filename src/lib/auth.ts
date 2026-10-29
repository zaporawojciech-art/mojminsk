import { streets, type Street, type User, type UserPrivacy } from '../data/mockData';
import {
  ensureValidAccessToken,
  getAuthSession,
  onAuthSessionChange,
  setAuthSession,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  supabaseRest,
  type AuthSession,
} from './supabaseClient';

export interface SignUpNeighborInput {
  email: string;
  password: string;
  name: string;
  surname?: string;
  street: Street;
  houseNumber?: string;
  flatNumber?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  seed: string;
}

interface DbProfileRow {
  id: string;
  auth_user_id: string;
  name: string;
  email: string | null;
  street_name: string;
  street_as: string;
  city: string;
  postal_code: string;
  phone: string | null;
  seed: string;
  rerolls: number;
  verified: boolean;
  activation_pin: string | null;
  privacy: UserPrivacy | null;
}

export function translateAuthError(rawMessage: string): string {
  const msg = (rawMessage || '').toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'Nieprawidłowy adres e-mail lub hasło.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Potwierdź swój adres e-mail — kliknij link aktywacyjny wysłany na Twoją skrzynkę.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Konto z tym adresem e-mail już istnieje. Zaloguj się.';
  }
  if (msg.includes('password should be at least')) {
    return 'Hasło musi mieć co najmniej 6 znaków.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('security purposes')) {
    return 'Zbyt wiele prób w krótkim czasie. Odczekaj chwilę i spróbuj ponownie.';
  }
  if (msg.includes('unable to validate email') || msg.includes('invalid email')) {
    return 'Wprowadź prawidłowy adres e-mail.';
  }
  return rawMessage || 'Wystąpił błąd autoryzacji. Spróbuj ponownie.';
}

export async function fetchMyProfile(): Promise<User | null> {
  const session = getAuthSession();
  if (!session?.user?.id) return null;

  const rows = await supabaseRest<DbProfileRow[]>(
    `profiles?auth_user_id=eq.${encodeURIComponent(session.user.id)}&select=*&limit=1`,
  );
  const row = rows?.[0];
  if (!row) return null;

  const matchedStreet = streets.find((s) => s.name === row.street_name);
  const streetObj: Street = matchedStreet ?? {
    name: row.street_name,
    as: row.street_as,
    neighbors: 1,
  };

  return {
    profileId: row.id,
    name: row.name,
    email: row.email ?? session.user.email,
    street: streetObj,
    city: row.city,
    postalCode: row.postal_code,
    phone: row.phone ?? undefined,
    seed: row.seed,
    rerolls: row.rerolls ?? 3,
    verified: true,
    trialDaysLeft: 14,
    activationPin: row.activation_pin ?? undefined,
    privacy: row.privacy ?? {
      showStats: true,
      showPastAds: true,
      showRides: true,
    },
  };
}

export async function signUpNeighbor(input: SignUpNeighborInput): Promise<{
  user: User | null;
  needsEmailConfirm: boolean;
  error: string | null;
}> {
  try {
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/logowanie` : undefined;
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/signup${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ''}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: input.email.trim(),
          password: input.password,
          data: {
            name: input.name.trim(),
            surname: input.surname?.trim() || '',
            street_name: input.street.name,
            street_as: input.street.as,
            house_number: input.houseNumber?.trim() || '',
            flat_number: input.flatNumber?.trim() || '',
            postal_code: input.postalCode?.trim() || '05-300',
            city: input.city?.trim() || 'Mińsk Mazowiecki',
            phone: input.phone?.trim() || '',
            seed: input.seed,
          },
        }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.msg || data?.error_description || data?.message || 'Błąd rejestracji';
      return { user: null, needsEmailConfirm: false, error: translateAuthError(errMsg) };
    }

    const accessToken = data?.access_token || data?.session?.access_token;
    const refreshToken = data?.refresh_token || data?.session?.refresh_token;
    const authUser = data?.user || data?.session?.user;

    if (accessToken && refreshToken && authUser?.id) {
      const session: AuthSession = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at:
          data?.expires_at ||
          data?.session?.expires_at ||
          Math.floor(Date.now() / 1000) + Number(data?.expires_in || 3600),
        user: authUser,
      };
      setAuthSession(session);
      const profile = await fetchMyProfile();
      return { user: profile, needsEmailConfirm: false, error: null };
    }

    return { user: null, needsEmailConfirm: true, error: null };
  } catch (err) {
    return {
      user: null,
      needsEmailConfirm: false,
      error: err instanceof Error ? translateAuthError(err.message) : 'Błąd połączenia z serwerem.',
    };
  }
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg =
        data?.msg || data?.error_description || data?.message || 'Nieprawidłowe dane logowania';
      return { user: null, error: translateAuthError(errMsg) };
    }

    const session: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at:
        data.expires_at || Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
      user: data.user,
    };
    setAuthSession(session);

    const profile = await fetchMyProfile();
    return { user: profile, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? translateAuthError(err.message) : 'Błąd połączenia z serwerem.',
    };
  }
}

export async function signOut(): Promise<void> {
  try {
    const token = await ensureValidAccessToken();
    if (token && token !== SUPABASE_ANON_KEY) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // ignore network error on logout
  } finally {
    setAuthSession(null);
  }
}

export async function resetPasswordForEmail(
  email: string,
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/logowanie` : undefined;
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/recover${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ''}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errMsg = data?.msg || data?.error_description || data?.message || 'Nie udało się wysłać linku.';
      return { ok: false, error: translateAuthError(errMsg) };
    }
    return { ok: true, error: null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? translateAuthError(err.message) : 'Błąd połączenia.',
    };
  }
}

export async function updateMyProfileInSupabase(user: User): Promise<void> {
  const session = getAuthSession();
  if (!session?.user?.id) return;
  await supabaseRest(
    `profiles?auth_user_id=eq.${encodeURIComponent(session.user.id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        name: user.name,
        street_name: user.street.name,
        street_as: user.street.as,
        city: user.city ?? 'Mińsk Mazowiecki',
        postal_code: user.postalCode ?? '05-300',
        seed: user.seed,
        rerolls: user.rerolls,
        privacy: user.privacy,
        updated_at: new Date().toISOString(),
      }),
    },
    'return=minimal',
  );
}

export { onAuthSessionChange, getAuthSession };
