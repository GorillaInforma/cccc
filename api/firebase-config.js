// Devuelve la config web de Firebase leyendo las variables de entorno de Vercel.
export default function handler(req, res) {
  const cfg = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };
  if (!cfg.apiKey || !cfg.projectId) {
    return res.status(500).json({ error: "Faltan variables de entorno de Firebase" });
  }
  res.setHeader("Cache-Control", "public, max-age=300");
  res.status(200).json(cfg);
}
