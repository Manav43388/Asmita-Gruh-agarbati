import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function RelatedProducts({ currentProduct, allProducts, onProductSelect }) {
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});

  if (!currentProduct || !allProducts || allProducts.length === 0) return null;

  // Similar Products: same category, exclude current
  const similarProducts = allProducts
    .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, 4);

  // Customers Also Viewed: different category, prioritize bestsellers/trending
  const alsoViewed = allProducts
    .filter(p =>
      p.id !== currentProduct.id &&
      p.category !== currentProduct.category
    )
    .sort((a, b) => {
      // Prioritize bestsellers and trending
      const aScore = (a.isBestseller ? 2 : 0) + (a.isTrending ? 1 : 0) + (a.salesCount || 0) / 100;
      const bScore = (b.isBestseller ? 2 : 0) + (b.isTrending ? 1 : 0) + (b.salesCount || 0) / 100;
      return bScore - aScore;
    })
    .slice(0, 4);

  // If not enough similar products, supplement from alsoViewed
  const displaySimilar = similarProducts.length > 0
    ? similarProducts
    : allProducts.filter(p => p.id !== currentProduct.id).slice(0, 4);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  const handleClick = (product) => {
    if (onProductSelect) onProductSelect(product);
  };

  const MiniProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="related-product-mini-card"
      onClick={() => handleClick(product)}
    >
      <div className="related-mini-img-wrap">
        <img
          src={product.image || product.imageUrl}
          alt={product.title || product.name}
          loading="lazy"
          decoding="async"
        />
        {product.tag && <span className="related-mini-tag">{product.tag}</span>}
      </div>
      <div className="related-mini-info">
        <h4 className="related-mini-name">{product.title || product.name}</h4>
        <div className="related-mini-price-row">
          <span className="related-mini-price">₹{product.discountPrice || product.price}</span>
          {product.discountPrice && (
            <span className="related-mini-orig">₹{product.price}</span>
          )}
        </div>
        <button
          className={`related-mini-cart-btn ${addedIds[product.id] ? 'added' : ''}`}
          onClick={(e) => handleAddToCart(e, product)}
        >
          <ShoppingCart size={13} />
          {addedIds[product.id] ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="related-products-section">
      {/* Similar Products */}
      {displaySimilar.length > 0 && (
        <>
          <div className="pd-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={18} style={{ color: '#d4af37' }} />
            Similar Products
          </div>
          <div className="related-products-grid">
            {displaySimilar.map((product, index) => (
              <MiniProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </>
      )}

      {/* Customers Also Viewed */}
      {alsoViewed.length > 0 && (
        <>
          <div className="pd-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <ChevronRight size={18} style={{ color: '#d4af37' }} />
            Customers Also Viewed
          </div>
          <div className="related-products-grid">
            {alsoViewed.map((product, index) => (
              <MiniProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
