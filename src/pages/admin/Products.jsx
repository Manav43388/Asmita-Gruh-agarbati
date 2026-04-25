import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Tag,
  IndianRupee,
  Loader2
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Incense Sticks',
    description: '',
    image: '',
    unit: 'Per Box'
  });

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'products', currentId), formData);
        toast.success('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), {
          ...formData,
          createdAt: new Date()
        });
        toast.success('Product added successfully');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setCurrentId(product.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'Incense Sticks',
      description: '',
      image: '',
      unit: 'Per Box'
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  if (loading) return <div className="admin-page-container">Loading...</div>;

  return (
    <div className="admin-content-fade">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Product Catalog</h1>
          <p className="admin-subtitle" style={{ textAlign: 'left' }}>Add and manage your incense and spiritual items.</p>
        </div>
        
        <button 
          className="admin-button" 
          style={{ width: 'auto' }}
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {products.map((product) => (
          <div key={product.id} className="admin-stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '160px', overflow: 'hidden' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="admin-badge confirmed">{product.category}</span>
                <span style={{ fontWeight: 700, color: '#d4af37' }}>₹{product.price}</span>
              </div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h4>
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.25rem', height: '40px', overflow: 'hidden' }}>
                {product.description}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="admin-button" style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => handleEdit(product)}>
                  <Edit size={16} style={{ marginRight: '5px' }} /> Edit
                </button>
                <button className="admin-button" style={{ flex: 1, padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={() => handleDelete(product.id)}>
                  <Trash2 size={16} style={{ marginRight: '5px' }} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="admin-page-container" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="admin-card" style={{ maxWidth: '600px' }}>
            <h2 className="admin-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Product Name</label>
                  <input 
                    className="admin-input" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Premium Rose Agarbatti"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Price (₹)</label>
                  <input 
                    type="number"
                    className="admin-input" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="150"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Category</label>
                  <select 
                    className="admin-input"
                    style={{ paddingLeft: '1rem' }}
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Incense Sticks</option>
                    <option>Dhoop Sticks</option>
                    <option>Pujan Samagri</option>
                    <option>Attar & Perfumes</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Unit</label>
                  <input 
                    className="admin-input" 
                    style={{ paddingLeft: '1rem' }}
                    value={formData.unit} 
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    placeholder="Per Box / 100g"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Image URL</label>
                <input 
                  className="admin-input" 
                  value={formData.image} 
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Description</label>
                <textarea 
                  className="admin-input" 
                  style={{ minHeight: '100px', paddingLeft: '1rem' }}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Write something about this product..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="admin-button" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-button">
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
