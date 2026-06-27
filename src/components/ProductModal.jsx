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
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import RelatedProducts from './RelatedProducts';
import { ProductSchema } from './StructuredData';

/* ─── Base fallback data for consistency ─── */
const FALLBACK = {
  subtitle: 'Premium Spiritual Products',
  description: 'Crafted with the finest natural ingredients using traditional recipes.',
  howToUse: 'Light the tip, blow out gently, and enjoy the fragrance. Ensure good ventilation.',
  storage: 'Store in a cool, dry place away from direct sunlight.',
  ingredients: [],
  benefits: [],
  faqs: [],
  specifications: [],
  deliveryText: 'Standard delivery within 3-5 days.',
  offerText: 'Flat 10% off on your first order!',
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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [dbReviews, setDbReviews] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(product);

  // Reset when product prop changes
  useEffect(() => {
    setCurrentProduct(product);
    setQty(1);
    setAddedToCart(false);
  }, [product]);

  const wishlisted = isInWishlist(currentProduct.id);

  const handleWishlistToggle = () => {
    toggleWishlist(currentProduct);
  };

  useEffect(() => {
    if (!currentProduct.id) return;
    const q = query(collection(db, 'reviews'), where('productId', '==', currentProduct.id), where('isApproved', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const revs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbReviews(revs.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)));
    });
    return () => unsubscribe();
  }, [currentProduct.id]);

  // ROBUST DATA MAPPING
  const data = {
    title: currentProduct.name || currentProduct.title || 'Product',
    subtitle: currentProduct.shortDescription || currentProduct.subtitle || FALLBACK.subtitle,
    description: currentProduct.description || currentProduct.desc || FALLBACK.description,
    price: Number(currentProduct.discountPrice) || Number(currentProduct.price) || 0,
    originalPrice: currentProduct.discountPrice ? Number(currentProduct.price) : (Number(currentProduct.price) * 1.2),
    image: currentProduct.image || currentProduct.imageUrl,
    tag: currentProduct.isBestseller ? 'Bestseller' : (currentProduct.isTrending ? 'Trending' : (currentProduct.isNew ? 'New' : currentProduct.tag)),
    howToUse: currentProduct.howToUse || FALLBACK.howToUse,
    storage: currentProduct.storageInstructions || FALLBACK.storage,
    ingredients: Array.isArray(currentProduct.ingredients) && currentProduct.ingredients.length > 0 ? currentProduct.ingredients : FALLBACK.ingredients,
    benefits: Array.isArray(currentProduct.benefits) && currentProduct.benefits.length > 0 ? currentProduct.benefits : FALLBACK.benefits,
    faqs: Array.isArray(currentProduct.faqs) && currentProduct.faqs.length > 0 ? currentProduct.faqs : FALLBACK.faqs,
    specifications: Array.isArray(currentProduct.specifications) && currentProduct.specifications.length > 0 
      ? currentProduct.specifications 
      : [
          { name: 'Country of Origin', value: currentProduct.country || 'India' },
          { name: 'Item Form', value: currentProduct.material || 'Natural' },
          { name: 'Item Type', value: currentProduct.category || 'Spiritual' },
          { name: 'Quantity', value: currentProduct.quantity || '1 Pack' },
          { name: 'Burning Time', value: currentProduct.burnTime || 'Varies' },
        ],
    deliveryText: currentProduct.deliveryText || FALLBACK.deliveryText,
    offerText: currentProduct.offerText || FALLBACK.offerText,
    features: currentProduct.features || DEFAULT_FEATURES,
    stock: Number(currentProduct.stock) || 0
  };

  const savings = Math.max(0, data.originalPrice - data.price);
  const discountPct = data.originalPrice > 0 ? Math.round((savings / data.originalPrice) * 100) : 0;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart({ ...currentProduct, price: data.price });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart({ ...currentProduct, price: data.price });
    onClose();
    setIsCartOpen(true);
  };

  const totalReviews = dbReviews.length + (Number(currentProduct.manualReviewCount) || 0);
  const avgRating = totalReviews > 0 
    ? ((dbReviews.reduce((sum, r) => sum + (r.rating || 0), 0) + (Number(currentProduct.manualReviewCount || 0) * Number(currentProduct.manualRating || 4.5))) / totalReviews).toFixed(1)
    : (Number(currentProduct.manualRating) || "5.0");

  // Handle switching to a related product
  const handleRelatedProductSelect = (newProduct) => {
    setCurrentProduct(newProduct);
    setQty(1);
    setAddedToCart(false);
    // Scroll to top of modal
    const scrollEl = document.querySelector('.pd-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <ProductSchema product={{ id: currentProduct.id, name: data.title, image: data.image, description: data.description, price: data.price, stock: data.stock, rating: avgRating, reviews: totalReviews }} />
      <motion.div className="pd-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div className="pd-sheet-wrapper" onClick={onClose}>
        <motion.div
          className="pd-sheet"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="pd-close" onClick={onClose} aria-label="Close"><X size={20} /></button>

          <div className="pd-scroll">
            <div className="pd-gallery">
              <div className="pd-main-img-wrap">
                <img src={data.image} alt={data.title} className="pd-main-img" loading="lazy" decoding="async" />
                {data.tag && <span className="product-tag pd-tag">{data.tag}</span>}
                {discountPct > 0 && <span className="pd-discount-badge">-{discountPct}% OFF</span>}
                <button className={`pd-wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlistToggle}>
                  <Heart size={18} fill={wishlisted ? '#e74c3c' : 'transparent'} stroke={wishlisted ? '#e74c3c' : 'currentColor'} />
                </button>
              </div>
            </div>

            <div className="pd-body">
              <div className="pd-subtitle">{data.subtitle}</div>
              <h2 className="pd-title">{data.title}</h2>

              <div className="pd-rating-row">
                <Stars rating={avgRating} size={15} />
                <span className="pd-avg-rating">{avgRating}</span>
                <span className="pd-review-count">({totalReviews} reviews)</span>
                <span className="pd-verified-tag"><BadgeCheck size={13} /> Verified</span>
              </div>

              <div className="pd-price-block">
                <span className="pd-price">₹{data.price}</span>
                {discountPct > 0 && <span className="pd-original-price">₹{Math.round(data.originalPrice)}</span>}
                {savings > 0 && <span className="pd-save-badge">Save ₹{Math.round(savings)}</span>}
              </div>
              <div className="pd-tax-note">Inclusive of all taxes · Free Shipping · COD Available</div>

              <div className="pd-qty-row">
                <span className="pd-qty-label">Qty:</span>
                <div className="pd-qty-control">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="pd-qty-btn"><Minus size={14} /></button>
                  <span className="pd-qty-val">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="pd-qty-btn"><Plus size={14} /></button>
                </div>
                {data.stock <= 7 && (
                  <span className={`pd-stock-pill ${data.stock <= 3 ? 'critical' : 'low'}`}>
                    🔥 Only {data.stock} left
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
                {data.description && (
                  <AccordionItem title="📖 Product Description" defaultOpen={true}>
                    <div className="pd-acc-text whitespace-pre-wrap">{data.description}</div>
                  </AccordionItem>
                )}
                {data.howToUse && (
                  <AccordionItem title="🔥 How to Use">
                    <div className="pd-acc-text whitespace-pre-wrap">{data.howToUse}</div>
                  </AccordionItem>
                )}
                {data.ingredients.length > 0 && (
                  <AccordionItem title="🌿 Ingredients">
                    <ul className="pd-acc-list">
                      {data.ingredients.map((ing, i) => (
                        <li key={i}><Leaf size={12} style={{ color: '#d4af37', marginRight: 6 }} />{ing}</li>
                      ))}
                    </ul>
                  </AccordionItem>
                )}
                {data.benefits.length > 0 && (
                  <AccordionItem title="✨ Key Benefits">
                    <ul className="pd-acc-list">
                      {data.benefits.map((b, i) => (
                        <li key={i}><Check size={12} style={{ color: '#22c55e', marginRight: 6 }} />{b}</li>
                      ))}
                    </ul>
                  </AccordionItem>
                )}
                {data.storage && (
                  <AccordionItem title="📦 Storage Instructions">
                    <div className="pd-acc-text whitespace-pre-wrap">{data.storage}</div>
                  </AccordionItem>
                )}
              </div>

              <div className="pd-section-title">Delivery & Offers</div>
              <div className="pd-delivery-card">
                <div className="pd-delivery-item">
                  <Truck size={20} className="pd-del-icon" />
                  <div>
                    <div className="pd-del-title">Estimated Delivery</div>
                    <div className="pd-del-sub">{data.deliveryText}</div>
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
                  <div className="pd-coupon-desc">{data.offerText}</div>
                </div>
              </div>

              {/* DYNAMIC SPECIFICATIONS TABLE */}
              {data.specifications.length > 0 && (
                <div className="pd-spec-table">
                  <div className="pd-spec-header">Product Specifications</div>
                  {data.specifications.map((spec, i) => (
                    <div key={i} className="pd-spec-row">
                      <span className="pd-spec-key">{spec.name || spec.key} :</span>
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
                {data.features.map(({ feature, ours }) => (
                  <div key={feature} className="pd-comp-row">
                    <span className="pd-comp-feature">{feature}</span>
                    <span className="pd-comp-ours"><span className="pd-circle-check"><Check size={13} strokeWidth={3} /></span></span>
                    <span className="pd-comp-others">
                      {ours ? <span className="pd-circle-x"><XIcon size={13} strokeWidth={3} /></span> : <span className="pd-circle-check"><Check size={13} strokeWidth={3} /></span>}
                    </span>
                  </div>
                ))}
              </div>

              {data.faqs.length > 0 && (
                <>
                  <div className="pd-section-title">Frequently Asked Questions</div>
                  <div className="pd-accordion">
                    {data.faqs.map((faq, i) => (
                      <AccordionItem key={i} title={`❓ ${faq.question || faq.q}`}>
                        <div className="pd-acc-text whitespace-pre-wrap">{faq.answer || faq.a}</div>
                      </AccordionItem>
                    ))}
                  </div>
                </>
              )}

              {/* Related Products — Enhanced component */}
              <RelatedProducts
                currentProduct={currentProduct}
                allProducts={allProducts}
                onProductSelect={handleRelatedProductSelect}
              />

              <div style={{ height: '2rem' }} />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
