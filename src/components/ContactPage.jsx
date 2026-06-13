import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Send, CheckCircle, Clock, ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const FAQS = [
  {
    q: 'Are your agarbattis made with 100% natural ingredients?',
    a: 'Yes! All our products are handcrafted using natural resins, herbs, essential oils, and bamboo sticks. We use zero synthetic fragrances or harmful chemicals.',
  },
  {
    q: 'Do you offer home delivery across India?',
    a: 'Absolutely! We deliver across all of India with free shipping on all orders. Orders are typically dispatched within 1–2 business days.',
  },
  {
    q: 'How long does one agarbatti / dhoop stick burn?',
    a: 'Our premium agarbatti sticks burn for 25–35 minutes each. Dhoop sticks burn for 45–60 minutes, making them perfect for longer pooja sessions.',
  },
  {
    q: 'Can I order in bulk for temples, events, or gifting?',
    a: 'Yes, we welcome bulk orders! Please contact us on WhatsApp at +91 63522 91433 for wholesale pricing and custom gift packaging options.',
  },
  {
    q: 'What is your return / refund policy?',
    a: 'If you receive a damaged or incorrect product, we will replace or refund it within 7 days. Please share a photo on WhatsApp and we will resolve it quickly.',
  },
  {
    q: 'How should I store agarbatti to keep it fresh?',
    a: 'Store in a cool, dry place away from direct sunlight and moisture. Keeping them in their original packaging or an airtight container ensures maximum shelf life.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, Credit/Debit Cards, Net Banking, Wallets via Razorpay, and Cash on Delivery (COD) across India.',
  },
  {
    q: 'How can I track my order?',
    a: 'You can track your order anytime using the "Track Order" page on our website. Just enter your Order ID to see real-time status updates.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSending(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...form,
        status: 'New',
        createdAt: serverTimestamp(),
      });
      setSent(true);
      toast.success('Message sent successfully! 🙏');
      setTimeout(() => {
        setSent(false);
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="contact-page-hero"
      >
        <h1 className="divine-title">Get In Touch</h1>
        <p className="contact-page-subtitle">
          We'd love to hear from you — reach out through any of our channels
        </p>
      </motion.div>

      {/* Contact Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="contact-cards-grid"
      >
        <a href="tel:+916352291433" className="contact-info-card">
          <div className="contact-card-icon">
            <Phone size={24} />
          </div>
          <h3>Call Us</h3>
          <p>+91 63522 91433</p>
          <span className="contact-card-label">Mon – Sat, 9 AM – 7 PM</span>
        </a>

        <a href="mailto:asmitagruhudhyog@gmail.com" className="contact-info-card">
          <div className="contact-card-icon">
            <Mail size={24} />
          </div>
          <h3>Email Us</h3>
          <p>asmitagruhudhyog@gmail.com</p>
          <span className="contact-card-label">We reply within 24 hours</span>
        </a>

        <a href="https://wa.me/916352291433" target="_blank" rel="noreferrer" className="contact-info-card">
          <div className="contact-card-icon whatsapp-icon">
            <MessageCircle size={24} />
          </div>
          <h3>WhatsApp</h3>
          <p>+91 63522 91433</p>
          <span className="contact-card-label">Quick response guaranteed</span>
        </a>

        <a href="https://share.google/emQA5aL8qLl4hM6IK" target="_blank" rel="noreferrer" className="contact-info-card">
          <div className="contact-card-icon">
            <MapPin size={24} />
          </div>
          <h3>Visit Us</h3>
          <p>Asmita Gruh Udhyog</p>
          <span className="contact-card-label">Gujarat, India</span>
        </a>
      </motion.div>

      {/* Contact Form + Map */}
      <div className="contact-page-content">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="contact-page-form-wrap"
        >
          <div className="contact-form-title">
            <Send size={22} color="#d4af37" />
            <h3>Send us a Message</h3>
          </div>
          <p className="contact-form-desc">Fill out the form below and we'll get back to you as soon as possible.</p>

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
                <p>Thank you for reaching out. We'll get back to you within 24 hours! 🙏</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} noValidate className="contact-page-form">
                <div className="form-row">
                  <div className={`form-group ${errors.name ? 'error' : ''}`}>
                    <label>Your Name *</label>
                    <input type="text" name="name" placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange} />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                    <label>Phone Number *</label>
                    <input type="tel" name="phone" placeholder="e.g. 9876543210" value={form.phone} onChange={handleChange} maxLength={10} />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={`form-group ${errors.email ? 'error' : ''}`}>
                    <label>Email Address *</label>
                    <input type="email" name="email" placeholder="email@example.com" value={form.email} onChange={handleChange} />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input type="text" name="subject" placeholder="e.g. Bulk Order Inquiry" value={form.subject} onChange={handleChange} />
                  </div>
                </div>

                <div className={`form-group ${errors.message ? 'error' : ''}`}>
                  <label>Your Message *</label>
                  <textarea name="message" rows="4" placeholder="Tell us what you need — bulk order, product info, custom fragrance..." value={form.message} onChange={handleChange} />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                </div>

                <button type="submit" className="contact-submit-btn" disabled={sending}>
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Sending...
                    </span>
                  ) : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="contact-page-map-wrap"
        >
          <h3 className="contact-map-title">
            <MapPin size={20} color="#d4af37" />
            Our Location
          </h3>
          <div className="contact-map-container">
            <iframe
              src="https://maps.google.com/maps?q=Surat,%20Gujarat&t=&z=12&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '16px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Asmita Gruh Udhyog Location"
            />
          </div>

          {/* Business Hours */}
          <div className="contact-hours-card">
            <div className="contact-hours-title">
              <Clock size={18} color="#d4af37" />
              <span>Business Hours</span>
            </div>
            <div className="contact-hours-grid">
              <div className="contact-hours-row">
                <span>Monday – Saturday</span>
                <span className="contact-hours-time">9:00 AM – 7:00 PM</span>
              </div>
              <div className="contact-hours-row">
                <span>Sunday</span>
                <span className="contact-hours-time closed">Closed</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="contact-faq-section"
      >
        <div className="contact-faq-header">
          <HelpCircle size={28} color="#d4af37" />
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-list contact-faq-list">
          {FAQS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.04 }}
              className={`faq-item glass-panel ${openFaq === i ? 'faq-open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={20}
                  className={`faq-chevron ${openFaq === i ? 'rotated' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="faq-answer-wrap"
                  >
                    <p className="faq-answer">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
