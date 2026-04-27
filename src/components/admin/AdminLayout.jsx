import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-full bg-[#050505] text-gray-200 overflow-hidden font-sans">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#141414',
            color: '#fff',
            border: '1px solid #2a2a2a',
          }
        }} 
      />
      
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden h-20 flex items-center justify-between px-6 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="font-bold text-admin-accent tracking-wide uppercase">Asmita Admin</span>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-2 bg-admin-accent/10 border border-admin-accent/20 rounded-xl text-admin-accent hover:bg-admin-accent/20 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-admin-accent/5 via-[#050505] to-[#050505]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
