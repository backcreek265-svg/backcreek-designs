// Payment and order-email helper (supports Cash App & PayPal)
// Configuration
const PAYPAL_BUSINESS = 'backcreek265@gmail.com'; // your PayPal email
const CASHAPP_CASHTAG = '$backcreek265'; // CHANGE THIS to your Cash App $cashtag
const MERCHANT_EMAIL = 'backcreek265@gmail.com'; // your email for order notifications
// Optional: set FORM_ENDPOINT to a Formspree endpoint (https://formspree.io/f/xxxx) to receive order emails via Formspree.
// Leave empty to use mailto fallback which opens the user's email client.
const FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxx'

function formatOrderSummary(cart){
  return cart.map(i => `${i.qty} x ${i.name}${i.note ? ` (Note: ${i.note})` : ''} @ $${i.price.toFixed(2)} = $${(i.qty*i.price).toFixed(2)}`).join('\n');
}

function sendOrderByFormspree(customerInfo, cart, total, paymentMethod){
  if(!FORM_ENDPOINT) return Promise.reject('No FORM_ENDPOINT configured');
  const payload = {
    customer_name: customerInfo.name,
    customer_email: customerInfo.email,
    customer_phone: customerInfo.phone,
    shipping_address: customerInfo.address,
    payment_method: paymentMethod,
    order_summary: formatOrderSummary(cart),
    total: total.toFixed(2),
    items: cart
  };
  return fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(r=>{
    if(!r.ok) throw new Error('Formspree response ' + r.status);
    return r.json();
  });
}

function sendOrderByMailto(customerInfo, cart, total, paymentMethod){
  const subject = encodeURIComponent('New Order from Backcreek Designs');
  const body = encodeURIComponent(
    `CUSTOMER INFO:\n` +
    `Name: ${customerInfo.name}\n` +
    `Email: ${customerInfo.email}\n` +
    `Phone: ${customerInfo.phone}\n` +
    `Shipping Address:\n${customerInfo.address}\n\n` +
    `PAYMENT METHOD: ${paymentMethod}\n\n` +
    `ORDER:\n${formatOrderSummary(cart)}\n\n` +
    `TOTAL: $${total.toFixed(2)}`
  );
  const mailto = `mailto:${encodeURIComponent(MERCHANT_EMAIL)}?subject=${subject}&body=${body}`;
  window.location.href = mailto; // opens user's default mail client
}

function showThankYouMessage(customerName){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
  
  const messageBox = document.createElement('div');
  messageBox.style.cssText = 'background:white; padding:40px 50px; border-radius:12px; text-align:center; max-width:500px; box-shadow:0 8px 24px rgba(0,0,0,0.3);';
  messageBox.innerHTML = `
    <h2 style="color:#4CAF50; margin-bottom:16px;">Thank You, ${customerName}!</h2>
    <p style="font-size:1.1rem; color:#333; margin-bottom:12px;">Your order has been received.</p>
    <p style="color:#666; margin-bottom:24px;">We'll email you the shipping details shortly. You'll now be redirected to complete your payment.</p>
    <button id="close-thank-you" style="padding:12px 24px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; font-size:1rem;">Continue to Payment</button>
  `;
  
  overlay.appendChild(messageBox);
  document.body.appendChild(overlay);
  
  return new Promise(resolve => {
    document.getElementById('close-thank-you').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve();
    });
    // auto-close after 5 seconds
    setTimeout(() => {
      if(document.body.contains(overlay)){
        document.body.removeChild(overlay);
        resolve();
      }
    }, 5000);
  });
}

function getCustomerInfo(){
  const nameEl = document.getElementById('buyer-name');
  const emailEl = document.getElementById('buyer-email');
  const phoneEl = document.getElementById('buyer-phone');
  const addressEl = document.getElementById('buyer-address');

  return {
    name: nameEl ? nameEl.value.trim() : '',
    email: emailEl ? emailEl.value.trim() : '',
    phone: phoneEl ? phoneEl.value.trim() : '',
    address: addressEl ? addressEl.value.trim() : '',
    elements: { nameEl, emailEl, phoneEl, addressEl }
  };
}

function validateCustomerInfo(customerInfo){
  const { name, email, phone, address, elements } = customerInfo;
  
  if(!name){
    alert('Please enter your full name.');
    if(elements.nameEl) elements.nameEl.focus();
    return false;
  }
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    alert('Please enter a valid email address.');
    if(elements.emailEl) elements.emailEl.focus();
    return false;
  }
  if(!phone){
    alert('Please enter your phone number.');
    if(elements.phoneEl) elements.phoneEl.focus();
    return false;
  }
  if(!address){
    alert('Please enter your shipping address.');
    if(elements.addressEl) elements.addressEl.focus();
    return false;
  }
  return true;
}

