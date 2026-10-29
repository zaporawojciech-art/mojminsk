import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const TRAPEZE_BASE = 'https://minsk-maz.trapeze.fi/vm/main';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// In-memory cache for static stops
let cachedStops: any = null;
let cachedStopsExpiry = 0;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'stops';

    // 1. STOPS LIST
    if (action === 'stops') {
      const now = Date.now();
      if (cachedStops && now < cachedStopsExpiry) {
        return new Response(JSON.stringify(cachedStops), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }

      const res = await fetch(`${TRAPEZE_BASE}?command=basicdata&action=mstops`);
      if (!res.ok) {
        throw new Error(`Trapeze stops error: ${res.status}`);
      }
      const rawStops = await res.json();

      // Clean and normalize stops
      const stops = rawStops.map((s: any) => ({
        id: String(s.id),
        altId: s.alt_id || '',
        name: s.name || '',
        lat: Number(s.lat),
        lon: Number(s.lon),
      }));

      cachedStops = stops;
      cachedStopsExpiry = now + 1000 * 60 * 60 * 12; // 12 hours

      return new Response(JSON.stringify(stops), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 2. STOP DEPARTURES
    if (action === 'departures') {
      const stopId = url.searchParams.get('stopId');
      if (!stopId) {
        return new Response(JSON.stringify({ error: 'stopId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch(`${TRAPEZE_BASE}?command=planner&action=sd&id=${encodeURIComponent(stopId)}`);
      if (!res.ok) {
        throw new Error(`Trapeze departures error: ${res.status}`);
      }
      const html = await res.text();

      // Parse stop info
      const stopNameMatch = html.match(/<input id='stop-name' type='hidden' value='([^']*)'>/);
      const stopLatMatch = html.match(/<input id='stop-lat' type='hidden' value='([^']*)'>/);
      const stopLonMatch = html.match(/<input id='stop-lon' type='hidden' value='([^']*)'>/);

      // Parse departures
      const departureRegex =
        /<div id='(\d+)' class='departure[^']*'>[\s\S]*?<div class='time'>([^<]+)<\/div>[\s\S]*?<div class='line'>([^<]+)<\/div>[\s\S]*?<div class='destination'[^>]*>([^<]+)<\/div>/g;
      const departures = [];
      let m;
      while ((m = departureRegex.exec(html)) !== null) {
        const rawLine = m[3].trim().replace(/kierunek/i, '');
        departures.push({
          id: m[1],
          time: m[2].trim(),
          line: rawLine,
          destination: m[4].trim(),
        });
      }

      const payload = {
        stopId,
        stopName: stopNameMatch ? stopNameMatch[1] : '',
        lat: stopLatMatch ? parseFloat(stopLatMatch[1]) : null,
        lon: stopLonMatch ? parseFloat(stopLonMatch[1]) : null,
        departures,
        updatedAt: new Date().toISOString(),
      };

      return new Response(JSON.stringify(payload), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=15',
        },
      });
    }

    // 3. VEHICLES (LIVE GPS)
    if (action === 'vehicles') {
      const res = await fetch(`${TRAPEZE_BASE}?command=planner&action=v`);
      if (!res.ok) {
        throw new Error(`Trapeze vehicles error: ${res.status}`);
      }
      const rawVehicles = await res.json();
      const vehicles = rawVehicles.map((v: any) => ({
        id: v.id,
        line: (v.lineLabel || v.label || '').replace(/kierunek/i, ''),
        lat: Number(v.lat),
        lon: Number(v.lon),
        bearing: Number(v.bearing || 0),
        depid: v.depid,
        type: v.type || 'Autobus',
      }));

      return new Response(JSON.stringify(vehicles), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=5',
        },
      });
    }

    // 4. PASSING TIMES & SITUATION
    if (action === 'passingtimes') {
      const depId = url.searchParams.get('id');
      if (!depId) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch(
        `${TRAPEZE_BASE}?command=planner&action=pt&next=5&id=${encodeURIComponent(depId)}`
      );
      if (!res.ok) {
        throw new Error(`Trapeze passing times error: ${res.status}`);
      }
      const html = await res.text();

      const situationMatch = html.match(
        /class=['"]deviation['"][^>]*>[\s\S]*?class=['"]highlight['"][^>]*>([^<]+)<\/span>/
      );
      const scheduleMatch = html.match(
        /class=['"]schedule['"][^>]*>[\s\S]*?class=['"]highlight['"][^>]*>([^<]+)<\/span>/
      );
      const directionMatch = html.match(/Kierunek:<span class=['"]highlight['"][^>]*>([\s\S]*?)<\/span>/);

      // Intermediate stops
      const stopRegex =
        /<div class='intermediate[^']*'>\s*<div class='station'>([^<]+)<\/div>\s*<div class='time'>([^<]+)<\/div>\s*<\/div>/g;
      const stops = [];
      let sMatch;
      while ((sMatch = stopRegex.exec(html)) !== null) {
        stops.push({
          station: sMatch[1].trim(),
          time: sMatch[2].trim(),
        });
      }

      const payload = {
        depId,
        situation: situationMatch ? situationMatch[1].trim() : 'na czas',
        schedule: scheduleMatch ? scheduleMatch[1].trim() : '',
        direction: directionMatch
          ? directionMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          : '',
        stops,
        updatedAt: new Date().toISOString(),
      };

      return new Response(JSON.stringify(payload), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=10',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
