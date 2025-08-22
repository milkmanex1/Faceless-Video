module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { ELEVENLABS_API_KEY } = process.env;
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "missing ELEVENLABS_API_KEY" });
  }

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "Missing text input" });

  try {
    const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.7
        }
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).json({ error: err });
    }

    const audioBuffer = await r.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return res.status(200).json({ audio: base64Audio });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
