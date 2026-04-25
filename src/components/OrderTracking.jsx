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
    <div className="min-h-screen bg-[#0a0a0c] pt-28 pb-20 px-4 relative z-50">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
            Track Your Order
          </h1>
          <p className="text-white/50 text-lg">Enter your Order ID or Phone Number to see real-time updates</p>
        </header>

        {/* Search Bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] shadow-2xl mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={24} />
              <input
                type="text"
                placeholder="Ex: ORD123456 or 9876543210"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent border-none py-5 pl-16 pr-6 text-xl text-white placeholder:text-white/20 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 rounded-[1.5rem] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Track'}
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-4 text-rose-400"
            >
              <AlertCircle size={24} />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Order Status Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <div className="text-orange-400 font-mono font-bold text-sm mb-2 uppercase tracking-widest">
                      Order ID: {order.orderId}
                    </div>
                    <h2 className="text-3xl font-bold mb-1">{order.name}</h2>
                    <p className="text-white/50 flex items-center gap-2">
                      <Phone size={16} /> {order.phone}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-white/30 text-sm mb-1 uppercase tracking-wider font-semibold">Total Amount</div>
                    <div className="text-3xl font-bold">₹{order.amount}</div>
                  </div>
                </div>

                <div className="p-8 md:p-10 space-y-10">
                  {/* Progress Timeline */}
                  <div className="relative py-10">
                    <div className="absolute top-[5.25rem] left-0 right-0 h-1 bg-white/10 rounded-full" />
                    <div 
                      className="absolute top-[5.25rem] left-0 h-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                    />

                    <div className="relative flex justify-between">
                      {STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div key={step.id} className="flex flex-col items-center gap-4 group">
                            <div className={`
                              w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 z-10
                              ${isCompleted 
                                ? 'bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg shadow-orange-500/20 text-white' 
                                : 'bg-[#1a1a1c] border border-white/10 text-white/20'}
                              ${isCurrent ? 'scale-125 ring-4 ring-orange-500/20' : ''}
                            `}>
                              <step.icon size={isCurrent ? 28 : 24} />
                            </div>
                            <div className="text-center">
                              <div className={`text-sm font-bold uppercase tracking-wider ${isCompleted ? 'text-white' : 'text-white/20'}`}>
                                {step.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tracking Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
                          <Package size={20} />
                        </div>
                        <span className="font-bold">Ordered Product</span>
                      </div>
                      <p className="text-white/60 leading-relaxed italic">"{order.product}"</p>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                          <Hash size={20} />
                        </div>
                        <span className="font-bold">Tracking ID</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-white/60 font-mono tracking-wider">
                          {order.trackingId || 'Not assigned yet'}
                        </p>
                        {order.trackingId && (
                          <button 
                            onClick={() => { navigator.clipboard.writeText(order.trackingId); }}
                            className="text-xs text-orange-400 hover:text-orange-300 font-bold uppercase"
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors md:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                          <MapPin size={20} />
                        </div>
                        <span className="font-bold">Shipping Address</span>
                      </div>
                      <p className="text-white/60">{order.address}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <a 
                      href={`https://wa.me/916352291433?text=Hi, I have a query about my order ${order.orderId}`}
                      target="_blank"
                      className="text-white/40 hover:text-orange-400 transition-colors flex items-center gap-2 font-medium"
                    >
                      <MessageCircle size={18} /> Need help with this order? Chat with us
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
