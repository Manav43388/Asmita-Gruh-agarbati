import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-gray-200 overflow-hidden font-sans relative selection:bg-admin-accent/30 selection:text-admin-accent">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-admin-accent/5 via-[#030303] to-[#030303] pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-admin-accent/5 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute bottom-0 left-[20%] w-[600px] h-[500px] bg-admin-accent/5 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-screen"></div>

      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }
        }} 
      />
      
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 backdrop-blur-[2px]">
        {/* Mobile Header */}
        <div className="lg:hidden h-20 flex items-center justify-between px-6 border-b border-white/5 bg-[#080808]/70 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-admin-accent to-yellow-200 tracking-wider uppercase text-lg">Asmita Admin</span>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-2.5 bg-admin-accent/10 border border-admin-accent/20 rounded-xl text-admin-accent hover:bg-admin-accent/20 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95 transition-all duration-300"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 w-full custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
