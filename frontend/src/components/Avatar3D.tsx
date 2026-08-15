import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { BodyMeasurements, Category } from "../types";

// Baseline adult proportions (cm) the mannequin is built at before any
// measurement scaling is applied.
const BASE = { height: 170, chest: 92, waist: 78, hip: 98 };
const SKIN = "#C9A487";
const NEUTRAL_TOP = "#D8D2C4";
const NEUTRAL_BOTTOM = "#3A342E";

export interface AvatarOutfit {
  category: Category;
  colorPalette?: string[];
}

interface MannequinProps {
  measurements: BodyMeasurements;
  outfit: AvatarOutfit | null;
}

function garmentZone(category?: Category): "full" | "upper" | "lower" | "accent" {
  if (!category) return "accent";
  if (["dress", "saree", "kurta", "lehenga", "sherwani"].includes(category)) return "full";
  if (["top", "jacket"].includes(category)) return "upper";
  if (category === "bottoms") return "lower";
  return "accent";
}

function Mannequin({ measurements, outfit }: MannequinProps) {
  const heightScale = (measurements.heightCm || BASE.height) / BASE.height;
  const chestScale = (measurements.chestCm || BASE.chest) / BASE.chest;
  const waistScale = (measurements.waistCm || BASE.waist) / BASE.waist;
  const hipScale = (measurements.hipCm || BASE.hip) / BASE.hip;
  const torsoScale = (chestScale + waistScale + hipScale) / 3;

  const garmentColor = outfit?.colorPalette?.[0] || "#4C3B73";
  const zone = garmentZone(outfit?.category);
  const upperColor = zone === "full" || zone === "upper" ? garmentColor : NEUTRAL_TOP;
  const lowerColor = zone === "full" || zone === "lower" ? garmentColor : NEUTRAL_BOTTOM;

  return (
    <group scale={[1, heightScale, 1]}>
      {/* head + neck */}
      <mesh position={[0, 3.35, 0]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.22, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.6} />
      </mesh>

      {/* torso + hips, width scaled by chest/waist/hip average */}
      <group scale={[torsoScale, 1, torsoScale * 0.75]}>
        <mesh position={[0, 2.45, 0]}>
          <capsuleGeometry args={[0.42, 0.85, 4, 16]} />
          <meshStandardMaterial color={upperColor} roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <capsuleGeometry args={[0.46, 0.35, 4, 16]} />
          <meshStandardMaterial color={zone === "full" ? garmentColor : NEUTRAL_BOTTOM} roughness={0.55} />
        </mesh>
        {zone === "full" && (
          // soft flared drape below the hips — reads as a dress/saree/kurta hem
          <mesh position={[0, 1.05, 0]}>
            <coneGeometry args={[0.62, 0.55, 24, 1, true]} />
            <meshStandardMaterial color={garmentColor} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* arms */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.62 * torsoScale, 2.35, 0]} rotation={[0, 0, side * -0.12]}>
          <capsuleGeometry args={[0.11, 1.15, 4, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      ))}

      {/* legs */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.22, 0.6, 0]}>
          <capsuleGeometry args={[0.17, zone === "full" ? 1.0 : 1.3, 4, 12]} />
          <meshStandardMaterial color={lowerColor} roughness={0.6} />
        </mesh>
      ))}

      {/* small accent piece for shoes / bags / jewelry recommendations */}
      {zone === "accent" && (
        <mesh position={[0, 3.05, 0.24]}>
          <torusGeometry args={[0.14, 0.02, 12, 32]} />
          <meshStandardMaterial color={garmentColor} roughness={0.3} metalness={0.6} />
        </mesh>
      )}
    </group>
  );
}

interface Avatar3DProps {
  measurements: BodyMeasurements;
  outfit: AvatarOutfit | null;
  autoRotate?: boolean;
}

export default function Avatar3D({ measurements, outfit, autoRotate = false }: Avatar3DProps) {
  return (
    <Canvas camera={{ position: [0, 1.9, 4.4], fov: 32 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 3]} intensity={1} color="#EDEAE2" />
      <pointLight position={[-3, 1, -2]} intensity={0.3} color="#B8935A" />
      <Mannequin measurements={measurements} outfit={outfit} />
      <ContactShadows position={[0, -0.02, 0]} opacity={0.28} scale={4.5} blur={2.2} far={2} />
      <OrbitControls
        target={[0, 1.8, 0]}
        enablePan={false}
        enableZoom
        minDistance={2.6}
        maxDistance={6}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.7}
        autoRotate={autoRotate}
        autoRotateSpeed={1.4}
      />
    </Canvas>
  );
}
