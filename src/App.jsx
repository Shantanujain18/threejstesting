import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// Component for multiple moving Soldier models
function Soldiers({ url = "/models/Soldier.glb", count = 5, speed = 0.02 }) {
  const { scene } = useGLTF(url);
  const group = useRef();

  // Initialize positions, directions, and colors
  const soldiers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          0,
          (Math.random() - 0.5) * 10
        ),
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          0,
          (Math.random() - 0.5) * speed
        ),
        color: new THREE.Color(Math.random(), Math.random(), Math.random())
      });
    }
    return arr;
  }, [count, speed]);

  // Animate each soldier
  useFrame(() => {
    soldiers.forEach((s, i) => {
      s.position.add(s.direction);
      const mesh = group.current.children[i];
      mesh.position.copy(s.position);
    });
  });

  // Change one soldier’s color after 2 seconds
  useFrame(({ clock }) => {
    if (clock.elapsedTime > 2) {
      soldiers[0].color.set("red");
      group.current.children[0].traverse((child) => {
        if (child.isMesh) {
          child.material.color = soldiers[0].color;
        }
      });
    }
  });

  return (
    <group ref={group}>
      {soldiers.map((s, i) => (
        <primitive
          key={i}
          object={scene.clone()}
          position={s.position}
          scale={0.02}
        >
          {/* Apply initial color */}
          <meshStandardMaterial attach="material" color={s.color} />
        </primitive>
      ))}
    </group>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Soldiers url="/models/Soldier.glb" count={5} speed={0.05} />
      <OrbitControls />
    </Canvas>
  );
}
