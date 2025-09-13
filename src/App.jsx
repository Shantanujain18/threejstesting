import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

// Instanced cubes component
function InstancedCubes({ count = 50, speed = 0.01 }) {
  const meshRef = useRef();
  const [colors] = useState(() => new Float32Array(count * 3));
  const [velocities] = useState(() => []);

  // Initialize positions and velocities
  useEffect(() => {
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      // Random start position
      dummy.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Random velocity
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed
        )
      );

      // Default color white
      colors[i * 3 + 0] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.geometry.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(colors, 3)
    );
  }, [count, speed, colors, velocities]);

  // Animate movement
  useFrame(() => {
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      meshRef.current.getMatrixAt(i, dummy.matrix);
      dummy.position.setFromMatrixPosition(dummy.matrix);

      // Move
      dummy.position.add(velocities[i]);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Change color of one cube (example: cube 0 -> red)
  const changeCubeColor = (index, color) => {
    if (!meshRef.current) return;
    const newColor = new THREE.Color(color);
    colors[index * 3 + 0] = newColor.r;
    colors[index * 3 + 1] = newColor.g;
    colors[index * 3 + 2] = newColor.b;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
  };

  // Change first cube color after 2 seconds
  useEffect(() => {
    setTimeout(() => changeCubeColor(0, "red"), 2000);
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [5, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <InstancedCubes count={100} speed={0.05} />
      <OrbitControls />
    </Canvas>
  );
}
