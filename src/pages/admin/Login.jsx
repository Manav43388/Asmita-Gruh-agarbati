import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <Toaster position="top-right" />
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
            disabled={loading}
          >
            {loading ? (
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
