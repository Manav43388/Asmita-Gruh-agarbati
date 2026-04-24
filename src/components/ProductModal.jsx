import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  X, ShoppingCart, Zap, Star, ChevronDown, ChevronUp,
  Leaf, Flame, Package, Truck, Gift, Shield, Check, X as XIcon,
  Plus, Minus, Heart, Share2, BadgeCheck, MessageCircle, Camera,
  Clock, MapPin, Tag, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

/* ─── Per-product rich data ─── */
const RICH_DATA = {
  1: {
    subtitle: 'Hand-rolled | Daily Puja & Meditation',
    originalPrice: 249,
    discount: 20,
    images: ['/agarbatti.png', '/dhoop.png', '/floral.png'],
    fragrance: 'Sandalwood & Herbal',
    burnTime: '30 min per stick',
    weight: '100g per box',
    material: 'Bamboo + Natural Resins',
    quantity: '50 sticks',
    country: 'India',
    usage: 'Daily Puja, Meditation',
    ingredients: ['Premium bamboo sticks', 'Natural sandalwood powder', 'Pure essential oils', 'Herbal extracts', 'Natural resins', 'Aromatic herbs'],
    benefits: ['Purifies air naturally', 'Aids deep meditation', 'Temple-grade quality', 'No harmful chemicals', 'Long-lasting fragrance', 'Eco-friendly packaging'],
    howToUse: 'Light the tip of the stick and let it catch flame for 5–10 seconds, then gently blow it out. Place in an incense holder at a safe distance from flammable items. Ensure good ventilation. Enjoy the fragrance as it fills your space.',
    storage: 'Store in a cool, dry place away from direct sunlight. Keep away from moisture. Use within 24 months of manufacture.',
    description: 'Our Premium Agarbatti is hand-rolled by skilled artisans using traditional recipes passed down through generations. Each stick is crafted with the finest natural ingredients — pure sandalwood powder, essential oils, and herbal resins — giving you a rich, long-lasting fragrance that transforms any space into a sacred sanctuary.',
    faqs: [
      { q: 'Are these safe for indoor use?', a: 'Yes, completely safe for indoor use. We use only natural ingredients with no harmful chemicals, sulfur, or synthetic fragrances.' },
      { q: 'How long does one stick burn?', a: 'Each stick burns for approximately 30 minutes, releasing a steady, consistent fragrance throughout.' },
      { q: 'Is the fragrance too strong?', a: 'The fragrance is balanced — rich enough to fill a room but not overwhelming. Ideal for daily puja or meditation.' },
      { q: 'Are these suitable for children and pets?', a: 'Yes, but always ensure proper ventilation and keep lit incense out of reach of children and pets.' },
    ],
    reviews: [
      { name: 'Priya Sharma', avatar: 'P', rating: 5, date: '12 Apr 2025', text: 'Best agarbatti I have ever used! The sandalwood fragrance is divine and lasts so long. Will definitely order again.' },
      { name: 'Rahul Patel', avatar: 'R', rating: 5, date: '8 Apr 2025', text: 'Pure natural smell — no headache at all unlike synthetic ones. My whole house smells amazing during pooja.' },
      { name: 'Sunita Mehta', avatar: 'S', rating: 4, date: '2 Apr 2025', text: 'Very good quality. Burns evenly and the fragrance is authentic. Packaging could be improved but the product is excellent.' },
    ],
    ratingBreakdown: { 5: 78, 4: 15, 3: 5, 2: 1, 1: 1 },
    totalReviews: 210,
    avgRating: 4.8,
  },
  2: {
    subtitle: 'Dhoop Cones | Meditation & Relaxation',
    originalPrice: 199,
    discount: 25,
    images: ['/dhoop.png', '/sambrani.png', '/agarbatti.png'],
    fragrance: 'Earthy & Woody',
    burnTime: '45 min per cone',
    weight: '80g per pack',
    material: 'Charcoal Base + Natural Resins',
    quantity: '20 cones',
    country: 'India',
    usage: 'Meditation, Yoga, Relaxation',
    ingredients: ['Charcoal base', 'Natural resins', 'Earthy essential oils', 'Herbal powder blend', 'Natural binders'],
    benefits: ['Rich thick smoke', 'Deep meditation aid', 'Long burning (45 min)', 'Natural ingredients', 'Eco-friendly', 'No toxic chemicals'],
    howToUse: 'Place a cone on a heat-proof holder or dhoop stand. Light the tip and allow to catch flame for 5 seconds, then blow out gently. The cone will continue to smoulder releasing thick, aromatic smoke. Keep away from flammable material.',
    storage: 'Store in original packaging in a cool, dry place. Protect from humidity. Use within 18 months.',
    description: 'Mystic Dhoop Cones produce a rich, thick smoke that instantly creates a calming, meditative atmosphere. Made from a premium charcoal base blended with earthy essential oils and natural resins, these cones are perfect for yoga sessions, deep meditation, or simply unwinding after a long day.',
    faqs: [
      { q: 'How do I use dhoop cones?', a: 'Place on a heat-proof dhoop holder, light the tip, blow out after 5 seconds, and let the cone smoulder gently.' },
      { q: 'Is the smoke safe to inhale?', a: 'All our cones are made from natural ingredients. However, always ensure good ventilation when burning incense.' },
      { q: 'How long does fragrance last after burning?', a: 'The fragrance lingers for 2–3 hours after the cone has burned out.' },
      { q: 'Can I use these for meditation?', a: 'Absolutely! The earthy, grounding aroma is specifically blended to support focus and deep meditation.' },
    ],
    reviews: [
      { name: 'Kavita Desai', avatar: 'K', rating: 5, date: '15 Apr 2025', text: 'Amazing for meditation sessions. The deep earthy aroma instantly grounds me. These are now a daily ritual.' },
      { name: 'Amit Verma', avatar: 'A', rating: 4, date: '10 Apr 2025', text: 'Good quality, burns evenly and lasts long. The smoke is rich and consistent throughout.' },
      { name: 'Pooja Nair', avatar: 'P', rating: 5, date: '5 Apr 2025', text: 'Incredible product. I have tried many brands but this is by far the best dhoop I have used. Highly recommend!' },
    ],
    ratingBreakdown: { 5: 72, 4: 20, 3: 6, 2: 1, 1: 1 },
    totalReviews: 180,
    avgRating: 4.7,
  },
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
    ingredients: ['100% natural ingredients', 'No synthetic fragrance', 'No harmful chemicals', 'Traditional formula', 'Natural binders', 'Aromatic herbs'],
    benefits: ['Premium quality', 'Natural fragrance', 'Long lasting', 'Handcrafted', 'Eco-friendly', 'No chemicals'],
    howToUse: 'Use as directed on the packaging. Keep away from children and flammable material. Place in appropriate holder. Ensure good ventilation.',
    storage: 'Store in a cool, dry place away from direct sunlight. Keep away from moisture.',
    description: 'Crafted with the finest natural ingredients using traditional Ayurvedic recipes, this premium product brings the authentic fragrance of Indian spirituality to your home. Perfect for daily puja, meditation, or creating a serene ambiance.',
    faqs: [
      { q: 'Is this product natural?', a: 'Yes, 100% natural ingredients. No harmful chemicals, artificial fragrances, or synthetic additives.' },
      { q: 'Is it safe for home use?', a: 'Completely safe for home use with proper ventilation. Keep out of reach of children.' },
      { q: 'How long does the fragrance last?', a: 'The fragrance lasts well beyond the burn time, lingering for hours to create a pleasant atmosphere.' },
      { q: 'Do you offer COD?', a: 'Yes! We offer Cash on Delivery across India with free shipping on orders above ₹499.' },
    ],
    reviews: [
      { name: 'Happy Customer', avatar: 'H', rating: 5, date: '10 Apr 2025', text: 'Excellent quality product. Highly recommended!' },
      { name: 'Verified Buyer', avatar: 'V', rating: 5, date: '5 Apr 2025', text: 'Great product, fast delivery. Will buy again.' },
      { name: 'Anita Singh', avatar: 'A', rating: 4, date: '1 Apr 2025', text: 'Good quality, natural fragrance. Very happy with the purchase.' },
    ],
    ratingBreakdown: { 5: 75, 4: 15, 3: 7, 2: 2, 1: 1 },
    totalReviews: 150,
    avgRating: 4.7,
  },
};

