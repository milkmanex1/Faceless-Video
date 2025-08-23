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
      return res.status(400).json({ error: "Missing audio file" });
    }

    // --- Call Shotstack API ---
    const response = await fetch("https://api.shotstack.io/stage/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SHOTSTACK_API_KEY,
      },
      body: JSON.stringify({
        // Put your Shotstack payload here.
        // Example: passing the audio to be ingested
        timeline: {
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: "audio",
                    src: `data:audio/mpeg;base64,${audio}`,
                  },
                  start: 0,
                  length: 10,
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
    res.status(200).json(data);
  } catch (error) {
    console.error("Shotstack Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
