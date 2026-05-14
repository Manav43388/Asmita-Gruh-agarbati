import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ReviewModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    title: '',
    text: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const setRating = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.text || !formData.title) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'reviews'), {
        ...formData,
        isApproved: false, // Requires admin approval by default
        isFeatured: false,
        verified: false,
        date: new Date().toLocaleDateString('en-GB'),
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', rating: 5, title: '', text: '' });
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="checkout-overlay"
        style={{ zIndex: 1000 }}
        onClick={(e) => { if (e.target.classList.contains('checkout-overlay') && !loading && !success) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="checkout-modal auth-modal"
          style={{ maxWidth: '450px' }}
        >
          {!success && !loading && (
            <button className="close-btn checkout-close" onClick={onClose}>
              <X size={22} />
            </button>
          )}

          {success ? (
            <div className="auth-content profile-view text-center py-8">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Review Submitted!</h3>
              <p className="text-gray-400">Thank you for your feedback. Your review will be visible once approved.</p>
            </div>
          ) : (
            <div className="auth-content">
              <div className="auth-header">
                <h3>Write a Review</h3>
                <p>Share your experience with our products</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Your Rating</label>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={28}
                          fill={star <= formData.rating ? '#d4af37' : 'transparent'}
                          stroke={star <= formData.rating ? '#d4af37' : '#555'}
                          className="transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    placeholder="Enter your name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Review Title</label>
                  <input 
                    name="title" 
                    type="text" 
                    placeholder="Brief summary of your review" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Your Review</label>
                  <textarea 
                    name="text" 
                    placeholder="What did you like or dislike?" 
                    value={formData.text} 
                    onChange={handleChange} 
                    required
                    rows="4"
                    className="w-full bg-[#151515] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all resize-none"
                  ></textarea>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="checkout-next-btn auth-submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
