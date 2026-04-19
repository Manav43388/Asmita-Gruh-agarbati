import React, { Suspense } from 'react';
import Scene from './components/Scene';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import Contact from './components/Contact';
import './index.css';

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      
      <div className="content-layer">
        <Navbar />
        <Hero />
        <Products />
        <Contact />
      </div>
    </>
  );
}

export default App;
