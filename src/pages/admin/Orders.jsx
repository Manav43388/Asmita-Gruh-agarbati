import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Truck,
  Edit2,
  Check
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Using a simpler query first to ensure we see EVERYTHING
    const q = collection(db, 'orders');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort manually in JS for now to avoid index issues
      const sorted = ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(sorted);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateTracking = async (orderId, trackingId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { trackingId });
      toast.success('Tracking ID updated');
    } catch (error) {
      toast.error('Failed to update tracking');
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone?.includes(searchTerm)
  );

  if (loading) return <div className="admin-page-container">Loading...</div>;

  return (
    <div className="admin-content-fade">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="admin-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Order Management</h1>
          <p className="admin-subtitle" style={{ textAlign: 'left' }}>Track, manage and update customer orders.</p>
        </div>
        
        <div className="admin-input-wrapper" style={{ width: '300px' }}>
          <Search className="admin-input-icon" size={18} />
          <input 
            type="text" 
            className="admin-input" 
            placeholder="Search Order ID, Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Info</th>
                <th>Product & Amount</th>
                <th>Status</th>
                <th>Tracking ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#d4af37' }}>{order.orderId}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      {order.createdAt?.toDate?.().toLocaleString() || 'Just now'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>{order.phone}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666', maxWidth: '200px' }}>{order.address}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.product}</div>
                    <div style={{ color: '#22c55e', fontWeight: 700 }}>₹{order.amount}</div>
                  </td>
                  <td>
                    <select 
                      className="admin-select"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{ 
                        background: order.status === 'Pending' ? 'rgba(234, 179, 8, 0.1)' : 
                                   order.status === 'Delivered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: order.status === 'Pending' ? '#eab308' : 
                               order.status === 'Delivered' ? '#22c55e' : '#fff'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td>
                    <div className="admin-input-wrapper" style={{ width: '150px' }}>
                      <Truck className="admin-input-icon" size={14} />
                      <input 
                        type="text" 
                        className="admin-input" 
                        style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', fontSize: '0.8rem' }}
                        placeholder="TRK123..." 
                        defaultValue={order.trackingId}
                        onBlur={(e) => updateTracking(order.id, e.target.value)}
                      />
                    </div>
                  </td>
                  <td>
                    <button className="admin-action-btn" title="View Details">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
