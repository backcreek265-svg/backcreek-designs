// Simple cart using localStorage
const CART_KEY = 'backcreek_cart';

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item){
  const cart = getCart();
  const existing = cart.find(i=>i.id===item.id);
  if(existing){ existing.qty += 1; }
  else { item.qty = 1; cart.push(item); }
  saveCart(cart);
}

function updateCartBadge(){
  const cart = getCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  const badge = document.getElementById('cart-badge');
  if(badge) badge.textContent = count;
}

function getShippingCost() {
  const el = document.getElementById('shipping-cost');
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

// If on product pages
document.addEventListener('click', (e)=>{
  if(e.target && e.target.classList.contains('add-to-cart')){
    const btn = e.target;
    const item = { id: btn.dataset.id, name: btn.dataset.name, price: parseFloat(btn.dataset.price) };
    addToCart(item);
    btn.textContent = 'Added';
    setTimeout(()=> btn.textContent = 'Add to cart', 1200);
  }
});

// If on cart page, render cart
function renderCart(){
  const container = document.getElementById('cart-items');
  if(!container) return;
  const cart = getCart();
  if(cart.length===0){ container.innerHTML = '<p>Your cart is empty.</p>'; document.getElementById('cart-total').textContent = ''; return; }
  container.innerHTML = '';
  let total=0;
  cart.forEach(item=>{
    const row = document.createElement('div');
    row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='12px 0'; row.style.borderBottom='1px solid #eee';
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div style="color:#666;">$${item.price.toFixed(2)} each</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <input type="number" min="1" value="${item.qty}" data-id="${item.id}" style="width:60px; padding:6px;">
        <button data-remove="${item.id}" style="padding:8px 10px; background:#e74c3c; color:white; border:none; border-radius:6px; cursor:pointer;">Remove</button>
      </div>
    `;
    container.appendChild(row);
    total += item.price * item.qty;
  });
  const shipping = getShippingCost();
  document.getElementById('cart-total').textContent = 'Total: $' + total.toFixed(2) + (shipping > 0 ? ` + $${shipping.toFixed(2)} shipping = $${(total+shipping).toFixed(2)}` : '');
}

// Handle quantity changes and remove
document.addEventListener('input', (e)=>{
  if(e.target && e.target.tagName==='INPUT' && e.target.dataset.id){
    const id = e.target.dataset.id; const qty = parseInt(e.target.value) || 1;
    const cart = getCart();
    const item = cart.find(i=>i.id===id);
    if(item){ item.qty = qty; saveCart(cart); renderCart(); }
  }
});

document.addEventListener('click', (e)=>{
  if(e.target && e.target.dataset.remove){
    const id = e.target.dataset.remove;
    let cart = getCart();
    cart = cart.filter(i=>i.id!==id);
    saveCart(cart); renderCart();
  }
});

// Listen for shipping cost changes
const shippingEl = document.getElementById('shipping-cost');
if (shippingEl) {
  shippingEl.addEventListener('input', renderCart);
}

// checkout placeholder
const checkoutBtn = document.getElementById('checkout');
if(checkoutBtn){ checkoutBtn.addEventListener('click', ()=> alert('Checkout placeholder — integrate payment gateway to process orders.')); }

// initial render
updateCartBadge(); renderCart();