function clearCart(){
  localStorage.removeItem('backcreek_cart');
  const badge = document.getElementById('cart-badge');
  if(badge) badge.textContent = '';
}

function getShippingCost() {
  const el = document.getElementById('shipping-cost');
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

// Cash App checkout
function cashappCheckout(){
  const cart = JSON.parse(localStorage.getItem('backcreek_cart') || '[]');
  if(!cart || cart.length===0){ alert('Your cart is empty.'); return; }

  const customerInfo = getCustomerInfo();
  if(!validateCustomerInfo(customerInfo)) return;

  const shipping = getShippingCost();
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0) + shipping;

  const processOrder = () => {
    showThankYouMessage(customerInfo.name).then(() => {
      // Open Cash App payment link
      const cashappUrl = `https://cash.app/${CASHAPP_CASHTAG}/${total.toFixed(2)}?note=${encodeURIComponent('Backcreek Designs Order - ' + customerInfo.name)}`;
      window.open(cashappUrl, '_blank');
      clearCart();
    });
  };

  if(FORM_ENDPOINT){
    sendOrderByFormspree(customerInfo, cart, total, 'Cash App').then(()=>{
      processOrder();
    }).catch(err=>{
      console.warn('Formspree send failed:', err);
      if(confirm('Sending order email failed. Continue to Cash App anyway?')) processOrder();
    });
  } else {
    sendOrderByMailto(customerInfo, cart, total, 'Cash App');
    setTimeout(processOrder, 1000);
  }
}

// PayPal checkout
function paypalCheckout(){
  const cart = JSON.parse(localStorage.getItem('backcreek_cart') || '[]');
  if(!cart || cart.length===0){ alert('Your cart is empty.'); return; }

  const customerInfo = getCustomerInfo();
  if(!validateCustomerInfo(customerInfo)) return;

  const shipping = getShippingCost();
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0) + shipping;

  const openPayPal = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.paypal.com/cgi-bin/webscr';
    form.target = '_blank';

    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'cmd', value:'_cart'}));
    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'upload', value:'1'}));
    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'business', value:PAYPAL_BUSINESS}));
    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'currency_code', value:'USD'}));
    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'custom', value:`${customerInfo.name}|${customerInfo.email}|${customerInfo.phone}|${customerInfo.address}|shipping:$${shipping.toFixed(2)}`}));

    cart.forEach((item, idx)=>{
      const i = idx + 1;
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'item_name_' + i, value:item.name + (item.note ? ` - Note: ${item.note}` : '')}));
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'amount_' + i, value:item.price.toFixed(2)}));
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'quantity_' + i, value:item.qty}));
    });
    // Add shipping as a separate item for PayPal
    if (shipping > 0) {
      const i = cart.length + 1;
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'item_name_' + i, value:'Shipping'}));
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'amount_' + i, value:shipping.toFixed(2)}));
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'quantity_' + i, value:1}));
    }

    document.body.appendChild(form);
    form.submit();
    form.remove();

    clearCart();
  };

  const processOrder = () => {
    showThankYouMessage(customerInfo.name).then(() => {
      openPayPal();
    });
  };

  if(FORM_ENDPOINT){
    sendOrderByFormspree(customerInfo, cart, total, 'PayPal').then(()=>{
      processOrder();
    }).catch(err=>{
      console.warn('Formspree send failed:', err);
      if(confirm('Sending order email failed. Continue to PayPal anyway?')) processOrder();
    });
  } else {
    sendOrderByMailto(customerInfo, cart, total, 'PayPal');
    setTimeout(processOrder, 1000);
  }
}

// Calculate shipping cost (placeholder logic)
const calcShippingBtn = document.getElementById('calc-shipping');
if (calcShippingBtn) {
  calcShippingBtn.addEventListener('click', function() {
    const addressEl = document.getElementById('buyer-address');
    const shippingEl = document.getElementById('shipping-cost');
    const dest = addressEl ? addressEl.value.trim() : '';
    if (!dest) {
      alert('Please enter the destination address first.');
      if (addressEl) addressEl.focus();
      return;
    }
    // Placeholder: always $8.95 for USPS Priority Mail (real API can be added)
    // Origin: 214 Treemount Ln, Gaston, SC
    // You can replace this with a real API call for dynamic rates
    shippingEl.value = '8.95';
    shippingEl.dispatchEvent(new Event('input'));
    alert('Estimated USPS Priority Mail shipping: $8.95');
  });
}

// Attach to buttons
const cashappBtn = document.getElementById('cashapp-checkout');
if(cashappBtn){ cashappBtn.addEventListener('click', cashappCheckout); }

const paypalBtn = document.getElementById('paypal-checkout');
if(paypalBtn){ paypalBtn.addEventListener('click', paypalCheckout); }
