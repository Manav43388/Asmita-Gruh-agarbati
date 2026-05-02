import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Image as ImageIcon, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Info,
  Star
} from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, onSnapshot, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const CMS = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('banners');
  
  const [banners, setBanners] = useState([
    { id: 1, image: '', link: '', title: '' }
  ]);

  const [policies, setPolicies] = useState({
    about: '',
    shipping: '',
    privacy: '',
    terms: ''
  });
  
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const unsubHome = onSnapshot(doc(db, 'content', 'homepage'), (docSnap) => {
      if (docSnap.exists()) {
        setBanners(docSnap.data().banners || []);
      }
    });

    const unsubPolicies = onSnapshot(doc(db, 'content', 'policies'), (docSnap) => {
      if (docSnap.exists()) {
        setPolicies(docSnap.data());
      }
      setLoading(false);
    });

    const unsubReviews = onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), (snapshot) => {
      const revs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(revs);
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });

    return () => {
      unsubHome();
      unsubPolicies();
      unsubReviews();
      unsubProducts();
    };
  }, []);

  const handleSaveBanners = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'content', 'homepage'), { banners });
      toast.success('Banners updated');
    } catch (error) {
      toast.error('Failed to update banners');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePolicies = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'content', 'policies'), policies);
      toast.success('Policies updated');
    } catch (error) {
      toast.error('Failed to update policies');
    } finally {
      setSaving(false);
    }
  };

  const addBanner = () => {
    setBanners([...banners, { id: Date.now(), image: '', link: '', title: '' }]);
  };

  const removeBanner = (id) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  if (loading) return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
      <div className="h-96 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
          Content Management
          <Layout className="text-admin-accent" size={28} />
        </h1>
        <p className="text-gray-400">Manage your website banners and legal documents.</p>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-[#141414] border border-[#2a2a2a] rounded-2xl w-fit mb-8">
        <button 
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'banners' ? 'bg-admin-accent text-[#050505]' : 'text-gray-500 hover:text-white'}`}
        >
          <ImageIcon size={18} /> Homepage Banners
        </button>
        <button 
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'policies' ? 'bg-admin-accent text-[#050505]' : 'text-gray-500 hover:text-white'}`}
        >
          <FileText size={18} /> Site Policies
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'reviews' ? 'bg-admin-accent text-[#050505]' : 'text-gray-500 hover:text-white'}`}
        >
          <Star size={18} /> Reviews
        </button>
      </div>

      {activeTab === 'banners' ? (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon size={20} className="text-admin-accent" />
              Carousel Banners
            </h3>
            <div className="flex gap-4">
              <button onClick={addBanner} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-bold">
                <Plus size={18} /> Add Banner
              </button>
              <button onClick={handleSaveBanners} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-admin-accent text-[#050505] rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all disabled:opacity-50">
                {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                Save Banners
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {banners.map((banner, idx) => (
              <div key={banner.id} className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-6 relative group overflow-hidden">
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Banner Slot #{idx + 1}</span>
                    <button onClick={() => removeBanner(banner.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Banner Image URL</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all text-sm"
                        placeholder="https://example.com/banner.jpg"
                        value={banner.image}
                        onChange={e => {
                          const newBanners = [...banners];
                          newBanners[idx].image = e.target.value;
                          setBanners(newBanners);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Redirection Link</label>
                      <input 
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all text-sm"
                        placeholder="/products"
                        value={banner.link}
                        onChange={e => {
                          const newBanners = [...banners];
                          newBanners[idx].link = e.target.value;
                          setBanners(newBanners);
                        }}
                      />
                    </div>
                  </div>

                  {banner.image && (
                    <div className="mt-2 rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#0a0a0a] h-32 relative">
                      <img src={banner.image} alt="Preview" className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Image Preview</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="col-span-full py-20 bg-[#141414] border border-[#2a2a2a] border-dashed rounded-3xl text-center text-gray-600">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
                <p>No banners added yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'policies' ? (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-admin-accent" />
              Policy Documents
            </h3>
            <button onClick={handleSavePolicies} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-admin-accent text-[#050505] rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all disabled:opacity-50">
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              Save All Policies
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {Object.keys(policies).map((key) => (
              <div key={key} className="bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2a2a] bg-white/[0.02] flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')} Policy</span>
                  <div className="p-1 bg-white/5 rounded-lg">
                    <Info size={14} className="text-gray-600" />
                  </div>
                </div>
                <div className="p-6">
                  <textarea 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-2xl px-6 py-5 focus:outline-none focus:border-admin-accent transition-all min-h-[300px] text-sm leading-relaxed custom-scrollbar"
                    placeholder={`Enter content for ${key} policy...`}
                    value={policies[key]}
                    onChange={e => setPolicies({...policies, [key]: e.target.value})}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'reviews' ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star size={20} className="text-admin-accent" />
              Manage Customer Reviews
            </h3>
            <button 
              onClick={() => setEditingReview({ 
                name: '', 
                rating: 5, 
                title: '', 
                text: '', 
                verified: true, 
                isApproved: true, 
                isFeatured: false, 
                productId: '', 
                customerImage: '', 
                reviewMedia: '',
                date: new Date().toISOString().split('T')[0] 
              })} 
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-bold"
            >
              <Plus size={18} /> Add New Review
            </button>
          </div>

          {editingReview && (
            <div className="bg-[#141414] border border-admin-accent/30 rounded-3xl p-8 mb-8 animate-in zoom-in-95 duration-200">
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                {editingReview.id ? 'Edit Review' : 'Create New Review'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Customer Name</label>
                  <input 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent"
                    value={editingReview.name}
                    onChange={e => setEditingReview({...editingReview, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Rating (1-5)</label>
                  <select 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent"
                    value={editingReview.rating}
                    onChange={e => setEditingReview({...editingReview, rating: parseInt(e.target.value)})}
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Review Title</label>
                  <input 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent"
                    value={editingReview.title}
                    onChange={e => setEditingReview({...editingReview, title: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Review Text</label>
                  <textarea 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent min-h-[100px]"
                    value={editingReview.text}
                    onChange={e => setEditingReview({...editingReview, text: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Linked Product</label>
                  <select 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent"
                    value={editingReview.productId}
                    onChange={e => setEditingReview({...editingReview, productId: e.target.value})}
                  >
                    <option value="">Select a Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Review Date</label>
                  <input 
                    type="date"
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent"
                    value={editingReview.date || ''}
                    onChange={e => setEditingReview({...editingReview, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Customer Image URL (Optional)</label>
                  <input 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent"
                    value={editingReview.customerImage || ''}
                    onChange={e => setEditingReview({...editingReview, customerImage: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block">Review Media URL (Optional)</label>
                  <input 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent"
                    value={editingReview.reviewMedia || ''}
                    onChange={e => setEditingReview({...editingReview, reviewMedia: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-6 md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editingReview.verified} 
                      onChange={e => setEditingReview({...editingReview, verified: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-admin-accent focus:ring-admin-accent"
                    />
                    <span className="text-sm text-gray-400">Verified Buyer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editingReview.isApproved} 
                      onChange={e => setEditingReview({...editingReview, isApproved: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-admin-accent focus:ring-admin-accent"
                    />
                    <span className="text-sm text-gray-400">Approved</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editingReview.isFeatured} 
                      onChange={e => setEditingReview({...editingReview, isFeatured: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-admin-accent focus:ring-admin-accent"
                    />
                    <span className="text-sm text-gray-400">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#2a2a2a]">
                <button 
                  onClick={() => setEditingReview(null)}
                  className="px-6 py-2 text-gray-500 hover:text-white transition-all text-sm font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const { id, ...data } = editingReview;
                      if (id) {
                        await updateDoc(doc(db, 'reviews', id), data);
                        toast.success('Review updated');
                      } else {
                        await addDoc(collection(db, 'reviews'), { ...data, createdAt: new Date().toISOString() });
                        toast.success('Review added');
                      }
                      setEditingReview(null);
                    } catch (e) {
                      toast.error('Error saving review');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="px-8 py-2 bg-admin-accent text-[#050505] rounded-xl font-bold transition-all text-sm"
                >
                  Save Review
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 flex justify-between items-center group">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-admin-accent/10 flex items-center justify-center text-admin-accent font-bold">
                    {rev.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{rev.name}</span>
                      {rev.verified && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-500/20">Verified</span>}
                      {rev.isFeatured && <span className="text-[10px] bg-admin-accent/10 text-admin-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-admin-accent/20">Featured</span>}
                      {!rev.isApproved && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-red-500/20">Pending</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < rev.rating ? "text-admin-accent fill-admin-accent" : "text-gray-700"} />
                      ))}
                      <span className="text-gray-500 text-xs ml-2">{rev.productId ? products.find(p => p.id === rev.productId)?.name || 'Product Linked' : 'No Product'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingReview(rev)} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <RefreshCw size={18} />
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Delete this review?')) {
                        try {
                          await deleteDoc(doc(db, 'reviews', rev.id));
                          toast.success('Review deleted');
                        } catch (e) {
                          toast.error('Error deleting review');
                        }
                      }
                    }} 
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="py-20 text-center text-gray-600 bg-[#141414] rounded-3xl border border-[#2a2a2a] border-dashed">
                <Star size={40} className="mx-auto mb-4 opacity-10" />
                <p>No reviews found in database.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

    </div>
  );
};

export default CMS;
