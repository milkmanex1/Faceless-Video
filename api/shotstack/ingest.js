export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { audio } = req.body;

    if (!audio) {
      return res.status(400).json({ error: "Missing audio base64 string" });
    }

    // --- Call Shotstack API with base64 audio directly ---
    const response = await fetch("https://api.shotstack.io/stage/edit", {
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
                    src: `data:audio/mpeg;base64,${audio}`, // 👈 embed base64 directly
                  },
                  start: 0,
                  length: 10, // adjust depending on your audio duration
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
      return res.status(response.status)
