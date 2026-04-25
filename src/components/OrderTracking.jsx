import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  MessageCircle, 
  ChevronRight, 
  Box, 
  AlertCircle,
  Loader2,
  Phone,
  Hash
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const STEPS = [
  { id: 'Pending', label: 'Pending', icon: Clock },
  { id: 'Confirmed', label: 'Confirmed', icon: Box },
  { id: 'Shipped', label: 'Shipped', icon: Truck },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle }
];

export default function OrderTracking() {
  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync with Firestore if an order is found
  useEffect(() => {
    let unsubscribe = () => {};

    if (order?.id) {
      unsubscribe = onSnapshot(doc(db, 'orders', order.id), (doc) => {
        if (doc.exists()) {
          setOrder({ id: doc.id, ...doc.data() });
        }
      });
    }

    return () => unsubscribe();
  }, [order?.id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const ordersRef = collection(db, 'orders');
      
      // Try searching by Order ID first
      const qId = query(ordersRef, where('orderId', '==', searchInput.trim()));
      const unsubscribeId = onSnapshot(qId, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setOrder({ id: doc.id, ...doc.data() });
          setLoading(false);
        } else {
          // If not found by ID, try by Phone
          const qPhone = query(ordersRef, where('phone', '==', searchInput.trim()));
          onSnapshot(qPhone, (phoneSnapshot) => {
            if (!phoneSnapshot.empty) {
              const doc = phoneSnapshot.docs[0];
              setOrder({ id: doc.id, ...doc.data() });
            } else {
              setError('Order not found. Please check your Order ID or Phone Number.');
            }
            setLoading(false);
          });
        }
      });
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === order?.status);

  return (
  return (
    <div className="section tracking-section" style={{ position: 'relative', zIndex: 50 }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header className="products-header">
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>Track Your Order</h1>
          <p className="section-subtitle">Enter your Order ID or Phone Number to see real-time updates</p>
        </header>

        {/* Search Bar */}
        <div className="glass-panel tracking-search-box">
          <form onSubmit={handleSearch} className="tracking-form">
            <div className="tracking-input-container">
              <Search className="tracking-search-icon" size={24} />
              <input
                type="text"
                placeholder="Ex: ORD123456 or 9876543210"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="tracking-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="cta-button tracking-btn"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Track'}
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="error-notice"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="order-detail-view"
            >
              <div className="glass-panel order-status-card">
                <div className="order-status-header">
                  <div className="order-id-badge">Order ID: {order.orderId}</div>
                  <div className="order-main-info">
                    <h2 className="order-customer-name">{order.name}</h2>
                    <p className="order-phone-sub"><Phone size={14} /> {order.phone}</p>
                  </div>
                  <div className="order-amount-display">
                    <span className="amount-label">Total Amount</span>
                    <span className="amount-value">₹{order.amount}</span>
                  </div>
                </div>

                <div className="order-status-body">
                  {/* Progress Timeline */}
                  <div className="tracking-timeline-container">
                    <div className="timeline-track">
                      <div 
                        className="timeline-progress-bar"
                        style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                      />
                    </div>

                    <div className="timeline-steps">
                      {STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div key={step.id} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                            <div className="step-icon-circle">
                              <step.icon size={20} />
                            </div>
                            <span className="step-name">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tracking Details Grid */}
                  <div className="tracking-details-grid">
                    <div className="detail-item-box">
                      <div className="detail-item-header">
                        <Package size={18} />
                        <span>Ordered Product</span>
                      </div>
                      <p className="detail-item-value italic">"{order.product}"</p>
                    </div>

                    <div className="detail-item-box">
                      <div className="detail-item-header">
                        <Hash size={18} />
                        <span>Tracking ID</span>
                      </div>
                      <div className="id-with-copy">
                        <p className="detail-item-value font-mono">{order.trackingId || 'Processing...'}</p>
                        {order.trackingId && (
                          <button onClick={() => navigator.clipboard.writeText(order.trackingId)} className="copy-text-btn">Copy</button>
                        )}
                      </div>
                    </div>

                    <div className="detail-item-box full-width">
                      <div className="detail-item-header">
                        <MapPin size={18} />
                        <span>Shipping Address</span>
                      </div>
                      <p className="detail-item-value">{order.address}</p>
                    </div>
                  </div>

                  <div className="help-footer">
                    <a 
                      href={`https://wa.me/916352291433?text=Hi, I have a query about my order ${order.orderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="help-whatsapp-link"
                    >
                      <MessageCircle size={18} /> Need help? Chat with us on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper to use doc without importing again
import { doc } from 'firebase/firestore';
