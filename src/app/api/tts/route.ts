// app/api/tts/route.ts
import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.NEXT_ELEVENLABS_API_KEY!, // để key trong .env.local
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Gọi API ElevenLabs
    const stream = await elevenlabs.textToSpeech.convert(
      "ZF6FPAbjXT4488VcRRnw",
      {
        text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
        voiceSettings: {
          stability: 0.65,
          similarityBoost: 0,
        },
      }
    );

    // Đọc stream thành buffer
    const chunks: Uint8Array[] = [];
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Trả về file mp3 trực tiếp
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
