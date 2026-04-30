import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  X, 
  Copy, 
  CheckCircle2, 
  Clock,
  Zap
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialFormState = {
    code: '',
    type: 'Percentage',
    value: '',
    minPurchase: '0',
    expiryDate: '',
    status: 'Active',
    usageCount: 0
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const q = query(collection(db, 'coupons'), orderBy('code'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalData = {
        ...formData,
        code: formData.code.toUpperCase(),
        value: Number(formData.value),
        minPurchase: Number(formData.minPurchase || 0),
        updatedAt: new Date()
      };

      if (isEditing) {
        await updateDoc(doc(db, 'coupons', currentId), finalData);
        toast.success('Coupon updated');
      } else {
        await addDoc(collection(db, 'coupons'), {
          ...finalData,
          createdAt: new Date()
        });
        toast.success('Coupon created');
      }
      setShowModal(false);
      setFormData(initialFormState);
    } catch (error) {
      toast.error('Failed to save coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      await deleteDoc(doc(db, 'coupons', id));
      toast.success('Deleted');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied');
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-48 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>)}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10 px-4">
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Coupons
            <Ticket className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">Create and manage promotional discount codes.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[280px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-admin-accent transition-colors" size={18} />
            <input 
              className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-admin-accent transition-all"
              placeholder="Search codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setFormData(initialFormState); setIsEditing(false); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-admin-accent to-yellow-600 text-[#050505] font-bold rounded-xl shadow-xl hover:-translate-y-1 transition-all"
          >
            <Plus size={20} /> New Coupon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <div key={coupon.id} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden group hover:border-admin-accent/30 transition-all flex flex-col p-6 relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${coupon.status === 'Active' ? 'from-emerald-500/10' : 'from-red-500/10'} to-transparent rounded-bl-full`} />
            
            <div className="flex justify-between items-start mb-6">
              <div className="bg-admin-accent/10 border border-admin-accent/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="text-admin-accent font-black tracking-widest">{coupon.code}</span>
                <button onClick={() => copyCode(coupon.code)} className="text-admin-accent hover:text-white transition-colors">
                  <Copy size={14} />
                </button>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${coupon.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {coupon.status}
              </span>
            </div>

            <div className="mb-6 flex-1">
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-black text-white">
                  {coupon.type === 'Percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                </span>
                <span className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">OFF</span>
              </div>
              <p className="text-sm text-gray-400">Min. Purchase: <span className="text-white font-bold">₹{coupon.minPurchase}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={14} />
                <span className="text-xs font-medium">Expires: {coupon.expiryDate || 'No Limit'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 justify-end">
                <Zap size={14} />
                <span className="text-xs font-medium">{coupon.usageCount} Used</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setFormData(coupon); setCurrentId(coupon.id); setIsEditing(true); setShowModal(true); }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/5 font-bold text-xs uppercase tracking-widest"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(coupon.id)}
                className="p-2.5 bg-red-500/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0a0a0a] border border-[#2a2a2a] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between bg-gradient-to-r from-admin-accent/10 to-transparent">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Tag className="text-admin-accent" />
                {isEditing ? 'Edit Coupon' : 'New Coupon'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Coupon Code</label>
                <input 
                  className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all font-black tracking-widest uppercase"
                  placeholder="SAVE50"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Discount Type</label>
                  <select className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Value</label>
                  <input type="number" className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Min. Purchase (₹)</label>
                  <input type="number" className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.minPurchase} onChange={e => setFormData({...formData, minPurchase: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Status</label>
                  <select className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Expiry Date</label>
                <input type="date" className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              </div>

              <div className="pt-6 border-t border-[#2a2a2a] flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-admin-accent text-[#050505] font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-xl transition-all">
                  {isEditing ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
