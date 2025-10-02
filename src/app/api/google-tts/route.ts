import { NextResponse } from "next/server";
import * as gTTS from "google-tts-api";
import https from "https";

// Helper: tải URL thành Buffer
function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https
      .get(new URL(url), (res) => {
        const chunks: Uint8Array[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

export async function POST(req: Request) {
  try {
    const { text, lang } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Chia text thành nhiều đoạn audio
    const urls = gTTS.getAllAudioUrls(text, {
      lang: lang ?? "en",
      slow: false,
    });

    // Tải tất cả các buffer
    const buffers = await Promise.all(
      urls.map((item) => fetchBuffer(item.url))
    );

    // Gộp buffer thành 1 file duy nhất
    const finalBuffer = Buffer.concat(buffers);

    return new NextResponse(finalBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=voice.mp3",
      },
    });
  } catch (err) {
    console.error("TTS API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
