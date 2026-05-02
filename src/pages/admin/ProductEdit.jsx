import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Info, 
  Settings, 
  Eye, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Link,
  MessageSquare,
  Truck,
  ShieldCheck,
  Star,
  Search,
  Tag,
  IndianRupee,
  BadgePercent,
  RefreshCcw,
  Layout,
  Globe
} from 'lucide-react';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, updateDoc, addDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import { createLog } from '../../utils/adminLogs';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  
  const [expandedSections, setExpandedSections] = useState({
    usage: true,
    ingredients: false,
    benefits: false,
    storage: false,
    delivery: false
  });

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    shortDescription: '',
    description: '',
    howToUse: '',
    ingredients: [],
    benefits: [],
    storageInstructions: '',
    deliveryText: 'Standard delivery within 3-5 days.',
    offerText: 'Flat 10% off on your first order!',
    specifications: [],
    faqs: [],
    relatedProducts: [],
    status: 'Draft',
    visibility: true,
    price: '',
    discountPrice: '',
    stock: 0,
    lowStockAlert: true,
    image: '',
    category: 'General',
    tags: [],
    deliveryDays: '3-5',
    freeShipping: false,
    codAvailable: true,
    isBestseller: false,
    isNew: true,
    isTrending: false,
    reviewsEnabled: true,
    manualRating: 4.5,
    manualReviewCount: 0,
    metaTitle: '',
    metaDescription: '',
    slug: '',
    whatsappEnabled: true,
    whatsappMessage: ''
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(prev => ({
              ...prev,
              ...data,
              ingredients: data.ingredients || [],
              benefits: data.benefits || [],
              specifications: data.specifications || [],
              faqs: data.faqs || [],
              relatedProducts: data.relatedProducts || [],
              tags: data.tags || []
            }));
          } else {
            toast.error('Product not found');
            navigate('/admin/products');
          }
        } catch (error) {
          console.error(error);
          toast.error('Error fetching product');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllProducts(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (formData.name && !isEdit) {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ 
        ...prev, 
        slug,
        metaTitle: `${formData.name} | Asmita Gruh Udhyog`
      }));
    }
  }, [formData.name, isEdit]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      toast.loading('Uploading image...', { id: 'img-upload' });
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded', { id: 'img-upload' });
    } catch (error) {
      toast.error('Image upload failed', { id: 'img-upload' });
    } finally {
      setSaving(false);
    }
  };

  const handleListAdd = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const handleListUpdate = (field, index, value) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const handleListRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSpecAdd = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };

  const handleSpecUpdate = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const handleFAQAdd = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const handleFAQUpdate = (index, field, value) => {
    const newFAQs = [...formData.faqs];
    newFAQs[index][field] = value;
    setFormData(prev => ({ ...prev, faqs: newFAQs }));
  };

  const handleSave = async (status) => {
    if (!formData.name || !formData.price) {
      toast.error('Product Name and Price are required');
      return;
    }

    try {
      setSaving(true);
      const loadingToast = toast.loading(isEdit ? 'Updating product...' : 'Publishing product...');
      
      const finalData = { 
        ...formData, 
        status, 
        updatedAt: new Date(),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock),
        manualReviewCount: Number(formData.manualReviewCount || 0),
        manualRating: Number(formData.manualRating || 4.5)
      };

      if (isEdit) {
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, finalData);
        await createLog('Admin', `Updated product: ${formData.name}`, 'Products');
        toast.success('Product updated successfully', { id: loadingToast });
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...finalData,
          createdAt: new Date(),
          salesCount: 0
        });
        await createLog('Admin', `Created product: ${formData.name}`, 'Products');
        toast.success('Product published successfully', { id: loadingToast });
        navigate(`/admin/products/edit/${docRef.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      setSaving(true);
      const loadingToast = toast.loading('Deleting product...');
      await updateDoc(doc(db, 'products', id), { status: 'Deleted', visibility: false });
      // Or actually delete: await deleteDoc(doc(db, 'products', id));
      // For safety, we usually just mark as deleted or allow full deletion. 
      // User asked for "Delete Product", so let's do real deletion.
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'products', id));
      
      await createLog('Admin', `Deleted product: ${formData.name}`, 'Products');
      toast.success('Product deleted successfully', { id: loadingToast });
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product');
    } finally {
      setSaving(false);
    }
  };

  const calculateSavings = () => {
    if (formData.price && formData.discountPrice) {
      const savings = formData.price - formData.discountPrice;
      return savings > 0 ? savings : 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <RefreshCcw className="animate-spin text-admin-accent mb-4" size={48} />
        <p className="text-gray-400 font-medium">Loading product system...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 -mx-6 mb-8 bg-[#030303]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/products')}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-['Outfit']">
              {isEdit ? `Edit: ${formData.name}` : 'Create New Product'}
            </h1>
            <p className="text-xs text-gray-500">
              {isEdit ? 'Update product information and catalog' : 'Fill in the details to list a new product'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEdit && (
            <button 
              onClick={handleDelete}
              disabled={saving}
              className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 disabled:opacity-50"
              title="Delete Product"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={() => handleSave('Draft')}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-bold text-gray-300 hover:text-white transition-all rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSave('Active')}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-admin-accent to-yellow-600 text-[#050505] text-sm font-black rounded-xl shadow-lg shadow-admin-accent/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {isEdit ? 'Update Changes' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        
        {/* LEFT SIDE - Product Content (70%) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Basic Information */}
          <section className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-admin-accent/10 flex items-center justify-center text-admin-accent">
                <Info size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Basic Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Product Name</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="admin-input text-lg font-medium"
                  placeholder="e.g. Premium Sandalwood Incense Sticks"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">SKU Code</label>
                  <input 
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="ASM-SAN-001"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Short Description</label>
                  <input 
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="admin-input"
                    placeholder="Brief highlight for product card..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Product Description */}
          <section className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Layout size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Product Description</h2>
            </div>
            
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#0a0a0a]">
              <div className="flex items-center gap-2 p-3 bg-white/[0.02] border-b border-white/5">
                {['B', 'I', 'U', 'List', 'Link'].map(btn => (
                  <button 
                    key={btn} 
                    type="button" 
                    className="px-3 py-1.5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-admin-accent bg-[#141414] border border-white/5 hover:border-admin-accent/30 rounded-lg transition-all"
                  >
                    {btn}
                  </button>
                ))}
              </div>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-transparent p-6 text-gray-300 min-h-[300px] focus:outline-none resize-none leading-relaxed"
                placeholder="Write detailed product story..."
              />
            </div>
          </section>

          {/* Accordion Sections */}
          <div className="space-y-4">
            
            {/* How to Use */}
            <div className={`premium-card !p-0 overflow-hidden transition-all duration-300 ${expandedSections.usage ? 'ring-1 ring-admin-accent/30' : ''}`}>
              <button 
                onClick={() => toggleSection('usage')}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <HelpCircle size={18} />
                  </div>
                  <span className="font-bold text-white">How to Use</span>
                </div>
                {expandedSections.usage ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
              </button>
              {expandedSections.usage && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300 border-t border-white/5 pt-6 bg-black/20">
                  <textarea 
                    name="howToUse"
                    value={formData.howToUse}
                    onChange={handleInputChange}
                    className="admin-input min-h-[100px] resize-none"
                    placeholder="Step by step instructions..."
                  />
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div className={`premium-card !p-0 overflow-hidden transition-all duration-300 ${expandedSections.ingredients ? 'ring-1 ring-admin-accent/30' : ''}`}>
              <button 
                onClick={() => toggleSection('ingredients')}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Star size={18} />
                  </div>
                  <span className="font-bold text-white">Ingredients</span>
                </div>
                {expandedSections.ingredients ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
              </button>
              {expandedSections.ingredients && (
                <div className="px-6 pb-6 space-y-3 border-t border-white/5 pt-6 bg-black/20">
                  {formData.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        value={ing}
                        onChange={(e) => handleListUpdate('ingredients', idx, e.target.value)}
                        className="admin-input"
                        placeholder="Ingredient name..."
                      />
                      <button onClick={() => handleListRemove('ingredients', idx)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleListAdd('ingredients')}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/5 text-gray-500 hover:text-admin-accent hover:border-admin-accent/30 rounded-xl transition-all mt-2"
                  >
                    <Plus size={18} /> Add Ingredient
                  </button>
                </div>
              )}
            </div>

            {/* Key Benefits */}
            <div className={`premium-card !p-0 overflow-hidden transition-all duration-300 ${expandedSections.benefits ? 'ring-1 ring-admin-accent/30' : ''}`}>
              <button 
                onClick={() => toggleSection('benefits')}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="font-bold text-white">Key Benefits</span>
                </div>
                {expandedSections.benefits ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
              </button>
              {expandedSections.benefits && (
                <div className="px-6 pb-6 space-y-3 border-t border-white/5 pt-6 bg-black/20">
                  {formData.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        value={benefit}
                        onChange={(e) => handleListUpdate('benefits', idx, e.target.value)}
                        className="admin-input"
                        placeholder="Benefit point..."
                      />
                      <button onClick={() => handleListRemove('benefits', idx)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleListAdd('benefits')}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/5 text-gray-500 hover:text-admin-accent hover:border-admin-accent/30 rounded-xl transition-all mt-2"
                  >
                    <Plus size={18} /> Add Benefit
                  </button>
                </div>
              )}
            </div>

            {/* Storage Instructions */}
            <div className={`premium-card !p-0 overflow-hidden transition-all duration-300 ${expandedSections.storage ? 'ring-1 ring-admin-accent/30' : ''}`}>
              <button 
                onClick={() => toggleSection('storage')}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="font-bold text-white">Storage Instructions</span>
                </div>
                {expandedSections.storage ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
              </button>
              {expandedSections.storage && (
                <div className="px-6 pb-6 border-t border-white/5 pt-6 bg-black/20">
                  <textarea 
                    name="storageInstructions"
                    value={formData.storageInstructions}
                    onChange={handleInputChange}
                    className="admin-input min-h-[80px] resize-none"
                    placeholder="Cool and dry place..."
                  />
                </div>
              )}
            </div>

            {/* Delivery & Offers */}
            <div className={`premium-card !p-0 overflow-hidden transition-all duration-300 ${expandedSections.delivery ? 'ring-1 ring-admin-accent/30' : ''}`}>
              <button 
                onClick={() => toggleSection('delivery')}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-admin-accent/10 flex items-center justify-center text-admin-accent">
                    <Truck size={18} />
                  </div>
                  <span className="font-bold text-white">Delivery & Offers</span>
                </div>
                {expandedSections.delivery ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
              </button>
              {expandedSections.delivery && (
                <div className="px-6 pb-6 space-y-4 border-t border-white/5 pt-6 bg-black/20">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 block">Delivery Text</label>
                    <input name="deliveryText" value={formData.deliveryText} onChange={handleInputChange} className="admin-input" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 block">Offer Text</label>
                    <input name="offerText" value={formData.offerText} onChange={handleInputChange} className="admin-input" />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Dynamic Specifications */}
          <section className="premium-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-400">
                  <Settings size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">Dynamic Specifications</h2>
              </div>
              <button onClick={handleSpecAdd} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-admin-accent text-xs font-bold rounded-lg border border-admin-accent/20 transition-all">
                <Plus size={16} /> Add Spec
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.specifications.length === 0 && (
                <p className="text-center py-8 text-gray-600 italic">No specifications added yet.</p>
              )}
              {formData.specifications.map((spec, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group relative">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider mb-1 block">Field Name</label>
                      <input value={spec.name} onChange={(e) => handleSpecUpdate(idx, 'name', e.target.value)} className="admin-input" placeholder="e.g. Burn Time" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider mb-1 block">Value</label>
                      <input value={spec.value} onChange={(e) => handleSpecUpdate(idx, 'value', e.target.value)} className="admin-input" placeholder="e.g. 45 mins" />
                    </div>
                  </div>
                  <button onClick={() => handleListRemove('specifications', idx)} className="self-center mt-5 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="premium-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">FAQ Section</h2>
              </div>
              <button onClick={handleFAQAdd} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-400/20 transition-all">
                <Plus size={16} /> Add FAQ
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.faqs.map((faq, idx) => (
                <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider mb-1 block">Question</label>
                      <input value={faq.question} onChange={(e) => handleFAQUpdate(idx, 'question', e.target.value)} className="admin-input" placeholder="User question..." />
                    </div>
                    <button onClick={() => handleListRemove('faqs', idx)} className="mt-5 p-3 text-red-500 hover:bg-red-500/10 rounded-xl">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 tracking-wider mb-1 block">Answer</label>
                    <textarea value={faq.answer} onChange={(e) => handleFAQUpdate(idx, 'answer', e.target.value)} className="admin-input min-h-[80px]" placeholder="Response..." />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Related Products */}
          <section className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                <Link size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Related Products (Upsell)</h2>
            </div>
            
            <div className="relative group">
              <div className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-pink-400 transition-colors">
                <Search size={18} />
              </div>
              <select 
                multiple
                className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-2xl pl-12 pr-4 py-4 min-h-[150px] focus:outline-none focus:border-pink-500/50 transition-all scrollbar-hide"
                value={formData.relatedProducts}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, relatedProducts: values }));
                }}
              >
                {allProducts.filter(p => p.id !== id).map(prod => (
                  <option key={prod.id} value={prod.id} className="py-2 px-2 hover:bg-white/5 rounded-lg mb-1 cursor-pointer">
                    {prod.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

        </div>

        {/* RIGHT SIDE - Control Panel (30%) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Product Status & Visibility */}
          <section className="premium-card">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Status & Visibility</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${formData.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
                  <span className="font-bold text-white uppercase text-xs tracking-wider">{formData.status}</span>
                </div>
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'Active' ? 'Draft' : 'Active' }))}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formData.status === 'Active' ? 'bg-emerald-500/20' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.status === 'Active' ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Eye size={16} />
                  <span className="text-xs font-medium">Visible to customers</span>
                </div>
                <input 
                  type="checkbox" 
                  name="visibility" 
                  checked={formData.visibility} 
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-admin-accent focus:ring-0"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="premium-card">
            <div className="flex items-center gap-2 mb-6">
              <IndianRupee className="text-admin-accent" size={18} />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pricing</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-600 mb-1 block">Regular Price (₹)</label>
                <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="admin-input" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-600 mb-1 block">Discount Price (₹)</label>
                <input name="discountPrice" type="number" value={formData.discountPrice} onChange={handleInputChange} className="admin-input" placeholder="0.00" />
              </div>
              {calculateSavings() > 0 && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">You save</span>
                  <span className="text-sm font-black text-emerald-500">₹{calculateSavings()}</span>
                </div>
              )}
            </div>
          </section>

          {/* Inventory */}
          <section className="premium-card">
            <div className="flex items-center gap-2 mb-6">
              <BadgePercent className="text-blue-400" size={18} />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Inventory</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-600 mb-1 block">Stock Quantity</label>
                <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} className="admin-input" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Sold Count</span>
                <span className="text-sm font-black text-white">{formData.salesCount || 0}</span>
              </div>
            </div>
          </section>

          {/* Product Image */}
          <section className="premium-card">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Product Image</h3>
            <div className="relative group">
              <div className="aspect-square w-full rounded-2xl bg-white/5 border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center gap-3 hover:border-admin-accent/50 transition-all">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button onClick={() => document.getElementById('image-upload').click()} className="p-3 bg-white/10 rounded-full hover:bg-white/20">
                        <Upload size={24} className="text-white" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon size={40} className="text-gray-700" />
                    <button onClick={() => document.getElementById('image-upload').click()} className="text-xs font-bold text-admin-accent uppercase tracking-widest hover:underline">Upload Image</button>
                  </>
                )}
                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>
          </section>

          {/* Delivery Settings */}
          <section className="premium-card">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Delivery Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-600 mb-1 block">Delivery Days</label>
                <input name="deliveryDays" value={formData.deliveryDays} onChange={handleInputChange} className="admin-input" placeholder="e.g. 3-5 days" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-xs text-gray-400">Free Shipping</span>
                <input type="checkbox" name="freeShipping" checked={formData.freeShipping} onChange={handleInputChange} className="w-4 h-4 text-admin-accent" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-xs text-gray-400">COD Available</span>
                <input type="checkbox" name="codAvailable" checked={formData.codAvailable} onChange={handleInputChange} className="w-4 h-4 text-admin-accent" />
              </div>
            </div>
          </section>

          {/* Product Badges */}
          <section className="premium-card">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Product Badges</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'isBestseller', label: 'Bestseller', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
                { name: 'isNew', label: 'New Arrival', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                { name: 'isTrending', label: 'Trending', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
              ].map(badge => (
                <button 
                  key={badge.name}
                  onClick={() => setFormData(prev => ({ ...prev, [badge.name]: !prev[badge.name] }))}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${formData[badge.name] ? badge.color : 'bg-white/5 text-gray-500 border-white/5'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{badge.label}</span>
                  {formData[badge.name] ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-20" />}
                </button>
              ))}
            </div>
          </section>

          {/* SEO Settings */}
          <section className="premium-card border-2 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="text-emerald-400" size={18} />
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">SEO Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-emerald-500/50 mb-1 block">URL Slug</label>
                <input name="slug" value={formData.slug} onChange={handleInputChange} className="admin-input" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-emerald-500/50 mb-1 block">Meta Title</label>
                <input name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className="admin-input" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-emerald-500/50 mb-1 block">Meta Description</label>
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} className="admin-input min-h-[100px]" />
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Save Overlay for mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 bg-[#030303]/90 backdrop-blur-md border-t border-white/5 p-4 lg:hidden">
        <div className="flex gap-4">
          <button onClick={() => handleSave('Draft')} className="flex-1 py-3 font-bold text-gray-400 border border-white/10 rounded-xl">Draft</button>
          <button onClick={() => handleSave('Active')} className="flex-[2] py-3 font-bold bg-admin-accent text-black rounded-xl">Publish</button>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
