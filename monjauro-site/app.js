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

(async()=>{
  const source = [...document.querySelectorAll("video source")]
    .find(el => el.getAttribute("src") === "./videos/614284.mp4");
  if(!source) return;

  try{
    const paths = [
      "./videos/618845/part0.txt",
      "./videos/618845/part1.txt",
      "./videos/618845/part3.txt",
      "./videos/618845/part4.txt",
      "./videos/618845/part5.txt",
      "./videos/618845/part6.txt"
    ];
    const chunks = await Promise.all(paths.map(async path=>{
      const r = await fetch(path);
      if(!r.ok) throw new Error(`Falha ao carregar ${path}`);
      return r.text();
    }));
    const b64 = chunks.join("");
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes],{type:"video/mp4"}));
    const video = source.closest("video");
    source.remove();
    video.src = url;
    video.load();
  }catch(err){
    console.warn("Não foi possível carregar o vídeo 618845:", err);
  }
})();
