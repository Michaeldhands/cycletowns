import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { currentUser, hasSupabase, isMember, supabasePublic, supabaseServer } from "@/lib/supabase/server";
import { runTool, toolsFor, type ToolCtx } from "@/lib/ask/tools";
import { STATIC_PROMPT, riderPrompt, type RiderContext } from "@/lib/ask/prompt";
import type { AskEvent, AskTurn } from "@/lib/ask/cards";
import { hasAsk } from "@/lib/ask/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Ask Cycletowns. The browser sends the conversation as plain text turns; we answer as a stream of
   newline-delimited JSON events — text as it is written, and a card whenever a tool returns
   something worth showing. Conversations are not stored. */

const MODEL = process.env.ASK_MODEL || "claude-haiku-5-5";
const MAX_ROUNDS = 6;
const LIMIT = {
  anon: Number(process.env.ASK_LIMIT_ANON || 8),
  rider: Number(process.env.ASK_LIMIT_RIDER || 30),
  insider: Number(process.env.ASK_LIMIT_INSIDER || 150),
  all: Number(process.env.ASK_DAILY_CAP || 1500),   // across everyone — the bill's ceiling
};


const clientIp = (req: NextRequest) =>
  req.headers.get("x-nf-client-connection-ip") || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";

/** Counts one message against a bucket; true while under the cap. Fails open if the table isn't there yet. */
async function bump(bucket: string, cap: number): Promise<boolean> {
  if (!hasSupabase()) return true;
  try {
    const { data, error } = await supabasePublic().rpc("ask_bump", { p_bucket: bucket, p_cap: cap });
    if (error) {
      console.error("ask_bump", error.message);
      return true;
    }
    return data !== false;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  if (!hasAsk()) return Response.json({ error: "Ask Cycletowns isn’t switched on yet." }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { turns?: AskTurn[] };
  const turns = (body.turns || [])
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.text === "string" && t.text.trim())
    .slice(-12)
    .map((t) => ({ role: t.role, content: t.text.slice(0, 2000) }));
  if (!turns.length || turns[turns.length - 1].role !== "user") return Response.json({ error: "Nothing to answer." }, { status: 400 });
  while (turns.length && turns[0].role !== "user") turns.shift();

  // Who's asking, and how much they can ask today.
  const me = await currentUser();
  const insider = isMember(me?.profile);
  const bucket = me ? `u:${me.id}` : `a:${createHash("sha256").update(clientIp(req) + (process.env.ASK_SALT || process.env.NEXT_PUBLIC_SUPABASE_URL || "")).digest("hex").slice(0, 20)}`;
  const cap = me ? (insider ? LIMIT.insider : LIMIT.rider) : LIMIT.anon;
  if (!(await bump("all", LIMIT.all))) return Response.json({ error: "Ask Cycletowns is very busy today. Try again tomorrow." }, { status: 429 });
  if (!(await bump(bucket, cap))) {
    const msg = me
      ? insider
        ? "That's today's limit reached. It resets at midnight."
        : "That's today's free questions. Insiders get many more — or come back tomorrow."
      : "That's the limit for guests today. Join free for more questions, and so Ask Cycletowns remembers how you ride.";
    return Response.json({ error: msg, limit: true }, { status: 429 });
  }

  // What we know about the rider.
  let rider: RiderContext | null = null;
  const sb = me ? await supabaseServer() : null;
  if (me && sb) {
    const { data: mem } = await sb.from("rider_memories").select("fact").eq("user_id", me.id).order("created_at", { ascending: false }).limit(30);
    rider = {
      name: me.profile?.display_name,
      homeTown: me.profile?.home_town,
      riderType: me.profile?.rider_type,
      ability: me.profile?.ability,
      insider,
      memories: ((mem as { fact: string }[] | null) || []).map((m) => m.fact),
    };
  }

  const ctx: ToolCtx = {
    signedIn: Boolean(me && sb),
    remember: async (fact, kind) => {
      if (!me || !sb) return false;
      const { error } = await sb.from("rider_memories").insert({ user_id: me.id, fact, kind: ["riding", "preference", "home", "travel", "goal", "other"].includes(kind) ? kind : "other" });
      return !error;
    },
    signal: (s) => {
      if (!hasSupabase()) return;
      supabasePublic().from("ask_signals").insert(s).then(({ error }) => error && console.error("ask_signal", error.message));
    },
  };

  const anthropic = new Anthropic();
  const tools = toolsFor(ctx.signedIn);
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: STATIC_PROMPT, cache_control: { type: "ephemeral" } },
    { type: "text", text: riderPrompt(rider) },
  ];
  const messages: Anthropic.MessageParam[] = turns;

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: AskEvent) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      try {
        for (let round = 0; round < MAX_ROUNDS; round++) {
          const s = anthropic.messages.stream({ model: MODEL, max_tokens: 1024, system, tools, messages });
          for await (const ev of s) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") send({ t: "text", v: ev.delta.text });
          }
          const msg = await s.finalMessage();
          messages.push({ role: "assistant", content: msg.content });
          if (msg.stop_reason !== "tool_use") break;

          const results: Anthropic.ToolResultBlockParam[] = [];
          for (const block of msg.content) {
            if (block.type !== "tool_use") continue;
            send({ t: "status", v: STATUS[block.name] || "Checking the guide…" });
            try {
              const out = await runTool(block.name, (block.input || {}) as Record<string, unknown>, ctx);
              if (out.card) send({ t: "card", card: out.card });
              results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(out.result) });
            } catch (err) {
              console.error("ask tool", block.name, err);
              results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify({ error: "That lookup failed." }), is_error: true });
            }
          }
          messages.push({ role: "user", content: results });
          send({ t: "text", v: "\n\n" });
        }
        send({ t: "done" });
      } catch (err) {
        console.error("ask", err);
        send({ t: "error", v: "Ask Cycletowns hit a problem answering that. Try again in a moment." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}

const STATUS: Record<string, string> = {
  find_towns: "Looking through the Victorian guides…",
  town_guide: "Opening the town guide…",
  find_events: "Checking the events calendar…",
  build_loop: "Finding roads for a loop…",
  plan_trip: "Putting the days together…",
  remember: "Noting that…",
};
