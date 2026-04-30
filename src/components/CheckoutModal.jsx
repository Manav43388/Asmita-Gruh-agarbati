import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Package, Truck, MessageCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, increment, doc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Tag, Ticket } from 'lucide-react';
const STEPS = ['Review Order', 'Shipping Info', 'Confirm'];

export default function CheckoutModal() {
  const { cartItems, isCheckoutOpen, setIsCheckoutOpen, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '', notes: '' });
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    if (user && isCheckoutOpen) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user, isCheckoutOpen]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Enter valid 10-digit mobile number';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter valid 6-digit pincode';
    return newErrors;
  };

  const handleNext = () => {
    if (step === 1) {
      const e = validate();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    setStep(s => s + 1);
  };

  const buildWhatsAppMessage = () => {
    const itemLines = cartItems.map(i => `• ${i.title} × ${i.quantity} = ₹${(i.price * i.quantity).toLocaleString()}`).join('\n');
    return `🛒 *New Order - Asmita Gruh Udhyog*\n\n*Items Ordered:*\n${itemLines}\n\n*Order Total: ₹${subtotal.toLocaleString()}*\n\n*Customer Details:*\nName: ${formData.name}\nPhone: ${formData.phone}${formData.email ? '\nEmail: ' + formData.email : ''}\nAddress: ${formData.address}, ${formData.city} - ${formData.pincode}${formData.notes ? '\nNotes: ' + formData.notes : ''}`;
  };

  const [orderId, setOrderId] = useState('');

  const generateOrderId = () => {
    return 'ORD' + Date.now();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    
    try {
      const q = query(
        collection(db, 'coupons'), 
        where('code', '==', couponCode.toUpperCase()),
        where('status', '==', 'Active')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setCouponError('Invalid or inactive coupon code');
        setDiscount(0);
        setAppliedCoupon(null);
        return;
      }

      const coupon = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      
      // Check Expiry
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        setCouponError('Coupon has expired');
        return;
      }

      // Check Min Purchase
      if (subtotal < (coupon.minPurchase || 0)) {
        setCouponError(`Min. purchase for this coupon is ₹${coupon.minPurchase}`);
        return;
      }

      let discountAmount = 0;
      if (coupon.type === 'Percentage') {
        discountAmount = (subtotal * coupon.value) / 100;
      } else {
        discountAmount = coupon.value;
      }

      setDiscount(discountAmount);
      setAppliedCoupon(coupon);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      console.error("Coupon error:", error);
      setCouponError('Error validating coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const finalTotal = subtotal - discount;

  const handlePlaceOrder = async () => {
    setLoading(true);
    const newId = generateOrderId();
    setOrderId(newId);
    
    try {
      const fullAddress = `${formData.address}, ${formData.city} - ${formData.pincode}`;
      const productString = cartItems.map(i => `${i.title} (x${i.quantity})`).join(', ');

      const orderData = {
        orderId: newId,
        name: formData.name,
        phone: formData.phone,
        address: fullAddress,
        product: productString,
        amount: finalTotal,
        discount: discount,
        couponCode: appliedCoupon?.code || null,
        subtotal: subtotal,
        status: 'Order placed',
        trackingId: '',
        createdAt: serverTimestamp(),
        userId: user?.uid || null,
        userEmail: user?.email || null
      };

      // Save to Firestore
      await addDoc(collection(db, 'orders'), orderData);
      
      // Increment coupon usage if applicable
      if (appliedCoupon) {
        await updateDoc(doc(db, 'coupons', appliedCoupon.id), {
          usageCount: increment(1)
        });
      }
      
      setStep(2);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => { setStep(0); setFormData({ name: '', phone: '', email: '', address: '', city: '', pincode: '', notes: '' }); setErrors({}); setOrderId(''); }, 400);
  };

  const handleOrderComplete = () => {
    clearCart();
    handleClose();
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d < 0 ? 60 : -60, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); handleNext(); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  if (!isCheckoutOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="checkout-overlay"
        onClick={(e) => { if (e.target.classList.contains('checkout-overlay') && step < 2) handleClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="checkout-modal"
        >
          {/* Close */}
          {step < 2 && (
            <button className="close-btn checkout-close" onClick={handleClose}>
              <X size={22} />
            </button>
          )}

          {/* Progress Steps */}
          {step < 2 && (
            <div className="checkout-steps">
              {STEPS.slice(0, 2).map((s, i) => (
                <React.Fragment key={i}>
                  <div className={`checkout-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                    <div className="step-circle">{i < step ? <CheckCircle size={16} /> : i + 1}</div>
                    <span>{s}</span>
                  </div>
                  {i < 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="checkout-step-content"
              >
                <div className="checkout-step-header">
                  <Package size={24} style={{ color: 'var(--primary-color)' }} />
                  <h3>Review Your Order</h3>
                </div>

                <div className="checkout-order-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="checkout-order-item">
                      <div className="checkout-item-img">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="checkout-item-info">
                        <span className="checkout-item-name">{item.title}</span>
                        <span className="checkout-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="checkout-item-amount">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="checkout-coupon-section">
                  <div className={`coupon-input-wrap ${appliedCoupon ? 'applied' : ''}`}>
                    <Tag size={16} className="coupon-icon" />
                    <input 
                      type="text" 
                      placeholder="Enter Coupon Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button className="remove-coupon" onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }}>Remove</button>
                    ) : (
                      <button 
                        className="apply-coupon-btn" 
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                      >
                        {validatingCoupon ? '...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponError && <p className="coupon-error-text">{couponError}</p>}
                </div>

                <div className="checkout-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="total-row discount-row">
                      <span className="flex items-center gap-1.5"><Ticket size={14} /> Discount ({appliedCoupon?.code})</span>
                      <span className="text-emerald-500">- ₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="total-row">
                    <span>Delivery</span>
                    <span className="free-tag">FREE</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button className="checkout-next-btn" onClick={goNext}>
                  Continue to Shipping <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="checkout-step-content"
              >
                <div className="checkout-step-header">
                  <Truck size={24} style={{ color: 'var(--primary-color)' }} />
                  <h3>Shipping Details</h3>
                </div>

                <div className="checkout-form">
                  <div className="form-row">
                    <div className={`form-group ${errors.name ? 'error' : ''}`}>
                      <label>Full Name *</label>
                      <input name="name" value={formData.name} onChange={handleChange} placeholder="Ramesh Patel" />
                      {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>
                    <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                      <label>Phone Number *</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" type="tel" />
                      {errors.phone && <span className="field-error">{errors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email (optional)</label>
                    <input name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" type="email" />
                  </div>
                  <div className={`form-group ${errors.address ? 'error' : ''}`}>
                    <label>Delivery Address *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="House No., Street, Landmark..." rows="2" />
                    {errors.address && <span className="field-error">{errors.address}</span>}
                  </div>
                  <div className="form-row">
                    <div className={`form-group ${errors.city ? 'error' : ''}`}>
                      <label>City *</label>
                      <input name="city" value={formData.city} onChange={handleChange} placeholder="Surat" />
                      {errors.city && <span className="field-error">{errors.city}</span>}
                    </div>
                    <div className={`form-group ${errors.pincode ? 'error' : ''}`}>
                      <label>Pincode *</label>
                      <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="395001" type="text" maxLength="6" />
                      {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Order Notes (optional)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Special instructions..." rows="2" />
                  </div>
                </div>

                <div className="checkout-form-actions">
                  <button className="checkout-back-btn" onClick={goBack}>Back</button>
                  <button className="checkout-next-btn" onClick={handlePlaceOrder}>
                    <CheckCircle size={18} /> Confirm Order
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="checkout-step-content checkout-success"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, damping: 15 }}
                  className="success-icon-wrap"
                >
                  <CheckCircle size={72} />
                </motion.div>
                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  Order Placed Successfully! 🎉
                </motion.h3>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  Thank you for your order! Your order has been recorded and our team will process it shortly.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="success-summary"
                >
                  <div className="success-summary-row highlight">
                    <span>Order ID</span><span className="order-id-text">{orderId}</span>
                  </div>
                  <div className="success-summary-row">
                    <span>Name</span><span>{formData.name}</span>
                  </div>
                  <div className="success-summary-row">
                    <span>Phone</span><span>{formData.phone}</span>
                  </div>
                  <div className="success-summary-row">
                    <span>Order Total</span><span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="success-summary-row discount">
                      <span>Discount Saved</span><span className="text-emerald-500">₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                </motion.div>
                
                <div className="success-actions">
                  <Link to="/track" className="track-order-btn-link" onClick={() => { localStorage.setItem('last_order_search', orderId); handleOrderComplete(); }}>
                    Track This Order <ChevronRight size={18} />
                  </Link>
                  <button
                    className="checkout-next-btn back-home-btn"
                    onClick={handleOrderComplete}
                  >
                    Back to Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
