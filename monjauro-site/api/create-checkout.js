const PRODUCTS = {
  1: { name: "Mounjaro Natural Uni Ervas - 1 pote (120 capsulas)", amount: 5490 },
  2: { name: "Mounjaro Natural Uni Ervas - 2 potes (240 capsulas)", amount: 8490 },
  3: { name: "Mounjaro Natural Uni Ervas - 3 potes (360 capsulas)", amount: 10990 }
};

function digits(v=""){ return String(v).replace(/\D/g,""); }

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Método não permitido."});
  if(!process.env.PAGBANK_TOKEN) return res.status(500).json({error:"PAGBANK_TOKEN não configurado no Vercel."});

  try{
    const b=req.body || {};
    const kit=Number(b.kit);
    const product=PRODUCTS[kit];
    if(!product) return res.status(400).json({error:"Kit inválido."});

    const cpf=digits(b.tax_id);
    const cep=digits(b.postal_code);
    const phone=digits(b.phone);
    const uf=String(b.region_code||"").trim().toUpperCase();

    if(!b.name || String(b.name).trim().split(/\s+/).length<2) return res.status(400).json({error:"Informe nome e sobrenome."});
    if(!/^\S+@\S+\.\S+$/.test(String(b.email||""))) return res.status(400).json({error:"E-mail inválido."});
    if(cpf.length!==11) return res.status(400).json({error:"CPF inválido."});
    if(cep.length!==8) return res.status(400).json({error:"CEP inválido."});
    if(uf.length!==2) return res.status(400).json({error:"UF inválida."});

    let phoneObj;
    if(phone.length>=10){
      let national=phone;
      if(national.startsWith("55") && national.length>=12) national=national.slice(2);
      const area=national.slice(0,2), number=national.slice(2);
      if(number.length>=8 && number.length<=9) phoneObj={country:"+55",area,number};
    }

    const origin = process.env.SITE_URL || `https://${req.headers.host}`;
    const reference = `GIGIH-${Date.now()}`;

    const payload={
      reference_id:reference,
      customer:{
        name:String(b.name).trim(),
        email:String(b.email).trim(),
        tax_id:cpf,
        ...(phoneObj ? {phone:phoneObj} : {})
      },
      customer_modifiable:true,
      items:[{
        reference_id:`MOUNJARO-${kit}`,
        name:product.name,
        quantity:1,
        unit_amount:product.amount
      }],
      shipping:{
        type:"FREE",
        amount:0,
        address:{
          country:"BRA",
          region_code:uf,
          city:String(b.city||"").trim(),
          postal_code:cep,
          street:String(b.street||"").trim(),
          number:String(b.number||"").trim(),
          locality:String(b.locality||"").trim(),
          ...(b.complement ? {complement:String(b.complement).trim()} : {})
        },
        address_modifiable:true
      },
      payment_methods:[
        {type:"PIX"},
        {type:"CREDIT_CARD",brands:["VISA","MASTERCARD","ELO","HIPERCARD","AMEX"]}
      ],
      payment_methods_configs:[
        {type:"CREDIT_CARD",config_options:[{option:"INSTALLMENTS_LIMIT",value:"3"}]}
      ],
      redirect_url:`${origin}/obrigado.html?ref=${encodeURIComponent(reference)}`,
      return_url:`${origin}/`,
      notification_urls:[`${origin}/api/pagbank-webhook`],
      payment_notification_urls:[`${origin}/api/pagbank-webhook`]
    };

    const response=await fetch("https://api.pagseguro.com/checkouts",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.PAGBANK_TOKEN}`,
        "Content-Type":"application/json",
        "Accept":"application/json"
      },
      body:JSON.stringify(payload)
    });

    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      console.error("PagBank error",response.status,data);
      return res.status(response.status).json({error:"O PagBank recusou a criação do checkout."});
    }

    const pay=(data.links||[]).find(l=>l.rel==="PAY");
    if(!pay?.href) return res.status(502).json({error:"Checkout criado, mas sem link de pagamento."});

    return res.status(200).json({pay_url:pay.href,checkout_id:data.id,reference_id:reference});
  }catch(err){
    console.error(err);
    return res.status(500).json({error:"Erro interno ao criar o checkout."});
  }
}