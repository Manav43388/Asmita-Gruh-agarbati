import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  History, 
  UserPlus, 
  Lock, 
  Terminal,
  Search,
  Filter,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const Security = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getLogIcon = (type) => {
    switch (type) {
      case 'Product': return <Package size={16} className="text-blue-400" />;
      case 'Order': return <ShoppingBag size={16} className="text-emerald-400" />;
      case 'Settings': return <Settings size={16} className="text-orange-400" />;
      default: return <Terminal size={16} className="text-gray-400" />;
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
      <div className="h-96 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10 px-4">
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Security & Logs
            <ShieldCheck className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">Monitor administrative actions and system security.</p>
        </div>
        
        <div className="relative w-full sm:w-[320px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-admin-accent transition-colors" size={18} />
          <input 
            className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-admin-accent transition-all placeholder:text-gray-600"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-admin-accent/5 to-transparent flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History size={20} className="text-admin-accent" />
                Activity Log
              </h3>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Showing latest 100 actions</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0a0a0a]">
                  <tr className="border-b border-[#2a2a2a] text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Admin User</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Module</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-400 font-medium">
                          {log.timestamp?.toDate?.().toLocaleString() || 'Just now'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-admin-accent/20 flex items-center justify-center text-[10px] font-bold text-admin-accent">
                            {log.user?.charAt(0) || 'A'}
                          </div>
                          <span className="text-xs font-bold text-gray-200">{log.user || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-300 font-medium">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <Terminal size={12} /> {log.module}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center text-gray-600 text-sm italic">
                        No activity logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert size={16} className="text-admin-accent" />
              Security Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400">Firewall</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400">Auth Method</span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-1 rounded">Firebase</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400">Admin Roles</span>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-400/10 px-2 py-1 rounded">Enabled</span>
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-br from-admin-accent/20 to-transparent border border-admin-accent/20 rounded-3xl p-6">
            <Lock className="text-admin-accent mb-4" size={24} />
            <h4 className="text-sm font-bold text-white mb-2">Access Control</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Administrative access is limited to authorized IP addresses and authenticated Google accounts. Role-based access controls (RBAC) are active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
