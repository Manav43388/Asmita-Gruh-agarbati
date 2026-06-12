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
        className="divine-header flex flex-col items-center w-full"
      >
        <h2 className="divine-title text-center" style={{ marginBottom: '1.5rem' }}>Fragrances For Divine Experiences</h2>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 w-full max-w-4xl px-4">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-[#ecc244] text-black shadow-[0_0_15px_rgba(236,194,68,0.3)] scale-105 font-bold border border-[#ecc244]'
                  : 'bg-[#151515] text-gray-400 hover:bg-[#222] hover:text-[#ecc244] border border-white/10 font-medium'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
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
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image-container premium-frame" style={{ cursor: 'pointer', overflow: 'hidden' }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    className="product-image"
                    loading="lazy"
                    decoding="async"
                    width="260"
                    height="240"
                    style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => setSelectedProduct(p)}
                  />
                </div>

                <div className="product-info flex-1 flex flex-col px-5 py-4" style={{ cursor: 'pointer' }}>
                  <h3 className="mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed flex-1" title={p.desc}>
                    {p.desc}
                  </p>
                  {p.stock <= 5 && p.stock > 0 && (
                    <p className="text-orange-500 text-sm font-medium mt-auto">
                      🔥 Only {p.stock} left!
                    </p>
                  )}
                </div>
              </div>

                <div className="product-footer">
                  <div className="product-price-block">
                    {p.discountPrice ? (
                      <>
                        <span className="product-price">₹{p.discountPrice}</span>
                        <span className="product-original-price line-through text-xs text-gray-500 ml-2">₹{p.price}</span>
                      </>
                    ) : (
                      <span className="product-price">₹{p.price}</span>
                    )}
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
