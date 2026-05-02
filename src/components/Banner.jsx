import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'content', 'homepage'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners.filter(b => b.image));
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <section className="banner-section">
      <div className="banner-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="banner-slide"
          >
            <img src={banners[currentIndex].image} alt={banners[currentIndex].title || 'Banner'} className="banner-image" />
            {banners[currentIndex].title && (
              <div className="banner-overlay">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {banners[currentIndex].title}
                </motion.h2>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button className="banner-nav prev" onClick={() => setCurrentIndex((currentIndex - 1 + banners.length) % banners.length)}>
              <ChevronLeft size={24} />
            </button>
            <button className="banner-nav next" onClick={() => setCurrentIndex((currentIndex + 1) % banners.length)}>
              <ChevronRight size={24} />
            </button>
            <div className="banner-dots">
              {banners.map((_, i) => (
                <button 
                  key={i} 
                  className={`banner-dot ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
