export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://jqortivwlvsjuiiexvro.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxb3J0aXZ3bHZzanVpaWV4dnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMTU2MjgsImV4cCI6MjEwODc5MTYyOH0.mjqNwNnBKRouohPOp3Pa6LKu6m37Qy9xaAdWWdFA-CM';

const AUTH_STORAGE_KEY = 'mojminsk_auth';

export interface AuthUser {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  user: AuthUser;
}

type AuthListener = (session: AuthSession | null) => void;

const listeners = new Set<AuthListener>();
let currentSession: AuthSession | null = loadStoredSession();
let refreshPromise: Promise<AuthSession | null> | null = null;

function loadStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    // Wyczyść stary nieszyfrowany mock z localStorage z poprzedniej wersji prototypu
    localStorage.removeItem('mojminsk_user');

    // Sprawdź czy w URL znajduje się hash z linku potwierdzającego e-mail (#access_token=...)
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const expiresIn = Number(params.get('expires_in') || '3600');
      const payload = accessToken ? decodeJwtPayload(accessToken) : null;
      if (accessToken && refreshToken && payload?.sub) {
        const hashSession: AuthSession = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + expiresIn,
          user: {
            id: String(payload.sub),
            email: typeof payload.email === 'string' ? payload.email : undefined,
          },
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(hashSession));
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
        return hashSession;
      }
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.access_token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession | null): void {
  currentSession = session;
  if (typeof window !== 'undefined') {
    try {
      if (session) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }
  listeners.forEach((cb) => {
    try {
      cb(currentSession);
    } catch {
      // ignore listener errors
    }
  });
}

export function getAuthSession(): AuthSession | null {
  return currentSession;
}

export function onAuthSessionChange(cb: AuthListener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export async function ensureValidAccessToken(): Promise<string> {
  if (!currentSession) return SUPABASE_ANON_KEY;
  const nowSec = Math.floor(Date.now() / 1000);
  if (currentSession.expires_at && currentSession.expires_at - nowSec > 60) {
    return currentSession.access_token;
  }
  if (!currentSession.refresh_token) {
    return currentSession.access_token;
  }
  if (!refreshPromise) {
    refreshPromise = refreshSession(currentSession.refresh_token).finally(() => {
      refreshPromise = null;
    });
  }
  const refreshed = await refreshPromise;
  return refreshed?.access_token || SUPABASE_ANON_KEY;
}

async function refreshSession(refreshToken: string): Promise<AuthSession | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      if (res.status === 400 || res.status === 401) {
        setAuthSession(null);
      }
      return null;
    }
    const data = await res.json();
    const next: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at:
        data.expires_at || Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
      user: data.user,
    };
    setAuthSession(next);
    return next;
  } catch {
    return currentSession;
  }
}

export async function getAuthHeaders(prefer?: string): Promise<HeadersInit> {
  const token = await ensureValidAccessToken();
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (prefer) {
    headers.Prefer = prefer;
  }
  return headers;
}

export async function supabaseRest<T>(
  path: string,
  options: RequestInit = {},
  prefer?: string,
): Promise<T | null> {
  try {
    const authHeaders = await getAuthHeaders(prefer);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        ...authHeaders,
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

export async function supabaseRpc<T>(
  fnName: string,
  args: Record<string, unknown> = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(args),
    });
    const text = await res.text();
    if (!res.ok) {
      let msg = 'Wystąpił błąd serwera.';
      try {
        const parsed = JSON.parse(text);
        msg = parsed?.message || parsed?.error_description || parsed?.hint || msg;
      } catch {
        if (text) msg = text;
      }
      return { data: null, error: msg };
    }
    if (!text) return { data: null, error: null };
    return { data: JSON.parse(text) as T, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Błąd połączenia z serwerem.',
    };
  }
}

/* ---------------- Supabase Realtime (Phoenix Channels WebSocket) ---------------- */

export interface RealtimeChangeOptions<TRecord> {
  channelName: string;
  table: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  onRecord: (record: TRecord, eventType: string) => void;
  onPoll?: () => void;
  pollIntervalMs?: number;
}

export function subscribePostgresChanges<TRecord>({
  channelName,
  table,
  event = '*',
  filter,
  onRecord,
  onPoll,
  pollIntervalMs = 5000,
}: RealtimeChangeOptions<TRecord>): () => void {
  if (typeof window === 'undefined') return () => {};

  let closed = false;
  let ws: WebSocket | null = null;
  let heartbeatTimer: number | null = null;
  let reconnectTimer: number | null = null;
  let refCounter = 1;

  const topic = `realtime:${channelName}`;
  const wsBase = SUPABASE_URL.replace(/^http/, 'ws');
  const wsUrl = `${wsBase}/realtime/v1/websocket?apikey=${encodeURIComponent(SUPABASE_ANON_KEY)}&vsn=1.0.0`;

  const connect = async () => {
    if (closed) return;
    const accessToken = await ensureValidAccessToken();
    if (closed) return;

    try {
      ws = new WebSocket(wsUrl);
    } catch {
      return;
    }

    ws.onopen = () => {
      if (closed || !ws) return;
      const pgChangeConfig: Record<string, string> = {
        event,
        schema: 'public',
        table,
      };
      if (filter) {
        pgChangeConfig.filter = filter;
      }

      ws.send(
        JSON.stringify({
          topic,
          event: 'phx_join',
          payload: {
            config: {
              broadcast: { self: false },
              presence: { key: '' },
              postgres_changes: [pgChangeConfig],
            },
            access_token: accessToken,
          },
          ref: String(refCounter++),
        }),
      );

      heartbeatTimer = window.setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              topic: 'phoenix',
              event: 'heartbeat',
              payload: {},
              ref: String(refCounter++),
            }),
          );
        }
      }, 25000);
    };

    ws.onmessage = (msgEvent) => {
      try {
        const packet = JSON.parse(String(msgEvent.data));
        if (packet?.event === 'postgres_changes' && packet?.payload?.data) {
          const data = packet.payload.data;
          const record = (data.record ?? data.old_record) as TRecord | undefined;
          const eventType = String(data.type || packet.payload.event || 'INSERT');
          if (record) {
            onRecord(record, eventType);
          }
        }
      } catch {
        // ignore malformed packets
      }
    };

    ws.onclose = () => {
      if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      if (!closed) {
        reconnectTimer = window.setTimeout(() => {
          void connect();
        }, 3000);
      }
    };
  };

  void connect();

  const pollTimer =
    onPoll && pollIntervalMs > 0
      ? window.setInterval(() => {
          if (document.visibilityState === 'visible') {
            onPoll();
          }
        }, pollIntervalMs)
      : null;

  return () => {
    closed = true;
    if (heartbeatTimer) window.clearInterval(heartbeatTimer);
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    if (pollTimer) window.clearInterval(pollTimer);
    if (ws) {
      try {
        ws.close();
      } catch {
        // ignore
      }
    }
  };
}
