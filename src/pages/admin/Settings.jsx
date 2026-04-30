import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  MessageSquare, 
  Phone, 
  Save, 
  RefreshCw, 
  Layout, 
  Bell, 
  ShieldCheck,
  Smartphone,
  Eye
} from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    whatsappNumber: '918140306388',
    confirmationTemplate: 'Hello {customer_name}, your order #{order_id} for {product_name} has been confirmed! Total: ₹{amount}. Thank you for choosing Asmita Gruh Udhyog.',
    trackingTemplate: 'Your order #{order_id} is now {status}. You can track it here: {tracking_link}',
    deliveryTemplate: 'Great news! Your order #{order_id} has been delivered. We hope you love your incense!',
    businessName: 'Asmita Gruh Udhyog',
    adminEmail: 'admin@asmitagruh.com'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = (template) => {
    return template
      .replace('{customer_name}', 'Manav')
      .replace('{order_id}', 'AGU123')
      .replace('{product_name}', 'Premium Rose Agarbatti')
      .replace('{amount}', '250')
      .replace('{status}', 'Shipped')
      .replace('{tracking_link}', 'https://asmitagruh.com/track/AGU123');
  };

  if (loading) return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
      <div className="h-96 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10 px-4">
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            System Settings
            <SettingsIcon className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">Configure your business and automation preferences.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-admin-accent to-yellow-600 text-[#050505] font-black uppercase tracking-widest text-xs rounded-xl shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="xl:col-span-2 space-y-8">
          {/* WhatsApp Config */}
          <section className="bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">WhatsApp Integration</h3>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Business WhatsApp Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500 border-r border-[#2a2a2a] pr-3">
                    <Smartphone size={16} />
                    <span className="text-sm font-bold">+91</span>
                  </div>
                  <input 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl pl-20 pr-4 py-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold tracking-widest"
                    value={settings.whatsappNumber}
                    onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2 italic">Enter 10-digit number without country code</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Order Confirmation Template</label>
                  <textarea 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all min-h-[100px] text-sm leading-relaxed"
                    value={settings.confirmationTemplate}
                    onChange={e => setSettings({...settings, confirmationTemplate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Tracking Update Template</label>
                  <textarea 
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all min-h-[100px] text-sm leading-relaxed"
                    value={settings.trackingTemplate}
                    onChange={e => setSettings({...settings, trackingTemplate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Business Info */}
          <section className="bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-blue-500/5 to-transparent flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Layout size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Business Details</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Display Business Name</label>
                <input 
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all"
                  value={settings.businessName}
                  onChange={e => setSettings({...settings, businessName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Admin Email Address</label>
                <input 
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all"
                  value={settings.adminEmail}
                  onChange={e => setSettings({...settings, adminEmail: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Preview */}
        <div className="space-y-8">
          <section className="bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl sticky top-8">
            <div className="p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-admin-accent/5 to-transparent flex items-center gap-3">
              <div className="p-2 bg-admin-accent/10 rounded-lg text-admin-accent">
                <Eye size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Message Preview</h3>
            </div>
            <div className="p-8">
              <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-[#2a2a2a] relative">
                <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full m-3 animate-pulse" />
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare size={10} /> Live Preview
                </p>
                <div className="bg-[#1a1a1a] text-white p-4 rounded-xl rounded-tl-none text-xs leading-relaxed shadow-inner border border-white/5">
                  {renderPreview(settings.confirmationTemplate)}
                </div>
                <p className="text-[9px] text-gray-600 mt-4 text-center font-medium italic">
                  Tokens used: {'{customer_name}'}, {'{order_id}'}, {'{product_name}'}, {'{amount}'}
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Bell className="text-gray-500 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-gray-200 mb-1">System Notifications</h4>
                    <p className="text-[10px] text-gray-500">Automated updates are sent to the customer upon status change.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <ShieldCheck className="text-gray-500 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-gray-200 mb-1">Secure Storage</h4>
                    <p className="text-[10px] text-gray-500">All configurations are encrypted and stored securely in Firebase.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
