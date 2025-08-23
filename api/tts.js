export default async function handler(req, res) {
  console.log("REQ METHOD:", req.method);
  console.log("REQ BODY:", req.body);

  return res.status(200).json({
    ok: true,
    msg: "Base handler works without ?test=1",
    received: req.body || null,
  });
}
