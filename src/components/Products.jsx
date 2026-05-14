import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Check, Star, Plus, Minus, Flame, Clock, Leaf } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

// 3D Tilt Card wrapper
function TiltCard({ children, className, onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}

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
    <section id="products" className="section products-section-premium">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="section-header-premium"
      >
        <span className="section-label-premium">Our Collection</span>
        <h2 className="section-title-premium">Fragrances For Divine Experiences</h2>
        <p className="section-desc-premium">
          Each fragrance is carefully handcrafted using centuries-old techniques and the finest natural ingredients
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="category-filter-premium"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-btn-premium ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      <div className="products-grid-premium">
        {filtered.map((p, index) => {
          const inCart = getCartQty(p.id);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <TiltCard
                className="product-card-premium"
              >
                {p.tag && <span className="product-tag-premium">{p.tag}</span>}

                <div
                  className="product-clickable-premium"
                  onClick={() => setSelectedProduct(p)}
                >
                  <div className="product-image-wrap-premium">
                    <div className="product-image-glow" />
                    <img src={p.image} alt={p.title} className="product-image-premium" />
                    <div className="product-image-overlay" />
                  </div>

                  <div className="product-info-premium">
                    <h3 className="product-title-premium">{p.title}</h3>
                    <p className="product-desc-premium">{p.desc}</p>

                    {/* Fragrance meta */}
                    <div className="product-meta-premium">
                      <span><Clock size={12} /> 30-45 min</span>
                      <span><Leaf size={12} /> Natural</span>
                    </div>
                  </div>
                </div>

                <div className="product-footer-premium">
                  <div className="product-price-premium">
                    {p.discountPrice ? (
                      <>
                        <span className="price-current">₹{p.discountPrice}</span>
                        <span className="price-original">₹{p.price}</span>
                      </>
                    ) : (
                      <span className="price-current">₹{p.price}</span>
                    )}
                    <span className="price-unit">{p.unit || 'per pack'}</span>
                  </div>

                  <div className="product-actions-premium">
                    {inCart > 0 ? (
                      <div className="qty-stepper-premium">
                        <button onClick={(e) => { e.stopPropagation(); handleDecrease(p.id, inCart); }}>
                          <Minus size={14} />
                        </button>
                        <span>{inCart}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleIncrease(p); }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        className="add-cart-premium"
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShoppingCart size={15} />
                        Add to Cart
                      </motion.button>
                    )}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="cart-banner-premium"
      >
        <p>🚚 Free delivery on all orders across India</p>
        <motion.button
          className="view-cart-premium"
          onClick={() => setIsCartOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Cart & Checkout
        </motion.button>
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
