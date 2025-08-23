export const config = {
  runtime: "nodejs",
  dynamic: "force-dynamic"
};

export default async function handler(req, res) {
  console.log("REQ METHOD:", req.method);
  console.log("REQ URL:", req.url);

  if (req.method === "POST") {
    return res.status(200).json({
      ok: true,
      msg: "POST handler hit correctly",
      body: req.body || null,
    });
  }

  return res.status(200).json({
    ok: true,
    msg: "Base handler works (GET or others)",
    received: null,
  });
}
