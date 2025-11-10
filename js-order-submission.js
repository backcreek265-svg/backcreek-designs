// ============================================================
// BACKCREEK DESIGNS - ORDER SUBMISSION CLIENT CODE
// JavaScript for sending order data to Google Sheets backend
// ============================================================

/**
 * SETUP:
 * 1. Replace GOOGLE_APPS_SCRIPT_URL with your deployed web app URL
 * 2. Add this script to your HTML pages that have order forms
 * 3. Call submitOrderToSheet() when customer clicks "Add to Cart" or "Checkout"
 */

// ============================================================
// CONFIGURATION
// ============================================================

// Google Forms submission URL
const GOOGLE_APPS_SCRIPT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdW4pPQ5hQgCFvxjB2dK9e__3AHOayI6QgFAQU0aZA9TyvcOg/formResponse';

// Form field mappings
// NOTE: Add optional fields `orderId` and `tracking` if you create them in your Google Form.
// Find each field's entry id by inspecting the form page HTML or using prefill links.
const FORM_FIELDS = {
  orderId: 'entry.184515123',
  tracking: 'entry.56793878',
  customerName: 'entry.991419179',
  customerEmail: 'entry.1822179688',
  productName: 'entry.151228154',
  material: 'entry.1732230919',
  color: 'entry.659036927',
  notes: 'entry.931961301',
  price: 'entry.424751957',
  quantity: 'entry.1919891682'
};

// ============================================================
// MAIN SUBMISSION FUNCTION
// ============================================================

/**
 * Sends order data to Google Sheets via Apps Script
 * @param {Object} orderData - The order information
 * @returns {Promise} - Resolves with response or rejects with error
 */
async function submitOrderToSheet(orderData) {
  try {
    // Show loading state (optional)
    showLoadingState();
    
    console.log('Sending order data:', orderData);
    
    // Create FormData with Google Forms field names
    const formData = new URLSearchParams();
    formData.append(FORM_FIELDS.customerName, orderData.customerName || '');
    formData.append(FORM_FIELDS.customerEmail, orderData.customerEmail || '');
    formData.append(FORM_FIELDS.productName, orderData.productName || '');
    formData.append(FORM_FIELDS.material, orderData.material || '');
    formData.append(FORM_FIELDS.color, orderData.color || '');
    // If orderId/tracking fields are not configured on the Form, include them inside notes as a fallback
    let notesCombined = orderData.notes || '';
    if (!FORM_FIELDS.orderId && orderData.orderId) {
      notesCombined += (notesCombined ? '\n' : '') + `Order ID: ${orderData.orderId}`;
    }
    if (!FORM_FIELDS.tracking && orderData.tracking) {
      notesCombined += (notesCombined ? '\n' : '') + `Tracking: ${orderData.tracking}`;
    }
    formData.append(FORM_FIELDS.notes, notesCombined);
    formData.append(FORM_FIELDS.price, orderData.price || '');
    formData.append(FORM_FIELDS.quantity, orderData.quantity || 1);
    // Conditionally include optional fields if mappings are configured
    if (FORM_FIELDS.orderId && orderData.orderId) {
      formData.append(FORM_FIELDS.orderId, orderData.orderId);
    }
    if (FORM_FIELDS.tracking && (orderData.tracking || orderData.tracking === '')) {
      formData.append(FORM_FIELDS.tracking, orderData.tracking || '');
    }
    
    // Send to Google Forms
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
    
    console.log('Order submitted successfully');
    
    // Hide loading state
    hideLoadingState();
    
    // Show success message
    showSuccessMessage();
    
    return { success: true };
    
  } catch (error) {
    console.error('Error submitting order:', error);
    
    // Hide loading state
    hideLoadingState();
    
    // Show error message
    showErrorMessage(error.message);
    
    throw error;
  }
}

// ============================================================
// ORDER ID GENERATION
// ============================================================

/**
 * Generates a short unique order ID.
 * We keep the ID compact; the association to name/email/product/etc.
 * is stored alongside this ID in the Sheet.
 */
