import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Sparkles, Html, MeshDistortMaterial } from '@react-three/drei';

function FloatingAgarbatti({ position, rotation }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2} position={position}>
      <mesh ref={meshRef} rotation={rotation}>
        {/* Stick base (bamboo) */}
        <cylinderGeometry args={[0.02, 0.02, 3, 16]} />
        <meshStandardMaterial color="#8b4513" />
        
        {/* Incense part */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2, 16]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
        </mesh>
        
        {/* Glowing Tip */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={2} />
        </mesh>
      </mesh>
    </Float>
  );
}

function DivineAura() {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.1;
    ref.current.rotation.y = state.clock.elapsedTime * 0.15;
  });
  return (
    <mesh ref={ref} position={[0, 0, -8]}>
      <torusKnotGeometry args={[4, 0.4, 128, 32]} />
      <MeshDistortMaterial
        color="#d4af37"
        emissive="#8b4513"
        emissiveIntensity={2}
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={1}
      />
    </mesh>
  );
}

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#030303']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#d4af37" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b4513" />

        {/* Particles representing smoke/scent (reduced count to prevent GPU crash) */}
        <Sparkles count={50} scale={12} size={2} speed={0.4} opacity={0.3} color="#d4af37" />
        
        {/* Distant stars/dust (reduced to 500) */}
        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />

        {/* Divine Glowing Aura */}
        <DivineAura />

        {/* Floating Agarbattis */}
        <FloatingAgarbatti position={[-4, 0, -2]} rotation={[0, 0, 0.2]} />
        <FloatingAgarbatti position={[4, 1, -3]} rotation={[0, 0, -0.4]} />
        <FloatingAgarbatti position={[0, -3, -4]} rotation={[0, 0, 0.1]} />

        {/* Floating 3D Title using HTML to avoid SDF WebGL crashes */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5} position={[0, 2.5, -5]}>
          <Html transform center>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: '800',
              color: '#d4af37',
              textShadow: '0px 0px 20px rgba(139, 69, 19, 0.8)',
              whiteSpace: 'nowrap'
            }}>
              ASMITA GRUH UDHYOG
            </div>
          </Html>
        </Float>

        {/* Controls - autoRotate gently */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 2 + 0.2} 
          minPolarAngle={Math.PI / 2 - 0.2}
        />
      </Canvas>
    </div>
  );
}
