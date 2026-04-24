import React from 'react';
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-main glass-panel">
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand-col">
          <div className="footer-logo-wrap">
            <img src="/logo.png" alt="Asmita Gruh Udhyog" className="footer-logo-img" />
          </div>
          <div className="nav-brand" style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Asmita Gruh Udhyog</div>
          <p className="footer-tagline">
            Aromatic excellence since inception.<br />Experience the divine in every breath.
          </p>
          <a
            href="https://wa.me/916352291433"
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
            <li><MapPin size={15} /><a href="https://share.google/emQA5aL8qLl4hM6IK" target="_blank" rel="noreferrer">Gujarat, India</a></li>
            <li><Phone size={15} /><a href="tel:+916352291433">+91 63522 91433</a></li>
            <li><Mail size={15} /><a href="mailto:asmitagruhudhyog@gmail.com">asmitagruhudhyog@gmail.com</a></li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <a href="https://www.instagram.com/asmita_ghruh_udhyog" target="_blank" rel="noreferrer">@asmita_ghruh_udhyog</a>
            </li>
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
