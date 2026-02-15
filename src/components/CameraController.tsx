"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface CameraControllerProps {
  targetPosition: { x: number; y: number; z: number } | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export default function CameraController({
  targetPosition,
  controlsRef,
}: CameraControllerProps) {
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const animProgress = useRef(0);
  const startTarget = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  const startCamPos = useRef(new THREE.Vector3());
  const endCamPos = useRef(new THREE.Vector3());
  const prevTargetPos = useRef<string | null>(null);
  const lockTarget = useRef<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    if (!targetPosition || !controlsRef.current) {
      lockTarget.current = null;
      return;
    }

    const key = `${targetPosition.x.toFixed(4)},${targetPosition.y.toFixed(4)},${targetPosition.z.toFixed(4)}`;
    // Only trigger fly-to animation on a new selection, not every frame update
    if (prevTargetPos.current === key) {
      // Just update lock target for smooth tracking
      lockTarget.current = targetPosition;
      return;
    }
    prevTargetPos.current = key;
    lockTarget.current = targetPosition;

    const controls = controlsRef.current;
    const dest = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y,
      targetPosition.z
    );

    // Compute a good camera offset based on distance from origin
    const distFromOrigin = dest.length();
    const viewDist = Math.max(3, Math.min(20, distFromOrigin * 0.3 + 2));

    // Start animation
    startTarget.current.copy(controls.target);
    endTarget.current.copy(dest);
    startCamPos.current.copy(camera.position);

    // Position camera above and slightly behind the target
    endCamPos.current.set(
      dest.x + viewDist * 0.3,
      dest.y + viewDist * 0.7,
      dest.z + viewDist * 0.6
    );

    animProgress.current = 0;
    isAnimating.current = true;
  }, [targetPosition, controlsRef, camera]);

  // Clear lock when no target
  useEffect(() => {
    if (!targetPosition) {
      prevTargetPos.current = null;
      lockTarget.current = null;
      isAnimating.current = false;
    }
  }, [targetPosition]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    // Fly-to animation
    if (isAnimating.current) {
      animProgress.current = Math.min(1, animProgress.current + delta * 1.8);
      const t = easeOutCubic(animProgress.current);

      controls.target.lerpVectors(startTarget.current, endTarget.current, t);
      camera.position.lerpVectors(startCamPos.current, endCamPos.current, t);

      if (animProgress.current >= 1) {
        isAnimating.current = false;
      }
      controls.update();
      return;
    }

    // Lock-on: smoothly track the object as it moves
    if (lockTarget.current) {
      const dest = new THREE.Vector3(
        lockTarget.current.x,
        lockTarget.current.y,
        lockTarget.current.z
      );
      // Smoothly move the orbit target to follow the object
      controls.target.lerp(dest, Math.min(1, delta * 4));
      controls.update();
    }
  });

  return null;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
