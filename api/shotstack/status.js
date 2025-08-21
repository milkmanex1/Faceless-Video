export default async function handler(req, res) {
  const { SHOTSTACK_API_KEY, SHOTSTACK_ENV } = process.env;
  const env = SHOTSTACK_ENV || "stage";
  const { renderId } = req.query || {};
  if (!renderId) return res.status(400).json({ error: "renderId required" });

  const r = await fetch(`https://api.shotstack.io/edit/${env}/render/${renderId}`, {
    headers: { "x-api-key": SHOTSTACK_API_KEY }
  });
  const data = await r.json();
  if (!r.ok) return res.status(400).json(data);

  // Try to return a stable url if present
  const cdn =
    data?.response?.url ||
    data?.data?.attributes?.output?.url ||
    data?.data?.attributes?.url ||
    null;

  return res.status(200).json({
    status: data?.response?.status || data?.data?.attributes?.status || "unknown",
    url: cdn
  });
}
