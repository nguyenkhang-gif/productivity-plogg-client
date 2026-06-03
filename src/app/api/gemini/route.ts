import { NextRequest, NextResponse } from "next/server";
import redis from "@/core/lib/redis";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemma-4-31b-it";
const LIMIT = 20;
const WINDOW_SECONDS = 86400; // 24h
const REDIS_KEY_PREFIX = "fe:rl:gemini";

// Lua script: INCR + EXPIRE atomic — chỉ set TTL khi key mới tạo
const INCR_SCRIPT = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
  return count
`;

async function extractUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
      { headers: { Authorization: authHeader } }
    );
    if (!res.ok) return null;
    const profile = await res.json();
    return profile.id as string;
  } catch {
    return null;
  }
}

async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  count: number;
  remaining: number;
  resetAt: string;
} | null> {
  try {
    const key = `${REDIS_KEY_PREFIX}:${userId}`;
    const count = (await redis.eval(
      INCR_SCRIPT,
      1,
      key,
      String(WINDOW_SECONDS)
    )) as number;

    const ttl = await redis.ttl(key);
    const resetAt = new Date(Date.now() + ttl * 1000).toISOString();
    const remaining = Math.max(0, LIMIT - count);

    return { allowed: count <= LIMIT, count, remaining, resetAt };
  } catch (err) {
    console.warn("[gemini] Redis error — fail open:", (err as Error).message);
    return null; // fail open
  }
}

function buildGeminiBody(
  prompt: string,
  systemInstruction?: string
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  return body;
}

async function callGemini(
  prompt: string,
  apiKey: string,
  systemInstruction?: string
): Promise<{ text: string } | { error: string; status: number }> {
  const res = await fetch(
    `${BASE_URL}/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildGeminiBody(prompt, systemInstruction)),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error("[gemini] API error:", res.status, error);
    return { error, status: res.status };
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { text };
}

async function callGeminiStream(
  prompt: string,
  apiKey: string,
  systemInstruction?: string
): Promise<Response> {
  const geminiRes = await fetch(
    `${BASE_URL}/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildGeminiBody(prompt, systemInstruction)),
    }
  );

  if (!geminiRes.ok) {
    const error = await geminiRes.text();
    console.error("[gemini] stream API error:", geminiRes.status, error);
    return NextResponse.json(
      { error, status: geminiRes.status },
      { status: geminiRes.status }
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = geminiRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") continue;
            try {
              const json = JSON.parse(raw);
              const text: string =
                json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // malformed SSE chunk — skip
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey, systemInstruction, stream = false } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Thiếu 'prompt'" }, { status: 400 });
    }

    const call = stream ? callGeminiStream : callGemini;

    // --- Chế độ 1: User có key riêng → dùng thẳng, không rate limit ---
    if (apiKey) {
      const result = await call(prompt, apiKey, systemInstruction);
      if (!stream && "error" in (result as object)) {
        return NextResponse.json(result, { status: (result as { status: number }).status });
      }
      return result as Response;
    }

    // --- Chế độ 2: Dùng server key → cần rate limit ---
    const serverKey = process.env.GEMINI_API_KEY;
    if (!serverKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY chưa được cấu hình" },
        { status: 500 }
      );
    }

    const userId = await extractUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit(userId);
    if (rl && !rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", limit: LIMIT, remaining: 0, resetAt: rl.resetAt },
        { status: 429 }
      );
    }

    const result = await call(prompt, serverKey, systemInstruction);
    if (!stream && "error" in (result as object)) {
      return NextResponse.json(result, { status: (result as { status: number }).status });
    }
    return result as Response;
  } catch (err) {
    console.error("[gemini] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
