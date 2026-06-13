import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductModal from './ProductModal';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, moveToCart, loading } = useWishlist();
  const { products } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleMoveToCart = (item) => {
    moveToCart(item);
  };

  const handleProductClick = (item) => {
    // Find the full product from products context
    const fullProduct = products.find(p => p.id === item.id || p.id === item.productId);
    if (fullProduct) {
      setSelectedProduct(fullProduct);
    }
  };

  if (!user) {
    return (
      <section className="section wishlist-page">
        <div className="wishlist-empty">
          <Heart size={72} strokeWidth={1} style={{ color: 'var(--primary-color)', opacity: 0.4 }} />
          <h2>Please Login</h2>
          <p>Sign in to view your wishlist and save your favourite products.</p>
          <button className="wishlist-browse-btn" onClick={() => navigate('/')}>
            <ShoppingBag size={18} /> Browse Products
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="section wishlist-page">
        <div className="wishlist-header">
          <h2 className="divine-title">My Wishlist</h2>
        </div>
        <div className="products-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="product-card" style={{ opacity: 0.3 }}>
              <div className="product-image-container" style={{ background: '#141414' }} />
              <div style={{ padding: '1rem' }}>
                <div style={{ height: 20, background: '#1a1a1a', borderRadius: 8, marginBottom: 8 }} />
                <div style={{ height: 14, background: '#1a1a1a', borderRadius: 8, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="section wishlist-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="wishlist-header"
      >
        <h2 className="divine-title">
          <Heart size={32} style={{ color: '#e74c3c', fill: '#e74c3c' }} />
          My Wishlist
        </h2>
        {wishlistItems.length > 0 && (
          <p className="wishlist-count-text">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
        )}
      </motion.div>

      {wishlistItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="wishlist-empty"
        >
          <Heart size={72} strokeWidth={1} style={{ color: 'var(--primary-color)', opacity: 0.4 }} />
          <h2>Your wishlist is empty</h2>
          <p>Save items you love to your wishlist and revisit them anytime.</p>
          <button className="wishlist-browse-btn" onClick={() => navigate('/')}>
            <ShoppingBag size={18} /> Browse Products
          </button>
        </motion.div>
      ) : (
        <div className="products-grid">
          <AnimatePresence>
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="product-card wishlist-card"
              >
                <div
                  className="product-clickable"
                  onClick={() => handleProductClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image-container premium-frame" style={{ overflow: 'hidden' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="product-image"
                      loading="lazy"
                      decoding="async"
                      width="260"
                      height="240"
                    />
                    <button
                      className="product-wishlist-btn active"
                      onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); }}
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={18} fill="#e74c3c" stroke="#e74c3c" />
                    </button>
                  </div>

                  <div className="product-info" style={{ padding: '1rem 1.25rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.category}</p>
                  </div>
                </div>

                <div className="product-footer">
                  <div className="product-price-block">
                    {item.discountPrice ? (
                      <>
                        <span className="product-price">₹{item.discountPrice}</span>
                        <span className="product-original-price line-through text-xs text-gray-500 ml-2">₹{item.price}</span>
                      </>
                    ) : (
                      <span className="product-price">₹{item.price}</span>
                    )}
                    <span className="product-unit">{item.unit || 'per pack'}</span>
                  </div>

                  <div className="wishlist-card-actions">
                    <button
                      className="wishlist-move-cart-btn"
                      onClick={(e) => { e.stopPropagation(); handleMoveToCart(item); }}
                    >
                      <ShoppingCart size={15} /> Move to Cart
                    </button>
                    <button
                      className="wishlist-remove-btn"
                      onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); }}
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
