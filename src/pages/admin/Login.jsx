import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isAdmin, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  React.useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-card">
        <div className="admin-sidebar-logo" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Logo" />
          <span>Asmita Admin</span>
        </div>
        
        <h1 className="admin-title">Admin Login</h1>
        <p className="admin-subtitle">Only authorized access allowed</p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Email Address</label>
            <div className="admin-input-wrapper">
              <Mail className="admin-input-icon" size={18} />
              <input
                type="email"
                className="admin-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Password</label>
            <div className="admin-input-wrapper">
              <Lock className="admin-input-icon" size={18} />
              <input
                type="password"
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-button"
            disabled={submitting || authLoading}
          >
            {submitting || authLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <ShieldCheck size={20} />
                Login to Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
