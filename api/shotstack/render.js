export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { SHOTSTACK_API_KEY, SHOTSTACK_ENV } = process.env;
  if (!SHOTSTACK_API_KEY) {
    return res.status(500).json({ error: "missing SHOTSTACK_API_KEY" });
  }
  const env = SHOTSTACK_ENV || "stage";

  // Parse request body
  const body = req.body;
  const json = typeof body === "string" ? JSON.parse(body || "{}") : body || {};
  const edit = buildEditJson(json);

  // Forward to Shotstack
  const r = await fetch(`https://api.shotstack.io/edit/${env}/render`, {
    method: "POST",
    headers: {
      "x-api-key": SHOTSTACK_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(edit)
  });

  const data = await r.json();
  if (!r.ok) return res.status(400).json(data);

  return res.status(200).json({
    renderId: data.response?.id || data.id || data?.data?.id || null
  });

  // helper
  function buildEditJson(input) {
    const { clips = [], voiceUrl, musicUrl, width = 1080, height = 1920, fps = 24 } = input;
    return {
      timeline: {
        ...(musicUrl ? { soundtrack: { src: musicUrl, effect: "fadeInFadeOut", volume: 0.3 } } : {}),
        tracks: [
          {
            clips: clips.map((c, i) => ({
              asset: { type: c.type || "video", src: c.src },
              start: i === 0 ? 0 : "auto",
              length: c.length || 5,
              fit: "cover",
              transition: { in: "fade", out: "fade" },
              ...(c.type === "image" ? { effect: "zoomIn" } : {})
            }))
          },
          voiceUrl
            ? { clips: [{ asset: { type: "audio", src: voiceUrl }, start: 0, length: "auto" }] }
            : null
        ].filter(Boolean)
      },
      output: { format: "mp4", size: { width, height }, fps }
    };
  }
}
