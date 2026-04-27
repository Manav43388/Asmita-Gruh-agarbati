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
      <div className="w-full h-full flex flex-col gap-6 animate-pulse">
        <div className="flex justify-between items-end mb-4">
          <div className="h-10 w-48 bg-[#141414] rounded-lg"></div>
          <div className="h-12 w-40 bg-[#141414] rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-[350px] bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Product Catalog
            <Package className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">Add, edit, and manage your spiritual items.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[250px] group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-admin-accent transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all placeholder:text-gray-600 shadow-inner"
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-admin-accent to-yellow-600 text-[#050505] font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:-translate-y-1 transition-all duration-300"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="group flex flex-col bg-[#141414] rounded-2xl border border-[#2a2a2a] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] hover:border-admin-accent/50"
          >
            <div className="h-48 relative overflow-hidden bg-white/5">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute top-3 left-3 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Tag size={12} className="text-admin-accent" />
                {product.category}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h4 className="text-white font-bold text-lg leading-tight line-clamp-2">{product.name}</h4>
                <span className="text-admin-accent font-bold text-lg bg-admin-accent/10 px-2 py-0.5 rounded-lg border border-admin-accent/20 shrink-0">₹{product.price}</span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                {product.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-[#2a2a2a] mt-auto">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-[#2a2a2a] hover:border-gray-500 font-medium text-sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40 font-medium text-sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#141414] border border-[#2a2a2a] border-dashed rounded-2xl">
            <Package size={64} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-gray-400">Try adjusting your search or add a new product.</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-admin-accent/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a] bg-[#0a0a0a]">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {isEditing ? <Edit className="text-admin-accent" /> : <Plus className="text-admin-accent" />}
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">Product Name</label>
                    <input 
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Premium Rose Agarbatti"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-1">
                      Price <IndianRupee size={12} className="text-gray-500" />
                    </label>
                    <input 
                      type="number"
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="150"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">Category</label>
                    <select 
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors appearance-none cursor-pointer"
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
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">Unit</label>
                    <input 
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                      value={formData.unit} 
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      placeholder="Per Box / 100g"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300 ml-1">Product Image</label>
                  <div className="w-full relative border-2 border-dashed border-[#2a2a2a] rounded-xl hover:border-admin-accent/50 transition-colors bg-[#0a0a0a] group">
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
                    <div className="p-6 flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-admin-accent transition-colors">
                      <ImageIcon size={32} />
                      <span className="font-medium">
                        {imageFile ? imageFile.name : 'Click to upload or drag & drop'}
                      </span>
                      <span className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</span>
                    </div>
                  </div>
                  {isEditing && formData.image && !imageFile && (
                    <div className="flex items-center gap-3 mt-3 p-3 bg-white/5 rounded-lg border border-[#2a2a2a]">
                      <img src={formData.image} alt="Current" className="w-12 h-12 rounded object-cover border border-[#2a2a2a]" />
                      <p className="text-sm text-gray-400">Current image will be kept unless you upload a new one.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300 ml-1">Description</label>
                  <textarea 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors min-h-[120px] resize-y"
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Write a compelling description for this product..."
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-[#2a2a2a] bg-[#0a0a0a] flex justify-end gap-3">
              <button 
                type="button" 
                className="px-6 py-2.5 rounded-xl font-medium text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="product-form"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-admin-accent to-yellow-600 text-[#050505] font-bold rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <><Loader2 size={18} className="animate-spin" /> Saving...</>
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
