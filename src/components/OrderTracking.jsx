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
  CreditCard
} from 'lucide-react';
import { collection, query, where, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

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

  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch logged-in user's orders
  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'orders'), where('userEmail', '==', user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserOrders(orders.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync selected order for real-time updates
  useEffect(() => {
    if (!selectedOrder?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'orders', selectedOrder.id), (doc) => {
      if (doc.exists()) {
        setSelectedOrder({ id: doc.id, ...doc.data() });
      }
    });
    return () => unsubscribe();
  }, [selectedOrder?.id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedOrder(null);

    try {
      const ordersRef = collection(db, 'orders');
      // Search by Order ID
      const qId = query(ordersRef, where('orderId', '==', searchInput.trim().toUpperCase()));
      const snapshot = await getDocs(qId);
      
      if (!snapshot.empty) {
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setSelectedOrder(data);
      } else {
        // Search by Phone
        const qPhone = query(ordersRef, where('phone', '==', searchInput.trim()));
        const phoneSnapshot = await getDocs(qPhone);
        if (!phoneSnapshot.empty) {
          const data = { id: phoneSnapshot.docs[0].id, ...phoneSnapshot.docs[0].data() };
          setSelectedOrder(data);
        } else {
          setError('Order not found. Please check your Order ID or Phone Number.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    return STEPS.findIndex(s => s.id === status);
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        {/* Header - Always show search for easy access */}
        <header className="tracking-header-amazon">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Track Your Divine Order
          </motion.h1>
          <p>Enter your Order ID or Phone Number to stay updated</p>
        </header>

        {/* Search Box - Matches the "Yesterday" UI */}
        <div className="tracking-search-box glass-panel">
          <form onSubmit={handleSearch} className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Order ID (e.g. ORD123456) or Phone Number" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="track-btn" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Track Order'}
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="error-notice glass-panel"
            >
              <AlertCircle size={24} />
              <p>{error}</p>
            </motion.div>
          )}

          {selectedOrder ? (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="order-detail-view-amazon"
            >
              <button className="back-link" onClick={() => setSelectedOrder(null)}>
                <ArrowLeft size={18} /> Back to Search
              </button>

              <div className="detail-layout">
                <div className="detail-main">
                  <div className="detail-product-card glass-panel">
                    <div className="detail-product-header">
                      <div className="detail-product-info" style={{ flex: 1 }}>
                        <div className="order-id-badge">Order ID: {selectedOrder.orderId}</div>
                        <h2 style={{ marginTop: '1rem' }}>{selectedOrder.name}</h2>
                        <p className="detail-price">₹{selectedOrder.amount}</p>
                        <p className="order-phone-sub"><Package size={14} /> {selectedOrder.product}</p>
                      </div>
                      <div className="order-amount-display">
                        <span className="amount-label">Status</span>
                        <span className="amount-value" style={{ fontSize: '1.5rem', color: '#d4af37' }}>{selectedOrder.status}</span>
                      </div>
                    </div>

                    <div className="detail-info-grid" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', marginTop: '2rem' }}>
                      <div className="info-block">
                        <div className="info-label"><MapPin size={14} /> Delivery Address</div>
                        <p>{selectedOrder.address}</p>
                      </div>
                      <div className="info-block">
                        <div className="info-label"><Clock size={14} /> Phone Number</div>
                        <p>{selectedOrder.phone}</p>
                      </div>
                      <div className="info-block">
                        <div className="info-label"><Calendar size={14} /> Ordered On</div>
                        <p>{selectedOrder.createdAt?.seconds ? new Date(selectedOrder.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</p>
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
                    <p>Chat with our support team on WhatsApp for any queries about this order.</p>
                    <a 
                      href={`https://wa.me/916352291433?text=Hi, I need help with my order ${selectedOrder.orderId}`} 
                      className="whatsapp-btn-amazon"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={20} /> Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            user && userOrders.length > 0 && (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="orders-list-view"
                style={{ marginTop: '3rem' }}
              >
                <h2 style={{ marginBottom: '1.5rem' }}>Your Recent Orders</h2>
                <div className="orders-grid-amazon">
                  {userOrders.map(order => (
                    <div key={order.id} className="order-card-amazon glass-panel" onClick={() => setSelectedOrder(order)}>
                      <div className="order-card-top">
                        <div className="order-main-info">
                          <div className="order-text">
                            <h4>{order.product}</h4>
                            <p>Order ID: {order.orderId}</p>
                            <p className="order-date-small">Date: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</p>
                          </div>
                        </div>
                        <div className="order-status-badge" style={{ color: '#d4af37' }}>
                          <span className="dot" style={{ backgroundColor: '#d4af37' }} />
                          {order.status}
                        </div>
                      </div>
                      <div className="order-card-bottom">
                        <div className="order-meta-item">
                          <span>Total: ₹{order.amount}</span>
                        </div>
                        <button className="view-detail-btn-amazon">
                          Track Status <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
