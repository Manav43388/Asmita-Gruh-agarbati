import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="section">
      <h2 className="section-title">Get In Touch</h2>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="contact-container"
      >
        <div className="contact-form">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="form-group">
              <textarea rows="5" placeholder="Your Message" required></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>

        <div className="contact-info">
          <div className="info-item">
            <div className="info-icon"><MapPin /></div>
            <div className="info-text">
              <h4>Visit Us</h4>
              <p>Asmita Gruh Udhyog, Gujarat, India</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon"><Phone /></div>
            <div className="info-text">
              <h4>Call Us</h4>
              <p>+91 98765 43210</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><Mail /></div>
            <div className="info-text">
              <h4>Email Us</h4>
              <p>contact@asmitagruhudhyog.com</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
