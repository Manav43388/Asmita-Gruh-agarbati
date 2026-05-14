import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, CreditCard, ArrowRight, Download, Home, ShoppingBag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const data = location.state;
    if (data) {
      setPaymentData(data);
      // Clear it from session to prevent replay
      window.history.replaceState({}, document.title);
    } else {
      // Try loading from sessionStorage
      const stored = sessionStorage.getItem('lastPaymentSuccess');
      if (stored) {
        setPaymentData(JSON.parse(stored));
        sessionStorage.removeItem('lastPaymentSuccess');
      }
    }
  }, [location]);

  const handleDownloadInvoice = () => {
    if (!paymentData) return;
    // Generate a simple text invoice
    const invoice = `
═══════════════════════════════════════
         ASMITA GRUH UDHYOG
       Premium Agarbatti & More
═══════════════════════════════════════

PAYMENT RECEIPT
───────────────────────────────────────
Order ID:       ${paymentData.orderId}
Payment ID:     ${paymentData.paymentId}
Date:           ${new Date().toLocaleString('en-IN')}

Customer:       ${paymentData.customerName}
Phone:          ${paymentData.customerPhone}

Amount Paid:    ₹${paymentData.amount?.toLocaleString()}
Payment Method: ${paymentData.paymentMethod}
Status:         PAID ✓

═══════════════════════════════════════
    Thank you for your purchase!
═══════════════════════════════════════
    `.trim();

    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${paymentData.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!paymentData) {
    return (
      <div className="payment-result-page">
        <div className="payment-result-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="payment-result-card"
          >
            <div className="payment-empty-state">
              <Package size={64} strokeWidth={1} />
              <h2>No Payment Information</h2>
              <p>This page is only accessible after a successful payment.</p>
              <Link to="/" className="payment-action-btn primary">
                <Home size={18} /> Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        {/* Animated confetti particles */}
        <div className="confetti-container">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="confetti-particle"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                scale: [0, 1, 0.5],
                rotate: Math.random() * 720,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
              style={{
                background: ['#d4af37', '#ecc244', '#22c55e', '#3b82f6', '#a855f7'][Math.floor(Math.random() * 5)],
                width: 8 + Math.random() * 8,
                height: 8 + Math.random() * 8,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="payment-result-card success"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, damping: 12 }}
            className="payment-success-icon"
          >
            <div className="success-ring" />
            <CheckCircle size={64} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="payment-result-title"
          >
            Payment Successful! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="payment-result-subtitle"
          >
            Thank you for your order! Your payment has been processed securely.
          </motion.p>

          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="payment-details-card"
          >
            <div className="payment-detail-row highlight">
              <span className="label"><Package size={14} /> Order ID</span>
              <span className="value gold">{paymentData.orderId}</span>
            </div>
            <div className="payment-detail-row">
              <span className="label"><CreditCard size={14} /> Payment ID</span>
              <span className="value">{paymentData.paymentId}</span>
            </div>
            <div className="payment-detail-row">
              <span className="label">Customer</span>
              <span className="value">{paymentData.customerName}</span>
            </div>
            <div className="payment-detail-row">
              <span className="label">Phone</span>
              <span className="value">{paymentData.customerPhone}</span>
            </div>
            <div className="payment-detail-row">
              <span className="label">Payment Method</span>
              <span className="value">{paymentData.paymentMethod}</span>
            </div>
            <div className="payment-detail-row grand-total">
              <span className="label">Amount Paid</span>
              <span className="value">₹{paymentData.amount?.toLocaleString()}</span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="payment-actions"
          >
            <Link
              to="/track"
              className="payment-action-btn primary"
              onClick={() => localStorage.setItem('last_order_search', paymentData.orderId)}
            >
              <Package size={18} /> Track Order
            </Link>
            <button onClick={handleDownloadInvoice} className="payment-action-btn secondary">
              <Download size={18} /> Download Invoice
            </button>
            <Link to="/" className="payment-action-btn outline">
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
