import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-dashboard-wrapper">
      <Toaster position="top-right" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="admin-main-content">
        {/* Mobile Header */}
        <div className="admin-mobile-header" style={{ display: 'none' }}>
          <button onClick={toggleSidebar} className="admin-action-btn">
            <Menu size={24} />
          </button>
          <span style={{ fontWeight: 700, color: '#d4af37' }}>Asmita Admin</span>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
