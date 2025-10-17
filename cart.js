// Simple cart using localStorage
const CART_KEY = 'backcreek_cart';
// Set your Cash App cashtag here (include the leading $), e.g., '$BackcreekDesigns'
const CASHAPP_CASHTAG = '$westinw125';

// Product image mapping is now loaded from product-images.json
let PRODUCT_IMAGES = {};
fetch('product-images.json')
  .then(r => r.json())
  .then(data => { PRODUCT_IMAGES = data; updateCartBadge(); renderCart(); })
  .catch(() => {});

function getProductImage(id) {
  return PRODUCT_IMAGES[id] || 'image/plain.svg';
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
    showToast(`${item.name} added to cart`);
    btn.textContent = 'Added';
    animateAddToCart(card, btn);
    setTimeout(()=> btn.textContent = 'Add to cart', 1200);
  }
});

// Animated add-to-cart effect
function animateAddToCart(card, btn) {
  if (!card) return;
  const img = card.querySelector('img');
  const cartIcon = document.querySelector('a[href="cart.html"] i.fa-shopping-cart');
  if (!img || !cartIcon) return;
  const imgRect = img.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();
  const clone = img.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = imgRect.left + 'px';
  clone.style.top = imgRect.top + 'px';
  clone.style.width = imgRect.width + 'px';
  clone.style.height = imgRect.height + 'px';
  clone.style.zIndex = 3000;
  clone.style.transition = 'all 0.8s cubic-bezier(.68,-0.55,.27,1.55)';
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);
  requestAnimationFrame(()=>{
    clone.style.left = cartRect.left + (cartRect.width/2 - imgRect.width/4) + 'px';
    clone.style.top = cartRect.top + (cartRect.height/2 - imgRect.height/4) + 'px';
    clone.style.width = imgRect.width/2 + 'px';
    clone.style.height = imgRect.height/2 + 'px';
    clone.style.opacity = '0.5';
  });
  setTimeout(()=>{ clone.remove(); }, 850);
}

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
    const imgSrc = getProductImage(item.id);
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
const mainCheckoutBtn = document.getElementById('main-checkout');
if(mainCheckoutBtn){
  mainCheckoutBtn.addEventListener('click', ()=>{
    // Optionally validate info here, or just go to payment selection
    window.location.href = 'checkout.html';
  });
}

// initial render
updateCartBadge(); renderCart();

// ----- UI Enhancements -----
// Toasts
function ensureToastContainer(){
  let el = document.querySelector('.toast-container');
  if(!el){
    el = document.createElement('div');
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
}
function showToast(text){
  const wrap = ensureToastContainer();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  wrap.appendChild(t);
  requestAnimationFrame(()=> t.classList.add('show'));
  setTimeout(()=>{
    t.classList.remove('show');
    setTimeout(()=> t.remove(), 200);
  }, 1800);
}

// Back to top button
function ensureBackToTop(){
  let btn = document.querySelector('.back-to-top');
  if(!btn){
    btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.title = 'Back to top';
    btn.textContent = '↑';
    btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
    document.body.appendChild(btn);
    window.addEventListener('scroll', ()=>{
      if(window.scrollY > 300) btn.classList.add('show'); else btn.classList.remove('show');
    });
  }
}
ensureBackToTop();

// Dark mode toggle
function ensureDarkToggle(){
  let toggle = document.querySelector('#dark-toggle');
  if(!toggle){
    toggle = document.createElement('button');
    toggle.id = 'dark-toggle';
    toggle.style.position = 'fixed';
    toggle.style.right = '20px';
    toggle.style.bottom = '140px';
    toggle.style.padding = '8px 10px';
    toggle.style.borderRadius = '8px';
    toggle.style.border = '1px solid #e5e7eb';
    toggle.style.background = '#fff';
    toggle.style.cursor = 'pointer';
    toggle.textContent = '🌙';
    toggle.title = 'Toggle dark mode';
    document.body.appendChild(toggle);
    const apply = (on)=> document.body.classList.toggle('dark', !!on);
    const saved = localStorage.getItem('bc_dark') === '1';
    apply(saved);
    toggle.addEventListener('click', ()=>{
      const on = !document.body.classList.contains('dark');
      apply(on);
      localStorage.setItem('bc_dark', on ? '1' : '0');
    });
  }
}
ensureDarkToggle();

// Mini-cart preview (hover on cart link)
function ensureMiniCart(){
  const cartLink = document.querySelector('a[href="cart.html"]');
  if(!cartLink) return;
  let panel = document.querySelector('.mini-cart');
  if(!panel){
    panel = document.createElement('div');
    panel.className = 'mini-cart';
    cartLink.style.position = 'relative';
    cartLink.parentElement.style.position = 'relative';
    panel.style.right = '0';
    panel.style.top = '100%';
    cartLink.parentElement.appendChild(panel);
  }
  function render(){
    const cart = getCart();
    if(cart.length === 0){ panel.innerHTML = '<div style="color:#666;">Cart is empty</div>'; return; }
    const top = cart.slice(0,3);
    let total = 0;
    panel.innerHTML = top.map(i=>{
      total += i.price * i.qty;
      const img = i.image || getProductImage(i.id);
      return `<div class="mini-row"><img class="mini-img" src="${img}" alt="${i.name}"><div style="flex:1;">${i.name} x ${i.qty}</div><div>$${(i.price*i.qty).toFixed(2)}</div></div>`;
    }).join('') + `<div style="border-top:1px solid #e5e7eb; margin-top:6px; padding-top:6px; text-align:right; font-weight:bold;">$${total.toFixed(2)} total</div>`;
  }
  ['mouseenter','focus'].forEach(ev=> cartLink.addEventListener(ev, ()=>{ render(); panel.classList.add('show'); }));
  ['mouseleave','blur'].forEach(ev=> cartLink.addEventListener(ev, ()=> panel.classList.remove('show')));
}
ensureMiniCart();

// Lazy-load images
function enableLazyLoad(){
  document.querySelectorAll('img').forEach(img=>{ if(!img.loading) img.loading = 'lazy'; });
}
if(document.readyState === 'complete' || document.readyState === 'interactive') enableLazyLoad();
else window.addEventListener('DOMContentLoaded', enableLazyLoad);

// ----- Cash App checkout -----
function getCartSubtotal(){
  const cart = getCart();
  return cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
}

function formatUSD(n){
  return (Math.round(n * 100) / 100).toFixed(2);
}

function buildOrderNote(){
  const cart = getCart();
  const lines = cart.map(i => `${i.name} x${i.qty} - $${(i.price*i.qty).toFixed(2)}`);
  const name = (document.getElementById('buyer-name')?.value || '').trim();
  const phone = (document.getElementById('buyer-phone')?.value || '').trim();
  const email = (document.getElementById('buyer-email')?.value || '').trim();
  const addr = (document.getElementById('buyer-address')?.value || '').trim();
  let note = `Backcreek order`;
  if(name) note += ` for ${name}`;
  note += `\n` + lines.join('\n');
  if(phone) note += `\nPhone: ${phone}`;
  if(email) note += `\nEmail: ${email}`;
  if(addr) note += `\nShip: ${addr}`;
  return note;
}

function openCashApp(total){
  const amount = formatUSD(total);
  const tag = CASHAPP_CASHTAG || '';
  const cleanTag = tag.startsWith('$') ? tag : ('$' + tag);
  const urlWithAmount = `https://cash.app/${cleanTag}/${amount}`;
  const urlTagOnly = `https://cash.app/${cleanTag}`;
  // Try opening the URL with amount; if Cash App ignores amount, user can type it
  window.open(urlWithAmount, '_blank');
  // Also copy details to clipboard for convenience
  const details = `${cleanTag}\nAmount: $${amount}\n\n${buildOrderNote()}`;
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(details).catch(()=>{});
  }
}

