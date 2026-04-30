import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, Star, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

const CATEGORIES = ['All', 'Incense Sticks', 'Dhoop Sticks', 'Puja Items', 'Idol Cloth', 'Other Spiritual Products'];

export default function Products() {
  const { addToCart, cartItems, setIsCartOpen, setIsCheckoutOpen, updateQuantity, removeFromCart } = useCart();
  const [addedIds, setAddedIds] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.name || data.title || 'New Product',
            desc: data.description || data.desc || 'No description available',
            image: data.image || data.imageUrl || '/agarbatti.png',
            price: data.price || 0,
            unit: data.unit || 'per pack',
            category: data.category || 'Incense Sticks',
            stock: data.stock || 10,
            tag: data.tag || null,
            ...data
          };
        });
        setProducts(productsData);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds(p => ({ ...p, [product.id]: true }));
    setTimeout(() => setAddedIds(p => ({ ...p, [product.id]: false })), 1500);
  };

  const handleIncrease = (product) => addToCart(product);

  const handleDecrease = (id, currentQty) => {
    if (currentQty <= 1) removeFromCart(id);
    else updateQuantity(id, currentQty - 1);
  };

  const getCartQty = (id) => {
    const item = cartItems.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  return (
    <section id="products" className="section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="divine-header"
      >
        <h2 className="divine-title">Fragrances For Divine Experiences</h2>
      </motion.div>

      <div className="products-grid">
        {filtered.map((p, index) => {
          const inCart = getCartQty(p.id);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="product-card"
            >
              {p.tag && <span className="product-tag">{p.tag}</span>}

              <div
                className="product-clickable"
                onClick={() => setSelectedProduct(p)}
              >
                <div className="product-image-container premium-frame">
                  <img src={p.image} alt={p.title} className="product-image" />
                </div>

                <div className="product-info">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              </div>

              <div className="product-footer">
                <div className="product-price-block">
                  <span className="product-price">₹{p.price}</span>
                  <span className="product-unit">{p.unit || 'per pack'}</span>
                </div>

                <div className="product-actions">
                  {inCart > 0 ? (
                    <div className="card-qty-stepper">
                      <button onClick={(e) => { e.stopPropagation(); handleDecrease(p.id, inCart); }}>
                        <Minus size={14} />
                      </button>
                      <span className="card-qty-count">{inCart}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleIncrease(p); }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="add-cart-btn-solid"
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                    >
                      <ShoppingCart size={15} />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="view-cart-banner"
      >
        <p>🛒 Free delivery on all orders across India</p>
        <button className="view-cart-btn" onClick={() => setIsCartOpen(true)}>
          View Cart &amp; Checkout
        </button>
      </motion.div>
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
