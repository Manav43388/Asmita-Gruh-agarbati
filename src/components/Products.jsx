import React, { useState } from 'react';
import { ShoppingCart, Check, Star, Plus, Minus } from 'lucide-react';
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
    category: 'Incense Sticks',
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
  },
  {
    id: 7,
    title: 'Charcoal Dhoop Sticks',
    desc: 'Extra-long burning dhoop sticks infused with sandalwood and herbs.',
    image: '/dhoop.png',
    price: 179,
    unit: 'per pack (30 sticks)',
    tag: null,
    category: 'Dhoop Sticks',
  },
  {
    id: 8,
    title: 'Chandan Agarbatti',
    desc: 'Pure sandalwood incense for a cool, meditative, temple-like ambiance.',
    image: '/agarbatti.png',
    price: 229,
    unit: 'per box (40 sticks)',
    tag: 'Popular',
    category: 'Incense Sticks',
  },
  {
    id: 9,
    title: 'Gulab Gulkand Attar',
    desc: 'A romantic rose and gulkand blend — perfect for any occasion.',
    image: '/attar.png',
    price: 349,
    unit: 'per bottle (10ml)',
    tag: null,
    category: 'Other Spiritual Products',
  },
  {
    id: 10,
    title: 'Havan Samagri',
    desc: 'Premium mix of herbs, resins, and grains for yagna and havan rituals.',
    image: '/sambrani.png',
    price: 299,
    unit: 'per bag (250g)',
    tag: 'New',
    category: 'Puja Items',
  },
  {
    id: 11,
    title: 'Rose Dhoop Cones',
    desc: 'Delicate rose-scented cones for a floral, uplifting spiritual space.',
    image: '/floral.png',
    price: 139,
    unit: 'per pack (25 cones)',
    tag: null,
    category: 'Dhoop Sticks',
  },
  {
    id: 12,
    title: 'Puja Gift Hamper',
    desc: 'Curated puja set with agarbatti, dhoop, camphor & attar — a perfect gift.',
    image: '/camphor.png',
    price: 599,
    unit: 'per hamper',
    tag: 'Premium',
    category: 'Puja Items',
  },
  {
    id: 13,
    title: 'Velvet Idol Cloth',
    desc: 'Premium velvet aasan and poshak for your deities.',
    image: '/floral.png', // Using existing placeholder image
    price: 150,
    unit: 'per piece',
    tag: 'New',
    category: 'Idol Cloth',
  }
];

const CATEGORIES = ['All', 'Incense Sticks', 'Dhoop Sticks', 'Puja Items', 'Idol Cloth', 'Other Spiritual Products'];

export default function Products() {
  const { addToCart, cartItems, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const [addedIds, setAddedIds] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');

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
  const featuredProduct = products[0]; // Premium Agarbatti

  return (
    <section id="products" className="section">
      {/* Divine Category Browser */}
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
    </section>
  );
}
