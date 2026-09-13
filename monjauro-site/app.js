const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let selected = {kit:2, price:84.90};
const modal = document.querySelector("#checkout");
const buttons = document.querySelectorAll(".kit-card .buy-btn");

buttons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const card = btn.closest(".kit-card");
    selected = {kit:Number(card.dataset.kit), price:Number(card.dataset.price)};
    document.querySelector("#selectedTitle").textContent = `${selected.kit} ${selected.kit===1?"pote":"potes"}`;
    document.querySelector("#selectedPrice").textContent = `${money(selected.price)} • frete incluído`;
    document.querySelector("#total").textContent = money(selected.price);
    document.querySelector("#error").textContent = "";
    modal.showModal();
  });
});

document.querySelector("#closeModal").addEventListener("click",()=>modal.close());
modal.addEventListener("click",(e)=>{ if(e.target===modal) modal.close(); });

document.querySelector("#orderForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const error = document.querySelector("#error");
  const button = document.querySelector("#payButton");
  error.textContent="";
  button.disabled=true;
  button.textContent="CRIANDO CHECKOUT...";

  const form = Object.fromEntries(new FormData(e.target).entries());
  form.kit = selected.kit;

  try{
    const response = await fetch("/api/create-checkout",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(form)
    });
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "Não foi possível criar o checkout.");
    if(!data.pay_url) throw new Error("O Mercado Pago não retornou o link de pagamento.");
    window.location.href = data.pay_url;
  }catch(err){
    error.textContent = err.message;
    button.disabled=false;
    button.textContent="IR PARA O MERCADO PAGO →";
  }
});

