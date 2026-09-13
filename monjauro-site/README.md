# Site Mounjaro Natural — Achadinhos da Gigih

## O que já está pronto
- Landing page responsiva.
- 3 ofertas: 1 pote (60 cápsulas) R$54,90; 2 potes (120 cápsulas) R$84,90; 3 potes (180 cápsulas) R$109,90.
- Frete padrão embutido no preço.
- Seção com 3 vídeos do TikTok, incluindo o principal vídeo de vendas.
- Prints de avaliações.
- Fotos do produto e composição.
- Checkout com formulário de entrega.
- Integração serverless preparada para PagBank.
- Deploy preparado para Vercel.

## Para o pagamento funcionar de verdade
No Vercel, crie as variáveis de ambiente:
- `PAGBANK_TOKEN` = token da sua conta PagBank
- `SITE_URL` = URL pública do site, por exemplo `https://seusite.vercel.app`

Sem o token, o site abre normalmente, mas o checkout não consegue criar o pagamento.

## Importante antes de publicar
Inclua no rodapé:
- nome/razão social do vendedor
- CPF/CNPJ aplicável
- contato
- política de privacidade
- política de troca/devolução
- prazo estimado de entrega

Também confirme se os preços do fornecedor continuam os mesmos antes de aceitar pedidos, porque a oferta do TikTok Shop pode mudar.

## Deploy
1. Extraia este ZIP.
2. Importe a pasta no Vercel.
3. Configure `PAGBANK_TOKEN` e `SITE_URL`.
4. Faça o deploy.
