export default function handler(req, res) {
  if (req.method === "POST") {
    return res.status(200).json({
      ok: true,
      msg: "POST handler hit correctly",
      body: req.body || null,
    });
  }

  return res.status(200).json({
    ok: true,
    msg: "GET handler works at /api/tts",
  });
}
