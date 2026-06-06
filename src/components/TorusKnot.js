"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { TorusKnot } from "three";

export function TorusKnotMesh({ mousePos }) {
  const meshRef = useRef(null);
  const [targetRotX, setTargetRotX] = useState(0);
  const [targetRotY, setTargetRotY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setTargetRotX(y * 0.5);
      setTargetRotY(x * 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 200, 32]} />
      <meshStandardMaterial
        color="#b7ff00"
        wireframe
        emissive="#b7ff00"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export function SceneContent() {
  return (
    <>
      <TorusKnotMesh />
      <pointLight position={[10, 10, 10]} color="#b7ff00" intensity={2} />
      <pointLight position={[-10, -10, 10]} color="#ffffff" intensity={1} />
      <ambientLight intensity={0.3} />
    </>
  );
}
