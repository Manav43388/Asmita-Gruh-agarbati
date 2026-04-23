import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  const handleProceed = () => {
    setIsCartOpen(false);
    setTimeout(() => setIsCheckoutOpen(true), 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cart-backdrop"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="cart-drawer"
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <div className="cart-drawer-title">
                <ShoppingBag size={22} />
                <span>Your Cart</span>
                {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
              </div>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="cart-items-list">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag size={56} strokeWidth={1} style={{ color: 'var(--primary-color)', opacity: 0.4 }} />
                  <p>Your cart is empty</p>
                  <span>Add some products to get started!</span>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cartItems.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="cart-item"
                    >
                      <div className="cart-item-img">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <h4>{item.title}</h4>
                          <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="cart-item-bottom">
                          <div className="qty-control">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                              <Minus size={13} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="cart-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-subtotal">
                  <span>Subtotal</span>
                  <span className="subtotal-amount">₹{subtotal.toLocaleString()}</span>
                </div>
                <p className="cart-note">Taxes & shipping calculated at checkout</p>
                <button className="proceed-btn" onClick={handleProceed}>
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
