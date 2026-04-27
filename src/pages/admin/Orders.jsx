import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  Truck,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  Calendar
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = collection(db, 'orders');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(sorted);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateTracking = async (orderId, trackingId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { trackingId });
      toast.success('Tracking ID updated');
    } catch (error) {
      toast.error('Failed to update tracking');
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone?.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('deliver')) return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
    if (s.includes('ship') || s.includes('out')) return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
    return 'bg-amber-400/10 text-amber-400 border-amber-400/20'; // Pending / default
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-pulse">
        <div className="flex justify-between items-end mb-4">
          <div className="h-10 w-48 bg-[#141414] rounded-lg"></div>
          <div className="h-12 w-64 bg-[#141414] rounded-xl"></div>
        </div>
        <div className="h-screen bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Order Management
            <ShoppingBag className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">Track, manage and update customer orders.</p>
        </div>
        
        <div className="relative w-full sm:w-[320px] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all placeholder:text-gray-600 shadow-inner"
            placeholder="Search Order ID, Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10 shadow-md">
              <tr className="border-b border-[#2a2a2a] text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-5">Order Info</th>
                <th className="px-6 py-5">Customer Info</th>
                <th className="px-6 py-5">Product & Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Tracking ID</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] overflow-y-auto">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <div className="font-bold text-admin-accent text-sm mb-1">{order.orderId}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} />
                      {order.createdAt?.toDate?.().toLocaleString() || 'Just now'}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2 font-medium text-gray-200 mb-1">
                      <User size={14} className="text-gray-500" /> {order.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <Phone size={14} className="text-gray-500" /> {order.phone}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-500 max-w-[220px]">
                      <MapPin size={14} className="flex-shrink-0 mt-0.5" /> 
                      <span className="line-clamp-2" title={order.address}>{order.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-300 text-sm mb-1 line-clamp-2">{order.product}</div>
                    <div className="text-emerald-400 font-bold tracking-wide">₹{order.amount}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <select 
                      className={`appearance-none bg-[#0a0a0a] border border-[#2a2a2a] text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors cursor-pointer hover:bg-[#1a1a1a] ${getStatusBadge(order.status).replace('bg-', 'hover:bg-').split(' ')[1]}`}
                      value={order.status || 'Order placed'}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option value="Order placed">Order placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="relative w-[150px] group/input">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-admin-accent transition-colors">
                        <Truck size={14} />
                      </div>
                      <input 
                        type="text" 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-gray-300 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors placeholder:text-gray-600 hover:border-gray-600"
                        placeholder="TRK123..." 
                        defaultValue={order.trackingId}
                        onBlur={(e) => updateTracking(order.id, e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <button className="p-2 text-gray-400 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-colors border border-transparent hover:border-admin-accent/20" title="View Details">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
                      <div className="p-4 rounded-full bg-[#0a0a0a] border border-[#2a2a2a]">
                        <Search size={32} className="opacity-50" />
                      </div>
                      <p className="text-lg">No orders found matching "{searchTerm}"</p>
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

export default Orders;
