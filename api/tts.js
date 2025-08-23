// 1. Call TTS
const ttsRes = await fetch("https://faceless-video-gwk6.vercel.app/api/tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: scriptText,
    voiceId: selectedVoiceId,
  }),
});
const ttsData = await ttsRes.json();

// 2. Call Shotstack ingest with base64 audio
await fetch("https://faceless-video-gwk6.vercel.app/api/shotstack/ingest", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    audio: ttsData.audio, // 👈 send base64 directly
  }),
});
