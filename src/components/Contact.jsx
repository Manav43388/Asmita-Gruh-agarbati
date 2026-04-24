import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Send, CheckCircle, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const whatsappNumber = '916352291433'; // Replace with actual number
    const text = encodeURIComponent(
      `Hello Asmita Gruh Udhyog! 🙏\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n\n*Message:*\n${form.message}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: '', phone: '', message: '' }); }, 4000);
  };

  return (
    <section id="contact" className="section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="products-header"
      >
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">We'd love to hear from you — reach out anytime</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="contact-container"
      >
        {/* Left: Form */}
        <div className="contact-form">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="contact-success"
              >
                <CheckCircle size={56} color="#22c55e" />
                <h3>Message Sent!</h3>
                <p>WhatsApp opened with your message. We'll get back to you shortly! 🙏</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleWhatsApp} noValidate>
                <div className="contact-form-title">
                  <MessageCircle size={22} color="#d4af37" />
                  <h3>Send us a Message</h3>
                </div>

                <div className={`form-group ${errors.name ? 'error' : ''}`}>
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                  <label>WhatsApp Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={10}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>

                <div className={`form-group ${errors.message ? 'error' : ''}`}>
                  <label>Your Message / Enquiry</label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Tell us what you need — bulk order, product info, custom fragrance..."
                    value={form.message}
                    onChange={handleChange}
                  />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                </div>

                <button type="submit" className="whatsapp-btn">
                  <MessageCircle size={20} />
                  Send via WhatsApp
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Info */}
        <div className="contact-info">
          <div className="contact-info-header">
            <h3>Contact Details</h3>
            <p>Reach out through any of these channels — we're always happy to help.</p>
          </div>

          <div className="info-item">
            <div className="info-icon"><MapPin size={22} /></div>
            <div className="info-text">
              <h4>Visit Us</h4>
              <p>Asmita Gruh Udhyog, Gujarat, India</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><Phone size={22} /></div>
            <div className="info-text">
              <h4>Call / WhatsApp</h4>
              <a href="tel:+916352291433" className="info-link">+91 63522 91433</a>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><Mail size={22} /></div>
            <div className="info-text">
              <h4>Email Us</h4>
              <a href="mailto:asmitagruhudhyog@gmail.com" className="info-link">
                asmitagruhudhyog@gmail.com
              </a>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><Instagram size={22} /></div>
            <div className="info-text">
              <h4>Follow on Instagram</h4>
              <a href="https://www.instagram.com/asmita_ghruh_udhyog" target="_blank" rel="noreferrer" className="info-link">
                @asmita_ghruh_udhyog
              </a>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><MessageCircle size={22} /></div>
            <div className="info-text">
              <h4>Business Hours</h4>
              <p>Mon – Sat: 9 AM – 7 PM IST</p>
            </div>
          </div>

          {/* WhatsApp direct link */}
          <a
            href="https://wa.me/916352291433"
            target="_blank"
            rel="noreferrer"
            className="direct-whatsapp-btn"
          >
            <MessageCircle size={20} />
            Chat on WhatsApp
          </a>
        </div>
      </motion.div>
    </section>
  );
}
