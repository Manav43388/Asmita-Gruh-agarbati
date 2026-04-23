import React from 'react';
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-main glass-panel">
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand-col">
          <div className="nav-brand" style={{ marginBottom: '1rem' }}>Asmita Gruh Udhyog</div>
          <p className="footer-tagline">
            Aromatic excellence since inception.<br />Experience the divine in every breath.
          </p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="footer-whatsapp"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>

        {/* Quick Links */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-link-list">
            <li><a href="#home">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Products */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Products</h4>
          <ul className="footer-link-list">
            <li><a href="#products">Agarbatti</a></li>
            <li><a href="#products">Dhoop Cones</a></li>
            <li><a href="#products">Sambrani Cups</a></li>
            <li><a href="#products">Natural Attar</a></li>
            <li><a href="#products">Puja Hampers</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Contact</h4>
          <ul className="footer-contact-list">
            <li><MapPin size={15} /><span>Gujarat, India</span></li>
            <li><Phone size={15} /><a href="tel:+919876543210">+91 98765 43210</a></li>
            <li><Mail size={15} /><a href="mailto:contact@asmitagruhudhyog.com">contact@asmitagruhudhyog.com</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <p>&copy; {currentYear} Asmita Gruh Udhyog. All rights reserved.</p>
        <p className="footer-made">Made with ❤️ in Gujarat, India</p>
      </div>
    </footer>
  );
}
