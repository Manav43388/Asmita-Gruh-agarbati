import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Award, Users } from 'lucide-react';

const stats = [
  { value: '15+', label: 'Years of Craftsmanship' },
  { value: '50+', label: 'Fragrance Varieties' },
  { value: '10K+', label: 'Happy Customers' },
  { value: '100%', label: 'Natural Ingredients' },
];

const values = [
  {
    icon: <Leaf size={28} />,
    title: 'Pure & Natural',
    desc: 'Every stick is hand-rolled using the finest herbs, resins, and natural binders — no harmful chemicals.',
  },
  {
    icon: <Heart size={28} />,
    title: 'Made with Devotion',
    desc: 'Crafted by skilled artisans who pour their heart into every product, honoring centuries-old traditions.',
  },
  {
    icon: <Award size={28} />,
    title: 'Premium Quality',
    desc: 'Our products are tested for purity and long-lasting fragrance, ensuring a superior spiritual experience.',
  },
  {
    icon: <Users size={28} />,
    title: 'Community First',
    desc: 'We empower local artisans and support sustainable sourcing, giving back to the communities we serve.',
  },
];

export default function About() {
  return (
    <section id="about" className="section about-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="about-header"
      >
        <span className="about-label">Our Story</span>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>About Asmita Gruh Udhyog</h2>
        <p className="about-subtitle">
          Born in the heart of Gujarat, Asmita Gruh Udhyog has been crafting premium, handmade agarbatti
          and dhoop for over 15 years. Our journey began with a simple belief — that fragrance has the power
          to elevate the spirit, purify the mind, and bring peace to every home.
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="about-stats">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="stat-card glass-panel"
          >
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Values Grid */}
      <div className="values-grid">
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            viewport={{ once: true }}
            className="value-card glass-panel"
          >
            <div className="value-icon">{v.icon}</div>
            <h3 className="value-title">{v.title}</h3>
            <p className="value-desc">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Brand Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="brand-quote glass-panel"
      >
        <span className="quote-mark">"</span>
        <p>
          Fragrance is a bridge between the earthly and the divine. At Asmita, we craft that bridge with love,
          purity, and devotion — one stick at a time.
        </p>
        <span className="quote-author">— Asmita Gruh Udhyog</span>
      </motion.div>
    </section>
  );
}
