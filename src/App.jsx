// App.jsx
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Soldier({ url, action, visible }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const mixerRef = useRef();
  const [actionsMap, setActionsMap] = useState({});

  useEffect(() => {
    if (!scene || !animations || !group.current) return;

    // Scale model up to fit screen nicely
    scene.scale.set(2, 2, 2);

    // Initialize mixer
    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;

    // Find animations by name
    const idleAnim = animations.find(a => a.name.toLowerCase().includes("idle"));
    const walkAnim = animations.find(a => a.name.toLowerCase().includes("walk"));
    const runAnim  = animations.find(a => a.name.toLowerCase().includes("run"));

    if (!idleAnim || !walkAnim || !runAnim) {
      console.warn("Animations missing:", animations.map(a => a.name));
      return;
    }

    const idleAction = mixer.clipAction(idleAnim);
    const walkAction = mixer.clipAction(walkAnim);
    const runAction  = mixer.clipAction(runAnim);

    // Play all actions, only idle visible initially
    idleAction.play();
    walkAction.play(); walkAction.setEffectiveWeight(0);
    runAction.play();  runAction.setEffectiveWeight(0);

    setActionsMap({ idle: idleAction, walk: walkAction, run: runAction });
  }, [scene, animations]);

  useEffect(() => {
    if (!actionsMap[action]) return;

    Object.values(actionsMap).forEach(a => a.setEffectiveWeight(0));
    actionsMap[action].setEffectiveWeight(1);
  }, [action, actionsMap]);

  useFrame((state, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    if (group.current) {
      group.current.position.y = 0; // on ground
      group.current.position.x = 0; // center
      group.current.position.z = 0; // center
    }
  });

  return <group ref={group} visible={visible}><primitive object={scene} /></group>;
}

export default function App() {
  const [action, setAction] = useState("idle");
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Canvas shadows camera={{ position: [0, 3, 8], fov: 100 }}>
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Ground */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#777" />
        </mesh>

        {/* Soldier */}
        <Soldier url="/models/Soldier.glb" action={action} visible={visible} />

        <OrbitControls />
      </Canvas>

      {/* Buttons */}
      <div style={{ position: "absolute", top: 100, left: 20, zIndex: 1 }}>
        <button onClick={() => setVisible(!visible)}>
          {visible ? "Hide" : "Show"} Model
        </button>
        <button onClick={() => setAction("idle")}>Idle</button>
        <button onClick={() => setAction("walk")}>Walk</button>
        <button onClick={() => setAction("run")}>Run</button>
      </div>
    </>
  );
}
