const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let selected = {kit:2, price:84.90};
const modal = document.querySelector("#checkout");

document.querySelectorAll(".kit button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const card = btn.closest(".kit");
    selected = {kit:Number(card.dataset.kit), price:Number(card.dataset.price)};
    document.querySelector("#selectedTitle").textContent = `${selected.kit} ${selected.kit===1?"Pote":"Potes"}`;
    document.querySelector("#selectedPrice").textContent = `${money(selected.price)} • Frete grátis`;
    document.querySelector("#total").textContent = money(selected.price);
    document.querySelector("#error").textContent = "";
    modal.showModal();
  });
});

document.querySelector("#closeModal").onclick=()=>modal.close();

document.querySelector("#orderForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const error = document.querySelector("#error");
  const button = document.querySelector("#payButton");
  error.textContent="";
  button.disabled=true;
  button.textContent="CRIANDO CHECKOUT...";

  const form = Object.fromEntries(new FormData(e.target).entries());
  form.kit = selected.kit;

  try {
    const response = await fetch("/api/create-checkout",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(form)
    });
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "Não foi possível criar o checkout.");
    if(!data.pay_url) throw new Error("O PagBank não retornou o link de pagamento.");
    window.location.href=data.pay_url;
  } catch(err) {
    error.textContent=err.message;
    button.disabled=false;
    button.textContent="IR PARA O PAGBANK →";
  }
});