function generateOrderId(name = '', email = '') {
  const pad = n => String(n).padStart(2, '0');
  const d = new Date();
  const ts = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  // 4-char random base36
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BC-${ts}-${rand}`; // Example: BC-20251107-153012-ABCD
}

// ============================================================
// HELPER FUNCTIONS FOR YOUR EXISTING CART SYSTEM
// ============================================================

/**
 * Extract order data from your cart and send to Google Sheets
 * This integrates with your existing js-01-cart.js
 */
function captureAndSubmitOrder() {
  // Get cart data from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Prepare order data for each item
  cart.forEach((item, index) => {
    const orderData = {
      customerName: document.getElementById('customerName')?.value || 'Guest',
      customerEmail: document.getElementById('customerEmail')?.value || '',
      productName: item.name || item.id,
      material: item.filament || item.material || 'PLA+',
      color: item.color || 'Not specified',
      notes: item.customText || item.notes || '',
      price: item.price.toFixed(2),
      quantity: item.quantity || 1
    };
    
    // Submit to Google Sheets
    submitOrderToSheet(orderData);
  });
  
  // Show confirmation
  alert(`Order submitted! Total: $${total.toFixed(2)}`);
}

/**
 * Capture order when "Add to Cart" is clicked
 * This can be called from your product pages
 */
function captureProductOrder(productCard) {
  const orderData = {
    customerName: 'Guest', // Can be updated at checkout
    customerEmail: '', // Can be updated at checkout
    productName: productCard.querySelector('h3')?.textContent || 'Unknown Product',
    material: productCard.querySelector('.filament-select')?.value || 'PLA+',
    color: productCard.querySelector('.color-select')?.value || 'Black',
    notes: productCard.querySelector('.custom-text')?.value || '',
    price: productCard.dataset.basePrice || '0.00',
    quantity: 1
  };
  
  // Submit to Google Sheets
  submitOrderToSheet(orderData);
}

// ============================================================
// UI FEEDBACK FUNCTIONS
// ============================================================

function showLoadingState() {
  // Create or show loading overlay
  let overlay = document.getElementById('orderLoadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'orderLoadingOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    overlay.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 12px; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
        <div style="font-weight: bold; font-size: 1.2rem;">Submitting Order...</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideLoadingState() {
  const overlay = document.getElementById('orderLoadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function showSuccessMessage() {
  // Create toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #27ae60, #229954);
    color: white;
    padding: 20px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10001;
    font-weight: bold;
    animation: slideIn 0.3s ease;
  `;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.5rem;">✓</span>
      <span>Order submitted successfully!</span>
    </div>
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showErrorMessage(errorText) {
  // Create error toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    padding: 20px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10001;
    font-weight: bold;
  `;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.5rem;">⚠️</span>
      <div>
        <div>Order submission failed</div>
        <div style="font-size: 0.9rem; font-weight: normal; margin-top: 5px;">${errorText}</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Remove after 5 seconds
  setTimeout(() => toast.remove(), 5000);
}

// ============================================================
// INTEGRATION EXAMPLES
// ============================================================

/**
 * EXAMPLE 1: Submit when "Add to Cart" button is clicked
 * Add this to your existing addToCart() function in js-01-cart.js
 */
function exampleAddToCartIntegration() {
  // Your existing add to cart code...
  const item = {
    id: 'cap1',
    name: 'Custom Yamaha Cap',
    price: 15.99,
    quantity: 1,
    filament: 'PLA+',
    color: 'Black'
  };
  
  // Add to localStorage (your existing code)
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // NEW: Submit to Google Sheets
  submitOrderToSheet({
    customerName: 'Guest',
    customerEmail: '',
    productName: item.name,
    material: item.filament,
    color: item.color,
    notes: '',
    price: item.price.toFixed(2),
    quantity: item.quantity
  });
}

/**
 * EXAMPLE 2: Submit all cart items at checkout
 * Call this when checkout button is clicked
 */
function exampleCheckoutIntegration() {
  const customerName = prompt('Enter your name:');
  const customerEmail = prompt('Enter your email:');
  
  if (!customerName || !customerEmail) {
    alert('Name and email are required!');
    return;
  }
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Submit each cart item
  const promises = cart.map(item => {
    return submitOrderToSheet({
      customerName: customerName,
      customerEmail: customerEmail,
      productName: item.name,
      material: item.filament || 'PLA+',
      color: item.color || 'Black',
      notes: item.customText || '',
      price: item.price.toFixed(2),
      quantity: item.quantity
    });
  });
  
  Promise.all(promises)
    .then(() => {
      alert('Order submitted successfully! We will contact you shortly.');
      localStorage.removeItem('cart'); // Clear cart
      window.location.href = '01-home.html'; // Redirect to home
    })
    .catch(error => {
      alert('Error submitting order. Please try again.');
      console.error(error);
    });
}

/**
 * EXAMPLE 3: Submit custom request form data
 * For your 01-custom-request.html page
 */
function submitCustomRequest(formData) {
  const orderData = {
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    productName: `Custom Request - ${formData.get('partType')}`,
    material: 'TBD',
    color: 'TBD',
    notes: `${formData.get('partDescription')}\n\nTimeline: ${formData.get('urgency')}\nPhone: ${formData.get('customerPhone') || 'N/A'}`,
    price: 'TBD',
    quantity: 1
  };
  
  return submitOrderToSheet(orderData);
}

// ============================================================
// EXPORT FOR MODULE USAGE (Optional)
// ============================================================

// If using ES6 modules, uncomment:
// export { submitOrderToSheet, captureAndSubmitOrder, captureProductOrder };
