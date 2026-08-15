import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// The site's signature 3D moment: an abstract, softly-lit form standing
// in for "fabric shaped by an algorithm" — distorted organic geometry
// rather than a literal garment, so it reads as premium/futuristic
// instead of gamey. Purely procedural (no textures/HDRs to fetch), so
// it works fully offline and adds no network dependency.

function FloatingForm() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.12;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.35, 8]} />
      <MeshDistortMaterial color="#4C3B73" distort={0.32} speed={1.4} roughness={0.25} metalness={0.4} />
    </mesh>
  );
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const { pointer } = state;
    group.current.rotation.y += (pointer.x * 0.4 - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (-pointer.y * 0.2 - group.current.rotation.x) * 0.05;
  });
  return <group ref={group}>{children}</group>;
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "none" }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color="#EDEAE2" />
      <pointLight position={[-3, -2, -2]} intensity={0.45} color="#B8935A" />
      <ParallaxRig>
        <FloatingForm />
        <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.9}>
          <mesh position={[1.55, 0.75, -0.5]}>
            <torusGeometry args={[0.2, 0.055, 16, 64]} />
            <meshStandardMaterial color="#B8935A" roughness={0.3} metalness={0.6} />
          </mesh>
        </Float>
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.7}>
          <mesh position={[-1.5, -0.55, -0.3]}>
            <sphereGeometry args={[0.13, 32, 32]} />
            <meshStandardMaterial color="#EDEAE2" roughness={0.4} />
          </mesh>
        </Float>
      </ParallaxRig>
      <ContactShadows position={[0, -1.55, 0]} opacity={0.22} scale={6} blur={2.4} far={2} />
    </Canvas>
  );
}
