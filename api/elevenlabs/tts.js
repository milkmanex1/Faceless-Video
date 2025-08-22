export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    // Example: receive text from frontend
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing 'text' in request body" });
    }

    // Call ElevenLabs API
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/jqcCZkN6Knx8BJ5TBdYR", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_settings: { stability: 0.3, similarity_boost: 0.7 },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error: error });
    }

    // Forward ElevenLabs response back to frontend
    const audioBuffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
