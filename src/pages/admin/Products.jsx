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
  X
} from 'lucide-react';
import { db, storage } from '../../firebase/config';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Incense Sticks',
    description: '',
    image: '',
    unit: 'Per Box'
  });

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
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
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

          const base64String = canvas.toDataURL('image/jpeg', 0.85);
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
        toast.loading('Processing image safely...', { id: 'uploadToast' });
        finalImageUrl = await compressImage(imageFile);
        toast.dismiss('uploadToast');
      } else if (!isEditing && !formData.image) {
        toast.error('Please upload an image');
        setUploadingImage(false);
        return;
      }

      const finalData = { ...formData, image: finalImageUrl };

      if (isEditing) {
        await updateDoc(doc(db, 'products', currentId), finalData);
        toast.success('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), {
          ...finalData,
          createdAt: new Date()
        });
        toast.success('Product added successfully');
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setCurrentId(product.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'Incense Sticks',
      description: '',
      image: '',
      unit: 'Per Box'
    });
    setIsEditing(false);
    setCurrentId(null);
    setImageFile(null);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-8 animate-pulse p-2">
        <div className="flex justify-between items-end mb-4">
          <div className="h-12 w-64 bg-white/5 rounded-xl border border-white/5"></div>
          <div className="h-14 w-48 bg-white/5 rounded-2xl border border-white/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-[400px] bg-white/5 rounded-3xl border border-white/5"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-10">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 font-['Outfit'] flex items-center gap-3 tracking-tight">
            Product Catalog
            <div className="p-2 bg-admin-accent/10 rounded-xl border border-admin-accent/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <Package className="text-admin-accent" size={24} />
            </div>
          </h1>
          <p className="text-gray-400 text-lg font-medium">Add, edit, and manage your spiritual items.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[280px] group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
              <Search size={20} className="transition-transform duration-300 group-focus-within:scale-110" />
            </div>
            <input 
              type="text" 
              className="w-full bg-[#111] border border-white/10 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-admin-accent/50 focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 placeholder:text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-admin-accent via-yellow-500 to-yellow-600 text-[#050505] font-black tracking-wide rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            <Plus size={22} />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="group flex flex-col bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] hover:border-admin-accent/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-admin-accent/0 to-admin-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
            
            <div className="h-56 relative overflow-hidden bg-white/5">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90"></div>
              
              <div className="absolute top-4 left-4 bg-[#0a0a0a]/70 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Tag size={12} className="text-admin-accent" />
                {product.category}
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1 relative z-20">
              <div className="flex justify-between items-start mb-3 gap-3">
                <h4 className="text-white font-extrabold text-xl leading-tight line-clamp-2 drop-shadow-md">{product.name}</h4>
                <span className="text-admin-accent font-black text-lg bg-admin-accent/10 px-3 py-1 rounded-xl border border-admin-accent/20 shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.1)]">₹{product.price}</span>
              </div>
              
              <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1 font-medium leading-relaxed">
                {product.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-3 pt-5 border-t border-white/5 mt-auto">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#151515] hover:bg-[#252525] text-white rounded-xl transition-all duration-300 border border-white/5 hover:border-white/20 font-bold text-sm shadow-sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit size={16} className="text-gray-400" /> Edit
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 border border-red-500/10 hover:border-red-500/30 font-bold text-sm shadow-sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-white/5 border-dashed rounded-3xl shadow-inner">
            <div className="p-6 rounded-full bg-white/5 border border-white/5 mb-4 shadow-lg">
              <Package size={48} className="text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-400 font-medium">Try adjusting your search or add a new product.</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="bg-gradient-to-b from-[#1c1c1c] to-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] animate-in zoom-in-95 duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-wide">
                {isEditing ? <Edit className="text-admin-accent" size={28} /> : <Plus className="text-admin-accent" size={28} />}
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto px-8 py-6 custom-scrollbar flex-1 relative">
              <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300 ml-1">Product Name</label>
                    <input 
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 shadow-inner font-medium"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Premium Rose Agarbatti"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-1">
                      Price <IndianRupee size={12} className="text-gray-500" />
                    </label>
                    <input 
                      type="number"
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 shadow-inner font-bold"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="150"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300 ml-1">Category</label>
                    <select 
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 appearance-none cursor-pointer shadow-inner font-medium bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_16px_center]"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option className="bg-[#1a1a1a]" value="Incense Sticks">Incense Sticks</option>
                      <option className="bg-[#1a1a1a]" value="Dhoop Sticks">Dhoop Sticks</option>
                      <option className="bg-[#1a1a1a]" value="Pujan Samagri">Pujan Samagri</option>
                      <option className="bg-[#1a1a1a]" value="Attar & Perfumes">Attar & Perfumes</option>
                      <option className="bg-[#1a1a1a]" value="Idol Cloth">Idol Cloth</option>
                      <option className="bg-[#1a1a1a]" value="Other Spiritual Products">Other Spiritual Products</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300 ml-1">Unit</label>
                    <input 
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 shadow-inner font-medium"
                      value={formData.unit} 
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      placeholder="Per Box / 100g"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 ml-1">Product Image</label>
                  <div className="w-full relative border-2 border-dashed border-white/10 rounded-2xl hover:border-admin-accent/50 transition-colors bg-[#0a0a0a]/50 group overflow-hidden">
                    <input 
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      onChange={e => {
                        if (e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                      required={!isEditing && !formData.image}
                    />
                    <div className="p-8 flex flex-col items-center justify-center gap-3 text-gray-400 group-hover:text-admin-accent transition-colors">
                      <div className="p-4 bg-white/5 rounded-full group-hover:bg-admin-accent/10 transition-colors">
                        <ImageIcon size={36} />
                      </div>
                      <span className="font-bold text-white">
                        {imageFile ? imageFile.name : 'Click to upload or drag & drop'}
                      </span>
                      <span className="text-xs text-gray-500 font-medium tracking-wide">SVG, PNG, JPG or GIF (max. 5MB)</span>
                    </div>
                  </div>
                  {isEditing && formData.image && !imageFile && (
                    <div className="flex items-center gap-4 mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                      <img src={formData.image} alt="Current" className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-sm" />
                      <p className="text-sm text-gray-400 font-medium">Current image will be kept unless you upload a new one.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 ml-1">Description</label>
                  <textarea 
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20 transition-all duration-300 min-h-[140px] resize-y shadow-inner font-medium leading-relaxed"
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Write a compelling description for this product..."
                  />
                </div>
              </form>
            </div>
            
            <div className="px-8 py-5 border-t border-white/5 bg-[#0f0f0f] flex justify-end gap-4 rounded-b-3xl">
              <button 
                type="button" 
                className="px-8 py-3.5 rounded-xl font-bold !text-white !bg-[#1a1a1a] hover:!bg-[#252525] transition-all duration-300 border border-white/5 hover:border-white/20 active:scale-95 shadow-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="product-form"
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-admin-accent via-yellow-500 to-yellow-600 text-[#050505] font-black rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <><Loader2 size={20} className="animate-spin" /> Saving...</>
                ) : (
                  isEditing ? 'Save Changes' : 'Create Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
