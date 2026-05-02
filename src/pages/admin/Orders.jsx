import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  Truck,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  Calendar,
  MessageSquare,
  Trash2,
  Printer,
  Copy,
  X,
  CreditCard,
  Package2
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { createLog } from '../../utils/adminLogs';
import PrintableInvoice from '../../components/admin/PrintableInvoice';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [whatsappConfig, setWhatsappConfig] = useState({ whatsappNumber: '918140306388' });

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) setWhatsappConfig(docSnap.data());
    });
    
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => {
      unsubSettings();
      unsubOrders();
    };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      await createLog('Admin', `Changed order #${orderId} status to ${newStatus}`, 'Orders');
      toast.success('Status updated');
      
      // Automatically trigger WhatsApp notification
      const updatedOrder = orders.find(o => o.id === orderId);
      if (updatedOrder) {
        notifyViaWhatsApp({ ...updatedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateTracking = async (orderId, trackingId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { trackingId });
      toast.success('Tracking updated');
      
      // Automatically trigger WhatsApp notification for tracking update
      const updatedOrder = orders.find(o => o.id === orderId);
      if (updatedOrder) {
        notifyViaWhatsApp({ ...updatedOrder, trackingId });
      }
    } catch (error) {
      toast.error('Failed to update tracking');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
      await createLog('Admin', `Deleted order #${id}`, 'Orders');
      toast.success('Order deleted');
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const notifyViaWhatsApp = (order) => {
    const businessName = whatsappConfig.businessName || 'Asmita Gruh Udhyog';
    const orderId = order.orderId || order.id.slice(0, 8);
    const status = order.status || 'Order placed';
    const trackingId = order.trackingId || '';
    
    let msg = `*Order Update - ${businessName}*%0A%0A`;
    msg += `Hello *${order.name}*,%0A%0A`;
    msg += `Your order *#${orderId}* has been updated to: *${status}*%0A`;
    
    if (trackingId) {
      msg += `%0A🚚 *Tracking ID:* ${trackingId}%0A`;
    }
    
    msg += `%0A📦 *Order Details:*%0A`;
    msg += `- Item(s): ${order.product}%0A`;
    msg += `- Amount: ₹${order.amount}%0A%0A`;
    
    msg += `📍 *Track your order:* ${window.location.origin}/track%0A%0A`;
    msg += `Thank you for choosing ${businessName}!`;

    const phone = order.phone.replace(/\D/g, '');
    const finalPhone = phone.startsWith('91') ? phone : `91${phone}`;
    
    window.open(`https://wa.me/${finalPhone}?text=${msg}`);
    toast.success('Opening WhatsApp');
  };

  const [activeTab, setActiveTab] = useState('New');

  const tabs = [
    { id: 'All', label: 'All Orders', icon: ShoppingBag },
    { id: 'New', label: 'New', count: orders.filter(o => o.status === 'Order placed' || o.status === 'Pending').length },
    { id: 'Ongoing', label: 'Ongoing', count: orders.filter(o => ['Confirmed', 'Packed', 'Shipped', 'Out for delivery'].includes(o.status)).length },
    { id: 'Completed', label: 'Completed', count: orders.filter(o => o.status === 'Delivered').length },
    { id: 'Cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);
    
    if (!matchesSearch) return false;

    if (activeTab === 'All') return true;
    if (activeTab === 'New') return order.status === 'Order placed' || order.status === 'Pending';
    if (activeTab === 'Ongoing') return ['Confirmed', 'Packed', 'Shipped', 'Out for delivery'].includes(order.status);
    if (activeTab === 'Completed') return order.status === 'Delivered';
    if (activeTab === 'Cancelled') return order.status === 'Cancelled';
    return true;
  });

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('deliver')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 focus:ring-emerald-500/30';
    if (s.includes('ship') || s.includes('out')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30 focus:ring-blue-500/30';
    if (s.includes('cancel')) return 'bg-red-500/10 text-red-400 border-red-500/30 focus:ring-red-500/30';
    if (s.includes('confirm') || s.includes('pack')) return 'bg-purple-500/10 text-purple-400 border-purple-500/30 focus:ring-purple-500/30';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/30 focus:ring-amber-500/30';
  };

  const getStatusIconColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('deliver')) return 'text-emerald-400';
    if (s.includes('ship') || s.includes('out')) return 'text-blue-400';
    if (s.includes('cancel')) return 'text-red-400';
    if (s.includes('confirm') || s.includes('pack')) return 'text-purple-400';
    return 'text-amber-400';
  };

  if (loading) return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
      <div className="h-96 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Orders Management
            <ShoppingBag className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400 text-sm">Review, track, and manage all your customer orders in one place.</p>
        </div>
        
        <div className="relative w-full sm:w-[360px] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all placeholder:text-gray-600 shadow-xl"
            placeholder="Search Order ID, Name, Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 px-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
              activeTab === tab.id 
                ? 'bg-admin-accent/10 border-admin-accent text-admin-accent shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                : 'bg-[#141414] border-[#2a2a2a] text-gray-500 hover:border-gray-700 hover:text-gray-300'
            }`}
          >
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === tab.id ? 'bg-admin-accent text-[#0a0a0a]' : 'bg-white/5 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden mx-4">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="bg-[#0a0a0a]">
              <tr className="border-b border-[#2a2a2a] text-[11px] uppercase tracking-[0.1em] text-gray-500 font-bold">
                <th className="px-6 py-5">Order ID / Date</th>
                <th className="px-6 py-5">Customer Details</th>
                <th className="px-6 py-5">Items & Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Tracking</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <div className="font-bold text-admin-accent text-sm mb-1 tracking-tight">{order.orderId || order.id.slice(0, 8)}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <Calendar size={12} className="text-gray-600" />
                      {order.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2 font-bold text-gray-100 text-sm mb-1">
                      {order.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Phone size={12} className="text-gray-600" /> {order.phone}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <MapPin size={12} className="text-gray-600" /> 
                      <span className="truncate max-w-[150px]">{order.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="text-xs text-gray-300 font-medium mb-1 line-clamp-1">{order.product}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-admin-accent font-bold text-sm">₹{order.amount}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/10 uppercase">
                        {order.paymentMethod || 'COD'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="relative group/select w-[160px]">
                      <select 
                        className={`appearance-none w-full bg-[#0a0a0a] border text-[10px] font-black uppercase tracking-[0.15em] rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all cursor-pointer shadow-lg ${getStatusBadge(order.status)}`}
                        value={order.status || 'Pending'}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 ${getStatusIconColor(order.status)}`}>
                        <Package2 size={14} strokeWidth={2.5} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="relative w-[140px]">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600">
                        <Truck size={12} />
                      </div>
                      <input 
                        type="text" 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-gray-300 text-[11px] font-medium rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-admin-accent transition-colors hover:border-gray-600"
                        placeholder="Tracking ID" 
                        defaultValue={order.trackingId}
                        onBlur={(e) => updateTracking(order.id, e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all" title="View Details"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={() => notifyViaWhatsApp(order)}
                        className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all" title="Notify Customer"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-[#0a0a0a] border border-[#2a2a2a] w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between bg-gradient-to-r from-admin-accent/5 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Order Details</h2>
                <p className="text-xs text-gray-500">ID: {selectedOrder.orderId || selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-admin-accent font-bold mb-4">Customer Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-admin-accent/10 flex items-center justify-center text-admin-accent border border-admin-accent/20">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-bold text-white">{selectedOrder.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-bold text-white">{selectedOrder.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400 border border-purple-400/20 flex-shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shipping Address</p>
                      <p className="text-sm font-medium text-gray-300 leading-relaxed">{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-admin-accent font-bold mb-4">Order Summary</h3>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase mb-2">Products</p>
                      <p className="text-sm font-bold text-gray-200">{selectedOrder.product}</p>
                    </div>
                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Payment Method</p>
                        <div className="flex items-center gap-2 text-white font-bold">
                          <CreditCard size={14} className="text-admin-accent" />
                          {selectedOrder.paymentMethod || 'Cash on Delivery'}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Total Amount</p>
                        <p className="text-2xl font-black text-admin-accent">₹{selectedOrder.amount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#050505] border-t border-[#2a2a2a] flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all"
              >
                <Printer size={18} /> Print Invoice
              </button>
              <button 
                onClick={() => notifyViaWhatsApp(selectedOrder)}
                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold py-3 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare size={18} /> Notify Customer
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedOrder && <PrintableInvoice order={selectedOrder} />}
    </div>
  );
};

export default Orders;
