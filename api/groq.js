// Proxy hacia Groq: la API key vive solo en el servidor (GROQ_API_KEY)
// y solo responde a usuarios con un ID token válido de Firebase Auth.

async function verificarToken(idToken) {
  const r = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" +
      encodeURIComponent(process.env.FIREBASE_API_KEY),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!r.ok) return null;
  const data = await r.json();
  return data?.users?.[0]?.localId || null; // uid
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const key = process.env.GROQ_API_KEY;
  if (!key || !process.env.FIREBASE_API_KEY) {
    return res.status(500).json({ error: "Faltan variables de entorno" });
  }

  const auth = req.headers.authorization || "";
  const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!idToken) return res.status(401).json({ error: "Falta el token" });

  const uid = await verificarToken(idToken).catch(() => null);
  if (!uid) return res.status(401).json({ error: "Token inválido o expirado" });

  const { messages, max_completion_tokens } = req.body || {};
  if (!Array.isArray(messages)) return res.status(400).json({ error: "messages inválido" });

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({
      model: process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b",
      messages,
      temperature: 0,
      max_completion_tokens: Math.min(Number(max_completion_tokens) || 400, 800),
      response_format: { type: "json_object" },
    }),
  });
  res.status(r.status).setHeader("Content-Type", "application/json").send(await r.text());
}
