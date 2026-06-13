import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Subscribe to user's wishlist in Firestore
  useEffect(() => {
    if (!user?.uid) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    const wishlistRef = collection(db, 'wishlists', user.uid, 'items');
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setWishlistItems(items);
      setLoading(false);
    }, (error) => {
      console.error('Wishlist subscription error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addToWishlist = useCallback(async (product) => {
    if (!user?.uid) {
      toast.error('Please login to add items to your wishlist');
      return false;
    }

    try {
      const itemRef = doc(db, 'wishlists', user.uid, 'items', product.id);
      await setDoc(itemRef, {
        productId: product.id,
        title: product.title || product.name,
        image: product.image || product.imageUrl,
        price: product.price,
        discountPrice: product.discountPrice || null,
        category: product.category,
        unit: product.unit || 'per pack',
        addedAt: new Date().toISOString()
      });
      toast.success('Added to wishlist ❤️');
      return true;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }
  }, [user?.uid]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!user?.uid) return;

    try {
      await deleteDoc(doc(db, 'wishlists', user.uid, 'items', productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove from wishlist');
    }
  }, [user?.uid]);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId || item.productId === productId);
  }, [wishlistItems]);

  const moveToCart = useCallback(async (product) => {
    if (!product) return;
    addToCart({
      id: product.id || product.productId,
      title: product.title,
      image: product.image,
      price: product.discountPrice || product.price,
      unit: product.unit
    });
    await removeFromWishlist(product.id || product.productId);
    toast.success('Moved to cart 🛒');
  }, [addToCart, removeFromWishlist]);

  const toggleWishlist = useCallback(async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      moveToCart,
      toggleWishlist,
      wishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
