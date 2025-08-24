export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { audio } = req.body;
    if (!audio) return res.status(400).json({ error: "Missing audio base64 string" });

    // --- Call Shotstack EDIT API to start render ---
    const response = await fetch("https://api.shotstack.io/edit/stage/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SHOTSTACK_API_KEY,
      },
      body: JSON.stringify({
        timeline: {
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: "audio",
                    src: `data:audio/mpeg;base64,${audio}`, // directly embed TTS audio
                  },
                  start: 0,
                  length: 10, // seconds – adjust later based on your audio
                },
              ],
            },
          ],
        },
        output: {
          format: "mp4",
          resolution: "sd",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    // data contains editId
    res.status(200).json(data);
  } catch (err) {
    console.error("Shotstack Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
