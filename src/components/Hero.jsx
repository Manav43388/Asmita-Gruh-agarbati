import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Sparkles, ShoppingBag } from 'lucide-react';

// Ambient particle system
function ParticleField() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const PARTICLE_COUNT = 80;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.5 - 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 43 : 30, // gold or amber
    }));

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x * canvas.width;
      const my = mouseRef.current.y * canvas.height;

      particlesRef.current.forEach((p) => {
        // Mouse attraction
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.x += dx * 0.003;
          p.y += dy * 0.003;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 60%, ${p.opacity})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 60%, ${p.opacity * 0.15})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-particles"
      aria-hidden="true"
    />
  );
}

// Smoke effect
function SmokeOverlay() {
  return (
    <div className="smoke-overlay" aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="smoke-wisp"
          style={{
            left: `${15 + i * 18}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const y = useTransform(scrollY, [0, 800], [0, 200]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 0.9]);

  const scrollToProducts = () => {
    const el = document.getElementById('home');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCollection = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="hero-premium" id="hero-section">
      {/* Background effects */}
      <ParticleField />
      <SmokeOverlay />
      
      {/* Rotating light orb */}
      <div className="hero-light-orb" aria-hidden="true" />
      <div className="hero-light-orb-2" aria-hidden="true" />

      <motion.div style={{ y, opacity, scale }} className="hero-content-wrapper">
        {/* Floating product image */}
        <motion.div
          className="hero-pouch-container"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-pouch-glow" />
          <motion.img
            src="/hero-pouch.png"
            alt="Premium Asmita Gruh Udhyog Agarbatti"
            className="hero-pouch-img"
            animate={{
              y: [0, -15, 0],
              rotateZ: [0, 1, -1, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Text content */}
        <motion.div
          className="hero-text-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Sparkles size={14} />
            <span>Handcrafted with Love</span>
          </motion.div>

          <h1 className="hero-headline">
            <span className="hero-headline-line">Experience</span>
            <span className="hero-headline-accent">Divine Fragrance</span>
          </h1>

          <p className="hero-subtitle">
            Elevate your spiritual moments with our premium, handcrafted agarbatti — 
            made from pure natural ingredients, bringing peace and a calm aura to every home.
          </p>

          <div className="hero-cta-group">
            <motion.button
              className="hero-btn-primary"
              onClick={scrollToProducts}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <ShoppingBag size={18} />
              Buy Now
            </motion.button>
            <motion.button
              className="hero-btn-secondary"
              onClick={scrollToCollection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Collection
            </motion.button>
          </div>

          {/* Trust indicators */}
          <div className="hero-trust-row">
            <span>✦ 100% Natural</span>
            <span>✦ Handmade</span>
            <span>✦ Made in India</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={scrollToProducts}
      >
        <span>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}
