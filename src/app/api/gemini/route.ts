import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemma-4-31b-it";

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

    if (apiKey) {
      const result = await call(prompt, apiKey, systemInstruction);
      if (!stream && "error" in (result as object)) {
        return NextResponse.json(result, { status: (result as { status: number }).status });
      }
      return result as Response;
    }

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
