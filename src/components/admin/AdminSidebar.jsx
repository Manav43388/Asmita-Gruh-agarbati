import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', path: '/admin/products', icon: Package },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#050505]/95 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static shadow-[10px_0_30px_rgba(0,0,0,0.5)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center p-1 border border-white/10 shadow-[0_0_20px_rgba(212,175,55,0.15)] overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-xl tracking-wide">Asmita</span>
              <span className="text-admin-accent font-bold text-xs tracking-widest uppercase">Admin</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-3 custom-scrollbar relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-admin-accent/5 blur-[80px] rounded-full pointer-events-none z-0"></div>
          
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-4 z-10">Main Menu</div>
          
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden z-10 font-bold
                 ${isActive 
                    ? 'text-admin-accent bg-admin-accent/10 border border-admin-accent/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                 }`
              }
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-admin-accent to-yellow-600 rounded-r-full shadow-[0_0_10px_#d4af37]"></div>
                  )}
                  <item.icon 
                    size={22} 
                    className={`transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-admin-accent drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : ''}`} 
                  />
                  <span className="tracking-wide">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-gray-400 font-bold hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group border border-transparent hover:border-red-500/20 active:scale-95"
          >
            <LogOut size={22} className="transition-transform group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
