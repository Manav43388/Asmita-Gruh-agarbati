import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Medal,
  CalendarDays,
  ChevronDown
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';

// --- Animated Number Component ---
const AnimatedNumber = ({ value, prefix = '' }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState([]);
  const [timeRange, setTimeRange] = useState(7); // days
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const q = collection(db, 'orders');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          ordersList.push({ id: doc.id, ...data });
        }
      });
      setAllOrders(ordersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Dynamic BI Calculations ---
  const { metrics, chartData, topProducts, sparklineData } = useMemo(() => {
    const now = new Date();
    const rangeMs = timeRange * 24 * 60 * 60 * 1000;
    
    // Split orders into Current Period and Previous Period
    const currentOrders = [];
    const previousOrders = [];
    
    allOrders.forEach(order => {
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const timeDiff = now - orderDate;
      if (timeDiff <= rangeMs) {
        currentOrders.push(order);
      } else if (timeDiff <= rangeMs * 2) {
        previousOrders.push(order);
      }
    });

    // Helper to calculate sums
    const calcRevenue = (ordersList) => ordersList.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    
    const currRevenue = calcRevenue(currentOrders);
    const prevRevenue = calcRevenue(previousOrders);
    const currCount = currentOrders.length;
    const prevCount = previousOrders.length;
    
    const currAov = currCount ? currRevenue / currCount : 0;
    const prevAov = prevCount ? prevRevenue / prevCount : 0;

    // Trend calculation
    const getTrend = (curr, prev) => {
      if (prev === 0) return { percent: curr > 0 ? 100 : 0, isUp: true };
      const percent = ((curr - prev) / prev) * 100;
      return { percent: Math.abs(percent).toFixed(1), isUp: percent >= 0 };
    };

    const revTrend = getTrend(currRevenue, prevRevenue);
    const countTrend = getTrend(currCount, prevCount);
    const aovTrend = getTrend(currAov, prevAov);

    // Chart Data Generation
    const salesByDate = {};
    const sparkline = [];
    
    // Pre-fill days
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesByDate[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    const productCounts = {};

    currentOrders.forEach(order => {
      const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const amount = Number(order.amount || 0);
      
      if (salesByDate[dateStr]) {
        salesByDate[dateStr].revenue += amount;
        salesByDate[dateStr].orders += 1;
      }

      const pName = order.product || 'Unknown Product';
      if (!productCounts[pName]) productCounts[pName] = { revenue: 0, count: 0 };
      productCounts[pName].revenue += amount;
      productCounts[pName].count += 1;
    });

    const finalChartData = Object.values(salesByDate);
    // Create sparkline array for metric cards
    finalChartData.forEach(day => sparkline.push({ value: day.revenue, orderVal: day.orders }));

    const sortedProducts = Object.keys(productCounts)
      .map(key => ({ name: key, ...productCounts[key] }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      metrics: {
        revenue: currRevenue, revTrend,
        orders: currCount, countTrend,
        aov: Math.round(currAov), aovTrend,
        conversion: '3.8', convTrend: { percent: '1.2', isUp: true } // Static mock
      },
      chartData: finalChartData,
      topProducts: sortedProducts,
      sparklineData: sparkline
    };
  }, [allOrders, timeRange]);


  const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#2a2a2a] p-4 rounded-xl shadow-2xl">
          <p className="text-gray-400 text-sm mb-1 font-medium">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-admin-accent"></div>
            <p className="text-white font-bold text-lg">
              {prefix}{payload[0].value.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const MiniSparkline = ({ dataKey, color }) => (
    <div className="h-12 w-24 absolute right-4 bottom-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparklineData}>
          <defs>
            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#color-${dataKey})`} isAnimationActive={true} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-48 bg-[#141414] rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
          <div className="h-80 bg-[#141414] rounded-2xl border border-[#2a2a2a]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-20">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit'] flex items-center gap-3">
            Analytics & BI
            <Activity className="text-admin-accent" size={28} />
          </h1>
          <p className="text-gray-400">Deep insights into your business performance.</p>
        </div>
        
        {/* Date Filter */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 !bg-[#141414] border border-[#2a2a2a] !text-white px-4 py-2.5 rounded-xl hover:border-admin-accent/50 transition-colors shadow-lg shadow-black/20"
          >
            <CalendarDays size={18} className="text-admin-accent" />
            <span className="font-medium text-sm">
              {timeRange === 7 ? 'Last 7 Days' : timeRange === 30 ? 'Last 30 Days' : 'Last 3 Months'}
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-top-2"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              {[
                { label: 'Last 7 Days', val: 7 },
                { label: 'Last 30 Days', val: 30 },
                { label: 'Last 3 Months', val: 90 }
              ].map(opt => (
                <button
                  key={opt.val}
                  style={{ backgroundColor: timeRange === opt.val ? 'rgba(212, 175, 55, 0.2)' : 'transparent' }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${timeRange === opt.val ? '!text-admin-accent font-bold border-l-2 border-admin-accent' : '!text-gray-300 hover:!bg-[#2a2a2a] hover:!text-white'}`}
                  onClick={() => { setTimeRange(opt.val); setIsDropdownOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        {[
          { label: 'Total Revenue', value: metrics.revenue, prefix: '₹', icon: IndianRupee, trend: metrics.revTrend, color: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: 'shadow-emerald-500/20', hex: '#34d399', sparkKey: 'value' },
          { label: 'Total Orders', value: metrics.orders, prefix: '', icon: ShoppingBag, trend: metrics.countTrend, color: 'text-blue-400', bg: 'bg-blue-400/10', glow: 'shadow-blue-500/20', hex: '#60a5fa', sparkKey: 'orderVal' },
          { label: 'Avg. Order Value', value: metrics.aov, prefix: '₹', icon: TrendingUp, trend: metrics.aovTrend, color: 'text-amber-400', bg: 'bg-amber-400/10', glow: 'shadow-amber-500/20', hex: '#fbbf24', sparkKey: 'value' },
          { label: 'Conversion Rate', value: 3.8, prefix: '', suffix: '%', icon: Activity, trend: metrics.convTrend, color: 'text-admin-accent', bg: 'bg-admin-accent/10', glow: 'shadow-admin-accent/20', hex: '#d4af37', sparkKey: 'orderVal' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="group bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-2xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] hover:border-[#4a4a4a] relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-125"></div>
            
            <MiniSparkline dataKey={stat.sparkKey} color={stat.hex} />

            <div className="flex justify-between items-start relative z-10 mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-lg ${stat.glow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-3xl font-bold text-white tracking-tight mb-1 flex items-baseline">
                {stat.prefix}<AnimatedNumber value={stat.value} />{stat.suffix}
              </h4>
              <p className="text-sm font-medium text-gray-400 mb-3">{stat.label}</p>
              
              <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${stat.trend.isUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                {stat.trend.isUp ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                {stat.trend.percent}% vs prev
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-admin-accent/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">Revenue Trend</h3>
              <p className="text-sm text-gray-400">Total revenue generated over {timeRange} days</p>
            </div>
          </div>
          
          {chartData.length > 0 && chartData.some(d => d.revenue > 0) ? (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <RechartsTooltip content={<CustomTooltip prefix="₹" />} cursor={{ stroke: '#d4af37', strokeWidth: 1, strokeDasharray: '5 5' }} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#d4af37" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 8, fill: '#d4af37', stroke: '#fff', strokeWidth: 2, className: "shadow-[0_0_20px_#d4af37]" }}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[320px] w-full flex flex-col items-center justify-center border border-dashed border-[#2a2a2a] rounded-xl">
              <Activity size={48} className="text-gray-600 mb-3" />
              <p className="text-gray-500 font-medium">No revenue data for this period</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8 shadow-2xl relative group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center gap-2 mb-8">
            <Medal className="text-admin-accent" size={24} />
            <h3 className="text-xl font-bold text-white font-['Outfit']">Top Performers</h3>
          </div>
          
          <div className="space-y-6">
            {topProducts.length > 0 ? topProducts.map((product, index) => {
              const maxRevenue = topProducts[0]?.revenue || 1;
              const percentage = Math.max((product.revenue / maxRevenue) * 100, 5);
              
              return (
                <div key={index} className="group/item">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex-1 overflow-hidden pr-4">
                      <h4 className="text-sm font-bold text-gray-200 truncate group-hover/item:text-admin-accent transition-colors">{product.name}</h4>
                      <p className="text-xs font-medium text-gray-500">{product.count} units sold</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white whitespace-nowrap">₹{product.revenue.toLocaleString()}</div>
                      <div className="text-xs font-bold text-admin-accent">{Math.round((product.revenue / metrics.revenue) * 100)}%</div>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-yellow-600 to-admin-accent rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover/item:animate-[shimmer_1.5s_infinite]"></div>
                    </motion.div>
                  </div>
                </div>
              );
            }) : (
              <div className="h-full flex flex-col items-center justify-center py-12 border border-dashed border-[#2a2a2a] rounded-xl text-gray-500">
                <ShoppingBag size={40} className="mb-3 opacity-50" />
                <p className="font-medium">No product data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="lg:col-span-3 bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8 shadow-2xl relative mt-2 group">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">Daily Orders Volume</h3>
              <p className="text-sm text-gray-400">Total number of orders processed daily</p>
            </div>
          </div>
          
          {chartData.length > 0 && chartData.some(d => d.orders > 0) ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#2a2a2a', opacity: 0.4 }} content={<CustomTooltip />} />
                  <Bar dataKey="orders" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1500}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#d4af37' : '#3a3a3a'} className="transition-all duration-300 hover:fill-admin-accent/80" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[280px] w-full flex flex-col items-center justify-center border border-dashed border-[#2a2a2a] rounded-xl">
               <CalendarDays size={48} className="text-gray-600 mb-3" />
               <p className="text-gray-500 font-medium">No order data for this period</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Analytics;
