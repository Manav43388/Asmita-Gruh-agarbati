import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Tag,
  IndianRupee,
  Loader2,
  Package,
  X,
  Shield,
  Copy,
  AlertCircle,
  Eye,
  EyeOff,
  History,
  Barcode
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createLog } from '../../utils/adminLogs';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product permanently?')) {
      try {
        const productToDelete = products.find(p => p.id === id);
        await deleteDoc(doc(db, 'products', id));
        await createLog('Admin', `Deleted product: ${productToDelete?.name || id}`, 'Products');
        toast.success('Deleted');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleEdit = (product) => {
    navigate(`/admin/products/edit/${product.id}`);
  };

  const getStockBadge = (stock) => {
    const s = Number(stock || 0);
    if (s === 0) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (s < 10) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-80 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>)}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 px-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Products
            <Package className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">Inventory and catalog management.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[280px] group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-admin-accent transition-all placeholder:text-gray-600 shadow-xl"
              placeholder="Search catalog..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-admin-accent to-yellow-600 text-[#050505] font-bold rounded-xl shadow-xl hover:-translate-y-1 transition-all duration-300"
            onClick={() => navigate('/admin/products/new')}
          >
            <Plus size={20} /> Add New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden group hover:border-admin-accent/30 transition-all duration-300 flex flex-col">
            <div className="relative h-48 premium-frame">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-[10px] text-white font-bold rounded uppercase tracking-wider border border-white/10">
                  {product.category}
                </span>
                {Number(product.stock || 0) < 10 && (
                  <span className={`px-2 py-1 flex items-center gap-1 text-[10px] font-bold rounded uppercase tracking-wider border ${getStockBadge(product.stock)}`}>
                    <AlertCircle size={10} /> {Number(product.stock) === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md border border-white/10 ${product.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {product.status === 'Active' ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-bold leading-tight group-hover:text-admin-accent transition-colors">{product.name}</h4>
                <div className="text-right">
                  <p className="text-admin-accent font-bold">₹{product.price}</p>
                  {product.discountPrice && <p className="text-[10px] text-gray-500 line-through">₹{product.discountPrice}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-white/5">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Stock / Sales</p>
                  <p className="text-xs text-gray-300 font-medium">
                    {product.stock || 0} Avail. <span className="text-gray-600">|</span> {product.salesCount || 0} Sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">SKU</p>
                  <p className="text-xs text-gray-400">{product.sku || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5">
                <button 
                  onClick={() => handleEdit(product)}
                  className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all border border-white/5 text-xs font-bold"
                >
                  <Edit size={14} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center justify-center gap-2 p-2 bg-red-500/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-all border border-transparent hover:border-red-500/20 text-xs font-bold"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
