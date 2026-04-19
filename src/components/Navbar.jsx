import React from 'react';

export default function Navbar() {
  return (
    <nav className="navbar glass-panel" style={{ margin: '1rem 2rem', border: 'none' }}>
      <div className="nav-brand">Asmita Gruh Udhyog</div>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="#about">About Us</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  );
}
