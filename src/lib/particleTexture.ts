import * as THREE from "three";

let _circleTexture: THREE.Texture | null = null;
let _starTexture: THREE.Texture | null = null;

export function getCircleTexture(): THREE.Texture {
  if (_circleTexture) return _circleTexture;

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.2)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  _circleTexture = new THREE.CanvasTexture(canvas);
  _circleTexture.needsUpdate = true;
  return _circleTexture;
}

export function getStarTexture(): THREE.Texture {
  if (_starTexture) return _starTexture;

  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const half = size / 2;

  // Soft glow
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.15, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.15)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Subtle cross spikes
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(half, 2);
  ctx.lineTo(half, size - 2);
  ctx.moveTo(2, half);
  ctx.lineTo(size - 2, half);
  ctx.stroke();

  _starTexture = new THREE.CanvasTexture(canvas);
  _starTexture.needsUpdate = true;
  return _starTexture;
}
