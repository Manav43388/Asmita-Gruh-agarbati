import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Plus, 
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  FileDown,
  ChevronRight,
  Database
} from 'lucide-react';
import { db } from '../../firebase/config';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  addDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateAmount, setUpdateAmount] = useState(1);
  const [updateType, setUpdateType] = useState('add'); // 'add' or 'reduce'
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatus = (product) => {
    const stock = Number(product.stock || 0);
    const lowStock = Number(product.lowStock || 0);
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle };
    if (stock <= lowStock) return { label: 'Low Stock', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: AlertTriangle };
    return { label: 'In Stock', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const status = getStatus(p).label;
    const matchesStatus = statusFilter === 'All' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: products.length,
    lowStock: products.filter(p => {
      const s = getStatus(p);
      return s.label === 'Low Stock';
    }).length,
    outOfStock: products.filter(p => Number(p.stock || 0) === 0).length
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || updateAmount <= 0) return;
    
    setUpdating(true);
    try {
      const amount = updateType === 'add' ? updateAmount : -updateAmount;
      const newStock = Number(selectedProduct.stock || 0) + amount;

      if (newStock < 0) {
        toast.error('Stock cannot go below 0');
        setUpdating(false);
        return;
      }

      const productRef = doc(db, 'products', selectedProduct.id);
      await updateDoc(productRef, {
        stock: increment(amount)
      });

      // Log the update
      await addDoc(collection(db, 'inventory_logs'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku || 'N/A',
        type: updateType,
        amount: Math.abs(amount),
        previousStock: selectedProduct.stock || 0,
        newStock: newStock,
        timestamp: serverTimestamp(),
        adminEmail: 'Admin' // Should ideally come from auth context
      });

      toast.success(`Stock ${updateType === 'add' ? 'increased' : 'reduced'} successfully`);
      setIsUpdateModalOpen(false);
      setSelectedProduct(null);
      setUpdateAmount(1);
    } catch (error) {
      console.error('Update failed', error);
      toast.error('Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Product Name', 'SKU', 'Current Stock', 'Low Stock Threshold', 'Status'];
    const data = products.map(p => [
      p.name,
      p.sku || 'N/A',
      p.stock || 0,
      p.lowStock || 0,
      getStatus(p).label
    ]);

    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      const skuIndex = headers.findIndex(h => h.toLowerCase().includes('sku'));
      const stockIndex = headers.findIndex(h => h.toLowerCase().includes('stock'));

      if (skuIndex === -1 || stockIndex === -1) {
        toast.error('CSV must have SKU and Stock columns');
        return;
      }

      setUpdating(true);
      let updatedCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length < 2) continue;

        const sku = row[skuIndex]?.trim();
        const stockValue = parseInt(row[stockIndex]?.trim());

        if (sku && !isNaN(stockValue)) {
          // Find product by SKU
          const product = products.find(p => p.sku === sku);
          if (product) {
            try {
              await updateDoc(doc(db, 'products', product.id), {
                stock: stockValue
              });
              updatedCount++;
            } catch (err) {
              errorCount++;
            }
          } else {
            errorCount++;
          }
        }
      }

      setUpdating(false);
      toast.success(`Bulk update complete: ${updatedCount} updated, ${errorCount} failed/skipped`);
      e.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-admin-accent mb-4" size={48} />
      <p className="text-gray-400 animate-pulse">Loading inventory data...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-admin-accent/10 flex items-center justify-center border border-admin-accent/20">
              <Database className="text-admin-accent" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-['Outfit']">Inventory</h1>
              <p className="text-gray-400 text-sm">Real-time stock management & tracking</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-admin-accent/10 hover:bg-admin-accent text-admin-accent hover:text-black border border-admin-accent/20 rounded-xl text-sm font-medium transition-all cursor-pointer">
            <Plus size={18} /> Bulk Upload
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => handleCSVUpload(e)}
            />
          </label>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all text-gray-300"
          >
            <FileDown size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-[40px] -mr-8 -mt-8 rounded-full`}></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 mb-6 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-admin-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-admin-accent transition-all placeholder:text-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Filter size={18} className="text-gray-500 ml-2" />
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 overflow-hidden">
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status 
                    ? 'bg-admin-accent text-black shadow-lg shadow-admin-accent/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                <th className="px-6 py-5">Product Details</th>
                <th className="px-6 py-5">SKU</th>
                <th className="px-6 py-5">Current Stock</th>
                <th className="px-6 py-5">Threshold</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                const status = getStatus(product);
                const StatusIcon = status.icon;
                return (
                  <tr key={product.id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-black border border-white/5 overflow-hidden flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm group-hover:text-admin-accent transition-colors">{product.name}</p>
                          <p className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wider">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-400">{product.sku || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${status.color}`}>
                          {product.stock || 0}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400 font-medium">{product.lowStock || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsUpdateModalOpen(true);
                        }}
                        className="px-4 py-2 bg-admin-accent/10 hover:bg-admin-accent text-admin-accent hover:text-black border border-admin-accent/20 rounded-lg text-xs font-bold transition-all duration-300"
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                        <Search className="text-gray-600" size={32} />
                      </div>
                      <p className="text-gray-400 font-medium text-lg">No products found</p>
                      <p className="text-gray-600 text-sm">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsUpdateModalOpen(false)}></div>
          <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-admin-accent/10 flex items-center justify-center border border-admin-accent/20">
                  <RefreshCw className="text-admin-accent" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Update Stock</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{selectedProduct?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-500 hover:text-white p-2">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setUpdateType('add')}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${
                    updateType === 'add' 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${updateType === 'add' ? 'bg-emerald-500 text-black' : 'bg-white/10'}`}>
                    <Plus size={24} />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">Add Stock</span>
                </button>
                <button 
                  onClick={() => setUpdateType('reduce')}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${
                    updateType === 'reduce' 
                      ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${updateType === 'reduce' ? 'bg-red-500 text-black' : 'bg-white/10'}`}>
                    <Minus size={24} />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">Reduce Stock</span>
                </button>
              </div>

              <div className="mb-8">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-3 block">Amount to {updateType}</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setUpdateAmount(Math.max(1, updateAmount - 1))}
                    className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <input 
                    type="number" 
                    className="flex-1 h-14 bg-black/40 border border-white/10 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:border-admin-accent transition-all"
                    value={updateAmount}
                    onChange={(e) => setUpdateAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  />
                  <button 
                    onClick={() => setUpdateAmount(updateAmount + 1)}
                    className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-8">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Current Stock</span>
                  <span className="text-xs font-bold text-white">{selectedProduct?.stock || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">New Expected Stock</span>
                  <span className={`text-lg font-black ${updateType === 'add' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {updateType === 'add' 
                      ? (selectedProduct?.stock || 0) + updateAmount 
                      : Math.max(0, (selectedProduct?.stock || 0) - updateAmount)
                    }
                  </span>
                </div>
              </div>

              <button 
                onClick={handleUpdateStock}
                disabled={updating}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                  updateType === 'add'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {updating ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Database size={20} />
                    Confirm Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
