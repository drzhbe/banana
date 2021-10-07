import * as THREE from "three";
import { Canvas, PrimitiveProps, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { Mesh } from "three";
import { Environment, useGLTF } from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";

const Banana = ({ id, z }: { id: number; z: number }) => {
  const ref = useRef<Mesh>();
  const [clicked, setClicked] = useState(false);
  const { viewport, camera } = useThree();
  // @ts-ignore (stas) nodes and materials are not exposed :(
  const { nodes, materials } = useGLTF("/banana-v1-transformed.glb");
  const { width, height } = viewport.getCurrentViewport(
    camera,
    new THREE.Vector3(0, 0, z)
  );
  const [data] = useState({
    x: THREE.MathUtils.randFloatSpread(2),
    y: THREE.MathUtils.randFloatSpread(height),
    z: z,
    rX: Math.random() * Math.PI,
    rY: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
  });
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.set(
      (data.rX += clicked ? 0.1 : 0.001),
      (data.rY += clicked ? 0.1 : 0.001),
      (data.rZ += clicked ? 0.1 : 0.001)
    );
    if (clicked) data.z -= 1;
    if (data.z < -200) {
      data.z = z;
      data.y = -height;
      setClicked(false);
    }
    ref.current.position.set(width * data.x, (data.y += 0.025), data.z);
    if (data.y > height) data.y = -height;
  });
  return (
    <mesh
      ref={ref}
      geometry={nodes.banana.geometry}
      material={materials.skin}
      // rotation={[-Math.PI / 2, 0, 0]}
      material-emissive="orange"
      // onClick={() => setClicked(!clicked)}
      onPointerDown={() => setClicked(!clicked)}
    />
  );
};

const App = ({ count = 100, depth = 80 }) => {
  return (
    <Canvas gl={{ alpha: false }} camera={{ near: 0.01, far: 110, fov: 30 }}>
      <color attach="background" args={["#ffbf40"]} />
      {/* <ambientLight intensity={0.2} /> */}
      <spotLight position={[10, 10, 10]} intensity={1} />
      <Suspense fallback={null}>
        <Environment preset="sunset" />
        {Array.from({ length: count }, (_, i) => (
          <Banana key={i} id={i} z={(-i / count) * depth - 20} />
        ))}
        <EffectComposer>
          <DepthOfField
            target={[0, 0, depth / 2]}
            focalLength={0.5}
            bokehScale={11}
            height={700}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};

export default App;
