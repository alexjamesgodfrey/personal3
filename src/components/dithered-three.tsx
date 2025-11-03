import { DitherCanvas } from "./dither-canvas";

export function DitheredThree() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <DitherCanvas />
      <div className="absolute inset-0 dither-md pointer-events-none" />
    </div>
  );
}
