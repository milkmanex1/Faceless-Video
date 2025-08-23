export default function handler(req, res) {
  if (req.method === "POST") {
    return res.status(200).json({
      ok: true,
      received: req.body || null,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
