import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Mail, Lock, User, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup, user, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
      onClose();
    } catch (err) {
      console.error("Auth Error:", err.code, err.message);
      if (err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password. If you are signing up, this email might already be in use.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Something went wrong');
      }
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
        onClick={(e) => { if (e.target.classList.contains('checkout-overlay')) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="checkout-modal auth-modal"
          style={{ maxWidth: '400px' }}
        >
          <button className="close-btn checkout-close" onClick={onClose}>
            <X size={22} />
          </button>

          {user ? (
            <div className="auth-content profile-view">
              <div className="auth-header">
                <div className="avatar-large">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <h3>Welcome, {user.displayName || 'User'}!</h3>
                <p>{user.email}</p>
              </div>
              
              <div className="auth-actions">
                <button className="checkout-next-btn logout-btn" onClick={() => { logout(); onClose(); }}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-content">
              <div className="auth-header">
                <div className="auth-icon-wrap">
                  {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
                </div>
                <h3>{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
                <p>{isLogin ? 'Login to access your orders and profile' : 'Join us for a premium fragrance experience'}</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <div className="form-group">
                    <label><User size={14} /> Full Name</label>
                    <input 
                      name="name" 
                      type="text" 
                      placeholder="Enter your name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                )}
                <div className="form-group">
                  <label><Mail size={14} /> Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="example@mail.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label><Lock size={14} /> Password</label>
                  <input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="checkout-next-btn auth-submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      {isLogin ? 'Login' : 'Sign Up'} <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer">
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button onClick={() => setIsLogin(!isLogin)} className="auth-toggle-btn">
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
