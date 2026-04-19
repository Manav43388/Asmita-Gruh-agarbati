import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer section glass-panel" style={{ minHeight: 'auto', padding: '3rem 10%', marginTop: '4rem', borderRadius: '40px 40px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="nav-brand" style={{ marginBottom: '1rem' }}>Asmita Gruh Udhyog</div>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
        Aromatic excellence since inception. Experience the divine.
      </p>
      
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <a href="#home" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>Home</a>
        <a href="#products" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>Products</a>
        <a href="#contact" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>Contact</a>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)', marginBottom: '2rem' }}></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>&copy; {currentYear} Asmita Gruh Udhyog. All rights reserved.</p>
    </footer>
  );
}
