import React, {
  Suspense,
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
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
    geo.computeVertexNormals();

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
        <meshStandardMaterial
          color={isSelected ? "red" : color}
          metalness={color === "gold" ? 1 : 0.2}
          roughness={color === "gold" ? 0.2 : 0.8}
        />
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

function CameraSetup({ controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 4, 16);
    camera.lookAt(0, 0, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera, controlsRef]);

  return null;
}

const ModelViewer = forwardRef(function ModelViewer(
  { objects = [], onDrag, onSelect, draggingIndex, selectedIndex },
  ref
) {
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    downloadScreenshot: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = "temple-configurator.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    },
  }));

  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, 16], fov: 45 }}
      gl={{ preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        canvasRef.current = gl.domElement;
      }}
      style={{ height: "600px", background: "#f0f0f0" }}
    >
      <CameraSetup controlsRef={controlsRef} />

      {/* Better lighting */}
      <ambientLight intensity={0.7} />
      <hemisphereLight intensity={0.7} groundColor="#666666" />
      <directionalLight
        position={[8, 12, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        position={[0, 10, 6]}
        angle={0.35}
        intensity={1.8}
        penumbra={0.5}
        castShadow
      />
      <pointLight position={[-8, 8, 8]} intensity={0.7} />

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
    </Canvas>
  );
});

export default ModelViewer;