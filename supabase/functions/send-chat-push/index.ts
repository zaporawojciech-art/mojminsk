import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-push-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PushConfig {
  vapid_public_key: string;
  vapid_private_key: string;
  push_webhook_secret: string;
}

let cachedConfig: PushConfig | null = null;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    if (!cachedConfig) {
      const envPub = Deno.env.get('VAPID_PUBLIC_KEY');
      const envPriv = Deno.env.get('VAPID_PRIVATE_KEY');
      const envSecret = Deno.env.get('PUSH_WEBHOOK_SECRET');

      if (envPub && envPriv) {
        cachedConfig = {
          vapid_public_key: envPub,
          vapid_private_key: envPriv,
          push_webhook_secret: envSecret || '',
        };
      } else {
        const { data } = await admin.rpc('get_push_config');
        if (data && data.vapid_public_key && data.vapid_private_key) {
          cachedConfig = data as PushConfig;
        }
      }
    }

    if (!cachedConfig) {
      return new Response(JSON.stringify({ error: 'Missing VAPID configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const incomingSecret = req.headers.get('x-push-secret') || '';
    if (
      cachedConfig.push_webhook_secret &&
      incomingSecret !== cachedConfig.push_webhook_secret
    ) {
      return new Response(JSON.stringify({ error: 'Unauthorized webhook' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();
    const { conversation_id, sender_id, recipient_id, body } = payload as {
      message_id?: string;
      conversation_id: string;
      sender_id: string;
      recipient_id: string;
      body: string;
    };

    if (!conversation_id || !recipient_id) {
      return new Response(JSON.stringify({ error: 'Missing conversation_id or recipient_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [{ data: sender }, { data: subs }] = await Promise.all([
      admin
        .from('public_profiles')
        .select('name, street_as')
        .eq('id', sender_id)
        .maybeSingle(),
      admin
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('profile_id', recipient_id),
    ]);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:kontakt@mojminsk.app';
    webpush.setVapidDetails(
      vapidSubject,
      cachedConfig.vapid_public_key,
      cachedConfig.vapid_private_key,
    );

    const senderTitle = sender
      ? `${sender.name} ${sender.street_as || ''}`.trim()
      : 'Nowa wiadomość od sąsiada';

    const notificationPayload = JSON.stringify({
      title: senderTitle,
      body: (body || 'Nowa wiadomość w czacie sąsiedzkim').slice(0, 90),
      url: `/wiadomosci/${conversation_id}`,
      conversationId: conversation_id,
    });

    let sent = 0;
    const staleIds: string[] = [];

    await Promise.all(
      subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            notificationPayload,
          );
          sent += 1;
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            staleIds.push(sub.id);
          }
        }
      }),
    );

    if (staleIds.length > 0) {
      await admin.from('push_subscriptions').delete().in('id', staleIds);
    }

    return new Response(JSON.stringify({ sent, removedStale: staleIds.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
