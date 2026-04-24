import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, ShoppingCart, Plus, Minus, Star, Check, Leaf, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const PRODUCT_DETAILS = {
  1: {
    ingredients: ['Bamboo sticks', 'Natural resins', 'Sandalwood powder', 'Pure essential oils', 'Herbal extracts'],
    benefits: ['100% Natural', 'Long burning (30 min)', 'No harmful chemicals', 'Temple-grade quality'],
    howToUse: 'Light the tip of the stick, let it catch flame for 5–10 seconds, then gently blow it out. Place in an incense holder and enjoy the fragrance.',
    reviews: [
      { name: 'Priya S.', rating: 5, text: 'Best agarbatti I have ever used. Divine fragrance!' },
      { name: 'Rahul P.', rating: 5, text: 'Pure natural smell, no headache at all. Buying again!' },
    ],
  },
  2: {
    ingredients: ['Charcoal base', 'Natural resins', 'Earthy essential oils', 'Herbal powder blend'],
    benefits: ['Rich thick smoke', 'Deep meditation aid', 'Long burning (45 min)', 'Natural ingredients'],
    howToUse: 'Place a cone on a heat-proof holder. Light the tip and blow out after 5 seconds. Keep away from flammable material.',
    reviews: [
      { name: 'Kavita D.', rating: 5, text: 'Amazing for meditation sessions. Deep earthy aroma.' },
      { name: 'Amit V.', rating: 4, text: 'Good quality. Burns evenly and lasts long.' },
    ],
  },
  3: {
    ingredients: ['Loban resin', 'Camphor', 'Natural binders', 'Herbal mix'],
    benefits: ['Purifies atmosphere', 'Removes negative energy', 'Natural antiseptic', 'Traditional formula'],
    howToUse: 'Place a cup on a heat-proof surface. Light the top and let it smoulder. Do not leave unattended.',
    reviews: [
      { name: 'Sunita M.', rating: 5, text: 'Sambrani cups are wonderful. Whole house smells amazing!' },
      { name: 'Deepak J.', rating: 5, text: 'Authentic traditional fragrance. Perfect for pooja.' },
    ],
  },
  default: {
    ingredients: ['100% natural ingredients', 'No synthetic fragrance', 'No harmful chemicals', 'Traditional formula'],
    benefits: ['Premium quality', 'Natural fragrance', 'Long lasting', 'Handcrafted'],
    howToUse: 'Use as directed on the packaging. Keep away from children and flammable material. Place in appropriate holder.',
    reviews: [
      { name: 'Happy Customer', rating: 5, text: 'Excellent quality product. Highly recommended!' },
      { name: 'Verified Buyer', rating: 5, text: 'Great product, fast delivery. Will buy again.' },
    ],
  },
};

function StarRow({ rating, size = 15 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          fill={i <= rating ? '#d4af37' : 'transparent'}
          stroke={i <= rating ? '#d4af37' : '#555'} />
      ))}
    </div>
  );
}

export default function ProductModal({ product, onClose }) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const details = PRODUCT_DETAILS[product.id] || PRODUCT_DETAILS.default;
  const cartItem = cartItems.find(i => i.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleIncrease = () => addToCart(product);
  const handleDecrease = () => {
    if (qty <= 1) removeFromCart(product.id);
    else updateQuantity(product.id, qty - 1);
  };

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 600;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="pmodal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="pmodal-sheet"
        initial={{ y: '110%' }}
        animate={{ y: isDesktop ? '-50%' : 0 }}
        exit={{ y: '110%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button className="pmodal-close" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>

        <div className="pmodal-scroll">
          {/* Image */}
          <div className="pmodal-image-wrap">
            <img src={product.image} alt={product.title} className="pmodal-image" />
            {product.tag && <span className="product-tag">{product.tag}</span>}
            {product.stock <= 7 && (
              <div className={`stock-indicator ${product.stock <= 3 ? 'critical' : 'low'} pmodal-stock`}>
                🔥 Only {product.stock} left!
              </div>
            )}
          </div>

          <div className="pmodal-body">
            {/* Title & rating */}
            <h2 className="pmodal-title">{product.title}</h2>
            <div className="pmodal-rating-row">
              <StarRow rating={5} size={16} />
              <span className="pmodal-rating-txt">4.8 · 210 reviews</span>
            </div>

            {/* Price + qty */}
            <div className="pmodal-price-row">
              <span className="pmodal-price">₹{product.price}</span>
              <span className="pmodal-unit">{product.unit}</span>
            </div>

            {/* Cart controls */}
            <div className="pmodal-cart-row">
              {qty > 0 ? (
                <div className="card-qty-stepper pmodal-stepper">
                  <button className="card-qty-btn" onClick={handleDecrease}><Minus size={16} /></button>
                  <span className="card-qty-count">{qty}</span>
                  <button className="card-qty-btn" onClick={handleIncrease}><Plus size={16} /></button>
                </div>
              ) : (
                <button className={`pmodal-add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
                  {added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
                </button>
              )}
            </div>

            {/* Benefits pills */}
            <div className="pmodal-benefits">
              {details.benefits.map((b, i) => (
                <span key={i} className="pmodal-benefit-pill">
                  <Leaf size={12} /> {b}
                </span>
              ))}
            </div>

            {/* Tabs */}
            <div className="pmodal-tabs">
              {['description', 'ingredients', 'how to use', 'reviews'].map(tab => (
                <button
                  key={tab}
                  className={`pmodal-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="pmodal-tab-content">
              {activeTab === 'description' && (
                <p className="pmodal-desc">{product.desc}</p>
              )}

              {activeTab === 'ingredients' && (
                <ul className="pmodal-ingredients">
                  {details.ingredients.map((ing, i) => (
                    <li key={i}><Leaf size={13} style={{ color: '#d4af37', marginRight: 6 }} />{ing}</li>
                  ))}
                </ul>
              )}

              {activeTab === 'how to use' && (
                <div className="pmodal-howto">
                  <Flame size={18} style={{ color: '#d4af37' }} />
                  <p>{details.howToUse}</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="pmodal-reviews">
                  {details.reviews.map((r, i) => (
                    <div key={i} className="pmodal-review-item">
                      <div className="pmodal-review-top">
                        <span className="review-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
                          {r.name[0]}
                        </span>
                        <span className="review-name">{r.name}</span>
                        <StarRow rating={r.rating} size={13} />
                      </div>
                      <p className="review-text">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

