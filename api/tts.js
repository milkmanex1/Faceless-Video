export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voice_id } = req.body;
  if (!text || !voice_id) {
    return res.status(400).json({ error: "Missing text or voice_id" });
  }

  // For now, just echo back to confirm it works
  return res.status(200).json({
    message: "POST received!",
    text,
    voice_id
  });
}

