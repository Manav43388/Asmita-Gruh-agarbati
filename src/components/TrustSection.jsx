import React from 'react';
import { motion } from 'framer-motion';
import { HandMetal, Timer, MapPin, Wind, Leaf } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: <HandMetal size={32} />,
    title: 'Handmade Quality',
    desc: 'Every stick is lovingly hand-rolled by skilled artisans using time-honored techniques.',
    gradient: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 100%)',
  },
  {
    icon: <Timer size={32} />,
    title: 'Long Lasting Fragrance',
    desc: 'Our premium formulations ensure 30–45 minutes of uninterrupted aromatic bliss.',
    gradient: 'linear-gradient(135deg, #c49b63 0%, #e8c99b 100%)',
  },
  {
    icon: <MapPin size={32} />,
    title: 'Made in India',
    desc: 'Proudly crafted in Gujarat using locally sourced natural ingredients.',
    gradient: 'linear-gradient(135deg, #8b6914 0%, #d4af37 100%)',
  },
  {
    icon: <Wind size={32} />,
    title: 'Low Smoke Formula',
    desc: 'Specially designed to produce minimal smoke while maximizing fragrance diffusion.',
    gradient: 'linear-gradient(135deg, #a08c5a 0%, #d4c69a 100%)',
  },
  {
    icon: <Leaf size={32} />,
    title: 'Natural Aroma',
    desc: '100% natural resins, essential oils, and herbs — zero synthetic chemicals.',
    gradient: 'linear-gradient(135deg, #7a6c3c 0%, #c4a853 100%)',
  },
];

export default function TrustSection() {
  return (
    <section className="trust-section-premium">
      <div className="trust-bg-pattern" aria-hidden="true" />
      
      <motion.div
        className="section-header-premium"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="section-label-premium">Why Choose Us</span>
        <h2 className="section-title-premium">Crafted with Purpose</h2>
        <p className="section-desc-premium">
          Every product embodies our commitment to purity, tradition, and excellence
        </p>
      </motion.div>

      <div className="trust-grid-premium">
        {TRUST_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            className="trust-card-premium"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <div className="trust-card-glow" style={{ background: item.gradient }} />
            <div className="trust-icon-premium" style={{ background: item.gradient }}>
              {item.icon}
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
