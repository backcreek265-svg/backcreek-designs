// Simple cart using localStorage
const CART_KEY = 'backcreek_cart';

// Product image mapping
const PRODUCT_IMAGES = {
  'cap1': 'image/product.jpg',
  'cap2': 'image/plain.png',
  'cap3': 'image/plain.png',
  'premium1': 'image/yamaha-cap.svg',
  'premium2': 'image/american-flag-cap.svg',
  'premium3': 'image/racing-cap.svg',
  'custom1': 'image/custom-logo-cap.svg',
  'custom2': 'image/custom-color-cap.svg',
  'custom3': 'image/fully-custom-cap.svg',
  'keychain1': 'image/backcreek-keychain.svg',
  'keychain2': 'image/custom-keychain.svg',
  'keychain3': 'image/premium-keychain.svg',
  'keychain4': 'image/yamaha-keychain.svg',
  'keychain5': 'image/leather-keychain.svg',
  'keychain6': 'image/anchor-keychain.svg',
  'keychain7': 'image/metal-keychain.svg',
  'keychain8': 'image/rope-keychain.svg',
  'keychain9': 'image/wood-keychain.svg'
};

function getProductImage(id) {
  return PRODUCT_IMAGES[id] || 'image/plain.png';
}

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item){
  const cart = getCart();
  // Add image if not present
  if (!item.image) {
    item.image = getProductImage(item.id);
  }
  // Treat same item with different note as distinct
  const key = item.id + (item.note ? `|${item.note}` : '');
  const existing = cart.find(i=> (i.id + (i.note ? `|${i.note}` : '')) === key);
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
    const card = btn.closest('.product-card');
    const noteEl = card ? card.querySelector('.item-note') : null;
    const note = noteEl ? noteEl.value.trim() : '';
    const item = { id: btn.dataset.id, name: btn.dataset.name, price: parseFloat(btn.dataset.price), note };
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
    row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='12px 0'; row.style.borderBottom='1px solid #eee'; row.style.gap='16px';
    const noteHtml = item.note ? `<div style="color:#888; font-size:0.9rem; margin-top:4px;">Note: ${item.note}</div>` : '';
    const key = item.id + (item.note ? `|${item.note}` : '');
    const imgSrc = item.image || getProductImage(item.id);
    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:16px; flex:1;">
        <img src="${imgSrc}" alt="${item.name}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; border:1px solid #e0e0e0;">
        <div>
          <strong>${item.name}</strong>
          <div style="color:#666;">$${item.price.toFixed(2)} each</div>
          ${noteHtml}
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <input type="number" min="1" value="${item.qty}" data-key="${key}" style="width:60px; padding:6px;">
        <button data-remove-key="${key}" style="padding:8px 10px; background:#e74c3c; color:white; border:none; border-radius:6px; cursor:pointer;">Remove</button>
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
  if(e.target && e.target.tagName==='INPUT' && (e.target.dataset.key || e.target.dataset.id)){
    const key = e.target.dataset.key || e.target.dataset.id;
    const qty = parseInt(e.target.value) || 1;
    const cart = getCart();
    const item = cart.find(i=> (i.id + (i.note ? `|${i.note}` : '')) === key);
    if(item){ item.qty = qty; saveCart(cart); renderCart(); }
  }
});

document.addEventListener('click', (e)=>{
  if(e.target && (e.target.dataset.removeKey || e.target.dataset.remove)){
    const key = e.target.dataset.removeKey || e.target.dataset.remove;
    let cart = getCart();
    cart = cart.filter(i=> (i.id + (i.note ? `|${i.note}` : '')) !== key);
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
