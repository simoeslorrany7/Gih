export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).end();
  // IMPORTANTE:
  // Este endpoint recebe notificações do PagBank.
  // O Vercel não é banco de dados. Para salvar pedidos/status de forma permanente,
  // conecte Supabase/Neon/Postgres e grave o evento aqui.
  console.log("PagBank webhook:", JSON.stringify(req.body));
  return res.status(200).json({received:true});
}