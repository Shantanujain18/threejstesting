// ArmyApp.jsx
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

function Soldier({ originalScene, animations, action, position }) {
  const group = useRef();
  const mixerRef = useRef();
  const [actionsMap, setActionsMap] = useState({});

  useEffect(() => {
    if (!originalScene || !animations || !group.current) return;

    // Clone model with independent skeleton
    const clonedScene = clone(originalScene);
    clonedScene.scale.set(1, 1, 1);
    group.current.add(clonedScene);

    // Setup AnimationMixer
    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const idleAnim = animations.find((a) =>
      a.name.toLowerCase().includes("idle")
    );
    const walkAnim = animations.find((a) =>
      a.name.toLowerCase().includes("walk")
    );
    const runAnim = animations.find((a) =>
      a.name.toLowerCase().includes("run")
    );

    if (!idleAnim || !walkAnim || !runAnim) {
      console.warn("Animations missing:", animations.map((a) => a.name));
      return;
    }

    const idleAction = mixer.clipAction(idleAnim);
    const walkAction = mixer.clipAction(walkAnim);
    const runAction = mixer.clipAction(runAnim);

    idleAction.play();
    walkAction.play(); walkAction.setEffectiveWeight(0);
    runAction.play(); runAction.setEffectiveWeight(0);

    setActionsMap({ idle: idleAction, walk: walkAction, run: runAction });
  }, [originalScene, animations]);

  // Switch animation on prop change
  useEffect(() => {
    if (!actionsMap[action]) return;
    Object.values(actionsMap).forEach((a) => a.setEffectiveWeight(0));
    actionsMap[action].setEffectiveWeight(1);
  }, [action, actionsMap]);

  // Animate
  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
  });

  return <group ref={group} position={position} />;
}

export default function ArmyApp() {
  const { scene, animations } = useGLTF("/models/Soldier.glb");
  const [action, setAction] = useState("idle");

  // Generate positions for multiple soldiers
  const positions = useMemo(() => {
    const rows = 3; // number of rows
    const cols = 5; // number of columns
    const spacing = 2.5;
    const arr = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        arr.push([j * spacing, 0, i * spacing]);
      }
    }
    return arr;
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [10, 8, 15], fov: 50 }}>
        {/* Army */}
        {positions.map((pos, i) => (
          <Soldier
            key={i}
            originalScene={scene}
            animations={animations}
            action={action}
            position={pos}
          />
        ))}

        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Ground */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#777" />
        </mesh>

        <OrbitControls />
      </Canvas>

      {/* Buttons */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1 }}>
        <button onClick={() => setAction("idle")}>Idle</button>
        <button onClick={() => setAction("walk")}>Walk</button>
        <button onClick={() => setAction("run")}>Run</button>
      </div>
    </div>
  );
}
