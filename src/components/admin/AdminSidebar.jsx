import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  LogOut,
  X,
  TrendingUp,
  Users,
  Ticket,
  MessageSquare,
  Layout,
  BarChart3,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    // Listen for new/pending orders
    const q = query(
      collection(db, 'orders'), 
      where('status', 'in', ['Order placed', 'Pending'])
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNewOrderCount(snapshot.size);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    { name: 'View Website', path: '/', icon: Globe },
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: newOrderCount },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'CMS', path: '/admin/cms', icon: Layout },
    { name: 'Settings', path: '/admin/settings', icon: MessageSquare },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Security', path: '/admin/security', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full border border-admin-accent/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]" />
            <span className="text-admin-accent font-bold text-sm tracking-widest uppercase">Asmita Gruh Udhyog</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
                 ${isActive 
                    ? 'bg-gradient-to-r from-admin-accent/20 to-transparent text-admin-accent font-medium shadow-[inset_2px_0_0_0_#d4af37]' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                 }`
              }
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2a2a2a]">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group shadow-lg shadow-red-500/5"
          >
            <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-bold uppercase tracking-widest text-xs">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