// V3: substitui os vídeos por uma galeria de fotos reais do produto.
(()=>{
  const section = document.querySelector("#videos");
  if(!section) return;

  section.id = "produto-fotos";
  section.className = "product-gallery-section";
  section.innerHTML = `
    <div class="product-gallery-shell">
      <div class="product-gallery-head">
        <div>
          <span class="kicker gallery-kicker">PRODUTO DE PERTO</span>
          <h2>Veja detalhes reais antes de escolher seu kit.</h2>
        </div>
        <p>Fotos do produto, da embalagem e das opções de kits para você conferir os detalhes com mais segurança antes da compra.</p>
      </div>

      <div class="product-gallery-layout">
        <div class="gallery-main-card">
          <img id="galleryMainImage" src="./img/produto-real.jpg" alt="Mounjaro Natural Uni Ervas em foto real">
          <div class="gallery-main-caption">
            <span>FOTO REAL DO PRODUTO</span>
            <strong>Mounjaro Natural • Uni Ervas</strong>
          </div>
        </div>

        <div class="gallery-thumbs" aria-label="Galeria de fotos do produto">
          <button class="gallery-thumb active" type="button" data-src="./img/produto-real.jpg" data-alt="Foto real do frasco Mounjaro Natural">
            <img src="./img/produto-real.jpg" alt="Foto real do frasco">
            <span>Produto real</span>
          </button>
          <button class="gallery-thumb" type="button" data-src="./img/produto-rotulo.jpg" data-alt="Rótulo do Mounjaro Natural Uni Ervas">
            <img src="./img/produto-rotulo.jpg" alt="Rótulo do produto">
            <span>Rótulo</span>
          </button>
          <button class="gallery-thumb" type="button" data-src="./img/1-pote.jpg" data-alt="Kit com 1 pote de Mounjaro Natural">
            <img src="./img/1-pote.jpg" alt="Kit com 1 pote">
            <span>1 pote</span>
          </button>
          <button class="gallery-thumb" type="button" data-src="./img/2-potes.jpg" data-alt="Kit com 2 potes de Mounjaro Natural">
            <img src="./img/2-potes.jpg" alt="Kit com 2 potes">
            <span>2 potes</span>
          </button>
          <button class="gallery-thumb" type="button" data-src="./img/3-potes.jpg" data-alt="Kit com 3 potes de Mounjaro Natural">
            <img src="./img/3-potes.jpg" alt="Kit com 3 potes">
            <span>3 potes</span>
          </button>
        </div>
      </div>

      <div class="gallery-trust-line">
        <span>✓ Veja a embalagem de perto</span>
        <span>✓ Compare os kits</span>
        <span>✓ Confira o rótulo antes da compra</span>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .product-gallery-section{padding:100px 7vw;background:#10271c;color:#fff}
    .product-gallery-shell{max-width:1240px;margin:0 auto}
    .product-gallery-head{display:grid;grid-template-columns:1fr .78fr;gap:60px;align-items:end;margin-bottom:38px}
    .product-gallery-head h2{font-family:"Manrope",sans-serif;font-size:clamp(38px,4.2vw,58px);line-height:1.03;letter-spacing:-.04em;margin:10px 0 0;color:#fff;max-width:720px}
    .product-gallery-head p{margin:0;color:#b9c7bd;line-height:1.7;max-width:560px}
    .gallery-kicker{color:#a9c7a1!important}
    .product-gallery-layout{display:grid;grid-template-columns:1.18fr .82fr;gap:22px;align-items:stretch}
    .gallery-main-card{position:relative;min-height:650px;border-radius:28px;overflow:hidden;background:#f5f5f1;border:1px solid rgba(255,255,255,.08)}
    .gallery-main-card>img{width:100%;height:650px;object-fit:cover;display:block}
    .gallery-main-caption{position:absolute;left:18px;right:18px;bottom:18px;padding:16px 18px;border-radius:18px;background:rgba(11,28,19,.82);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.12)}
    .gallery-main-caption span,.gallery-main-caption strong{display:block}
    .gallery-main-caption span{font-size:10px;font-weight:900;letter-spacing:.12em;color:#b9cdb8}
    .gallery-main-caption strong{font-family:"Manrope",sans-serif;font-size:19px;margin-top:5px;color:#fff}
    .gallery-thumbs{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .gallery-thumb{appearance:none;border:1px solid rgba(255,255,255,.12);background:#fff;border-radius:20px;padding:8px;cursor:pointer;text-align:left;overflow:hidden;color:#132218;box-shadow:none}
    .gallery-thumb:hover,.gallery-thumb.active{transform:translateY(-2px);border-color:#9fbd97;box-shadow:0 16px 34px rgba(0,0,0,.18)}
    .gallery-thumb img{display:block;width:100%;height:205px;object-fit:cover;border-radius:14px;background:#f4f4f0}
    .gallery-thumb span{display:block;padding:10px 6px 5px;font-size:12px;font-weight:900;color:#27402f}
    .gallery-thumb:last-child{grid-column:1/-1}
    .gallery-thumb:last-child img{height:190px;object-fit:contain}
    .gallery-trust-line{display:flex;flex-wrap:wrap;justify-content:center;gap:24px;margin-top:28px;color:#c5d3c9;font-size:12px;font-weight:800}
    @media(max-width:1000px){.product-gallery-head,.product-gallery-layout{grid-template-columns:1fr}.gallery-main-card,.gallery-main-card>img{min-height:0;height:560px}.gallery-thumbs{grid-template-columns:repeat(3,1fr)}.gallery-thumb:last-child{grid-column:auto}.gallery-thumb img,.gallery-thumb:last-child img{height:190px}}
    @media(max-width:640px){.product-gallery-section{padding:78px 18px}.product-gallery-head{gap:14px;margin-bottom:26px}.product-gallery-head h2{font-size:34px}.product-gallery-head p{font-size:14px}.gallery-main-card,.gallery-main-card>img{height:460px}.gallery-thumbs{display:flex;overflow:auto;gap:10px;padding-bottom:8px;scroll-snap-type:x mandatory}.gallery-thumb,.gallery-thumb:last-child{min-width:155px;grid-column:auto;scroll-snap-align:start}.gallery-thumb img,.gallery-thumb:last-child img{height:160px}.gallery-trust-line{justify-content:flex-start;gap:12px 18px}}
  `;
  document.head.appendChild(style);

  const main = section.querySelector("#galleryMainImage");
  const thumbs = section.querySelectorAll(".gallery-thumb");
  thumbs.forEach(btn=>btn.addEventListener("click",()=>{
    thumbs.forEach(item=>item.classList.remove("active"));
    btn.classList.add("active");
    main.src = btn.dataset.src;
    main.alt = btn.dataset.alt;
  }));
})();
