export default async function handler(req,res){
  // Endpoint preparado para receber notificações do PagBank.
  // Em produção, valide a autenticidade da notificação e persista o status do pedido.
  console.log("PagBank webhook:", req.method, req.body || {});
  return res.status(200).json({ok:true});
}