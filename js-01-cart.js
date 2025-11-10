// Simple cart using localStorage
const CART_KEY = 'backcreek_cart';
// Set your Cash App cashtag here (include the leading $), e.g., '$BackcreekDesigns'
const CASHAPP_CASHTAG = '$westinw125';

// Product image mapping - built into the file to avoid loading issues
const PRODUCT_IMAGES = {
  "cap1": "image/backcreekraisedlogo.png",
  "cap2": "image/backcreekcenterridgecap.png", 
  "cap3": "image/plain.png",
  "premium1": "image/backcreekflat.png",
  "premium2": "image/american.png",
  "premium3": "image/product.jpg",
  "custom1": "image/backcreekplaincap.png",
  "custom2": "image/plaincap.png",
  "custom3": "image/customizablekeychain.png",
  "keychain1": "image/backcreekplainkeychain.png",
  "keychain2": "image/customizablekeychain.png",
  "keychain3": "roundkeychain.png",
  "keychain4": "squareyamahakeychain.png.png",
  "keychain5": "roundkeychain.png",
  "keychain6": "backcreekplainkeychain.png.png",
  "keychain7": "wistlekeychain.png",
  "keychain8": "wistlekeychain.png",
  "keychain9": "customizablekeychain.png.png",
  "case1": "squarekeychaincase.png",
  "case2": "wistlekeychaincase.png",
  "case3": "squarekeychaincase.png",
  "case4": "wistlekeychaincase.png",
  "case5": "squarekeychaincase.png",
  "case6": "wistlekeychaincase.png",
  "yeti-holder": "wistlekeychaincase.png",
  "drain-holder": "squarekeychaincase.png"
};

