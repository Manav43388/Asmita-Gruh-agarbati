import React, { useState, useEffect } from 'react';
import { 
  Database, Search, Plus, AlertCircle, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, query, orderBy, runTransaction, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { createLog } from '../../utils/adminLogs';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // All, Low Stock, Out of Stock

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        minStock: doc.data().minStock || 0,
        stock: doc.data().stock || 0
      }));
      setProducts(prods);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStock = async (id, newStock, newMinStock, name) => {
    try {
      await runTransaction(db, async (transaction) => {
        const prodRef = doc(db, 'products', id);
        const prodDoc = await transaction.get(prodRef);
        if (!prodDoc.exists()) throw new Error('Product not found');
        
        const oldStock = prodDoc.data().stock || 0;
        const diff = Number(newStock) - oldStock;
        
        transaction.update(prodRef, { 
          stock: Number(newStock), 
          minStock: Number(newMinStock),
          lastStockUpdate: serverTimestamp()
        });

        if (diff !== 0) {
          const logRef = doc(collection(db, 'inventory_logs'));
          transaction.set(logRef, {
            productId: id,
            productName: name,
            type: diff > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(diff),
            reason: 'Manual Adjustment',
            timestamp: serverTimestamp()
          });
        }
      });
      
      await createLog('Admin', `Updated inventory for ${name}`, 'Inventory');
      toast.success('Stock updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update stock');
    }
  };

  const getStatus = (stock, minStock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' };
    if (stock <= minStock) return { label: 'Low Stock', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' };
    return { label: 'In Stock', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' };
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'Low Stock') return p.stock > 0 && p.stock <= p.minStock;
    if (filter === 'Out of Stock') return p.stock <= 0;
    return true;
  });

  const stats = {
    total: products.length,
    low: products.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
    out: products.filter(p => p.stock <= 0).length
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
        <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
        <div className="h-96 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Inventory
            <Database className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400 text-sm">Real-time stock management & tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mb-8">
        <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Products</p>
            <p className="text-3xl font-black text-white">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Database size={24} />
          </div>
        </div>
        <div className="bg-[#141414] border border-amber-500/20 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">Low Stock Items</p>
            <p className="text-3xl font-black text-white">{stats.low}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="bg-[#141414] border border-red-500/20 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Out of Stock</p>
            <p className="text-3xl font-black text-white">{stats.out}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="px-4 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-[360px] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-admin-accent transition-all placeholder:text-gray-600"
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f === 'In Stock' ? 'All' : f)} // We just map In Stock to All for simplicity, or we can add In Stock filter
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border ${
                filter === f || (f === 'In Stock' && filter === 'All')
                  ? 'bg-admin-accent/10 border-admin-accent text-admin-accent' 
                  : 'bg-[#141414] border-[#2a2a2a] text-gray-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-xl overflow-hidden mx-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#0a0a0a]">
              <tr className="border-b border-[#2a2a2a] text-[11px] uppercase tracking-[0.1em] text-gray-500 font-bold">
                <th className="px-6 py-5">Product Details</th>
                <th className="px-6 py-5">SKU</th>
                <th className="px-6 py-5">Current Stock</th>
                <th className="px-6 py-5">Threshold</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredProducts.map((p) => {
                const status = getStatus(p.stock, p.minStock);
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            <Database size={16} className="text-gray-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm truncate max-w-[250px]">{p.name}</div>
                          <div className="text-[10px] text-gray-500">{p.category || 'General'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {p.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-lg font-black text-white">
                        <span className={status.color}>{p.stock}</span> <span className="text-[10px] font-normal text-gray-500 uppercase">units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-400">{p.minStock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                               const newStock = window.prompt("Enter new stock for " + p.name, p.stock);
                               if (newStock !== null) handleUpdateStock(p.id, newStock, p.minStock, p.name);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-admin-accent hover:text-[#050505] bg-admin-accent/10 hover:bg-admin-accent rounded-lg border border-admin-accent/20 transition-all"
                          >
                            Update Stock
                          </button>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500 border-t border-[#2a2a2a]">
              <Database size={48} className="opacity-20 mb-3" />
              <p>No products found in inventory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
