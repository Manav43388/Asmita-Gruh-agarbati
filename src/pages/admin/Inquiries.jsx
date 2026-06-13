import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  User,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  Filter,
  ChevronDown
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
  New: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Read: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
};

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      }));
      setInquiries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status, updatedAt: new Date() });
      toast.success(`Marked as ${status}`);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filtered = inquiries.filter(inq => {
    const matchesSearch = !searchTerm ||
      (inq.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const newCount = inquiries.filter(i => i.status === 'New').length;

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
        <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10 px-4">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Inquiries
            <MessageSquare className="text-admin-accent" size={28} />
            {newCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                {newCount} New
              </span>
            )}
          </h1>
          <p className="text-gray-400">Manage contact form submissions from customers.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[280px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-admin-accent transition-colors" size={18} />
            <input
              className="w-full bg-[#141414] border border-[#2a2a2a] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-admin-accent transition-all"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-admin-accent transition-all appearance-none pr-10 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Read">Read</option>
              <option value="Resolved">Resolved</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', count: inquiries.length, color: 'text-white' },
          { label: 'New', count: inquiries.filter(i => i.status === 'New').length, color: 'text-blue-400' },
          { label: 'Read', count: inquiries.filter(i => i.status === 'Read').length, color: 'text-amber-400' },
          { label: 'Resolved', count: inquiries.filter(i => i.status === 'Resolved').length, color: 'text-emerald-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 text-center">
            <span className={`text-2xl font-black ${stat.color}`}>{stat.count}</span>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No inquiries found</p>
          </div>
        ) : (
          filtered.map((inq) => {
            const colors = STATUS_COLORS[inq.status] || STATUS_COLORS.New;
            return (
              <div
                key={inq.id}
                className={`bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 hover:border-admin-accent/30 transition-all cursor-pointer ${selectedInquiry?.id === inq.id ? 'border-admin-accent/50 ring-1 ring-admin-accent/20' : ''}`}
                onClick={() => {
                  setSelectedInquiry(selectedInquiry?.id === inq.id ? null : inq);
                  if (inq.status === 'New') updateStatus(inq.id, 'Read');
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-admin-accent/10 flex items-center justify-center text-admin-accent font-bold flex-shrink-0">
                      {(inq.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{inq.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate mt-0.5">
                        {inq.subject ? <strong>{inq.subject}: </strong> : ''}{inq.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {inq.createdAt instanceof Date ? inq.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Expanded View */}
                {selectedInquiry?.id === inq.id && (
                  <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail size={14} className="text-admin-accent" />
                        <a href={`mailto:${inq.email}`} className="hover:text-admin-accent transition-colors">{inq.email || 'N/A'}</a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone size={14} className="text-admin-accent" />
                        <a href={`tel:${inq.phone}`} className="hover:text-admin-accent transition-colors">{inq.phone || 'N/A'}</a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={14} className="text-admin-accent" />
                        {inq.createdAt instanceof Date ? inq.createdAt.toLocaleString('en-IN') : 'Unknown'}
                      </div>
                    </div>

                    {inq.subject && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Subject</span>
                        <p className="text-white font-medium mt-0.5">{inq.subject}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Message</span>
                      <p className="text-gray-300 mt-0.5 whitespace-pre-wrap">{inq.message}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {inq.status !== 'Read' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(inq.id, 'Read'); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all"
                        >
                          <Eye size={14} /> Mark as Read
                        </button>
                      )}
                      {inq.status !== 'Resolved' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(inq.id, 'Resolved'); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                        >
                          <CheckCircle2 size={14} /> Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Inquiries;
