import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, Star, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

const initialProducts = [
  {
    id: 1,
    title: 'Premium Agarbatti',
    desc: 'Hand-rolled natural incense sticks for daily prayers and meditation.',
    image: '/agarbatti.png',
    price: 199,
    unit: 'per box (50 sticks)',
    tag: 'Bestseller',
    category: 'Incense Sticks',
    stock: 5,
  },
  {
    id: 2,
    title: 'Mystic Dhoop Cones',
    desc: 'Thick, earthy smoke perfect for deep relaxation and spiritual awakening.',
    image: '/dhoop.png',
    price: 149,
    unit: 'per pack (20 cones)',
    tag: 'Popular',
    category: 'Dhoop Sticks',
    stock: 18,
  },
  {
    id: 3,
    title: 'Sambrani Cups',
    desc: 'Traditional loban cups that emit purifying smoke to cleanse your space.',
    image: '/sambrani.png',
    price: 129,
    unit: 'per pack (12 cups)',
    tag: null,
    category: 'Other Spiritual Products',
    stock: 3,
  },
  {
    id: 4,
    title: 'Camphor (Kapur)',
    desc: 'Pure, smoke-free camphor for authentic temple-like aarti at home.',
    image: '/camphor.png',
    price: 99,
    unit: 'per tin (50g)',
    tag: null,
    category: 'Puja Items',
    stock: 22,
  },
  {
    id: 5,
    title: 'Floral Essences',
    desc: 'Sweet and calming notes of jasmine, rose, and lavender incense.',
    image: '/floral.png',
    price: 249,
    unit: 'per box (40 sticks)',
    tag: 'New',
    category: 'Incense Sticks',
    stock: 7,
  },
  {
    id: 6,
    title: 'Natural Attar',
    desc: 'Alcohol-free, concentrated roll-on perfumes made from essential oils.',
    image: '/attar.png',
    price: 399,
    unit: 'per bottle (10ml)',
    tag: 'Premium',
    category: 'Other Spiritual Products',
    stock: 4,
  }
];

const CATEGORIES = ['All', 'Incense Sticks', 'Dhoop Sticks', 'Puja Items', 'Idol Cloth', 'Other Spiritual Products'];

export default function Products() {
  const { addToCart, cartItems, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const [addedIds, setAddedIds] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().name,
          desc: doc.data().description,
          ...doc.data()
        }));
        setProducts(productsData);
      } else {
        setProducts(initialProducts);
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="cat-circles-row"
      >
        {[
          { label: 'All Products',   filter: 'All',                      image: '/agarbatti.png' },
          { label: 'Incense Sticks', filter: 'Incense Sticks',           image: '/agarbatti.png' },
          { label: 'Dhoop Sticks',   filter: 'Dhoop Sticks',             image: '/dhoop.png'     },
          { label: 'Puja Items',     filter: 'Puja Items',               image: '/sambrani.png'  },
          { label: 'Idol Cloth',     filter: 'Idol Cloth',               image: '/floral.png'    },
          { label: 'Spiritual',      filter: 'Other Spiritual Products',  image: '/attar.png'     },
        ].map(cat => (
          <button
            key={cat.filter}
            className={`cat-circle-item ${activeCategory === cat.filter ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.filter)}
          >
            <div className="cat-circle-img">
              <img src={cat.image} alt={cat.label} />
            </div>
            <span className="cat-circle-label">{cat.label}</span>
          </button>
        ))}
      </motion.div>


      <div className="products-grid">
        {filtered.map((p, index) => {
          const inCart = getCartQty(p.id);
          const justAdded = addedIds[p.id];

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="product-card glass-panel"
            >
              {p.tag && <span className="product-tag">{p.tag}</span>}

              <div
                className="product-clickable"
                onClick={() => setSelectedProduct(p)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${p.title}`}
              >
                <div className="product-image-container">
                  <img src={p.image} alt={p.title} className="product-image" />
                  {inCart > 0 && (
                    <div className="in-cart-badge">
                      <ShoppingCart size={12} /> {inCart} in cart
                    </div>
                  )}
                </div>

                <div className="product-info">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  {p.stock <= 7 && p.stock > 0 && (
                    <div className={`stock-indicator ${p.stock <= 3 ? 'critical' : 'low'}`}>
                      🔥 Only {p.stock} left!
                    </div>
                  )}
                </div>
              </div>

              <div className="product-footer">
                <div className="product-price-block">
                  <span className="product-price">₹{p.price}</span>
                  <span className="product-unit">{p.unit || 'per pack'}</span>
                </div>

                {inCart > 0 ? (
                  <div className="card-qty-stepper" id={`qty-stepper-${p.id}`}>
                    <button
                      className="card-qty-btn"
                      onClick={() => handleDecrease(p.id, inCart)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="card-qty-count">{inCart}</span>
                    <button
                      className="card-qty-btn"
                      onClick={() => handleIncrease(p)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="add-cart-btn-solid"
                    onClick={() => handleAddToCart(p)}
                    id={`add-to-cart-${p.id}`}
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                )}
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
