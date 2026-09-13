const PRODUCTS = {
  1: { name: "Mounjaro Natural Uni Ervas - 1 pote (60 capsulas)", amount: 54.90 },
  2: { name: "Mounjaro Natural Uni Ervas - 2 potes (120 capsulas)", amount: 84.90 },
  3: { name: "Mounjaro Natural Uni Ervas - 3 potes (180 capsulas)", amount: 109.90 }
};

function digits(value = "") {
  return String(value).replace(/\D/g, "");
}

function text(value = "") {
  return String(value).trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({
      error: "MERCADOPAGO_ACCESS_TOKEN não configurado na Vercel."
    });
  }

  try {
    const body = req.body || {};
    const kit = Number(body.kit);
    const product = PRODUCTS[kit];
    const cpf = digits(body.tax_id);
    const cep = digits(body.postal_code);
    let phone = digits(body.phone);
    const uf = text(body.region_code).toUpperCase();
    const fullName = text(body.name);
    const nameParts = fullName.split(/\s+/);

    if (!product) return res.status(400).json({ error: "Kit inválido." });
    if (nameParts.length < 2) return res.status(400).json({ error: "Informe nome e sobrenome." });
    if (!/^\S+@\S+\.\S+$/.test(text(body.email))) return res.status(400).json({ error: "E-mail inválido." });
    if (cpf.length !== 11) return res.status(400).json({ error: "CPF inválido." });
    if (cep.length !== 8) return res.status(400).json({ error: "CEP inválido." });
    if (uf.length !== 2) return res.status(400).json({ error: "UF inválida." });
    if (!text(body.city) || !text(body.street) || !text(body.number) || !text(body.locality)) {
      return res.status(400).json({ error: "Preencha o endereço completo." });
    }

    if (phone.startsWith("55") && phone.length >= 12) phone = phone.slice(2);
    const areaCode = phone.length >= 10 ? phone.slice(0, 2) : "";
    const phoneNumber = phone.length >= 10 ? phone.slice(2) : "";
    const origin = process.env.SITE_URL || `https://${req.headers.host}`;
    const reference = `GIGIH-${Date.now()}`;

    const preference = {
      items: [{
        id: `MOUNJARO-${kit}`,
        title: product.name,
        quantity: 1,
        currency_id: "BRL",
        unit_price: product.amount
      }],
      payer: {
        name: nameParts.shift(),
        surname: nameParts.join(" "),
        email: text(body.email),
        identification: { type: "CPF", number: cpf },
        ...(areaCode && phoneNumber ? {
          phone: { area_code: areaCode, number: phoneNumber }
        } : {}),
        address: {
          zip_code: cep,
          street_name: text(body.street),
          street_number: text(body.number)
        }
      },
      shipments: {
        cost: 0,
        mode: "not_specified",
        receiver_address: {
          zip_code: cep,
          street_name: text(body.street),
          street_number: text(body.number),
          apartment: text(body.complement),
          city_name: text(body.city),
          state_name: uf,
          country_name: "Brasil"
        }
      },
      back_urls: {
        success: `${origin}/obrigado.html?status=approved`,
        pending: `${origin}/obrigado.html?status=pending`,
        failure: `${origin}/obrigado.html?status=failure`
      },
      auto_return: "approved",
      notification_url: `${origin}/api/mercadopago-webhook`,
      external_reference: reference,
      statement_descriptor: "UNI ERVAS BRASIL",
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }],
        installments: 3
      },
      metadata: {
        kit,
        locality: text(body.locality),
        complement: text(body.complement)
      }
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Mercado Pago error", response.status, data);
      return res.status(response.status).json({
        error: "O Mercado Pago recusou a criação do checkout."
      });
    }

    const payUrl = accessToken.startsWith("TEST-")
      ? (data.sandbox_init_point || data.init_point)
      : data.init_point;

    if (!payUrl) {
      return res.status(502).json({
        error: "Checkout criado, mas sem link de pagamento."
      });
    }

    return res.status(200).json({
      pay_url: payUrl,
      preference_id: data.id,
      reference_id: reference
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno ao criar o checkout." });
  }
}
