import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Mail, Lock, User, ArrowRight, Loader2, LogOut, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup, user, logout, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
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
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else if (mode === 'signup') {
        await signup(formData.email, formData.password, formData.name);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(formData.email);
        setResetSent(true);
      }
    } catch (err) {
      console.error("Auth Error:", err.code, err.message);
      if (err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password. If you are signing up, this email might already be in use.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setResetSent(false);
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

              {/* ── Forgot Password view ── */}
              {mode === 'forgot' ? (
                <>
                  <div className="auth-header">
                    <div className="auth-icon-wrap">
                      <KeyRound size={32} />
                    </div>
                    <h3>Reset Password</h3>
                    <p>Enter your email and we'll send you a reset link</p>
                  </div>

                  {resetSent ? (
                    <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'rgba(212,175,55,0.12)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <Mail size={24} style={{ color: '#d4af37' }} />
                      </div>
                      <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                        A reset link was sent to <strong style={{ color: '#d4af37' }}>{formData.email}</strong>.
                        <br />Check your inbox (and spam folder).
                      </p>
                      <button
                        className="checkout-next-btn auth-submit"
                        onClick={() => switchMode('login')}
                      >
                        <ArrowLeft size={16} /> Back to Login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                      <div className="form-group">
                        <label><Mail size={14} /> Email Address</label>
                        <input
                          name="email"
                          type="email"
                          placeholder="example@mail.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          autoFocus
                        />
                      </div>

                      {error && <div className="auth-error">{error}</div>}

                      <button type="submit" className="checkout-next-btn auth-submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                          <><Mail size={16} /> Send Reset Link</>
                        )}
                      </button>

                      <div className="auth-footer" style={{ marginTop: 12 }}>
                        <p>
                          Remember your password?
                          <button onClick={() => switchMode('login')} className="auth-toggle-btn">
                            Login
                          </button>
                        </p>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                /* ── Login / Signup view ── */
                <>
                  <div className="auth-header">
                    <div className="auth-icon-wrap">
                      {mode === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
                    </div>
                    <h3>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                    <p>{mode === 'login' ? 'Login to access your orders and profile' : 'Join us for a premium fragrance experience'}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="auth-form">
                    {mode === 'signup' && (
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label style={{ margin: 0 }}><Lock size={14} /> Password</label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#d4af37', fontSize: 12, fontWeight: 600,
                              padding: 0, textDecoration: 'underline', textUnderlineOffset: 2
                            }}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
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
                          {mode === 'login' ? 'Login' : 'Sign Up'} <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="auth-footer">
                    <p>
                      {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                      <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="auth-toggle-btn">
                        {mode === 'login' ? 'Sign Up' : 'Login'}
                      </button>
                    </p>
                  </div>
                </>
              )}

            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
