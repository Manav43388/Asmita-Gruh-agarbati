import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Package, Truck, CheckCircle, Clock, 
  MapPin, MessageCircle, Copy, ChevronRight, 
  ArrowLeft, AlertCircle, Loader2 
} from 'lucide-react';

// Mock Order Database
const MOCK_ORDERS = [
  {
    orderId: 'AS-1001',
    customerName: 'Rahul Sharma',
    phoneNumber: '9876543210',
    products: [
      { name: 'Mogra Premium Agarbatti', qty: 2, price: 250 },
      { name: 'Sandalwood Dhoop Sticks', qty: 1, price: 180 }
    ],
    totalPrice: 680,
    status: 'Shipped',
    orderDate: '2026-04-20',
    deliveryDate: '2026-04-26',
  },
  {
    orderId: 'AS-1002',
    customerName: 'Rahul Sharma',
    phoneNumber: '9876543210',
    products: [
      { name: 'Rose Incense Sticks', qty: 3, price: 120 }
    ],
    totalPrice: 360,
    status: 'Delivered',
    orderDate: '2026-03-15',
    deliveryDate: '2026-03-20',
  },
  {
    orderId: 'AS-1003',
    customerName: 'Priya Patel',
    phoneNumber: '9988776655',
    products: [
      { name: 'Combo Divine Pack', qty: 1, price: 1200 }
    ],
    totalPrice: 1200,
    status: 'Processing',
    orderDate: '2026-04-24',
    deliveryDate: '2026-04-30',
  }
];

const STATUS_STEPS = [
  { label: 'Order Placed', icon: Clock },
  { label: 'Processing', icon: Package },
  { label: 'Shipped', icon: Truck },
  { label: 'Out for Delivery', icon: MapPin },
  { label: 'Delivered', icon: CheckCircle },
];

export default function OrderTracking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const lastSearch = localStorage.getItem('last_order_search');
    if (lastSearch) {
      setSearchQuery(lastSearch);
      handleTrack(lastSearch);
    }
  }, []);

  const handleTrack = (query = searchQuery) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setCurrentOrder(null);
    setPastOrders([]);

    // Simulate API Fetch
    setTimeout(() => {
      const q = query.trim().toUpperCase();
      let foundOrder = MOCK_ORDERS.find(o => o.orderId === q);
      let userPastOrders = [];

      if (!foundOrder) {
        // Search by phone
        userPastOrders = MOCK_ORDERS.filter(o => o.phoneNumber === query);
        if (userPastOrders.length > 0) {
          // Sort by date desc and take latest as current
          userPastOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          foundOrder = userPastOrders[0];
          userPastOrders = userPastOrders.slice(1);
        }
      } else {
        // If searching by ID, also find other orders for that user's phone
        userPastOrders = MOCK_ORDERS.filter(o => o.phoneNumber === foundOrder.phoneNumber && o.orderId !== foundOrder.orderId);
      }

      if (foundOrder) {
        setCurrentOrder(foundOrder);
        setPastOrders(userPastOrders);
        localStorage.setItem('last_order_search', query);
      } else {
        setError('No orders found for the given ID or Phone Number.');
      }
      setLoading(false);
    }, 1000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Order ID Copied!');
  };

  const getStatusIndex = (status) => {
    return STATUS_STEPS.findIndex(s => s.label === status);
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        {/* Header */}
        <header className="tracking-header">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Track Your Divine Order
          </motion.h1>
          <p>Enter your Order ID or Phone Number to stay updated</p>
        </header>

        {/* Search Box */}
        <div className="tracking-search-box glass-panel">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Order ID (e.g. AS-1001) or Phone Number" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>
          <button className="track-btn" onClick={() => handleTrack()} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Track Order'}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="error-message glass-panel"
            >
              <AlertCircle size={40} />
              <p>{error}</p>
            </motion.div>
          )}

          {currentOrder && (
            <motion.div 
              key={currentOrder.orderId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="order-results"
            >
              {/* Current Order Card */}
              <div className="current-order-card glass-panel">
                <div className="order-card-header">
                  <div>
                    <span className="order-id-label">Order ID</span>
                    <h3>{currentOrder.orderId}</h3>
                  </div>
                  <button className="copy-id-btn" onClick={() => copyToClipboard(currentOrder.orderId)}>
                    <Copy size={16} /> Copy ID
                  </button>
                </div>

                <div className="order-details-grid">
                  <div className="detail-item">
                    <label>Customer Name</label>
                    <p>{currentOrder.customerName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Order Date</label>
                    <p>{new Date(currentOrder.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="detail-item">
                    <label>Total Price</label>
                    <p className="price-tag">₹{currentOrder.totalPrice}</p>
                  </div>
                  <div className="detail-item">
                    <label>Est. Delivery</label>
                    <p>{new Date(currentOrder.deliveryDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="order-products-list">
                  <label>Products Ordered</label>
                  <ul>
                    {currentOrder.products.map((p, i) => (
                      <li key={i}>{p.name} <span>× {p.qty}</span></li>
                    ))}
                  </ul>
                </div>

                {/* Progress Tracker */}
                <div className="status-tracker">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(getStatusIndex(currentOrder.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                  <div className="steps-container">
                    {STATUS_STEPS.map((step, idx) => {
                      const isActive = idx <= getStatusIndex(currentOrder.status);
                      const Icon = step.icon;
                      return (
                        <div key={idx} className={`status-step ${isActive ? 'active' : ''}`}>
                          <div className="step-icon-circle">
                            <Icon size={20} />
                          </div>
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-actions">
                  <a 
                    href={`https://wa.me/916352291433?text=Hi, I want to inquire about my order ${currentOrder.orderId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="whatsapp-track-btn"
                  >
                    <MessageCircle size={18} /> Contact on WhatsApp
                  </a>
                </div>
              </div>

              {/* Past Orders Section */}
              {pastOrders.length > 0 && (
                <div className="past-orders-section">
                  <h2>Past Orders</h2>
                  <div className="past-orders-list">
                    {pastOrders.map(order => (
                      <div key={order.orderId} className="past-order-item glass-panel">
                        <div className="past-order-info">
                          <span className="past-id">{order.orderId}</span>
                          <span className="past-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="past-order-meta">
                          <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                          <span className="past-price">₹{order.totalPrice}</span>
                        </div>
                        <button className="view-details-btn" onClick={() => handleTrack(order.orderId)}>
                          View Details <ChevronRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