// Initialize cart immediately
updateCartBadge(); 
renderCart();

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
  console.log('Adding to cart:', item);
  const cart = getCart();
  console.log('Current cart before adding:', cart);
  // Add image if not present
  if (!item.image) {
    item.image = getProductImage(item.id);
  }
  // Treat same item with different note as distinct
  const key = item.id + (item.note ? `|${item.note}` : '');
  const existing = cart.find(i=> (i.id + (i.note ? `|${i.note}` : '')) === key);
  if(existing){ existing.qty += 1; }
  else { item.qty = 1; cart.push(item); }
  console.log('Cart after adding:', cart);
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
    // Skip if this page has custom filament selection (Standard Caps)
    const hasFilamentSelect = document.querySelector('.filament-select');
    if(hasFilamentSelect) {
      console.log('Skipping default cart handler - page has custom filament selection');
      return;
    }
    
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
  if(!container) {
    console.log('Cart container not found - not on cart page');
    return;
  }
  const cart = getCart();
  console.log('Rendering cart:', cart);
  
  if(cart.length===0){ 
    container.innerHTML = '<p>Your cart is empty.</p>'; 
    const totalEl = document.getElementById('cart-total');
    if(totalEl) totalEl.textContent = ''; 
    return; 
  }
  
  container.innerHTML = '';
  let total=0;
  cart.forEach(item=>{
    // Fix any items with null prices
    if (item.price === null || item.price === undefined || isNaN(item.price)) {
      console.warn('Item has invalid price:', item);
      item.price = 0; // Set to 0 as fallback
    }
    
    const row = document.createElement('div');
    row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='12px 0'; row.style.borderBottom='1px solid #eee'; row.style.gap='16px';
    const noteHtml = item.note ? `<div style="color:#888; font-size:0.9rem; margin-top:4px;">Note: ${item.note}</div>` : '';
    const key = item.id + (item.note ? `|${item.note}` : '');
    const imgSrc = getProductImage(item.id);
    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:16px; flex:1;">
        <img src="${imgSrc}" alt="${item.name}" style="width:80px; height:80px; object-fit:contain; border-radius:8px; border:1px solid #e0e0e0;">
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
  const totalEl = document.getElementById('cart-total');
  if(totalEl) {
    totalEl.textContent = 'Total: $' + total.toFixed(2) + (shipping > 0 ? ` + $${shipping.toFixed(2)} shipping = $${(total+shipping).toFixed(2)}` : '');
  }
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

// ----- COOL FEATURE: Quick View Modal -----
const productData = {
  'cap1': {
    name: 'Yamaha Logo Cap',
    price: 15.00,
    image: 'backcreekflat.png.png',
    description: 'High-quality marine cowling cap featuring the iconic Yamaha logo. Perfect for protecting your outboard motor from the elements.',
    features: ['Weather resistant materials', 'Yamaha logo design', '3D printed with precision', 'Custom fit for most Yamaha outboards', 'Available in multiple filaments']
  },
  'cap2': {
    name: 'Plain Backcreek Cap',
    price: 15.00,
    image: 'plain.png',
    description: 'Clean, minimalist design cap perfect for any outboard motor. Features the subtle Backcreek branding.',
    features: ['Sleek design', 'Universal fit', 'Durable construction', 'Backcreek quality', 'Choice of filament materials']
  },
  'cap3': {
    name: 'Custom Fit Cap',
    price: 15.00,
    image: 'plain.png',
    description: 'Premium custom-fitted cap designed specifically for your outboard motor model. Precision engineered for perfect fit.',
    features: ['Custom engineered fit', 'Premium materials', 'Model-specific design', 'Enhanced protection', 'Professional finish']
  },
  'premium1': {
    name: 'Premium Yamaha Cap',
    price: 15.00,
    image: 'product.jpg',
    description: 'Premium version of our popular Yamaha cap with enhanced materials and finish.',
    features: ['Premium grade materials', 'Enhanced durability', 'Superior finish', 'Yamaha branding', 'Weather sealed']
  }
};

function createQuickViewModal() {
  const modal = document.createElement('div');
  modal.className = 'quick-view-modal';
  modal.id = 'quick-view-modal';
  modal.innerHTML = `
    <div class="quick-view-content">
      <button class="quick-view-close" onclick="closeQuickView()">&times;</button>
      <div class="quick-view-body">
        <div class="quick-view-image">
          <img id="qv-image" src="" alt="">
        </div>
        <div class="quick-view-details">
          <h2 id="qv-name"></h2>
          <div class="quick-view-price" id="qv-price"></div>
          <div class="quick-view-description" id="qv-description"></div>
          <div class="quick-view-features">
            <h4>Features:</h4>
            <ul id="qv-features"></ul>
          </div>
          <div class="quick-view-actions">
            <button class="quick-view-btn primary" id="qv-add-cart">Add to Cart</button>
            <a class="quick-view-btn secondary" id="qv-view-details">View Full Details</a>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeQuickView();
  });
}

function openQuickView(productId) {
  let modal = document.getElementById('quick-view-modal');
  if (!modal) {
    createQuickViewModal();
    modal = document.getElementById('quick-view-modal');
  }
  
  const product = productData[productId];
  if (!product) return;
  
  document.getElementById('qv-image').src = product.image;
  document.getElementById('qv-name').textContent = product.name;
  document.getElementById('qv-price').textContent = `$${product.price.toFixed(2)}`;
  document.getElementById('qv-description').textContent = product.description;
  
  const featuresList = document.getElementById('qv-features');
  featuresList.innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
  
  const addBtn = document.getElementById('qv-add-cart');
  addBtn.onclick = () => {
    addToCart({
      id: productId,
      name: product.name,
      price: product.price,
      note: 'Added via Quick View'
    });
    showToast(`${product.name} added to cart!`);
    closeQuickView();
  };
  
  const detailsBtn = document.getElementById('qv-view-details');
  detailsBtn.href = getProductDetailsLink(productId);
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function getProductDetailsLink(productId) {
  const links = {
    'cap1': 'product-yamaha-logo-cap.html',
    'cap2': 'product-plain-backcreek.html',
    'cap3': 'product-custom-fit-cap.html',
    'premium1': 'product-yamaha-cap.html'
  };
  return links[productId] || '#';
}

// Add Quick View buttons to product cards - DISABLED
function addQuickViewButtons() {
  // Quick View feature disabled - using 3D STL Viewer instead
  return;
  
  /*
  document.querySelectorAll('.product-card').forEach(card => {
    const addBtn = card.querySelector('.add-to-cart');
    if (addBtn && !card.querySelector('.quick-view-btn-card')) {
      const productId = addBtn.dataset.id;
      if (productData[productId]) {
        const quickViewBtn = document.createElement('button');
        quickViewBtn.className = 'quick-view-btn-card';
        quickViewBtn.textContent = '👁️ Quick View';
        quickViewBtn.style.cssText = `
          margin-top: 8px;
          padding: 8px 12px;
          background: #FF9800;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          font-size: 0.9rem;
          transition: background 0.2s ease;
        `;
        quickViewBtn.addEventListener('mouseover', () => quickViewBtn.style.background = '#F57C00');
        quickViewBtn.addEventListener('mouseout', () => quickViewBtn.style.background = '#FF9800');
        quickViewBtn.onclick = () => openQuickView(productId);
        addBtn.parentNode.insertBefore(quickViewBtn, addBtn.nextSibling);
      }
    }
  });
  */
}

// Initialize Quick View when page loads - DISABLED
/*
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addQuickViewButtons);
} else {
  addQuickViewButtons();
}
*/

// ESC key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuickView();
    closeComparison();
  }
});

// ----- COOL FEATURE 2: Product Comparison Tool -----
let compareList = [];

const extendedProductData = {
  ...productData,
  'premium2': {
    name: 'American Flag Cap',
    price: 25.00,
    image: 'american.png',
    description: 'Patriotic design cap featuring the American flag pattern. Perfect for proud boat owners.',
    features: ['American flag design', 'Premium materials', 'Fade resistant colors', 'Weather sealed', 'Patriotic styling'],
    specs: { material: 'Premium PLA+', weight: '45g', warranty: '1 Year', fitType: 'Universal' }
  },
  'premium3': {
    name: 'Premium Racing Edition',
    price: 79.00,
    image: 'backcreekflat.png.png',
    description: 'High-performance racing edition cap designed for speed boats and racing applications.',
    features: ['Aerodynamic design', 'Racing grade materials', 'Lightweight construction', 'Performance tested', 'Competition ready'],
    specs: { material: 'Carbon Fiber PLA', weight: '38g', warranty: '2 Years', fitType: 'Performance' }
  }
};

// Add specs to existing products
extendedProductData.cap1.specs = { material: 'PLA+', weight: '42g', warranty: '1 Year', fitType: 'Standard' };
extendedProductData.cap2.specs = { material: 'PLA+', weight: '40g', warranty: '1 Year', fitType: 'Universal' };
extendedProductData.cap3.specs = { material: 'Premium PETG', weight: '50g', warranty: '2 Years', fitType: 'Custom' };
extendedProductData.premium1.specs = { material: 'Premium PLA+', weight: '44g', warranty: '1 Year', fitType: 'Yamaha Specific' };

function createCompareCheckboxes() {
  document.querySelectorAll('.product-card').forEach(card => {
    const addBtn = card.querySelector('.add-to-cart');
    if (addBtn && !card.querySelector('.compare-checkbox')) {
      const productId = addBtn.dataset.id;
      if (extendedProductData[productId]) {
        const compareBox = document.createElement('div');
        compareBox.className = 'compare-checkbox';
        compareBox.innerHTML = `
          <input type="checkbox" id="compare-${productId}" data-product="${productId}">
          <label for="compare-${productId}">⚖️</label>
        `;
        
        card.style.position = 'relative';
        card.appendChild(compareBox);
        
        const checkbox = compareBox.querySelector('input');
        checkbox.addEventListener('change', () => toggleCompare(productId, checkbox.checked));
      }
    }
  });
}

function toggleCompare(productId, add) {
  if (add && !compareList.includes(productId)) {
    if (compareList.length >= 3) {
      showToast('Maximum 3 products can be compared');
      document.getElementById(`compare-${productId}`).checked = false;
      return;
    }
    compareList.push(productId);
  } else if (!add) {
    compareList = compareList.filter(id => id !== productId);
  }
  
  updateCompareBar();
}

function updateCompareBar() {
  let bar = document.getElementById('compare-sticky-bar');
  
  if (compareList.length === 0) {
    if (bar) bar.classList.remove('show');
    return;
  }
  
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'compare-sticky-bar';
    bar.className = 'compare-sticky-bar';
    document.body.appendChild(bar);
  }
  
  const products = compareList.map(id => extendedProductData[id]).filter(Boolean);
  
  bar.innerHTML = `
    <div class="compare-info">
      <div class="compare-count">${compareList.length} selected</div>
      <div class="compare-products">
        ${products.map(p => `
          <div class="compare-product-mini">
            ${p.name}
            <span class="remove-compare" onclick="removeFromCompare('${compareList.find(id => extendedProductData[id] === p)}')">&times;</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="compare-actions">
      ${compareList.length >= 2 ? '<button class="compare-btn primary" onclick="showComparison()">Compare Now</button>' : ''}
      <button class="compare-btn secondary" onclick="clearCompare()">Clear All</button>
    </div>
  `;
  
  bar.classList.add('show');
}

function removeFromCompare(productId) {
  compareList = compareList.filter(id => id !== productId);
  const checkbox = document.getElementById(`compare-${productId}`);
  if (checkbox) checkbox.checked = false;
  updateCompareBar();
}

function clearCompare() {
  compareList.forEach(id => {
    const checkbox = document.getElementById(`compare-${id}`);
    if (checkbox) checkbox.checked = false;
  });
  compareList = [];
  updateCompareBar();
}

function showComparison() {
  if (compareList.length < 2) {
    showToast('Select at least 2 products to compare');
    return;
  }
  
  let modal = document.getElementById('comparison-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'comparison-modal';
    modal.className = 'comparison-modal';
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeComparison();
    });
  }
  
  const products = compareList.map(id => extendedProductData[id]).filter(Boolean);
  
  modal.innerHTML = `
    <div class="comparison-content">
      <div class="comparison-header">
        <h2>🏁 Product Comparison</h2>
        <button class="comparison-close" onclick="closeComparison()">&times;</button>
      </div>
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="row-label">Feature</th>
            ${products.map(p => `<th>${p.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="row-label">Product Image</td>
            ${products.map(p => `<td><img src="${p.image}" alt="${p.name}"></td>`).join('')}
          </tr>
          <tr>
            <td class="row-label">Price</td>
            ${products.map(p => `<td class="comparison-price">$${p.price.toFixed(2)}</td>`).join('')}
          </tr>
          <tr>
            <td class="row-label">Description</td>
            ${products.map(p => `<td>${p.description}</td>`).join('')}
          </tr>
          <tr>
            <td class="row-label">Material</td>
            ${products.map(p => `<td>${p.specs.material}</td>`).join('')}
          </tr>
          <tr>
            <td class="row-label">Weight</td>
            ${products.map(p => `<td>${p.specs.weight}</td>`).join('')}
          </tr>
          <tr>
            <td class="row-label">Warranty</td>
            ${products.map(p => `<td>${p.specs.warranty}</td>`).join('')}
          </tr>
          <tr>
            <td class="row-label">Fit Type</td>
            ${products.map(p => `<td>${p.specs.fitType}</td>`).join('')}
          </tr>
          <tr>
            <td class="row-label">Key Features</td>
            ${products.map(p => `<td><ul style="text-align: left; padding-left: 20px;">${p.features.slice(0, 3).map(f => `<li>${f}</li>`).join('')}</ul></td>`).join('')}
          </tr>
          <tr class="comparison-actions-row">
            <td class="row-label">Actions</td>
            ${products.map((p, i) => `
              <td>
                <button class="comparison-add-btn" onclick="addToCartFromComparison('${compareList[i]}')">
                  Add to Cart - $${p.price.toFixed(2)}
                </button>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeComparison() {
  const modal = document.getElementById('comparison-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function addToCartFromComparison(productId) {
  const product = extendedProductData[productId];
  if (product) {
    addToCart({
      id: productId,
      name: product.name,
      price: product.price,
      note: 'Added from comparison tool'
    });
    showToast(`${product.name} added to cart!`);
  }
}

// Initialize comparison tool
function initComparisonTool() {
  createCompareCheckboxes();
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addQuickViewButtons();
    initComparisonTool();
  });
} else {
  addQuickViewButtons();
  initComparisonTool();
}