const BENEFIT_ICONS = [
  { icon: '🌿', label: 'Chemical Free' },
  { icon: '✨', label: 'Natural' },
  { icon: '🏆', label: 'Premium' },
  { icon: '🔥', label: 'Easy Use' },
  { icon: '🏠', label: 'Home Safe' },
];

const COMPARISON = [
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

  const data = RICH_DATA[product.id] || RICH_DATA.default;
  const images = data.images || [product.image];
  const originalPrice = data.originalPrice || Math.round(product.price * 1.2);
  const savings = originalPrice - product.price;
  const discountPct = Math.round((savings / originalPrice) * 100);

  // Delivery date: 3-5 days from today
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  // Related products (exclude current)
  const related = allProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
  const anyRelated = related.length > 0 ? related : allProducts.filter(p => p.id !== product.id).slice(0, 3);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    onClose();
    setIsCartOpen(true);
  };

  const totalReviews = data.totalReviews;
  const avgRating = data.avgRating;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="pd-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Full modal sheet */}
      <motion.div
        className="pd-sheet"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button className="pd-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="pd-scroll">

          {/* ─── SECTION 1: Image Gallery ─── */}
          <div className="pd-gallery">
            <div className="pd-main-img-wrap">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg] || product.image}
                  alt={product.title}
                  className="pd-main-img"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              {product.tag && <span className="product-tag pd-tag">{product.tag}</span>}
              {discountPct > 0 && <span className="pd-discount-badge">-{discountPct}% OFF</span>}
              <button
                className={`pd-wishlist-btn ${wishlist ? 'active' : ''}`}
                onClick={() => setWishlist(w => !w)}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={wishlist ? '#e74c3c' : 'transparent'} stroke={wishlist ? '#e74c3c' : 'currentColor'} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`View ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── SECTION 1: Product Info ─── */}
          <div className="pd-body">
            <div className="pd-subtitle">{data.subtitle}</div>
            <h1 className="pd-title">{product.title}</h1>

            {/* Rating row */}
            <div className="pd-rating-row">
              <Stars rating={avgRating} size={15} />
              <span className="pd-avg-rating">{avgRating}</span>
              <span className="pd-review-count">({totalReviews} reviews)</span>
              <span className="pd-verified-tag"><BadgeCheck size={13} /> Verified</span>
            </div>

            {/* Price block */}
            <div className="pd-price-block">
              <span className="pd-price">₹{product.price}</span>
              <span className="pd-original-price">₹{originalPrice}</span>
              <span className="pd-save-badge">Save ₹{savings}</span>
            </div>
            <div className="pd-tax-note">Inclusive of all taxes · Free Shipping · COD Available</div>

            {/* Quantity + buttons */}
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

            {/* CTA buttons */}
            <div className="pd-cta-row">
              <button
                className={`pd-add-btn ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                id="pd-add-to-cart-btn"
              >
                {addedToCart ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button className="pd-buy-btn" onClick={handleBuyNow} id="pd-buy-now-btn">
                <Zap size={18} /> Buy Now
              </button>
            </div>

            {/* ─── SECTION 2: Benefit Icons ─── */}
            <div className="pd-benefits-row">
              {BENEFIT_ICONS.map((b, i) => (
                <div key={i} className="pd-benefit-icon-item">
                  <span className="pd-benefit-emoji">{b.icon}</span>
                  <span className="pd-benefit-label">{b.label}</span>
                </div>
              ))}
            </div>

            {/* ─── SECTION 3: Expandable Descriptions ─── */}
            <div className="pd-section-title">Product Details</div>
            <div className="pd-accordion">
              <AccordionItem title="📖 Product Description" defaultOpen={true}>
                <p className="pd-acc-text">{data.description}</p>
              </AccordionItem>
              <AccordionItem title="🔥 How to Use">
                <p className="pd-acc-text">{data.howToUse}</p>
              </AccordionItem>
              <AccordionItem title="🌿 Ingredients">
                <ul className="pd-acc-list">
                  {data.ingredients.map((ing, i) => (
                    <li key={i}><Leaf size={12} style={{ color: '#d4af37', marginRight: 6, flexShrink: 0 }} />{ing}</li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem title="✨ Key Benefits">
                <ul className="pd-acc-list">
                  {data.benefits.map((b, i) => (
                    <li key={i}><Check size={12} style={{ color: '#22c55e', marginRight: 6, flexShrink: 0 }} />{b}</li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem title="📦 Storage Instructions">
                <p className="pd-acc-text">{data.storage}</p>
              </AccordionItem>
            </div>

            {/* ─── SECTION 4: Delivery & Offers ─── */}
            <div className="pd-section-title">Delivery & Offers</div>
            <div className="pd-delivery-card">
              <div className="pd-delivery-item">
                <Truck size={20} className="pd-del-icon" />
                <div>
                  <div className="pd-del-title">Estimated Delivery</div>
                  <div className="pd-del-sub">By {deliveryStr} · Free Shipping</div>
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

            {/* Coupon box */}
            <div className="pd-coupon-box">
              <Tag size={16} className="pd-coupon-icon" />
              <div>
                <div className="pd-coupon-code">ASMITA10</div>
                <div className="pd-coupon-desc">Use code for 10% off your first order</div>
              </div>
            </div>

            {/* Free gift */}
            <div className="pd-free-gift">
              <Gift size={18} />
              <span>🎁 Free surprise gift on orders above <strong>₹700</strong></span>
            </div>

            {/* ─── SECTION 5: Specifications Table ─── */}
            <div className="pd-spec-table">
              <div className="pd-spec-header">Specification</div>
              {[
                ['Country of Origin :', '🇮🇳 Made In ' + data.country],
                ['Item Form :', data.material],
                ['Quantity :', data.quantity],
                ['Weight :', data.weight],
                ['Fragrance :', data.fragrance],
                ['Usage Type :', data.usage],
                ['Burning Time :', data.burnTime],
                ['Ingredients :', 'Natural ingredients, including herbal powders, resins & essential oils'],
              ].map(([k, v]) => (
                <div key={k} className="pd-spec-row">
                  <span className="pd-spec-key">{k}</span>
                  <span className="pd-spec-val">{v}</span>
                </div>
              ))}
            </div>

            {/* ─── SECTION 6: Comparison ─── */}
            <div className="pd-comparison">
              <div className="pd-comp-header">
                <span className="pd-comp-feature">Features</span>
                <span className="pd-comp-ours">Asmita Gruh™</span>
                <span className="pd-comp-others">Others</span>
              </div>
              {COMPARISON.map(({ feature, ours }) => (
                <div key={feature} className="pd-comp-row">
                  <span className="pd-comp-feature">{feature}</span>
                  <span className="pd-comp-ours">
                    <span className="pd-circle-check"><Check size={13} strokeWidth={3} /></span>
                  </span>
                  <span className="pd-comp-others">
                    <span className="pd-circle-x"><XIcon size={13} strokeWidth={3} /></span>
                  </span>
                </div>
              ))}
            </div>

            {/* ─── SECTION 7: FAQ ─── */}
            <div className="pd-section-title">Frequently Asked Questions</div>
            <div className="pd-accordion">
              {data.faqs.map((faq, i) => (
                <AccordionItem key={i} title={`❓ ${faq.q}`}>
                  <p className="pd-acc-text">{faq.a}</p>
                </AccordionItem>
              ))}
            </div>

            {/* ─── SECTION 8: Related Products ─── */}
            {anyRelated.length > 0 && (
              <>
                <div className="pd-section-title">You May Also Like</div>
                <div className="pd-related-row">
                  {anyRelated.map(rp => {
                    const rpData = RICH_DATA[rp.id] || RICH_DATA.default;
                    const rpOriginal = rpData.originalPrice || Math.round(rp.price * 1.2);
                    return (
                      <div key={rp.id} className="pd-related-card">
                        <div className="pd-related-img-wrap">
                          <img src={rp.image} alt={rp.title} />
                          {rp.tag && <span className="pd-related-tag">{rp.tag}</span>}
                        </div>
                        <div className="pd-related-info">
                          <div className="pd-related-name">{rp.title}</div>
                          <div className="pd-related-prices">
                            <span className="pd-related-price">₹{rp.price}</span>
                            <span className="pd-related-orig">₹{rpOriginal}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ─── SECTION 9: Customer Reviews ─── */}
            <div className="pd-section-title">Customer Reviews</div>
            <div className="pd-reviews-summary">
              <div className="pd-reviews-avg">
                <div className="pd-avg-big">{avgRating}</div>
                <Stars rating={avgRating} size={18} />
                <div className="pd-total-reviews">{totalReviews} reviews</div>
              </div>
              <div className="pd-rating-bars">
                {[5, 4, 3, 2, 1].map(star => {
                  const pct = data.ratingBreakdown[star] || 0;
                  return (
                    <div key={star} className="pd-rating-bar-row">
                      <span className="pd-bar-label">{star}★</span>
                      <div className="pd-bar-track">
                        <div className="pd-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="pd-bar-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review action buttons */}
            <div className="pd-review-actions">
              <button className="pd-review-btn" id="pd-write-review-btn">
                <MessageCircle size={15} /> Write a Review
              </button>
              <button className="pd-review-btn" id="pd-ask-question-btn">
                <MessageCircle size={15} /> Ask a Question
              </button>
            </div>

            {/* Review list */}
            <div className="pd-review-list">
              {data.reviews.map((r, i) => (
                <div key={i} className="pd-review-item">
                  <div className="pd-review-top">
                    <span className="review-avatar">{r.avatar}</span>
                    <div className="pd-review-meta">
                      <span className="pd-reviewer-name">{r.name}</span>
                      <span className="pd-review-date">{r.date}</span>
                    </div>
                    <Stars rating={r.rating} size={13} />
                  </div>
                  <p className="pd-review-text">{r.text}</p>
                  <div className="pd-verified-row">
                    <BadgeCheck size={13} color="#22c55e" /> <span>Verified Purchase</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky bottom padding */}
            <div style={{ height: '1rem' }} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
