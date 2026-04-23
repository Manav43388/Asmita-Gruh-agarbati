import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const products = [
  {
    id: 1,
    title: 'Premium Agarbatti',
    desc: 'Hand-rolled natural incense sticks for daily prayers and meditation.',
    image: '/agarbatti.png',
    price: 199,
    unit: 'per box (50 sticks)',
    tag: 'Bestseller',
  },
  {
    id: 2,
    title: 'Mystic Dhoop Cones',
    desc: 'Thick, earthy smoke perfect for deep relaxation and spiritual awakening.',
    image: '/dhoop.png',
    price: 149,
    unit: 'per pack (20 cones)',
    tag: 'Popular',
  },
  {
    id: 3,
    title: 'Sambrani Cups',
    desc: 'Traditional loban cups that emit purifying smoke to cleanse your space.',
    image: '/sambrani.png',
    price: 129,
    unit: 'per pack (12 cups)',
    tag: null,
  },
  {
    id: 4,
    title: 'Camphor (Kapur)',
    desc: 'Pure, smoke-free camphor for authentic temple-like aarti at home.',
    image: '/camphor.png',
    price: 99,
    unit: 'per tin (50g)',
    tag: null,
  },
  {
    id: 5,
    title: 'Floral Essences',
    desc: 'Sweet and calming notes of jasmine, rose, and lavender incense.',
    image: '/floral.png',
    price: 249,
    unit: 'per box (40 sticks)',
    tag: 'New',
  },
  {
    id: 6,
    title: 'Natural Attar',
    desc: 'Alcohol-free, concentrated roll-on perfumes made from essential oils.',
    image: '/attar.png',
    price: 399,
    unit: 'per bottle (10ml)',
    tag: 'Premium',
  },
];

export default function Products() {
  const { addToCart, cartItems, setIsCartOpen } = useCart();
  const [addedIds, setAddedIds] = useState({});

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds(p => ({ ...p, [product.id]: true }));
    setTimeout(() => setAddedIds(p => ({ ...p, [product.id]: false })), 1500);
  };

  const getCartQty = (id) => {
    const item = cartItems.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <section id="products" className="section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="products-header"
      >
        <h2 className="section-title">Our Products</h2>
        <p className="section-subtitle">Crafted with devotion, delivered to your doorstep</p>
      </motion.div>

      <div className="products-grid">
        {products.map((p, index) => {
          const inCart = getCartQty(p.id);
          const justAdded = addedIds[p.id];

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="product-card glass-panel"
            >
              {p.tag && <span className="product-tag">{p.tag}</span>}

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
              </div>

              <div className="product-footer">
                <div className="product-price-block">
                  <span className="product-price">₹{p.price}</span>
                  <span className="product-unit">{p.unit}</span>
                </div>
                <button
                  className={`add-cart-btn ${justAdded ? 'added' : ''}`}
                  onClick={() => handleAddToCart(p)}
                  id={`add-to-cart-${p.id}`}
                >
                  {justAdded ? (
                    <><Check size={16} /> Added!</>
                  ) : (
                    <><ShoppingCart size={16} /> Add to Cart</>
                  )}
                </button>
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
    </section>
  );
}
