import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  X, ShoppingCart, Zap, Star, ChevronDown, ChevronUp,
  Leaf, Flame, Package, Truck, Gift, Shield, Check, X as XIcon,
  Plus, Minus, Heart, Share2, BadgeCheck, MessageCircle, Camera,
  Clock, MapPin, Tag, ChevronRight, Info, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

/* ─── RICH_DATA serves as fallback for older products ─── */
const RICH_DATA = {
  default: {
    subtitle: 'Premium Spiritual Products',
    originalPrice: null,
    discount: 15,
    images: null,
    fragrance: 'Natural & Aromatic',
    burnTime: 'Varies',
    weight: 'As per product',
    material: '100% Natural Ingredients',
    quantity: 'As per pack',
    country: 'India',
    usage: 'Puja, Meditation, Home',
    ingredients: ['100% natural ingredients', 'No synthetic fragrance', 'No harmful chemicals'],
    benefits: ['Premium quality', 'Natural fragrance', 'Long lasting', 'Handcrafted'],
    howToUse: 'Light the tip, blow out gently, and enjoy the fragrance. Ensure good ventilation.',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    description: 'Crafted with the finest natural ingredients using traditional Ayurvedic recipes.',
    faqs: [
      { q: 'Is this product natural?', a: 'Yes, 100% natural ingredients. No harmful chemicals.' },
      { q: 'Is it safe for home use?', a: 'Completely safe for home use with proper ventilation.' },
    ],
  },
};

const BENEFIT_ICONS = [
  { icon: '🌿', label: 'Chemical Free' },
  { icon: '✨', label: 'Natural' },
  { icon: '🏆', label: 'Premium' },
  { icon: '🔥', label: 'Easy Use' },
  { icon: '🏠', label: 'Home Safe' },
];

const DEFAULT_FEATURES = [
  { feature: 'Organic Ingredients', ours: true },
  { feature: 'Superior Fragrance', ours: true },
  { feature: 'Longer Burn Time', ours: true },
  { feature: 'Premium Packaging', ours: true },
  { feature: 'Eco-Friendly', ours: true },
  { feature: 'No Harmful Chemicals', ours: true },
];

