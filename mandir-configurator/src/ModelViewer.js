import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";

function STLModel({
  url,
  position,
  scale,
  color,
  rotation,
  spin = 0,
  index,
  onSelect,
  isSelected,
}) {
  const geometry = useLoader(STLLoader, url);

  const centeredGeometry = useMemo(() => {
    const geo = geometry.clone();
    geo.computeBoundingBox();

    const center = new THREE.Vector3();
    geo.boundingBox.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);

    return geo;
  }, [geometry]);

  return (
    <group position={position} rotation={[0, spin, 0]} scale={scale}>
      <mesh
        geometry={centeredGeometry}
        rotation={rotation}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect(index);
        }}
        onClick={(e) => e.stopPropagation()}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={isSelected ? "red" : color} />
      </mesh>
    </group>
  );
}

function FloorDragArea({ onDrag, draggingIndex }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.2, 0]}
      onPointerMove={(e) => {
        if (draggingIndex !== null) {
          onDrag(e.point);
        }
      }}
    >
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 4, 16);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

function CameraControls({ draggingIndex }) {
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={draggingIndex === null}
      enablePan={false}
      enableRotate
      enableZoom
      minDistance={8}
      maxDistance={40}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
    />
  );
}

export default function ModelViewer({
  objects = [],
  onDrag,
  onSelect,
  draggingIndex,
  selectedIndex,
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, 16], fov: 45 }}
      style={{ height: "500px", background: "#f0f0f0" }}
    >
      <CameraSetup />

      <ambientLight intensity={0.9} />
      <directionalLight position={[8, 12, 10]} intensity={1.4} castShadow />
      <pointLight position={[-8, 8, 8]} intensity={0.8} />

      <Suspense fallback={null}>
        {objects.map((obj, i) => (
          <STLModel
            key={i}
            {...obj}
            index={i}
            onSelect={onSelect}
            isSelected={i === selectedIndex}
          />
        ))}
      </Suspense>

      <FloorDragArea onDrag={onDrag} draggingIndex={draggingIndex} />
      <CameraControls draggingIndex={draggingIndex} />
    </Canvas>
  );
}