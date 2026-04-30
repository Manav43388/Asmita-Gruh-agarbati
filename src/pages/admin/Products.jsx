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
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { createLog } from '../../utils/adminLogs';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState = {
    name: '',
    price: '',
    discountPrice: '',
    sku: '',
    stock: '',
    salesCount: 0,
    status: 'Active',
    category: 'Incense Sticks',
    description: '',
    image: '',
    unit: 'Per Box',
    subtitle: '',
    fragrance: '',
    burnTime: '',
    weight: '',
    material: '',
    quantity: '',
    usage: '',
    country: 'India',
    ingredients: '',
    benefits: '',
    howToUse: '',
    storage: '',
    features: [
      { feature: 'Organic Ingredients', ours: true },
      { feature: 'Superior Fragrance', ours: true },
      { feature: 'Longer Burn Time', ours: true },
      { feature: 'Premium Packaging', ours: true },
      { feature: 'Eco-Friendly', ours: true },
      { feature: 'No Harmful Chemicals', ours: true },
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64String = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64String);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      let finalImageUrl = formData.image;

      if (imageFile) {
        toast.loading('Processing image...', { id: 'uploadToast' });
        finalImageUrl = await compressImage(imageFile);
        toast.dismiss('uploadToast');
      } else if (!isEditing && !formData.image) {
        toast.error('Please upload an image');
        setUploadingImage(false);
        return;
      }

      const finalData = { 
        ...formData, 
        image: finalImageUrl,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock || 0),
        salesCount: Number(formData.salesCount || 0)
      };

      if (isEditing) {
        await updateDoc(doc(db, 'products', currentId), finalData);
        await createLog('Admin', `Updated product: ${formData.name}`, 'Products');
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), {
          ...finalData,
          createdAt: new Date()
        });
        await createLog('Admin', `Created product: ${formData.name}`, 'Products');
        toast.success('Product added');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Operation failed');
    } finally {
      setUploadingImage(false);
    }
  };

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
    setFormData({ ...initialFormState, ...product });
    setCurrentId(product.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDuplicate = async (product) => {
    try {
      toast.loading('Duplicating...', { id: 'dup' });
      const { id, createdAt, ...rest } = product;
      await addDoc(collection(db, 'products'), {
        ...rest,
        name: `${rest.name} (Copy)`,
        createdAt: new Date()
      });
      await createLog('Admin', `Duplicated product: ${product.name}`, 'Products');
      toast.success('Product duplicated', { id: 'dup' });
    } catch (error) {
      toast.error('Duplication failed', { id: 'dup' });
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentId(null);
    setImageFile(null);
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
            onClick={() => { resetForm(); setShowModal(true); }}
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

              <div className="grid grid-cols-3 gap-2 mt-5">
                <button 
                  onClick={() => handleEdit(product)}
                  className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all border border-white/5"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDuplicate(product)}
                  className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all border border-white/5"
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center justify-center p-2 bg-red-500/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0a0a0a] border border-[#2a2a2a] w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between bg-gradient-to-r from-admin-accent/5 to-transparent">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                {isEditing ? <Edit className="text-admin-accent" /> : <Plus className="text-admin-accent" />}
                {isEditing ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Product Name</label>
                      <input className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">SKU Code</label>
                        <div className="relative">
                          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                          <input className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Status</label>
                        <select className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all appearance-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Regular Price</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                          <input type="number" className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Discount Price</label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                          <input type="number" className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Stock Qty</label>
                        <input type="number" className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Sold Count</label>
                        <div className="relative">
                          <History className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                          <input type="number" className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.salesCount} onChange={e => setFormData({...formData, salesCount: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#2a2a2a]">
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-4 block">Product Image</label>
                  <div className="border-2 border-dashed border-[#2a2a2a] rounded-2xl p-8 text-center hover:border-admin-accent/50 transition-all cursor-pointer bg-[#141414] relative overflow-hidden group">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setImageFile(e.target.files[0])} />
                    {imageFile || formData.image ? (
                      <div className="flex flex-col items-center gap-3">
                        <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} className="w-32 h-32 object-contain rounded-xl" />
                        <span className="text-xs text-gray-400">Click to change image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <ImageIcon size={48} className="text-gray-700 group-hover:text-admin-accent transition-colors" />
                        <span className="text-sm font-medium text-gray-400">Upload Product Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Description</label>
                  <textarea className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all min-h-[120px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </form>
            </div>
            
            <div className="p-6 bg-[#050505] border-t border-[#2a2a2a] flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-8 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" form="product-form" className="px-8 py-3 bg-admin-accent text-[#050505] font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50" disabled={uploadingImage}>
                {uploadingImage ? 'Processing...' : (isEditing ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