function Stars({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          fill={i <= Math.round(rating) ? '#d4af37' : 'transparent'}
          stroke={i <= Math.round(rating) ? '#d4af37' : '#555'} />
      ))}
    </div>
  );
}

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pd-accordion-item">
      <button className="pd-accordion-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pd-accordion-content">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductModal({ product, onClose, allProducts = [] }) {
  const { addToCart, cartItems, updateQuantity, removeFromCart, setIsCartOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [dbReviews, setDbReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (!product.id) return;
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', product.id),
      where('isApproved', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const revs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbReviews(revs.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      }));
      setReviewsLoading(false);
    });
    return () => unsubscribe();
  }, [product.id]);

  // Fallback to default rich data
  const fallback = RICH_DATA.default;
  
  // MERGE LOGIC: Dynamic DB data takes priority
  const displayData = {
    title: product.name || product.title,
    subtitle: product.shortDescription || fallback.subtitle,
    description: product.description || product.desc || fallback.description,
    price: product.discountPrice || product.price,
    originalPrice: product.discountPrice ? product.price : (product.originalPrice || Math.round(product.price * 1.2)),
    image: product.image || product.imageUrl,
    tag: product.isBestseller ? 'Bestseller' : (product.isTrending ? 'Trending' : (product.isNew ? 'New' : product.tag)),
    howToUse: product.howToUse || fallback.howToUse,
    storage: product.storageInstructions || product.storage || fallback.storage,
    ingredients: product.ingredients || fallback.ingredients,
    benefits: product.benefits || fallback.benefits,
    faqs: product.faqs || fallback.faqs,
    specifications: product.specifications || [],
    deliveryText: product.deliveryText || 'Standard delivery within 3-5 days.',
    offerText: product.offerText || 'Flat 10% off on your first order!',
    features: product.features || DEFAULT_FEATURES,
  };

  const images = [displayData.image]; // Extend this if multiple images are supported in future
  const savings = displayData.originalPrice - displayData.price;
  const discountPct = Math.round((savings / displayData.originalPrice) * 100);

  // Delivery date logic
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  // Related products logic
  const related = allProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
  const anyRelated = related.length > 0 ? related : allProducts.filter(p => p.id !== product.id).slice(0, 3);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart({ ...product, price: displayData.price });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart({ ...product, price: displayData.price });
    onClose();
    setIsCartOpen(true);
  };

  const totalReviews = dbReviews.length;
  const avgRating = totalReviews > 0 
    ? (dbReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : "5.0";

  const ratingBreakdown = [5, 4, 3, 2, 1].reduce((acc, star) => {
    const count = dbReviews.filter(r => Math.round(r.rating) === star).length;
    acc[star] = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return acc;
  }, {});

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div className="pd-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div className="pd-sheet-wrapper" onClick={onClose}>
        <motion.div
          className="pd-sheet"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
        >
        <button className="pd-close" onClick={onClose} aria-label="Close"><X size={20} /></button>

        <div className="pd-scroll">
          <div className="pd-gallery">
            <div className="pd-main-img-wrap">
              <img src={displayData.image} alt={displayData.title} className="pd-main-img" />
              {displayData.tag && <span className="product-tag pd-tag">{displayData.tag}</span>}
              {discountPct > 0 && <span className="pd-discount-badge">-{discountPct}% OFF</span>}
              <button className={`pd-wishlist-btn ${wishlist ? 'active' : ''}`} onClick={() => setWishlist(w => !w)}>
                <Heart size={18} fill={wishlist ? '#e74c3c' : 'transparent'} stroke={wishlist ? '#e74c3c' : 'currentColor'} />
              </button>
            </div>
          </div>

          <div className="pd-body">
            <div className="pd-subtitle">{displayData.subtitle}</div>
            <h1 className="pd-title">{displayData.title}</h1>

            <div className="pd-rating-row">
              <Stars rating={avgRating} size={15} />
              <span className="pd-avg-rating">{avgRating}</span>
              <span className="pd-review-count">({totalReviews} reviews)</span>
              <span className="pd-verified-tag"><BadgeCheck size={13} /> Verified</span>
            </div>

            <div className="pd-price-block">
              <span className="pd-price">₹{displayData.price}</span>
              {discountPct > 0 && <span className="pd-original-price">₹{displayData.originalPrice}</span>}
              {savings > 0 && <span className="pd-save-badge">Save ₹{savings}</span>}
            </div>
            <div className="pd-tax-note">Inclusive of all taxes · Free Shipping · COD Available</div>

            <div className="pd-qty-row">
              <span className="pd-qty-label">Qty:</span>
              <div className="pd-qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="pd-qty-btn"><Minus size={14} /></button>
                <span className="pd-qty-val">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="pd-qty-btn"><Plus size={14} /></button>
              </div>
              {product.stock <= 7 && (
                <span className={`pd-stock-pill ${product.stock <= 3 ? 'critical' : 'low'}`}>
                  🔥 Only {product.stock} left
                </span>
              )}
            </div>

            <div className="pd-cta-row">
              <button className={`pd-add-btn ${addedToCart ? 'added' : ''}`} onClick={handleAddToCart}>
                {addedToCart ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button className="pd-buy-btn" onClick={handleBuyNow}>
                <Zap size={18} /> Buy Now
              </button>
            </div>

            <div className="pd-benefits-row">
              {BENEFIT_ICONS.map((b, i) => (
                <div key={i} className="pd-benefit-icon-item">
                  <span className="pd-benefit-emoji">{b.icon}</span>
                  <span className="pd-benefit-label">{b.label}</span>
                </div>
              ))}
            </div>

            <div className="pd-section-title">Product Details</div>
            <div className="pd-accordion">
              <AccordionItem title="📖 Product Description" defaultOpen={true}>
                <p className="pd-acc-text">{displayData.description}</p>
              </AccordionItem>
              {displayData.howToUse && (
                <AccordionItem title="🔥 How to Use">
                  <p className="pd-acc-text">{displayData.howToUse}</p>
                </AccordionItem>
              )}
              {displayData.ingredients.length > 0 && (
                <AccordionItem title="🌿 Ingredients">
                  <ul className="pd-acc-list">
                    {displayData.ingredients.map((ing, i) => (
                      <li key={i}><Leaf size={12} style={{ color: '#d4af37', marginRight: 6 }} />{ing}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
              {displayData.benefits.length > 0 && (
                <AccordionItem title="✨ Key Benefits">
                  <ul className="pd-acc-list">
                    {displayData.benefits.map((b, i) => (
                      <li key={i}><Check size={12} style={{ color: '#22c55e', marginRight: 6 }} />{b}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
              {displayData.storage && (
                <AccordionItem title="📦 Storage Instructions">
                  <p className="pd-acc-text">{displayData.storage}</p>
                </AccordionItem>
              )}
            </div>

            <div className="pd-section-title">Delivery & Offers</div>
            <div className="pd-delivery-card">
              <div className="pd-delivery-item">
                <Truck size={20} className="pd-del-icon" />
                <div>
                  <div className="pd-del-title">Estimated Delivery</div>
                  <div className="pd-del-sub">{displayData.deliveryText}</div>
                </div>
              </div>
              <div className="pd-delivery-item">
                <MapPin size={20} className="pd-del-icon" />
                <div>
                  <div className="pd-del-title">Cash On Delivery</div>
                  <div className="pd-del-sub">Available Pan-India · No Extra Charges</div>
                </div>
              </div>
              <div className="pd-delivery-item">
                <Shield size={20} className="pd-del-icon" />
                <div>
                  <div className="pd-del-title">Easy Returns</div>
                  <div className="pd-del-sub">7-day hassle-free return policy</div>
                </div>
              </div>
            </div>

            <div className="pd-coupon-box">
              <Tag size={16} className="pd-coupon-icon" />
              <div>
                <div className="pd-coupon-code">OFFER</div>
                <div className="pd-coupon-desc">{displayData.offerText}</div>
              </div>
            </div>

            {displayData.specifications.length > 0 && (
              <div className="pd-spec-table">
                <div className="pd-spec-header">Product Specifications</div>
                {displayData.specifications.map((spec, i) => (
                  <div key={i} className="pd-spec-row">
                    <span className="pd-spec-key">{spec.name} :</span>
                    <span className="pd-spec-val">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pd-comparison">
              <div className="pd-comp-header">
                <span className="pd-comp-feature">Features</span>
                <span className="pd-comp-ours">Asmita Gruh™</span>
                <span className="pd-comp-others">Others</span>
              </div>
              {displayData.features.map(({ feature, ours }) => (
                <div key={feature} className="pd-comp-row">
                  <span className="pd-comp-feature">{feature}</span>
                  <span className="pd-comp-ours"><span className="pd-circle-check"><Check size={13} strokeWidth={3} /></span></span>
                  <span className="pd-comp-others">
                    {ours ? <span className="pd-circle-x"><XIcon size={13} strokeWidth={3} /></span> : <span className="pd-circle-check"><Check size={13} strokeWidth={3} /></span>}
                  </span>
                </div>
              ))}
            </div>

            {displayData.faqs.length > 0 && (
              <>
                <div className="pd-section-title">Frequently Asked Questions</div>
                <div className="pd-accordion">
                  {displayData.faqs.map((faq, i) => (
                    <AccordionItem key={i} title={`❓ ${faq.question || faq.q}`}>
                      <p className="pd-acc-text">{faq.answer || faq.a}</p>
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}

            {anyRelated.length > 0 && (
              <>
                <div className="pd-section-title">You May Also Like</div>
                <div className="pd-related-row">
                  {anyRelated.map(rp => (
                    <div key={rp.id} className="pd-related-card">
                      <div className="pd-related-img-wrap">
                        <img src={rp.image || rp.imageUrl} alt={rp.name || rp.title} />
                      </div>
                      <div className="pd-related-info">
                        <div className="pd-related-name">{rp.name || rp.title}</div>
                        <div className="pd-related-prices">
                          <span className="pd-related-price">₹{rp.discountPrice || rp.price}</span>
                          {rp.discountPrice && <span className="pd-related-orig">₹{rp.price}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="pd-section-title">Customer Reviews</div>
            <div className="pd-reviews-summary">
              <div className="pd-reviews-avg">
                <div className="pd-avg-big">{avgRating}</div>
                <Stars rating={avgRating} size={18} />
                <div className="pd-total-reviews">{totalReviews} reviews</div>
              </div>
              <div className="pd-rating-bars">
                {[5, 4, 3, 2, 1].map(star => {
                  const pct = ratingBreakdown[star] || 0;
                  return (
                    <div key={star} className="pd-rating-bar-row">
                      <span className="pd-bar-label">{star}★</span>
                      <div className="pd-bar-track"><div className="pd-bar-fill" style={{ width: `${pct}%` }} /></div>
                      <span className="pd-bar-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pd-review-list">
              {dbReviews.map((r, i) => (
                <div key={r.id || i} className={`pd-review-item ${r.isFeatured ? 'featured' : ''}`}>
                  <div className="pd-review-top">
                    <span className="review-avatar">{r.name ? r.name[0] : 'U'}</span>
                    <div className="pd-review-meta">
                      <span className="pd-reviewer-name">{r.name}</span>
                      <span className="pd-review-date">{r.date || new Date(r.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    <Stars rating={r.rating} size={13} />
                  </div>
                  <p className="pd-review-text">{r.text}</p>
                </div>
              ))}
            </div>
            <div style={{ height: '1rem' }} />
          </div>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
