// PayPal and order-email helper
// Configuration
const PAYPAL_BUSINESS = 'backcreek265@gmail.com'; // your PayPal email
// Optional: set FORM_ENDPOINT to a Formspree endpoint (https://formspree.io/f/xxxx) to receive order emails via Formspree.
// Leave empty to use mailto fallback which opens the user's email client.
const FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxx'

function formatOrderSummary(cart){
  return cart.map(i => `${i.qty} x ${i.name} @ $${i.price.toFixed(2)} = $${(i.qty*i.price).toFixed(2)}`).join('\n');
}

function sendOrderByFormspree(buyerEmail, cart, total){
  if(!FORM_ENDPOINT) return Promise.reject('No FORM_ENDPOINT configured');
  const payload = {
    buyer_email: buyerEmail,
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

function sendOrderByMailto(buyerEmail, cart, total){
  const subject = encodeURIComponent('New order from Backcreek Designs');
  const body = encodeURIComponent(`Buyer: ${buyerEmail}\n\nOrder:\n${formatOrderSummary(cart)}\n\nTotal: $${total.toFixed(2)}`);
  const mailto = `mailto:${encodeURIComponent(PAYPAL_BUSINESS)}?subject=${subject}&body=${body}`;
  window.location.href = mailto; // opens user's default mail client
}

function paypalCheckout(){
  const cart = JSON.parse(localStorage.getItem('backcreek_cart') || '[]');
  if(!cart || cart.length===0){ alert('Your cart is empty.'); return; }

  const buyerEmailEl = document.getElementById('buyer-email');
  const buyerEmail = buyerEmailEl ? buyerEmailEl.value.trim() : '';
  if(!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)){
    alert('Please enter a valid email address so we can send your order and shipping details.');
    if(buyerEmailEl) buyerEmailEl.focus();
    return;
  }

  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);

  // First, try to POST to Formspree if configured, otherwise fallback to mailto
  const afterSend = () => {
    // Build PayPal form and include buyer_email in the 'custom' field so it appears in PayPal transaction
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.paypal.com/cgi-bin/webscr';
    form.target = '_blank';

    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'cmd', value:'_cart'}));
    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'upload', value:'1'}));
    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'business', value:PAYPAL_BUSINESS}));
    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'currency_code', value:'USD'}));
    // include buyer email in custom
    form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'custom', value:`buyer_email:${buyerEmail}`}));

    cart.forEach((item, idx)=>{
      const i = idx + 1;
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'item_name_' + i, value:item.name}));
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'amount_' + i, value:item.price.toFixed(2)}));
      form.appendChild(Object.assign(document.createElement('input'), {type:'hidden', name:'quantity_' + i, value:item.qty}));
    });

    document.body.appendChild(form);
    form.submit();
    form.remove();

    // clear cart after initiating checkout
    localStorage.removeItem('backcreek_cart');
    // update badge if present
    const badge = document.getElementById('cart-badge'); if(badge) badge.textContent = '';
  };

  if(FORM_ENDPOINT){
    sendOrderByFormspree(buyerEmail, cart, total).then(()=>{
      // success -> open PayPal
      afterSend();
    }).catch(err=>{
      console.warn('Formspree send failed:', err);
      if(confirm('Sending order email failed. Continue to PayPal anyway?')) afterSend();
    });
  } else {
    // No Formspree: open mail client with order details, and then open PayPal
    // We'll open the mailto in a new tab then open PayPal form. Because mailto navigates the current tab, we use the fallback to open mailto first.
    sendOrderByMailto(buyerEmail, cart, total);
    // After giving the user a chance to send email in their mail client, still open PayPal form.
    // We call afterSend with a slight delay to allow the mail client to open.
    setTimeout(afterSend, 800);
  }
}

// Attach to button if present
const paypalBtn = document.getElementById('paypal-checkout');
if(paypalBtn){ paypalBtn.addEventListener('click', paypalCheckout); }

// Handle placeholder checkout button
const placeholderBtn = document.getElementById('checkout');
if(placeholderBtn){
  placeholderBtn.addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('backcreek_cart') || '[]');
    if(!cart || cart.length===0){ alert('Your cart is empty.'); return; }

    // Collect customer info for validation
    const nameEl = document.getElementById('buyer-name');
    const emailEl = document.getElementById('buyer-email');
    const phoneEl = document.getElementById('buyer-phone');
    const addressEl = document.getElementById('buyer-address');

    const customerInfo = {
      name: nameEl ? nameEl.value.trim() : '',
      email: emailEl ? emailEl.value.trim() : '',
      phone: phoneEl ? phoneEl.value.trim() : '',
      address: addressEl ? addressEl.value.trim() : ''
    };

    // Validate all fields first
    if(!customerInfo.name){
      alert('Please enter your full name.');
      if(nameEl) nameEl.focus();
      return;
    }
    if(!customerInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)){
      alert('Please enter a valid email address.');
      if(emailEl) emailEl.focus();
      return;
    }
    if(!customerInfo.phone){
      alert('Please enter your phone number.');
      if(phoneEl) phoneEl.focus();
      return;
    }
    if(!customerInfo.address){
      alert('Please enter your shipping address.');
      if(addressEl) addressEl.focus();
      return;
    }

    const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);

    // Show info modal
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
    
    const messageBox = document.createElement('div');
    messageBox.style.cssText = 'background:white; padding:40px 50px; border-radius:12px; text-align:center; max-width:500px; box-shadow:0 8px 24px rgba(0,0,0,0.3);';
    messageBox.innerHTML = `
      <h2 style="color:#FF9800; margin-bottom:16px;">Coming Soon!</h2>
      <p style="font-size:1.1rem; color:#333; margin-bottom:12px;">Additional payment methods are on the way.</p>
      <p style="color:#666; margin-bottom:8px;">For now, please use <strong>PayPal</strong> to complete your order.</p>
      <p style="color:#666; margin-bottom:24px;">Your cart total: <strong>$${total.toFixed(2)}</strong></p>
      <button id="close-placeholder" style="padding:12px 24px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; font-size:1rem;">Got it</button>
    `;
    
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
    
    document.getElementById('close-placeholder').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // Auto-close after 6 seconds
    setTimeout(() => {
      if(document.body.contains(overlay)){
        document.body.removeChild(overlay);
      }
    }, 6000);
  });
}