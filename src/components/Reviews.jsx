import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase/config';

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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 3;

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'), 
      where('isApproved', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const revs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort: Featured first, then newest
      const sorted = revs.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      });
      setReviews(sorted);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calculate breakdown and overall
  const counts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => Math.round(r.rating) === stars).length
  }));

  const totalReviews = reviews.length;
  const overall = totalReviews > 0 
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";

  const pages = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  if (loading) {
    return (
      <section id="reviews" className="section reviews-section flex items-center justify-center">
        <Loader2 className="animate-spin text-admin-accent" size={48} />
      </section>
    );
  }

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
          <span className="reviews-score">{overall}</span>
          <div>
            <StarRow rating={Math.round(parseFloat(overall))} size={22} />
            <span className="reviews-count">Based on {totalReviews} reviews</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="reviews-breakdown">
          {counts.map(b => (
            <div key={b.stars} className="breakdown-row">
              <StarRow rating={b.stars} size={13} />
              <div className="breakdown-bar-wrap">
                <div
                  className="breakdown-bar-fill"
                  style={{ width: totalReviews > 0 ? `${(b.count / totalReviews) * 100}%` : '0%' }}
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
              <div className="review-avatar">{r.name ? r.name[0] : 'U'}</div>
              <div>
                <div className="review-name-row">
                  <span className="review-name">{r.name}</span>
                  {r.verified && <span className="review-verified">Verified</span>}
                </div>
                <StarRow rating={r.rating} size={14} />
              </div>
              <span className="review-date">{r.date || new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="review-title">{r.title}</p>
            <p className="review-text">{r.text}</p>
          </motion.div>
        ))}
        {reviews.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            <p>No reviews yet. Be the first to write one!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
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
      )}
    </section>
  );
}

