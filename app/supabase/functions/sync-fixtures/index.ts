// Server-side fixture sync from API-Football (api-sports.io) into our own
// Supabase tables (clubs, competitions, matches). This is the ONLY place the
// API-Football secret key is used — it must never be sent to, or read by, the
// client app. Set it with: supabase secrets set API_FOOTBALL_KEY=xxxx
//
// Invocation is restricted to the Supabase project's own *secret* key (server-
// to-server), not the publishable key the client app uses — so a random caller
// with just the public key can't trigger this and burn our API-Football quota.
//
// See MASTER_PRODUCT_SPEC.md §15: football-data.org is meant to be primary and
// this is the fallback/verification source, but football-data.org sign-up is
// still blocked (cert error) as of 2026-09-15, so this is the sole live source
// for now. Swap/extend once football-data.org is reachable.

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";

type ApiFootballTeam = { id: number; name: string; logo: string };
type ApiFootballLeague = { id: number; name: string; country: string };
type ApiFootballFixture = {
  fixture: { id: number; date: string; status: { short: string } };
  league: ApiFootballLeague;
  teams: { home: ApiFootballTeam; away: ApiFootballTeam };
  goals: { home: number | null; away: number | null };
};

type MatchStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";

function mapStatus(short: string): MatchStatus {
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  if (["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"].includes(short)) return "live";
  if (short === "PST") return "postponed";
  if (["CANC", "ABD", "AWD", "WO"].includes(short)) return "cancelled";
  return "scheduled";
}

async function fetchFromApiFootball(path: string, params: Record<string, string>) {
  const apiKey = Deno.env.get("API_FOOTBALL_KEY");
  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY is not set. Run: supabase secrets set API_FOOTBALL_KEY=<key>");
  }

  const url = new URL(`${API_FOOTBALL_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { headers: { "x-apisports-key": apiKey } });
  if (!res.ok) {
    throw new Error(`API-Football request failed: ${res.status} ${await res.text()}`);
  }

  const body = await res.json();
  const hasErrors = Array.isArray(body.errors) ? body.errors.length > 0 : Object.keys(body.errors ?? {}).length > 0;
  if (hasErrors) {
    throw new Error(`API-Football returned errors: ${JSON.stringify(body.errors)}`);
  }

  return body.response;
}

export default {
  // "secret" only: this endpoint mutates data and calls a paid-quota external
  // API, so it must not be triggerable with the public/publishable key.
  fetch: withSupabase({ auth: ["secret"] }, async (req, ctx) => {
    const {
      competitionApiFootballId = 39, // default: Premier League
      season = new Date().getUTCFullYear(),
      code, // optional short code, e.g. "PL" — falls back to a stable placeholder if omitted
    } = await req.json().catch(() => ({}));

    const fixtures: ApiFootballFixture[] = await fetchFromApiFootball("/fixtures", {
      league: String(competitionApiFootballId),
      season: String(season),
    });

    if (fixtures.length === 0) {
      return Response.json({ competitionApiFootballId, season, clubsUpserted: 0, matchesUpserted: 0 });
    }

    const leagueInfo = fixtures[0].league;
    const { data: competition, error: competitionError } = await ctx.supabaseAdmin
      .from("competitions")
      .upsert(
        {
          name: leagueInfo.name,
          code: code ?? `L${leagueInfo.id}`,
          external_id_api_football: leagueInfo.id,
        },
        { onConflict: "external_id_api_football" },
      )
      .select()
      .single();
    if (competitionError) throw competitionError;

    const clubCache = new Map<number, string>(); // api-football team id -> our club uuid

    async function upsertClub(team: ApiFootballTeam): Promise<string> {
      const cached = clubCache.get(team.id);
      if (cached) return cached;

      const { data, error } = await ctx.supabaseAdmin
        .from("clubs")
        .upsert(
          { name: team.name, crest_url: team.logo, external_id_api_football: team.id },
          { onConflict: "external_id_api_football" },
        )
        .select("id")
        .single();
      if (error) throw error;

      clubCache.set(team.id, data.id as string);
      return data.id as string;
    }

    let matchesUpserted = 0;
    for (const fx of fixtures) {
      const [homeClubId, awayClubId] = await Promise.all([
        upsertClub(fx.teams.home),
        upsertClub(fx.teams.away),
      ]);

      const { error: matchError } = await ctx.supabaseAdmin.from("matches").upsert(
        {
          competition_id: competition.id,
          home_club_id: homeClubId,
          away_club_id: awayClubId,
          kickoff_at: fx.fixture.date,
          status: mapStatus(fx.fixture.status.short),
          home_score: fx.goals.home,
          away_score: fx.goals.away,
          external_id_api_football: fx.fixture.id,
        },
        { onConflict: "external_id_api_football" },
      );
      if (matchError) throw matchError;
      matchesUpserted++;
    }

    return Response.json({
      competition: competition.name,
      clubsUpserted: clubCache.size,
      matchesUpserted,
    });
  }),
};

/* To invoke locally:

  1. Copy supabase/functions/.env.example to supabase/functions/.env and fill in API_FOOTBALL_KEY
  2. Run `supabase start` then `supabase functions serve sync-fixtures --env-file supabase/functions/.env`
  3. POST to it with the project's SECRET key (not the publishable key):

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sync-fixtures' \
    --header 'apiKey: <your sb_secret_... key>' \
    --header 'Content-Type: application/json' \
    --data '{"competitionApiFootballId": 39, "season": 2025, "code": "PL"}'

  Once deployed (`supabase functions deploy sync-fixtures`), call the same way
  against the project's real URL, and set the secret first:
  `supabase secrets set API_FOOTBALL_KEY=<key>`
*/
