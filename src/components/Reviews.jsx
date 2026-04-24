import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    verified: true,
    date: '04/18/2026',
    rating: 5,
    title: 'Amazing fragrance!',
    text: 'These agarbattis have the most divine fragrance. My entire home feels like a temple. Perfect for daily puja and meditation.',
  },
  {
    id: 2,
    name: 'Rahul Patel',
    verified: true,
    date: '04/14/2026',
    rating: 5,
    title: 'Best Agarbatti Ever',
    text: 'Pure natural ingredients. No headache or irritation even after long use. Highly recommended for everyone!',
  },
  {
    id: 3,
    name: 'Kavita Devi',
    verified: true,
    date: '04/12/2026',
    rating: 5,
    title: 'Sambrani cups are wonderful',
    text: 'The sambrani cups fill the whole house with a beautiful purifying fragrance. Brilliant product. Will buy again!',
  },
  {
    id: 4,
    name: 'Amit Verma',
    verified: true,
    date: '04/10/2026',
    rating: 4,
    title: 'Great quality, fast delivery',
    text: 'Good packaging and fast delivery. The dhoop sticks are long-lasting and have a strong, pleasant aroma.',
  },
  {
    id: 5,
    name: 'Sunita Mehta',
    verified: true,
    date: '04/08/2026',
    rating: 5,
    title: 'Perfect gift!',
    text: 'Ordered the Puja Gift Hamper for my mother. She absolutely loved it. Very premium packaging and quality.',
  },
  {
    id: 6,
    name: 'Deepak Joshi',
    verified: false,
    date: '04/05/2026',
    rating: 5,
    title: '100% Natural — worth it',
    text: 'Finally found a brand that uses zero chemical fragrance. You can smell the difference immediately. Truly pure.',
  },
];

const BREAKDOWN = [
  { stars: 5, count: 177 },
  { stars: 4, count: 32 },
  { stars: 3, count: 1 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

const TOTAL_REVIEWS = BREAKDOWN.reduce((s, b) => s + b.count, 0);
const OVERALL = (
  BREAKDOWN.reduce((s, b) => s + b.stars * b.count, 0) / TOTAL_REVIEWS
).toFixed(2);

function StarRow({ rating, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? '#d4af37' : 'transparent'}
          stroke={i <= rating ? '#d4af37' : '#555'}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pages = Math.ceil(REVIEWS.length / perPage);
  const visible = REVIEWS.slice(page * perPage, page * perPage + perPage);

  return (
    <section id="reviews" className="section reviews-section">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="reviews-header"
      >
        <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Customer Reviews</h2>

        {/* Overall score */}
        <div className="reviews-overall">
          <span className="reviews-score">{OVERALL}</span>
          <div>
            <StarRow rating={Math.round(OVERALL)} size={22} />
            <span className="reviews-count">Based on {TOTAL_REVIEWS} reviews</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="reviews-breakdown">
          {BREAKDOWN.map(b => (
            <div key={b.stars} className="breakdown-row">
              <StarRow rating={b.stars} size={13} />
              <div className="breakdown-bar-wrap">
                <div
                  className="breakdown-bar-fill"
                  style={{ width: `${(b.count / TOTAL_REVIEWS) * 100}%` }}
                />
              </div>
              <span className="breakdown-num">{b.count}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="reviews-cta">
          <a
            href="https://wa.me/916352291433?text=Hi%2C%20I%20want%20to%20write%20a%20review%20for%20your%20product."
            target="_blank"
            rel="noreferrer"
            className="review-write-btn"
          >
            ✍️ Write a review
          </a>
          <a
            href="https://wa.me/916352291433?text=Hi%2C%20I%20have%20a%20question%20about%20your%20products."
            target="_blank"
            rel="noreferrer"
            className="review-ask-btn"
          >
            💬 Ask a question
          </a>
        </div>
      </motion.div>

      {/* Individual review cards */}
      <div className="reviews-list">
        {visible.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="review-card glass-panel"
          >
            <div className="review-card-top">
              <div className="review-avatar">{r.name[0]}</div>
              <div>
                <div className="review-name-row">
                  <span className="review-name">{r.name}</span>
                  {r.verified && <span className="review-verified">Verified</span>}
                </div>
                <StarRow rating={r.rating} size={14} />
              </div>
              <span className="review-date">{r.date}</span>
            </div>
            <p className="review-title">{r.title}</p>
            <p className="review-text">{r.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="reviews-pagination">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            className={`page-dot ${i === page ? 'active' : ''}`}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </section>
  );
}
