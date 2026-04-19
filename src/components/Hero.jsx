import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section id="home" className="hero">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="glass-panel"
        style={{ padding: '4rem', maxWidth: '800px' }}
      >
        <h1>Asmita Group</h1>
        <p>Experience the divine fragrance of our premium, hand-crafted agarbatti. Bringing peace, spirituality, and a calm aura to your everyday life.</p>
        <button className="cta-button">Explore Products</button>
      </motion.div>
    </section>
  );
}
