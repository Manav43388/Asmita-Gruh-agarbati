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

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Sort manually by date
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
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { label: 'Completed', value: stats.deliveredOrders, icon: CheckCircle2, color: 'text-admin-accent', bg: 'bg-admin-accent/10', border: 'border-admin-accent/20' },
  ];

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('deliver')) return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
    if (s.includes('ship') || s.includes('out')) return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
    return 'bg-amber-400/10 text-amber-400 border-amber-400/20'; // Pending / default
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-pulse">
        <div className="h-20 w-1/3 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>)}
        </div>
        <div className="h-96 bg-[#141414] rounded-2xl border border-[#2a2a2a] mt-6"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
          Dashboard Overview
          <TrendingUp className="text-admin-accent" size={28} />
        </h1>
        <p className="text-gray-400">Welcome back! Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className="group relative bg-[#141414] p-6 rounded-2xl border border-[#2a2a2a] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-gray-700"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110`}></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                <h4 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h4>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${stat.bg} ${stat.color} ${stat.border}`}>
                <stat.icon size={26} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-[#2a2a2a] flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
          <h3 className="text-xl font-bold text-white font-['Outfit']">Recent Orders</h3>
          <Link 
            to="/admin/orders" 
            className="flex items-center gap-2 text-sm font-medium text-admin-accent hover:text-white transition-colors group"
          >
            View All
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#2a2a2a] text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-admin-accent group-hover:text-white transition-colors">
                    {order.orderId || order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                    {order.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <span className="truncate max-w-[200px] block">{order.product}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                    ₹{order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingBag size={48} className="opacity-20" />
                      <p>No orders yet.</p>
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
