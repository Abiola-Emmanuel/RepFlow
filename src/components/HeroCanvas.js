"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

const SceneContent = dynamic(
  () => import("./TorusKnot").then((mod) => mod.SceneContent),
  { ssr: false }
);

function CanvasLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-lime-400 text-sm font-black animate-pulse">Loading...</div>
    </div>
  );
}

export function HeroCanvas() {
  return (
    <Suspense fallback={<CanvasLoader />}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
        alpha
      >
        <SceneContent />
      </Canvas>
    </Suspense>
  );
}
