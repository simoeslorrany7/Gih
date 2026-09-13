export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  console.log("Mercado Pago webhook recebido:", {
    type: req.body?.type,
    action: req.body?.action,
    dataId: req.body?.data?.id
  });

  return res.status(200).json({ ok: true });
}
