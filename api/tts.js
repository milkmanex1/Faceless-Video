export const config = {
  runtime: "nodejs",
  dynamic: "force-dynamic"
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Ensure body is parsed
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    console.log("REQ BODY:", body);

    const { text, voice_id } = body || {};

    if (!text || !voice_id) {
      return res.status(400).json({ error: "Missing text or voice_id" });
    }

    return res.status(200).json({
      ok: true,
      msg: "Base handler works, body parsed",
      received: { text, voice_id }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
