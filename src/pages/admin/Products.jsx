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
  CloudDownload
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
    storage: ''
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
      storage: ''
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 text-admin-accent border border-admin-accent/30 font-bold rounded-xl hover:bg-admin-accent/10 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
            onClick={async () => {
              if (window.confirm('Import default products to database? (Existing products with same name will be skipped)')) {
                const initialProducts = [
                  { title: 'Premium Agarbatti', desc: 'Hand-rolled natural incense sticks for daily prayers and meditation.', image: '/agarbatti.png', price: 199, unit: 'per box (50 sticks)', category: 'Incense Sticks', subtitle: 'Hand-rolled | Daily Puja & Meditation', fragrance: 'Sandalwood & Herbal', burnTime: '30 min per stick', weight: '100g per box', material: 'Bamboo + Natural Resins', quantity: '50 sticks', country: 'India' },
                  { title: 'Mystic Dhoop Cones', desc: 'Thick, earthy smoke perfect for deep relaxation and spiritual awakening.', image: '/dhoop.png', price: 149, unit: 'per pack (20 cones)', category: 'Dhoop Sticks', subtitle: 'Dhoop Cones | Meditation & Relaxation', fragrance: 'Earthy & Woody', burnTime: '45 min per cone', weight: '80g per pack', material: 'Charcoal Base + Natural Resins', quantity: '20 cones', country: 'India' },
                  { title: 'Sambrani Cups', desc: 'Traditional loban cups that emit purifying smoke to cleanse your space.', image: '/sambrani.png', price: 129, unit: 'per pack (12 cups)', category: 'Other Spiritual Products', subtitle: 'Natural Sambrani | Air Purification', fragrance: 'Traditional Loban', burnTime: '20 min per cup', weight: '120g per pack', material: 'Coal + Natural Resins', quantity: '12 cups', country: 'India' },
                  { title: 'Camphor (Kapur)', desc: 'Pure, smoke-free camphor for authentic temple-like aarti at home.', image: '/camphor.png', price: 99, unit: 'per tin (50g)', category: 'Puja Items', subtitle: 'Pure Camphor | Temple Grade', fragrance: 'Refining Camphor', burnTime: '5 min per piece', weight: '50g per tin', material: 'Pure Camphor', quantity: 'Approx 50 pieces', country: 'India' },
                  { title: 'Floral Essences', desc: 'Sweet and calming notes of jasmine, rose, and lavender incense.', image: '/floral.png', price: 249, unit: 'per box (40 sticks)', category: 'Incense Sticks', subtitle: 'Floral Blend | Calming Ambiance', fragrance: 'Mixed Floral', burnTime: '35 min per stick', weight: '90g per box', material: 'Charcoal Free', quantity: '40 sticks', country: 'India' },
                  { title: 'Natural Attar', desc: 'Alcohol-free, concentrated roll-on perfumes made from essential oils.', image: '/attar.png', price: 399, unit: 'per bottle (10ml)', category: 'Other Spiritual Products', subtitle: 'Alcohol Free | Long Lasting', fragrance: 'Natural Essential Oils', burnTime: 'Lasts 8-12 hours', weight: '10ml', material: 'Essential Oil Blend', quantity: '1 bottle', country: 'India' },
                  { title: 'Velvet Idol Cloth', desc: 'Premium red velvet cloth with gold lace for deity idols and puja altars.', image: '/floral.png', price: 149, unit: 'per piece', category: 'Idol Cloth', subtitle: 'Premium Velvet | Gold Embroidery', fragrance: 'None', burnTime: 'N/A', weight: '50g', material: 'Velvet Fabric', quantity: '1 piece', country: 'India' }
                ];
                
                toast.loading('Checking and importing...', { id: 'import' });
                try {
                  const existingNames = products.map(p => p.name.toLowerCase());
                  let count = 0;
                  for (const p of initialProducts) {
                    if (!existingNames.includes(p.title.toLowerCase())) {
                      await addDoc(collection(db, 'products'), {
                        ...p,
                        name: p.title,
                        description: p.desc,
                        createdAt: new Date()
                      });
                      count++;
                    }
                  }
                  toast.success(count > 0 ? `${count} products imported successfully` : 'All default products already exist', { id: 'import' });
                } catch (e) {
                  toast.error('Import failed', { id: 'import' });
                }
              }
            }}
          >
            <CloudDownload size={20} />
            Import Defaults
          </button>

          <button 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-admin-accent to-yellow-600 text-[#050505] font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30_px_rgba(212,175,55,0.5)] hover:-translate-y-1 transition-all duration-300"
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
            className="product-card glass-panel group flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)]"
          >
            <div className="product-image-container h-48 relative overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="product-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="product-tag">
                {product.category}
              </div>
            </div>
            
            <div className="product-info p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h4 className="text-white font-bold text-lg leading-tight line-clamp-2">{product.name}</h4>
                <span className="product-price text-lg shrink-0">₹{product.price}</span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                {product.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 hover:border-gray-500 font-medium text-sm"
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
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors min-h-[100px] resize-y"
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Write a compelling description for this product..."
                  />
                </div>

                <div className="pt-4 border-t border-[#2a2a2a]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Tag className="text-admin-accent" size={18} />
                    Specifications
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300 ml-1">Subtitle / Punchline</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                        value={formData.subtitle} 
                        onChange={e => setFormData({...formData, subtitle: e.target.value})}
                        placeholder="e.g. Hand-rolled | Natural"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300 ml-1">Fragrance</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                        value={formData.fragrance} 
                        onChange={e => setFormData({...formData, fragrance: e.target.value})}
                        placeholder="e.g. Sandalwood"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300 ml-1">Burning Time</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                        value={formData.burnTime} 
                        onChange={e => setFormData({...formData, burnTime: e.target.value})}
                        placeholder="e.g. 40 min per stick"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300 ml-1">Weight</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                        value={formData.weight} 
                        onChange={e => setFormData({...formData, weight: e.target.value})}
                        placeholder="e.g. 100g"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300 ml-1">Material</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                        value={formData.material} 
                        onChange={e => setFormData({...formData, material: e.target.value})}
                        placeholder="e.g. Bamboo + Resins"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300 ml-1">Quantity</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                        value={formData.quantity} 
                        onChange={e => setFormData({...formData, quantity: e.target.value})}
                        placeholder="e.g. 50 sticks"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300 ml-1">Usage</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                        value={formData.usage} 
                        onChange={e => setFormData({...formData, usage: e.target.value})}
                        placeholder="e.g. Daily Puja"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300 ml-1">Country of Origin</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors"
                        value={formData.country} 
                        onChange={e => setFormData({...formData, country: e.target.value})}
                        placeholder="India"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2a2a2a] space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">Ingredients (comma separated)</label>
                    <textarea 
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors min-h-[80px] resize-y"
                      value={formData.ingredients} 
                      onChange={e => setFormData({...formData, ingredients: e.target.value})}
                      placeholder="Natural resins, Essential oils, Bamboo sticks..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">Benefits (comma separated)</label>
                    <textarea 
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors min-h-[80px] resize-y"
                      value={formData.benefits} 
                      onChange={e => setFormData({...formData, benefits: e.target.value})}
                      placeholder="Purifies air, Aids meditation, Long lasting..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">How to Use</label>
                    <textarea 
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors min-h-[80px] resize-y"
                      value={formData.howToUse} 
                      onChange={e => setFormData({...formData, howToUse: e.target.value})}
                      placeholder="Light the tip of the stick..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 ml-1">Storage Instructions</label>
                    <textarea 
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-colors min-h-[80px] resize-y"
                      value={formData.storage} 
                      onChange={e => setFormData({...formData, storage: e.target.value})}
                      placeholder="Store in a cool, dry place..."
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-[#2a2a2a] bg-[#0a0a0a] flex justify-end gap-3">
              <button 
                type="button" 
                className="px-6 py-2.5 rounded-xl font-medium !text-white !bg-[#1a1a1a] hover:!bg-[#2a2a2a] transition-colors border border-transparent hover:border-white/10"
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