const cashBtn = document.getElementById('cashapp-checkout');
if(cashBtn){
  cashBtn.addEventListener('click', ()=>{
    if(!CASHAPP_CASHTAG || CASHAPP_CASHTAG.includes('YOUR')){
      alert('Set your Cash App $cashtag in cart.js (CASHAPP_CASHTAG) to enable Cash App checkout.');
      return;
    }
    // Require all info fields
    const name = (document.getElementById('buyer-name')?.value || '').trim();
    const email = (document.getElementById('buyer-email')?.value || '').trim();
    const phone = (document.getElementById('buyer-phone')?.value || '').trim();
    const addr = (document.getElementById('buyer-address')?.value || '').trim();
    if(!name || !email || !phone || !addr){
      alert('Please fill out your name, email, phone, and shipping address before checking out.');
      return;
    }
    const subtotal = getCartSubtotal();
    const shipping = getShippingCost();
    const total = subtotal + (isNaN(shipping) ? 0 : shipping);
    if(total <= 0){
      alert('Your cart is empty. Please add items first.');
      return;
    }
    openCashApp(total);
    showToast('Opening Cash App… details copied to clipboard');
    setTimeout(()=>{
      alert('IMPORTANT: Please check your Cash App payment and confirm the customer paid the full amount ($' + formatUSD(total) + '). If not, contact them before shipping.');
    }, 1200);
  });
}

// Expose payment functions for checkout.html
window.cashAppCheckout = function(){
  // Try to get info from checkout.html first
  const name = (document.getElementById('buyer-name')?.value || '').trim();
  const email = (document.getElementById('buyer-email')?.value || '').trim();
  const phone = (document.getElementById('buyer-phone')?.value || '').trim();
  const addr = (document.getElementById('buyer-address')?.value || '').trim();
  if(!name || !email || !phone || !addr){
    alert('Please fill out your name, email, phone, and shipping address before checking out.');
    return;
  }
  const subtotal = getCartSubtotal();
  const shipping = getShippingCost();
  const total = subtotal + (isNaN(shipping) ? 0 : shipping);
  if(total <= 0){
    alert('Your cart is empty. Please add items first.');
    return;
  }
  openCashApp(total);
  showToast('Opening Cash App… details copied to clipboard');
  setTimeout(()=>{
    alert('IMPORTANT: Please check your Cash App payment and confirm the customer paid the full amount ($' + formatUSD(total) + '). If not, contact them before shipping.');
  }, 1200);
}
window.paypalCheckout = function(){
  alert('PayPal checkout coming soon!');
}
