import { useEffect, useRef } from "react";
import { DitherScene } from "../lib/threeDitherScene";

export function DitherCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const dither = new DitherScene({
      canvas: ref.current,
      modelPath: "/models/king.glb",
      steps: 1,
      scale: 2000,
      speed: 0.1,
      useOriginalColor: true,
    });
    dither.loadModel().then(() => dither.start());
  }, []);

  return <canvas ref={ref} className="w-full h-full block" />;
}
