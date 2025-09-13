import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Bounds } from "@react-three/drei";
import * as THREE from "three";

function Soldier({ url, action, visible }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const mixerRef = useRef();
  const [actionsMap, setActionsMap] = useState({});

  useEffect(() => {
    if (!scene || !animations || !group.current) return;

    scene.scale.set(1, 1, 1);

    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;

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
  });

  return (
    <group ref={group} visible={visible}>
      <primitive object={scene} />
    </group>
  );
}

export default function App() {
  const [action, setAction] = useState("idle");
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ fov: 50 }}>
        <Bounds fit clip observe margin={1.2}>
          <Soldier url="/models/Soldier.glb" action={action} visible={visible} />
        </Bounds>

        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#777" />
        </mesh>

        <OrbitControls />
      </Canvas>

      {/* Buttons */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1 }}>
        <button onClick={() => setVisible(!visible)}>
          {visible ? "Hide" : "Show"} Model
        </button>
        <button onClick={() => setAction("idle")}>Idle</button>
        <button onClick={() => setAction("walk")}>Walk</button>
        <button onClick={() => setAction("run")}>Run</button>
      </div>
    </div>
  );
}
