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
  Hash,
  ArrowLeft,
  Calendar,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { collection, query, where, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { id: 'Order placed', label: 'Order placed', icon: Clock },
  { id: 'Confirmed', label: 'Confirmed', icon: ShieldCheck },
  { id: 'Packed', label: 'Packed', icon: Box },
  { id: 'Shipped', label: 'Shipped', icon: Truck },
  { id: 'Out for delivery', label: 'Out for delivery', icon: Package },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle }
];

export default function OrderTracking() {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user's orders from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'), 
      where('userEmail', '==', user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserOrders(orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync selected order for real-time status updates
  useEffect(() => {
    if (!selectedOrder?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'orders', selectedOrder.id), (doc) => {
      if (doc.exists()) {
        setSelectedOrder({ id: doc.id, ...doc.data() });
      }
    });
    return () => unsubscribe();
  }, [selectedOrder?.id]);

  const getStepIndex = (status) => {
    return STEPS.findIndex(s => s.id === status);
  };

  if (loading) {
    return (
      <div className="tracking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#d4af37' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <div className="auth-required-view glass-panel">
            <ShieldCheck size={64} className="auth-icon" style={{ color: '#d4af37' }} />
            <h2>Login to Track Orders</h2>
            <p>Please login to your account to view and track your orders.</p>
            <button className="track-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))} style={{ marginTop: '1.5rem' }}>
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <AnimatePresence mode="wait">
          {!selectedOrder ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="orders-list-view"
            >
              <header className="tracking-header-amazon">
                <h1>Your Orders</h1>
                <p>Track and manage your recent divine purchases</p>
              </header>

              <div className="orders-grid-amazon">
                {userOrders.length > 0 ? userOrders.map(order => (
                  <div key={order.id} className="order-card-amazon glass-panel" onClick={() => setSelectedOrder(order)}>
                    <div className="order-card-top">
                      <div className="order-main-info">
                        <div className="order-thumb-placeholder" style={{ width: '80px', height: '80px', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={32} color="#d4af37" />
                        </div>
                        <div className="order-text">
                          <h4>{order.product}</h4>
                          <p>Order ID: {order.orderId}</p>
                          <p className="order-date-small">Ordered on: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</p>
                        </div>
                      </div>
                      <div className="order-status-badge" style={{ color: '#d4af37' }}>
                        <span className="dot" style={{ backgroundColor: '#d4af37' }} />
                        {order.status}
                      </div>
                    </div>
                    <div className="order-card-bottom">
                      <div className="order-meta-item">
                        <span>Qty: 1</span>
                        <span className="divider">|</span>
                        <span>Total: ₹{order.amount}</span>
                      </div>
                      <button className="view-detail-btn-amazon">
                        Track Details <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="auth-required-view glass-panel">
                    <h3>No orders yet</h3>
                    <p>When you place an order, it will appear here for tracking.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="order-detail-view-amazon"
            >
              <button className="back-link" onClick={() => setSelectedOrder(null)}>
                <ArrowLeft size={18} /> Back to My Orders
              </button>

              <div className="detail-layout">
                <div className="detail-main">
                  <div className="detail-product-card glass-panel">
                    <div className="detail-product-header">
                      <div className="detail-img-placeholder" style={{ width: '120px', height: '120px', background: 'rgba(212,175,55,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={64} color="#d4af37" />
                      </div>
                      <div className="detail-product-info">
                        <div className="order-id-badge">Order ID: {selectedOrder.orderId}</div>
                        <h2 style={{ marginTop: '1rem' }}>{selectedOrder.product}</h2>
                        <p className="detail-price">₹{selectedOrder.amount}</p>
                      </div>
                    </div>

                    <div className="detail-info-grid">
                      <div className="info-block">
                        <div className="info-label"><MapPin size={14} /> Delivery Address</div>
                        <p>{selectedOrder.address}</p>
                      </div>
                      <div className="info-block">
                        <div className="info-label"><CreditCard size={14} /> Payment Method</div>
                        <p>Cash on Delivery</p>
                      </div>
                      <div className="info-block">
                        <div className="info-label"><Calendar size={14} /> Est. Delivery</div>
                        <p>3-5 Business Days</p>
                      </div>
                    </div>
                  </div>

                  {/* Amazon Tracking Timeline */}
                  <div className="detail-timeline-card glass-panel">
                    <h3>Order Progress</h3>
                    
                    <div className="amazon-tracker">
                      <div className="tracker-line">
                        <div 
                          className="tracker-fill" 
                          style={{ width: `${(getStepIndex(selectedOrder.status) / (STEPS.length - 1)) * 100}%` }} 
                        />
                      </div>
                      <div className="tracker-steps">
                        {STEPS.map((step, idx) => {
                          const active = idx <= getStepIndex(selectedOrder.status);
                          return (
                            <div key={step.id} className={`tracker-step ${active ? 'active' : ''}`}>
                              <div className="step-point" />
                              <span className="step-label">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="timeline-list" style={{ marginTop: '3rem' }}>
                      {STEPS.filter((_, idx) => idx <= getStepIndex(selectedOrder.status)).reverse().map((step, i) => (
                        <div key={step.id} className="timeline-item done">
                          <div className="timeline-marker">
                            <CheckCircle size={18} />
                          </div>
                          <div className="timeline-content">
                            <p className="status-text">{step.label}</p>
                            <p className="date-text">{i === 0 ? 'Current Status' : 'Completed'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="detail-side">
                  <div className="actions-card glass-panel">
                    <h3>Need Assistance?</h3>
                    <p>Have questions about this order? Chat with us directly.</p>
                    <a 
                      href={`https://wa.me/916352291433?text=Hi, I need help with my order ${selectedOrder.orderId}`} 
                      className="track-btn"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={20} /> WhatsApp Support
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
