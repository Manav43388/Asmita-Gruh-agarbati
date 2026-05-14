import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowLeft, Phone, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function PaymentFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const [failureData, setFailureData] = useState(null);

  useEffect(() => {
    const data = location.state;
    if (data) {
      setFailureData(data);
      window.history.replaceState({}, document.title);
    } else {
      const stored = sessionStorage.getItem('lastPaymentFailure');
      if (stored) {
        setFailureData(JSON.parse(stored));
        sessionStorage.removeItem('lastPaymentFailure');
      }
    }
  }, [location]);

  const handleRetry = () => {
    if (failureData?.retryAction) {
      // Navigate back to home and trigger checkout
      navigate('/', { state: { openCheckout: true, retryOrderId: failureData.orderId } });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="payment-result-card failed"
        >
          {/* Failed Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, damping: 12 }}
            className="payment-failed-icon"
          >
            <div className="failed-ring" />
            <XCircle size={64} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="payment-result-title failed"
          >
            Payment Failed
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="payment-result-subtitle"
          >
            {failureData?.errorMessage || 'Your payment could not be processed. Please try again.'}
          </motion.p>

          {/* Error Details */}
          {failureData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="payment-error-details"
            >
              <div className="error-info-row">
                <AlertTriangle size={16} />
                <span>
                  {failureData.errorCode === 'BAD_REQUEST_ERROR'
                    ? 'The payment was declined. Please check your payment details.'
                    : failureData.errorCode === 'GATEWAY_ERROR'
                    ? 'There was an issue with the payment gateway. Please try again.'
                    : failureData.errorCode === 'SERVER_ERROR'
                    ? 'A temporary server error occurred. Please retry in a moment.'
                    : 'An unexpected error occurred during payment processing.'}
                </span>
              </div>
              {failureData.orderId && (
                <div className="error-order-id">
                  Order ID: <strong>{failureData.orderId}</strong>
                </div>
              )}
            </motion.div>
          )}

          {/* Helpful tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="payment-tips"
          >
            <h4>Things to check:</h4>
            <ul>
              <li>Ensure your UPI app or bank account has sufficient balance</li>
              <li>Check your internet connection and try again</li>
              <li>Try a different payment method (UPI, Card, Net Banking)</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="payment-actions"
          >
            <button onClick={handleRetry} className="payment-action-btn primary retry">
              <RefreshCw size={18} /> Retry Payment
            </button>
            <Link to="/" className="payment-action-btn secondary">
              <ShoppingBag size={18} /> Return to Shop
            </Link>
            <a
              href="https://wa.me/918140306388?text=Hi%2C%20I%20faced%20a%20payment%20issue.%20My%20order%20ID%20is%20"
              target="_blank"
              rel="noopener noreferrer"
              className="payment-action-btn outline"
            >
              <Phone size={18} /> Contact Support
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
