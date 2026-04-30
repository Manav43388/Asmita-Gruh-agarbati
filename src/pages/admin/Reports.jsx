import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStats = () => {
    const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalItems = orders.reduce((acc, curr) => acc + (curr.items?.length || 1), 0);

    return { totalRevenue, totalOrders, avgOrderValue, totalItems };
  };

  const getMonthlyRevenue = () => {
    const monthlyData = {};
    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = order.createdAt.toDate();
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(order.amount || 0);
    });
    return Object.entries(monthlyData).reverse();
  };

  const getProductSales = () => {
    const productData = {};
    orders.forEach(order => {
      const name = order.product || 'Unknown Product';
      productData[name] = (productData[name] || 0) + 1;
    });
    return Object.entries(productData).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const exportToCSV = () => {
    if (orders.length === 0) return;
    
    const headers = ['Order ID', 'Date', 'Customer', 'Product', 'Amount', 'Status'];
    const rows = orders.map(o => [
      o.orderId || o.id,
      o.createdAt?.toDate().toLocaleDateString() || '',
      o.name,
      o.product,
      o.amount,
      o.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `asmitagruh_reports_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success('Report exported as CSV');
  };

  const stats = getStats();
  const monthlyRevenue = getMonthlyRevenue();
  const productSales = getProductSales();

  if (loading) return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-12 w-64 bg-[#141414] rounded-xl mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>)}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10 px-4">
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Reports & Analytics
            <BarChart3 className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">Analyze your business growth and performance metrics.</p>
        </div>
        
        <button 
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] hover:bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded-xl font-bold text-sm transition-all hover:-translate-y-1"
        >
          <FileSpreadsheet size={18} className="text-emerald-500" />
          Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-3xl group hover:border-admin-accent/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-admin-accent/10 rounded-2xl text-admin-accent">
              <IndianRupee size={20} />
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} /> 12%
            </span>
          </div>
          <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Revenue</p>
          <h2 className="text-2xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</h2>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-3xl group hover:border-admin-accent/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <ShoppingBag size={20} />
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} /> 8%
            </span>
          </div>
          <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Orders</p>
          <h2 className="text-2xl font-black text-white">{stats.totalOrders}</h2>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-3xl group hover:border-admin-accent/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
              <TrendingUp size={20} />
            </div>
            <span className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded-lg">
              <ArrowDownRight size={14} /> 3%
            </span>
          </div>
          <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mb-1">Avg. Order Value</p>
          <h2 className="text-2xl font-black text-white">₹{stats.avgOrderValue.toFixed(0)}</h2>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-3xl group hover:border-admin-accent/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
              <Users size={20} />
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} /> 15%
            </span>
          </div>
          <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Items Sold</p>
          <h2 className="text-2xl font-black text-white">{stats.totalItems}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-admin-accent" />
              Revenue Trend
            </h3>
            <select className="bg-[#0a0a0a] border border-[#2a2a2a] text-[10px] text-gray-400 px-3 py-1.5 rounded-lg focus:outline-none uppercase font-bold tracking-widest">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full flex items-end gap-4 pb-8 border-b border-[#2a2a2a] relative">
            {monthlyRevenue.map(([month, rev], i) => {
              const maxRev = Math.max(...monthlyRevenue.map(m => m[1]), 1);
              const height = (rev / maxRev) * 100;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                  <div className="absolute bottom-full mb-2 bg-admin-accent text-[#050505] px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    ₹{rev.toLocaleString()}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-admin-accent to-yellow-600 rounded-t-xl transition-all duration-700 hover:brightness-125" 
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{month}</span>
                </div>
              );
            })}
            {monthlyRevenue.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm italic">
                Insufficient data for chart
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-8">
            <ShoppingBag size={20} className="text-admin-accent" />
            Top Products
          </h3>
          <div className="space-y-6">
            {productSales.map(([name, count], idx) => (
              <div key={name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black text-gray-400">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-200 truncate">{name}</p>
                  <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-admin-accent rounded-full" 
                      style={{ width: `${(count / (productSales[0][1] || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white">{count}</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Sales</p>
                </div>
              </div>
            ))}
            {productSales.length === 0 && (
              <p className="text-center text-gray-600 text-sm italic py-10">No sales data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
