import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Sparkles, Html } from '@react-three/drei';

function FloatingAgarbatti({ position, rotation, scale = 1 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2} position={position}>
      <mesh ref={meshRef} rotation={rotation} scale={scale}>
        {/* Stick base (bamboo) */}
        <cylinderGeometry args={[0.02, 0.02, 3, 16]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
        
        {/* Incense part */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2, 16]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
        </mesh>
        
        {/* Glowing Tip */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#ff4500" emissive="#ff6600" emissiveIntensity={8} />
          <pointLight distance={4} intensity={2} color="#ff4500" />
        </mesh>
      </mesh>
    </Float>
  );
}

function FloatingDhoopCone({ position, rotation, scale = 1 }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5} position={position}>
      <mesh ref={meshRef} rotation={rotation} scale={scale}>
        {/* Dhoop Cone body */}
        <coneGeometry args={[0.3, 1, 16]} />
        <meshStandardMaterial color="#5a4538" roughness={0.8} />
        
        {/* Glowing Tip */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ff4500" emissive="#ff6600" emissiveIntensity={8} />
          <pointLight distance={4} intensity={2} color="#ff4500" />
        </mesh>
      </mesh>
    </Float>
  );
}

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#030303']} />
        
        {/* Lighting (increased to make objects more visible) */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#d4af37" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#8b4513" />

        {/* Particles representing smoke/scent */}
        <Sparkles count={80} scale={12} size={3} speed={0.4} opacity={0.5} color="#d4af37" />
        
        {/* Distant stars/dust */}
        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />

        {/* Small floating Agarbattis in the background */}
        <FloatingAgarbatti position={[-6, 3, -8]} rotation={[0, 0, 0.5]} scale={0.7} />
        <FloatingAgarbatti position={[5, 4, -10]} rotation={[0.2, 0, -0.6]} scale={0.8} />
        <FloatingAgarbatti position={[-4, -4, -6]} rotation={[-0.2, 0, 0.8]} scale={0.6} />
        <FloatingAgarbatti position={[6, -3, -9]} rotation={[0.4, 0, -0.4]} scale={0.9} />

        {/* Small floating Dhoop Cones in the background */}
        <FloatingDhoopCone position={[-5, 0, -7]} rotation={[0.3, 0.2, 0]} scale={0.9} />
        <FloatingDhoopCone position={[4, 1, -6]} rotation={[-0.4, -0.1, 0]} scale={1} />
        <FloatingDhoopCone position={[2, 5, -8]} rotation={[0.2, 0.5, 0.1]} scale={0.7} />
        <FloatingDhoopCone position={[-3, -5, -9]} rotation={[-0.3, 0.1, -0.2]} scale={0.8} />

        {/* Larger Foreground Elements */}
        <FloatingAgarbatti position={[-3, 0, -2]} rotation={[0, 0, 0.2]} scale={1.2} />
        <FloatingAgarbatti position={[3, 1, -3]} rotation={[0, 0, -0.4]} scale={1.1} />
        <FloatingDhoopCone position={[0, -2.5, -3]} rotation={[0.1, 0, 0.1]} scale={1.3} />


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
