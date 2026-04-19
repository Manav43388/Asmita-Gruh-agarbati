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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <h1>Crafting<br/>Devotion</h1>
        <p>Experience the pure, spiritual aura of Asmita Gruh Udhyog's premium, handcrafted agarbatti and dhoop.</p>
        <button className="cta-button" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>Explore Collection</button>
      </motion.div>
      </motion.div>
    </section>
  );
}
