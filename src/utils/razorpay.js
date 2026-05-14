/**
 * Razorpay Payment Service
 * Handles all Razorpay payment operations securely
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Load Razorpay SDK dynamically
let razorpayLoaded = false;
export const loadRazorpaySDK = () => {
  return new Promise((resolve, reject) => {
    if (razorpayLoaded && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      razorpayLoaded = true;
      resolve(true);
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
};

// Create Razorpay order via serverless API
export const createRazorpayOrder = async (amountInRupees, receipt, notes = {}) => {
  const amountInPaise = Math.round(amountInRupees * 100);

  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes,
    }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to create payment order');
  }
  return data.order;
};

// Verify payment signature via serverless API
export const verifyPaymentSignature = async (paymentData) => {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
    }),
  });

  const data = await response.json();
  return data;
};

// Open Razorpay checkout popup
export const openRazorpayCheckout = ({
  order,
  customerInfo,
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'Asmita Gruh Udhyog',
    description: 'Premium Agarbatti & Spiritual Products',
    order_id: order.id,
    prefill: {
      name: customerInfo.name || '',
      email: customerInfo.email || '',
      contact: customerInfo.phone || '',
    },
    notes: {
      orderId: customerInfo.orderId || '',
      address: customerInfo.address || '',
    },
    theme: {
      color: '#d4af37',
      backdrop_color: 'rgba(0, 0, 0, 0.85)',
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
      escape: true,
      animation: true,
      confirm_close: true,
    },
    handler: (response) => {
      // Payment succeeded - response contains:
      // razorpay_payment_id, razorpay_order_id, razorpay_signature
      if (onSuccess) onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on('payment.failed', (response) => {
    if (onFailure) {
      onFailure({
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        metadata: response.error.metadata,
      });
    }
  });

  rzp.open();
  return rzp;
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  COD: 'COD',
};

export const PAYMENT_METHODS = {
  RAZORPAY: 'Razorpay',
  COD: 'Cash on Delivery',
};
