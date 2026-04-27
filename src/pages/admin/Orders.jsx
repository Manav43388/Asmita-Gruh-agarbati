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
    if (s.includes('deliver')) return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
    if (s.includes('ship') || s.includes('out')) return 'bg-blue-400/10 text-blue-400 border-blue-400/20 shadow-[0_0_10px_rgba(96,165,250,0.1)]';
    return 'bg-amber-400/10 text-amber-400 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]';
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-pulse p-2">
        <div className="flex justify-between items-end mb-4">
          <div className="h-12 w-56 bg-white/5 rounded-xl border border-white/5"></div>
          <div className="h-14 w-72 bg-white/5 rounded-2xl border border-white/5"></div>
        </div>
        <div className="h-screen bg-white/5 rounded-3xl border border-white/5 shadow-2xl"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-10">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 font-['Outfit'] flex items-center gap-3 tracking-tight">
            Order Management
            <div className="p-2 bg-admin-accent/10 rounded-xl border border-admin-accent/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <ShoppingBag className="text-admin-accent" size={24} />
            </div>
          </h1>
          <p className="text-gray-400 text-lg font-medium">Track, manage and update customer orders.</p>
        </div>
        
        <div className="relative w-full sm:w-[360px] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
            <Search size={20} className="transition-transform duration-300 group-focus-within:scale-110" />
          </div>
          <input 
            type="text" 
            className="w-full bg-[#111] border border-white/10 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-admin-accent/50 focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 placeholder:text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
            placeholder="Search Order ID, Name, Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-white/5 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] overflow-hidden flex flex-col h-[calc(100vh-230px)]">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-400 font-bold shadow-sm">
                <th className="px-8 py-6">Order Info</th>
                <th className="px-8 py-6">Customer Info</th>
                <th className="px-8 py-6">Product & Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Tracking ID</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 overflow-y-auto">
              {filteredOrders.map((order, idx) => (
                <tr 
                  key={order.id} 
                  className={`group transition-all duration-300 hover:bg-admin-accent/[0.03] ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}
                >
                  <td className="px-8 py-6 align-top">
                    <div className="font-black text-admin-accent text-sm mb-1.5 tracking-wide">{order.orderId}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar size={13} className="text-gray-600 group-hover:text-admin-accent/50 transition-colors" />
                      {order.createdAt?.toDate?.().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <div className="flex items-center gap-2 font-bold text-gray-200 mb-1.5 text-sm">
                      <User size={15} className="text-gray-500 group-hover:text-admin-accent/50 transition-colors" /> {order.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1.5 font-medium">
                      <Phone size={15} className="text-gray-500 group-hover:text-admin-accent/50 transition-colors" /> {order.phone}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-500 max-w-[220px] font-medium leading-relaxed">
                      <MapPin size={15} className="flex-shrink-0 mt-0.5 text-gray-500 group-hover:text-admin-accent/50 transition-colors" /> 
                      <span className="line-clamp-2" title={order.address}>{order.address}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <div className="font-semibold text-gray-300 text-sm mb-2 line-clamp-2 leading-relaxed">{order.product}</div>
                    <div className="text-emerald-400 font-black tracking-wide text-base">₹{order.amount}</div>
                  </td>
                  <td className="px-8 py-6 align-top">
                    <select 
                      className={`appearance-none bg-[#0f0f0f] border border-white/10 text-sm font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 cursor-pointer shadow-sm hover:border-white/20 hover:bg-[#151515] ${getStatusBadge(order.status).replace('bg-', 'hover:bg-').split(' ')[1]} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_12px_center]`}
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
                  <td className="px-8 py-6 align-top">
                    <div className="relative w-[180px] group/input">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-admin-accent transition-colors">
                        <Truck size={16} className="transition-transform group-focus-within/input:translate-x-1" />
                      </div>
                      <input 
                        type="text" 
                        className="w-full bg-[#0f0f0f] border border-white/10 text-gray-300 text-sm font-medium rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 placeholder:text-gray-600 hover:border-white/20 shadow-inner"
                        placeholder="TRK123..." 
                        defaultValue={order.trackingId}
                        onBlur={(e) => updateTracking(order.id, e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top text-right">
                    <button className="p-2.5 text-gray-400 hover:text-admin-accent bg-transparent hover:bg-admin-accent/10 rounded-xl transition-all duration-300 border border-transparent hover:border-admin-accent/20 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] active:scale-95" title="View Details">
                      <ExternalLink size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-5 text-gray-500">
                      <div className="p-5 rounded-full bg-white/5 border border-white/5 shadow-inner">
                        <Search size={40} className="opacity-40" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-300 mb-1">No orders found</h3>
                        <p className="text-gray-500 font-medium">We couldn't find anything matching "{searchTerm}"</p>
                      </div>
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
