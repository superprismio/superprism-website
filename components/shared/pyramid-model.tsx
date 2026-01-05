"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function PyramidModel() {
  const { viewport } = useThree();
  const pyramid = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (pyramid.current) {
      pyramid.current.rotation.y += 0.02;
    }
  });

  // Create pyramid geometry (cone with 4 sides) - replacing the torus from tutorial
  const pyramidGeometry = useMemo(
    () => new THREE.ConeGeometry(1.5, 2, 4),
    []
  );

  // Material properties matching tutorial exactly
  const materialProps = {
    thickness: 0.2,
    roughness: 0,
    transmission: 1,
    ior: 1.2,
    chromaticAberration: 1.0,
    backside: true,
  };

  return (
    <group scale={viewport.width / 3.75}>
      <Text
        position={[0, 0, -1]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Superprism
      </Text>
      <mesh ref={pyramid} geometry={pyramidGeometry}>
        <MeshTransmissionMaterial {...materialProps} />
      </mesh>
    </group>
  );
}

