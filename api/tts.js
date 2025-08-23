export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Disable Vercel's CDN cache completely
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, voice_id } = req.body;

    if (!text || !voice_id) {
      return res.status(400).json({ error: "Missing text or voice_id" });
    }

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res
        .status(500)
        .json({ error: "ElevenLabs API failed", details: err });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return res.status(200).json({
      ok: true,
      message: "TTS generated successfully",
      audio: base64Audio,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
}
