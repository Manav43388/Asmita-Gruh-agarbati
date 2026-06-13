import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../context/ProductsContext';

export default function SearchBar({ onProductSelect }) {
  const { searchProducts } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  const handleSearch = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const found = searchProducts(value);
      setResults(found);
    }, 300);
  }, [searchProducts]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleSelect = (product) => {
    if (onProductSelect) onProductSelect(product);
    handleClose();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Highlight matching text
  const highlightMatch = (text, q) => {
    if (!q || q.length < 2) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
    );
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      {/* Search trigger button */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="search-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="nav-search-btn"
            onClick={handleOpen}
            aria-label="Search products"
          >
            <Search size={20} />
          </motion.button>
        ) : (
          <motion.div
            key="search-input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="search-input-wrap"
          >
            <Search size={18} className="search-input-icon" />
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Search products, categories..."
              value={query}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <button className="search-close-btn" onClick={handleClose} aria-label="Close search">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results dropdown */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="search-dropdown"
          >
            {results.length > 0 ? (
              <>
                <div className="search-dropdown-header">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </div>
                {results.map((product) => (
                  <button
                    key={product.id}
                    className="search-suggestion"
                    onClick={() => handleSelect(product)}
                  >
                    <div className="search-suggestion-img">
                      <img src={product.image} alt={product.title} loading="lazy" />
                    </div>
                    <div className="search-suggestion-info">
                      <span className="search-suggestion-name">
                        {highlightMatch(product.title || product.name, query)}
                      </span>
                      <span className="search-suggestion-category">
                        {highlightMatch(product.category, query)}
                      </span>
                    </div>
                    <span className="search-suggestion-price">
                      ₹{product.discountPrice || product.price}
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <div className="search-no-results">
                <Search size={24} style={{ opacity: 0.3 }} />
                <p>No products found for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
