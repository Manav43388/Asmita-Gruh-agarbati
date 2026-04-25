import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'orders');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let revenue = 0;
      let pending = 0;
      let delivered = 0;
      const ordersData = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        revenue += Number(data.amount || 0);
        if (data.status === 'Pending') pending++;
        if (data.status === 'Delivered') delivered++;
        ordersData.push({ id: doc.id, ...data });
      });

      // Sort manually
      const sorted = ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setStats({
        totalOrders: snapshot.size,
        totalRevenue: revenue,
        pendingOrders: pending,
        deliveredOrders: delivered
      });
      setRecentOrders(sorted.slice(0, 5));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
    { label: 'Completed', value: stats.deliveredOrders, icon: CheckCircle2, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  ];

  if (loading) return <div className="admin-page-container">Loading...</div>;

  return (
    <div className="admin-content-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
        <p className="admin-subtitle" style={{ textAlign: 'left' }}>Welcome back! Here is what's happening today.</p>
      </div>

      <div className="admin-stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={28} />
            </div>
            <div className="admin-stat-info">
              <h4>{stat.label}</h4>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h3>Recent Orders</h3>
          <button className="admin-button" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            View All
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: '#d4af37' }}>{order.orderId || order.id.slice(0, 8)}</td>
                  <td>{order.name}</td>
                  <td>{order.product}</td>
                  <td>₹{order.amount}</td>
                  <td>
                    <span className={`admin-badge ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: '#666' }}>
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
