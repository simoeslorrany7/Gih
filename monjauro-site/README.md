# Monjaro Natural + PagBank + Vercel

## Já configurado
- 1 pote: R$ 54,90
- 2 potes: R$ 84,90
- 3 potes: R$ 109,90
- Frete exibido como grátis (o custo de envio já foi embutido na precificação)
- Imagens reais recortadas do print fornecido
- Checkout PagBank no backend do Vercel
- Pix + cartão
- Token fica somente em variável de ambiente

## Publicar no Vercel
1. Crie um projeto no Vercel e envie esta pasta/repositório.
2. Em **Project → Settings → Environment Variables**, adicione:
   - `PAGBANK_TOKEN` = seu token NOVO do PagBank
   - `SITE_URL` = `https://seu-projeto.vercel.app`
3. Marque a variável para **Production** (e Preview só se quiser testar lá).
4. Faça um novo Deploy.
5. Teste primeiro com uma compra de valor baixo/controle seu e confira no painel PagBank.

## Segurança
Nunca coloque o token dentro de `app.js`, `index.html` ou em qualquer arquivo da pasta `public`.
Nunca envie o token pelo chat.
O cartão/CVV não passa pelo site: o comprador é redirecionado ao checkout PagBank.

## Webhook
`/api/pagbank-webhook.js` recebe eventos e hoje apenas registra no log.
Para painel de pedidos/status permanente, conecte um banco (ex.: Supabase) e grave os eventos do webhook.

## Antes de vender
Inclua identificação do vendedor, contato, política de privacidade, termos, troca/devolução,
prazo de entrega e confirme todas as informações regulatórias/rotulagem do suplemento.
