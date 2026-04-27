import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  IndianRupee, 
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// Simple hook for animating numbers
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) return;
    let startTime = null;
    let animationFrame;
    
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    
    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const animatedTotalOrders = useCountUp(stats.totalOrders);
  const animatedRevenue = useCountUp(stats.totalRevenue);
  const animatedPending = useCountUp(stats.pendingOrders);
  const animatedDelivered = useCountUp(stats.deliveredOrders);

  useEffect(() => {
    const q = collection(db, 'orders');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let revenue = 0;
      let pending = 0;
      let delivered = 0;
      const ordersData = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        revenue += Number(data.amount || 0);
        if (data.status === 'Pending' || data.status === 'Order placed') pending++;
        if (data.status === 'Delivered') delivered++;
        ordersData.push({ id: doc.id, ...data });
      });

      const sorted = ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setStats({
        totalOrders: snapshot.size,
        totalRevenue: revenue,
        pendingOrders: pending,
        deliveredOrders: delivered
      });
      setRecentOrders(sorted.slice(0, 5));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const statCards = [
    { 
      label: 'Total Orders', 
      value: animatedTotalOrders, 
      icon: ShoppingBag, 
      colors: { text: 'text-blue-400', bg: 'bg-blue-400/10', glow: 'shadow-blue-500/20' } 
    },
    { 
      label: 'Total Revenue', 
      value: `₹${animatedRevenue.toLocaleString()}`, 
      icon: IndianRupee, 
      colors: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: 'shadow-emerald-500/20' } 
    },
    { 
      label: 'Pending Orders', 
      value: animatedPending, 
      icon: Clock, 
      colors: { text: 'text-amber-400', bg: 'bg-amber-400/10', glow: 'shadow-amber-500/20' } 
    },
    { 
      label: 'Completed', 
      value: animatedDelivered, 
      icon: CheckCircle2, 
      colors: { text: 'text-admin-accent', bg: 'bg-admin-accent/10', glow: 'shadow-admin-accent/20' } 
    },
  ];

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('deliver')) return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
    if (s.includes('ship') || s.includes('out')) return 'bg-blue-400/10 text-blue-400 border-blue-400/20 shadow-[0_0_10px_rgba(96,165,250,0.1)]';
    return 'bg-amber-400/10 text-amber-400 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]';
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-pulse p-2">
        <div className="h-16 w-1/3 bg-white/5 rounded-xl border border-white/5"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-white/5 rounded-2xl border border-white/5"></div>)}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl border border-white/5 mt-6"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-10">
      <div className="mb-10 relative">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 font-['Outfit'] flex items-center gap-3 tracking-tight">
          Dashboard Overview
          <div className="p-2 bg-admin-accent/10 rounded-xl border border-admin-accent/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <TrendingUp className="text-admin-accent" size={24} />
          </div>
        </h1>
        <p className="text-gray-400 text-lg font-medium">Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className="group relative bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a] p-6 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] hover:border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] cursor-default"
          >
            {/* Hover Gradient Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent`}></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-4xl font-black text-white tracking-tight mt-1">{stat.value}</h4>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${stat.colors.bg} ${stat.colors.text} shadow-lg ${stat.colors.glow}`}>
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-xl font-bold text-white font-['Outfit'] tracking-wide">Recent Orders</h3>
          <Link 
            to="/admin/orders" 
            className="flex items-center gap-2 text-sm font-bold text-admin-accent hover:text-yellow-300 transition-colors group px-4 py-2 bg-admin-accent/5 rounded-lg border border-admin-accent/10 hover:border-admin-accent/30 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
          >
            View All Orders
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/5 text-xs uppercase tracking-widest text-gray-400 font-bold">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((order, idx) => (
                <tr 
                  key={order.id} 
                  className={`group transition-all duration-300 hover:bg-admin-accent/[0.03] ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}
                >
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-admin-accent group-hover:text-yellow-400 transition-colors">
                    {order.orderId || order.id.slice(0, 8)}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-200 font-medium">
                    {order.name}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    <span className="truncate max-w-[200px] block">{order.product}</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white tracking-wide">
                    ₹{order.amount}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3.5 py-1.5 text-xs font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium text-right">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-500">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5 mb-2">
                        <ShoppingBag size={32} className="opacity-40" />
                      </div>
                      <p className="text-lg font-medium">No orders have been placed yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
