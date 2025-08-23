export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Missing render ID" });
    }

    // --- Call Shotstack status endpoint ---
    const response = await fetch(`https://api.shotstack.io/stage/render/${id}`, {
      method: "GET",
      headers: {
        "x-api-key": process.env.SHOTSTACK_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Status Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
