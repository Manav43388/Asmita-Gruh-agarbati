import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="section faq-section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="faq-header"
      >
        <h2 className="section-title">Frequently Asked Questions</h2>
      </motion.div>

      <div className="faq-list">
        {FAQS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            viewport={{ once: true }}
            className={`faq-item glass-panel ${open === i ? 'faq-open' : ''}`}
          >
            <button
              className="faq-question"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span>{item.q}</span>
              <ChevronDown
                size={20}
                className={`faq-chevron ${open === i ? 'rotated' : ''}`}
              />
            </button>
            <AnimatePresence>
              {open === i && (
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
    </section>
  );
}
