import React from 'react';
import { MessageCircle, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-premium">
      <div className="footer-glow" aria-hidden="true" />
      
      <div className="footer-grid-premium">
        {/* Brand */}
        <div className="footer-brand-premium">
          <div className="footer-logo-premium">
            <img src="/logo.png" alt="Asmita Gruh Udhyog" />
          </div>
          <h3 className="footer-brand-name">Asmita Gruh Udhyog</h3>
          <p className="footer-brand-desc">
            Aromatic excellence since inception. Experience the divine in every breath.
          </p>
          <a
            href="https://wa.me/916352291433"
            target="_blank"
            rel="noreferrer"
            className="footer-wa-btn"
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>
        </div>

        {/* Quick Links */}
        <div className="footer-col-premium">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#hero-section">Home</a></li>
            <li><a href="#home">Products</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Products */}
        <div className="footer-col-premium">
          <h4>Products</h4>
          <ul>
            <li><a href="#home">Agarbatti</a></li>
            <li><a href="#home">Dhoop Cones</a></li>
            <li><a href="#home">Sambrani Cups</a></li>
            <li><a href="#home">Natural Attar</a></li>
            <li><a href="#home">Puja Hampers</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col-premium">
          <h4>Contact</h4>
          <ul className="footer-contact-premium">
            <li>
              <MapPin size={14} />
              <a href="https://share.google/emQA5aL8qLl4hM6IK" target="_blank" rel="noreferrer">Gujarat, India</a>
            </li>
            <li>
              <Phone size={14} />
              <a href="tel:+916352291433">+91 63522 91433</a>
            </li>
            <li>
              <Mail size={14} />
              <a href="mailto:asmitagruhudhyog@gmail.com">asmitagruhudhyog@gmail.com</a>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <a href="https://www.instagram.com/asmita_ghruh_udhyog" target="_blank" rel="noreferrer">@asmita_ghruh_udhyog</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-premium">
        <div className="footer-divider-premium" />
        <div className="footer-bottom-content">
          <p>© {currentYear} Asmita Gruh Udhyog. All rights reserved.</p>
          <p className="footer-made-premium">Made with ❤️ in Gujarat, India</p>
          <motion.button
            className="footer-top-btn"
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpRight size={18} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
