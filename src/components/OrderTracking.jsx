import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Truck, CheckCircle, Clock, 
  MapPin, MessageCircle, Copy, ChevronRight, 
  ArrowLeft, ShoppingBag, CreditCard, Calendar,
  Box, Info, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Enhanced Mock Order Database
const MOCK_ORDERS = [
  {
    orderId: 'AS-4821',
    orderDate: '2026-04-20',
    status: 'Shipped',
    deliveryDate: '2026-04-26',
    address: '123, Lotus Apartment, City Light, Surat, Gujarat - 395007',
    paymentMethod: 'UPI (Paid)',
    items: [
      { 
        id: 1, 
        name: 'Mogra Premium Agarbatti', 
        image: 'https://images.unsplash.com/photo-1612548403247-aa287dfe9410?auto=format&fit=crop&q=80&w=200', 
        qty: 2, 
        price: 250 
      }
    ],
    totalPrice: 500,
    timeline: [
      { status: 'Order Placed', date: '2026-04-20 10:30 AM', done: true },
      { status: 'Confirmed', date: '2026-04-20 11:45 AM', done: true },
      { status: 'Packed', date: '2026-04-21 09:00 AM', done: true },
      { status: 'Shipped', date: '2026-04-21 02:30 PM', done: true },
      { status: 'Out for Delivery', date: '', done: false },
      { status: 'Delivered', date: '', done: false }
    ]
  },
  {
    orderId: 'AS-3912',
    orderDate: '2026-04-10',
    status: 'Delivered',
    deliveryDate: '2026-04-14',
    address: '123, Lotus Apartment, City Light, Surat, Gujarat - 395007',
    paymentMethod: 'Cash on Delivery',
    items: [
      { 
        id: 2, 
        name: 'Sandalwood Dhoop Sticks', 
        image: 'https://images.unsplash.com/photo-1602812065352-721473210454?auto=format&fit=crop&q=80&w=200', 
        qty: 1, 
        price: 180 
      }
    ],
    totalPrice: 180,
    timeline: [
      { status: 'Order Placed', date: '2026-04-10 04:20 PM', done: true },
      { status: 'Confirmed', date: '2026-04-10 05:00 PM', done: true },
      { status: 'Packed', date: '2026-04-11 10:00 AM', done: true },
      { status: 'Shipped', date: '2026-04-12 11:00 AM', done: true },
      { status: 'Out for Delivery', date: '2026-04-14 09:30 AM', done: true },
      { status: 'Delivered', date: '2026-04-14 02:15 PM', done: true }
    ]
  }
];

const STATUS_MAP = {
  'Order Placed': { icon: Clock, color: '#a0a0a0' },
  'Confirmed': { icon: Info, color: '#3b82f6' },
  'Packed': { icon: Box, color: '#f59e0b' },
  'Shipped': { icon: Truck, color: '#8b5cf6' },
  'Out for Delivery': { icon: MapPin, color: '#ec4899' },
  'Delivered': { icon: CheckCircle, color: '#10b981' }
};

const TRACKER_STEPS = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderTracking() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // In a real app, we'd fetch orders based on user.email or user.id
  const userOrders = user ? MOCK_ORDERS : [];

  const getStepIndex = (status) => {
    const idx = TRACKER_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  if (!user) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <div className="auth-required-view glass-panel">
            <User size={64} className="auth-icon" />
            <h2>Login to Track Orders</h2>
            <p>Please login to your account to view and track your orders.</p>
            <button className="cta-button" onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}>
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
                <p>Manage and track your recent purchases</p>
              </header>

              <div className="orders-grid-amazon">
                {userOrders.length > 0 ? userOrders.map(order => (
                  <div key={order.orderId} className="order-card-amazon glass-panel" onClick={() => setSelectedOrder(order)}>
                    <div className="order-card-top">
                      <div className="order-main-info">
                        <img src={order.items[0].image} alt={order.items[0].name} className="order-thumb" />
                        <div className="order-text">
                          <h4>{order.items[0].name}</h4>
                          <p>Order ID: {order.orderId}</p>
                          <p className="order-date-small">Ordered on: {new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="order-status-badge" style={{ color: STATUS_MAP[order.status]?.color }}>
                        <span className="dot" style={{ backgroundColor: STATUS_MAP[order.status]?.color }} />
                        {order.status}
                      </div>
                    </div>
                    <div className="order-card-bottom">
                      <div className="order-meta-item">
                        <span>Qty: {order.items[0].qty}</span>
                        <span className="divider">|</span>
                        <span>Total: ₹{order.totalPrice}</span>
                      </div>
                      <button className="view-detail-btn-amazon">
                        Track Order <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="no-orders-view glass-panel">
                    <ShoppingBag size={48} />
                    <h3>No orders yet</h3>
                    <p>When you place an order, it will appear here.</p>
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
                <ArrowLeft size={18} /> Back to Orders
              </button>

              <div className="detail-layout">
                {/* Left: Product & Info */}
                <div className="detail-main">
                  <div className="detail-product-card glass-panel">
                    <div className="detail-product-header">
                      <img src={selectedOrder.items[0].image} alt={selectedOrder.items[0].name} className="detail-img" />
                      <div className="detail-product-info">
                        <h2>{selectedOrder.items[0].name}</h2>
                        <div className="id-copy-row">
                          <span>Order #{selectedOrder.orderId}</span>
                          <button onClick={() => { navigator.clipboard.writeText(selectedOrder.orderId); alert('Copied!'); }}>
                            <Copy size={14} />
                          </button>
                        </div>
                        <p className="detail-price">₹{selectedOrder.totalPrice}</p>
                      </div>
                    </div>

                    <div className="detail-info-grid">
                      <div className="info-block">
                        <div className="info-label"><MapPin size={14} /> Delivery Address</div>
                        <p>{selectedOrder.address}</p>
                      </div>
                      <div className="info-block">
                        <div className="info-label"><CreditCard size={14} /> Payment Method</div>
                        <p>{selectedOrder.paymentMethod}</p>
                      </div>
                      <div className="info-block">
                        <div className="info-label"><Calendar size={14} /> Est. Delivery</div>
                        <p>{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="detail-timeline-card glass-panel">
                    <h3>Order Progress</h3>
                    
                    {/* Progress Bar */}
                    <div className="amazon-tracker">
                      <div className="tracker-line">
                        <div 
                          className="tracker-fill" 
                          style={{ width: `${(getStepIndex(selectedOrder.status) / (TRACKER_STEPS.length - 1)) * 100}%` }} 
                        />
                      </div>
                      <div className="tracker-steps">
                        {TRACKER_STEPS.map((step, idx) => {
                          const active = idx <= getStepIndex(selectedOrder.status);
                          return (
                            <div key={step} className={`tracker-step ${active ? 'active' : ''}`}>
                              <div className="step-point" />
                              <span className="step-label">{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="timeline-list">
                      {selectedOrder.timeline.map((event, i) => (
                        <div key={i} className={`timeline-item ${event.done ? 'done' : ''}`}>
                          <div className="timeline-marker">
                            {event.done ? <CheckCircle size={16} /> : <div className="dot" />}
                          </div>
                          <div className="timeline-content">
                            <p className="status-text">{event.status}</p>
                            {event.date && <p className="date-text">{event.date}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="detail-side">
                  <div className="actions-card glass-panel">
                    <h3>Need Help?</h3>
                    <p>Have questions about your order? We're here to help you.</p>
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
