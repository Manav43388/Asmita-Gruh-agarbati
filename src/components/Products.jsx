import React, { useState } from 'react';
import { Sparkle, Wind, Flower, Flame, Cloud, Droplet, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const products = [
  {
    id: 1,
    title: 'Premium Agarbatti',
    desc: 'Hand-rolled natural incense sticks for daily prayers and meditation.',
    image: '/agarbatti.png'
  },
  {
    id: 2,
    title: 'Mystic Dhoop Cones',
    desc: 'Thick, earthy smoke perfect for deep relaxation and spiritual awakening.',
    image: '/dhoop.png'
  },
  {
    id: 3,
    title: 'Sambrani Cups',
    desc: 'Traditional loban cups that emit purifying smoke to cleanse your space.',
    image: '/sambrani.png'
  },
  {
    id: 4,
    title: 'Camphor (Kapur)',
    desc: 'Pure, smoke-free camphor for authentic temple-like aarti at home.',
    image: '/camphor.png'
  },
  {
    id: 5,
    title: 'Floral Essences',
    desc: 'Sweet and calming notes of jasmine, rose, and lavender incense.',
    image: '/floral.png'
  },
  {
    id: 6,
    title: 'Natural Attar',
    desc: 'Alcohol-free, concentrated roll-on perfumes made from essential oils.',
    image: '/attar.png'
  }
];

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleCheckout = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const msg = `Hello! I would like to order:
*${selectedProduct.title}*
Quantity: ${data.quantity}
Name: ${data.name}
Phone: ${data.phone}
Address: ${data.address}`;
    
    // Replace the phone number with the business actual WhatsApp number
    const whatsappUrl = `https://wa.me/919999999999?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
    setSelectedProduct(null);
  };

  return (
    <section id="products" className="section">
      <motion.h2 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="section-title"
      >
        Our Products
      </motion.h2>
      
      <div className="products-grid">
        {products.map((p, index) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            viewport={{ once: true }}
            className="product-card glass-panel"
          >
            <div className="product-image-container">
              <img src={p.image} alt={p.title} className="product-image" />
            </div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
            <button 
              onClick={() => setSelectedProduct(p)}
              className="checkout-btn"
              style={{ marginTop: 'auto', alignSelf: 'stretch' }}
            >
              Buy Now
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => {
              if (e.target.className.includes('modal-overlay')) setSelectedProduct(null);
            }}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="modal-content"
            >
              <button className="close-btn" onClick={() => setSelectedProduct(null)}>
                <X size={24} />
              </button>
              <h3>Checkout</h3>
              <p>Purchasing {selectedProduct.title}</p>
              
              <form onSubmit={handleCheckout}>
                <div className="form-group">
                  <input type="text" name="name" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="tel" name="phone" placeholder="Your Phone Number" required />
                </div>
                <div className="form-group">
                  <input type="number" name="quantity" placeholder="Quantity" min="1" defaultValue="1" required />
                </div>
                <div className="form-group">
                  <textarea name="address" placeholder="Delivery Address" rows="3" required></textarea>
                </div>
                <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>
                  Place Order via WhatsApp
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
