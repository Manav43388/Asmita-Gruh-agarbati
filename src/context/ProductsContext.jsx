import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.name || data.title || 'New Product',
            desc: data.description || data.desc || 'No description available',
            image: data.image || data.imageUrl || '/agarbatti.png',
            price: data.price || 0,
            unit: data.unit || 'per pack',
            category: data.category || 'Incense Sticks',
            stock: data.stock || 10,
            tag: data.tag || null,
            ...data
          };
        });
        setProducts(productsData);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getProductsByCategory = (category) => {
    if (!category || category === 'All') return products;
    return products.filter(p => p.category === category);
  };

  const searchProducts = (query) => {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return products.filter(p => {
      const title = (p.title || p.name || '').toLowerCase();
      const desc = (p.desc || p.description || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const tag = (p.tag || '').toLowerCase();
      const fragrance = (p.fragrance || '').toLowerCase();
      return title.includes(q) || desc.includes(q) || category.includes(q) || tag.includes(q) || fragrance.includes(q);
    }).slice(0, 8);
  };

  return (
    <ProductsContext.Provider value={{ products, loading, getProductsByCategory, searchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
