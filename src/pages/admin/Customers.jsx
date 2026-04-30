import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MessageSquare, 
  ShoppingBag, 
  IndianRupee, 
  ExternalLink,
  Phone,
  Mail,
  Calendar,
  History,
  X
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Group by email
      const customerMap = {};
      orders.forEach(order => {
        const key = order.email?.toLowerCase() || order.phone;
        if (!key) return;

        if (!customerMap[key]) {
          customerMap[key] = {
            name: order.name,
            email: order.email,
            phone: order.phone,
            totalSpent: 0,
            totalOrders: 0,
            lastOrderDate: order.createdAt,
            orders: [],
            address: order.address
          };
        }

        customerMap[key].totalSpent += Number(order.amount || 0);
        customerMap[key].totalOrders += 1;
        customerMap[key].orders.push(order);
        
        // Update last order date if this one is newer
        const currentLast = customerMap[key].lastOrderDate?.seconds || 0;
        const orderTime = order.createdAt?.seconds || 0;
        if (orderTime > currentLast) {
          customerMap[key].lastOrderDate = order.createdAt;
        }
      });

      const customerList = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(customerList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  if (loading) return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
      <div className="h-96 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Customers
            <Users className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">View and manage your customer relationships.</p>
        </div>
        
        <div className="relative w-full sm:w-[360px] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-admin-accent transition-all placeholder:text-gray-600 shadow-xl"
            placeholder="Search Name, Email, Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden mx-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#0a0a0a]">
              <tr className="border-b border-[#2a2a2a] text-[11px] uppercase tracking-[0.1em] text-gray-500 font-bold">
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Contact Info</th>
                <th className="px-6 py-5">Activity</th>
                <th className="px-6 py-5">Total Spent</th>
                <th className="px-6 py-5">Last Order</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredCustomers.map((customer, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-admin-accent/10 border border-admin-accent/20 flex items-center justify-center text-admin-accent font-bold">
                        {customer.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-100 text-sm">{customer.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">LOYAL CUSTOMER</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Mail size={12} className="text-gray-600" /> {customer.email || 'No email'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Phone size={12} className="text-gray-600" /> {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-white font-bold">
                      <ShoppingBag size={14} className="text-admin-accent" /> {customer.totalOrders} Orders
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm font-black text-emerald-400">
                      <IndianRupee size={14} /> {customer.totalSpent.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <Calendar size={12} className="text-gray-600" />
                      {customer.lastOrderDate?.toDate?.().toLocaleDateString() || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 text-gray-400 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-all" title="History"
                      >
                        <History size={18} />
                      </button>
                      <button 
                        onClick={() => window.open(`https://wa.me/91${customer.phone}`)}
                        className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all" title="WhatsApp"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedCustomer(null)} />
          <div className="relative bg-[#0a0a0a] border border-[#2a2a2a] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between bg-gradient-to-r from-admin-accent/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-admin-accent/20 flex items-center justify-center text-admin-accent border border-admin-accent/30 font-black text-xl">
                  {selectedCustomer.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                  <p className="text-xs text-gray-500">{selectedCustomer.totalOrders} total orders placed</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Total Spent</p>
                  <p className="text-2xl font-black text-emerald-400">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Avg Order Value</p>
                  <p className="text-2xl font-black text-blue-400">₹{(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(0)}</p>
                </div>
              </div>

              <h3 className="text-[10px] text-admin-accent uppercase font-black tracking-[0.2em] mb-4">Order History</h3>
              <div className="space-y-3">
                {selectedCustomer.orders.map((order, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-200">{order.product}</p>
                      <p className="text-xs text-gray-500">#{order.orderId} • {order.createdAt?.toDate?.().toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">₹{order.amount}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-admin-accent/10 text-admin-accent font-bold uppercase tracking-widest">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
