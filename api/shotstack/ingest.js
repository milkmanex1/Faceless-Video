export const config = { api: { bodyParser: false } }; // we manually read the body

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const { SHOTSTACK_API_KEY, SHOTSTACK_ENV } = process.env;
  const env = SHOTSTACK_ENV || "stage";
  if (!SHOTSTACK_API_KEY) return res.status(500).json({ error: "missing SHOTSTACK_API_KEY" });

  // If client sent JSON with { fileUrl }, fetch it server-side:
  const contentType = req.headers["content-type"] || "";
  let bytes, mime = "application/octet-stream";

  if (contentType.startsWith("application/json")) {
    const text = (await readRaw(req)).toString("utf8");
    const { fileUrl } = JSON.parse(text || "{}");
    if (!fileUrl) return res.status(400).json({ error: "fileUrl required" });
    const fr = await fetch(fileUrl);
    if (!fr.ok) return res.status(400).json({ error: "cannot fetch fileUrl" });
    bytes = Buffer.from(await fr.arrayBuffer());
    mime = fr.headers.get("content-type") || mime;
  } else {
    // Raw bytes (blob) were posted
    bytes = await readRaw(req);
    mime = req.headers["content-type"] || mime;
  }

  // 1) Create upload session
  const up = await fetch(`https://api.shotstack.io/ingest/${env}/upload`, {
    method: "POST",
    headers: { "x-api-key": SHOTSTACK_API_KEY }
  });
  const upData = await up.json();
  if (!up.ok) return res.status(400).json(upData);
  const id = upData?.data?.id;
  const putUrl = upData?.data?.attributes?.url;

  // 2) PUT bytes to signed URL
  const put = await fetch(putUrl, { method: "PUT", headers: { "content-type": mime }, body: bytes });
  if (!put.ok) return res.status(400).json({ error: "signed PUT failed" });

  // 3) Poll source until ready
  let src = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const s = await fetch(`https://api.shotstack.io/ingest/${env}/sources/${id}`, {
      headers: { "x-api-key": SHOTSTACK_API_KEY }
    });
    const sj = await s.json();
    const status = sj?.data?.attributes?.status;
    if (status === "ready") {
      src = sj?.data?.attributes?.source;
      break;
    } else if (status === "failed") {
      return res.status(400).json({ error: "ingest failed" });
    }
  }
  if (!src) return res.status(408).json({ error: "ingest timeout" });
  return res.status(200).json({ src });
}
