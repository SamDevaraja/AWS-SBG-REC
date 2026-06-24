"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import RegionMarkers from './RegionMarkers';
import { AWSRegionData } from '@/lib/api';
import { latLngToXYZ } from '@/utils/coordinates';

interface GlobeProps {
  regions: AWSRegionData[];
  onSelectRegion: (region: AWSRegionData) => void;
  selectedRegion: AWSRegionData | null;
}

let cachedTexture: THREE.Texture | null = null;

export default function Globe({ regions, onSelectRegion, selectedRegion }: GlobeProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(cachedTexture);
  const globeGroupRef = useRef<THREE.Group>(null);
  const loggedFinalRef = useRef<boolean>(false);
  const isLockedRef = useRef<boolean>(false);
  const prevSelectedRegionIdRef = useRef<string | null>(null);
  const idleLogCounterRef = useRef<number>(0);
  const targetRotationRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (cachedTexture) return;
    const loader = new THREE.TextureLoader();
    loader.load('/textures/world-map.png', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      cachedTexture = tex;
      setTexture(tex);
    });
  }, []);

  const getTargetRotation = (lat: number, lng: number) => {
    const [x, y, z] = latLngToXYZ(lat, lng, 1.0);

    // Solve XYZ rotation sequence Rx(rx) * Ry(ry) * P = [0, 0, 1]
    // Step 1: Rotate around Y to bring x to 0: ry = Math.atan2(-x, z)
    // Step 2: Rotate around X to bring y to 0: rx = Math.atan2(y, Math.sqrt(x * x + z * z))
    const ry = Math.atan2(-x, z);
    const rx = Math.atan2(y, Math.sqrt(x * x + z * z));

    // Shift focus slightly left to avoid info panel overlap
    const ryOffset = -0.35;

    // ALWAYS normalize target angles to [-PI, PI] to prevent unexpected wrapping/360-spinning
    return {
      x: Math.atan2(Math.sin(rx), Math.cos(rx)),
      y: Math.atan2(Math.sin(ry + ryOffset), Math.cos(ry + ryOffset))
    };
  };

  useFrame((state, delta) => {
    if (globeGroupRef.current) {
      if (selectedRegion) {
        // Reset locking state and calculate static target rotation once when a new region is selected
        if (prevSelectedRegionIdRef.current !== selectedRegion.id) {
          const wasIdle = prevSelectedRegionIdRef.current === null;
          prevSelectedRegionIdRef.current = selectedRegion.id;
          isLockedRef.current = false;
          loggedFinalRef.current = false;

          // Normalize current rotation angles to [-PI, PI] to prevent unexpected wrapping/360-spinning
          globeGroupRef.current.rotation.x = Math.atan2(Math.sin(globeGroupRef.current.rotation.x), Math.cos(globeGroupRef.current.rotation.x));
          globeGroupRef.current.rotation.y = Math.atan2(Math.sin(globeGroupRef.current.rotation.y), Math.cos(globeGroupRef.current.rotation.y));

          const newTarget = getTargetRotation(selectedRegion.lat, selectedRegion.lng);

          // Calculate shortest path deltas
          let diffX = newTarget.x - globeGroupRef.current.rotation.x;
          diffX = Math.atan2(Math.sin(diffX), Math.cos(diffX));
          let diffY = newTarget.y - globeGroupRef.current.rotation.y;
          diffY = Math.atan2(Math.sin(diffY), Math.cos(diffY));

          // We only skip revolving/tilting (keep X and Y unchanged) if transitioning from a previously selected region
          // that is adjacent/local (within ~25 degrees / 0.45 radians).
          const isNearby = !wasIdle && Math.abs(diffX) < 0.45 && Math.abs(diffY) < 0.45;
          if (isNearby) {
            targetRotationRef.current = {
              x: globeGroupRef.current.rotation.x, // Keep current X rotation unchanged (no tilt)
              y: globeGroupRef.current.rotation.y  // Keep current Y rotation unchanged (no revolving)
            };
          } else {
            targetRotationRef.current = newTarget;
          }
        }

        // Lock globe position completely if target rotation was already reached
        if (isLockedRef.current) {
          return;
        }

        const target = targetRotationRef.current;
        if (!target) return;

        // Shortest-path X rotation
        let diffX = target.x - globeGroupRef.current.rotation.x;
        diffX = Math.atan2(Math.sin(diffX), Math.cos(diffX));
        let xCompleted = false;
        if (Math.abs(diffX) < 0.0002) {
          globeGroupRef.current.rotation.x = target.x;
          xCompleted = true;
        } else {
          globeGroupRef.current.rotation.x += diffX * 0.12;
        }

        // Shortest-path Y rotation
        let diffY = target.y - globeGroupRef.current.rotation.y;
        diffY = Math.atan2(Math.sin(diffY), Math.cos(diffY));
        let yCompleted = false;
        if (Math.abs(diffY) < 0.0002) {
          globeGroupRef.current.rotation.y = target.y;
          yCompleted = true;
        } else {
          globeGroupRef.current.rotation.y += diffY * 0.12;
        }

        // Add progress logging while animating
        if (!xCompleted || !yCompleted) {
          const currentDiffX = Math.atan2(Math.sin(target.x - globeGroupRef.current.rotation.x), Math.cos(target.x - globeGroupRef.current.rotation.x));
          const currentDiffY = Math.atan2(Math.sin(target.y - globeGroupRef.current.rotation.y), Math.cos(target.y - globeGroupRef.current.rotation.y));
          console.log(`[DEBUG SELECTION] ` +
            `Selected Region ID: "${selectedRegion.id}", ` +
            `Current Rotation: [rx: ${globeGroupRef.current.rotation.x.toFixed(4)}, ry: ${globeGroupRef.current.rotation.y.toFixed(4)}], ` +
            `Target Rotation: [rx: ${target.x.toFixed(4)}, ry: ${target.y.toFixed(4)}], ` +
            `Rotation Delta: [dx: ${currentDiffX.toFixed(4)}, dy: ${currentDiffY.toFixed(4)}], ` +
            `idleRotationActive: false, ` +
            `selectionModeActive: true`
          );
        }

        if (xCompleted && yCompleted && !loggedFinalRef.current) {
          console.log(`[DEBUG SELECTION] Final Rotation Reached & Locked! ` +
            `Selected Region ID: "${selectedRegion.id}", ` +
            `Current Rotation: [rx: ${globeGroupRef.current.rotation.x.toFixed(4)}, ry: ${globeGroupRef.current.rotation.y.toFixed(4)}], ` +
            `Target Rotation: [rx: ${target.x.toFixed(4)}, ry: ${target.y.toFixed(4)}], ` +
            `Rotation Delta: [dx: 0.0000, dy: 0.0000], ` +
            `idleRotationActive: false, ` +
            `selectionModeActive: true`
          );
          loggedFinalRef.current = true;
          isLockedRef.current = true; // Freeze any future updates
        }
      } else {
        // No region selected — idle rotation is active
        if (prevSelectedRegionIdRef.current !== null) {
          prevSelectedRegionIdRef.current = null;
          isLockedRef.current = false;
          console.log(`[DEBUG SELECTION] Entering Idle Mode. Selected Region ID: "none", Current Rotation: [rx: ${globeGroupRef.current.rotation.x.toFixed(4)}, ry: ${globeGroupRef.current.rotation.y.toFixed(4)}], Target Rotation: [rx: 0.0000, ry: none], Rotation Delta: [dx: none, dy: none], idleRotationActive: true, selectionModeActive: false`);
        }

        // Gentle auto-spin
        globeGroupRef.current.rotation.y += delta * 0.04;

        // Return pitch (X-axis) back to 0
        let diffX = 0 - globeGroupRef.current.rotation.x;
        diffX = Math.atan2(Math.sin(diffX), Math.cos(diffX));
        globeGroupRef.current.rotation.x += diffX * 0.05;

        // Throttled log to show idle status without spamming
        idleLogCounterRef.current = (idleLogCounterRef.current || 0) + 1;
        if (idleLogCounterRef.current >= 120) {
          idleLogCounterRef.current = 0;
          console.log(`[DEBUG SELECTION] Idle Spin Active - Current Rotation: [rx: ${globeGroupRef.current.rotation.x.toFixed(4)}, ry: ${globeGroupRef.current.rotation.y.toFixed(4)}], Target Rotation: [rx: 0.0000, ry: none], Rotation Delta: [dx: none, dy: none], idleRotationActive: true, selectionModeActive: false`);
        }
      }
    }
  });

  return (
    <group
      ref={globeGroupRef}
      scale={1.5}
      rotation={new THREE.Euler(0, -1.3962634, 0, 'XYZ')}
    >
      {/* Ocean Base Sphere — renders first */}
      <Sphere args={[0.995, 64, 64]} renderOrder={0}>
        <meshBasicMaterial
          color="#BEE3ED"
          toneMapped={false}
        />
      </Sphere>

      {/* Landmass Sphere — renders second */}
      {texture && (
        <Sphere
          args={[1.0, 64, 64]}
          renderOrder={1}
          rotation={[0, 0, 0]}
        >
          <meshBasicMaterial
            alphaMap={texture}
            color="#7B7B7B"
            transparent={true}
            opacity={1.0}
            depthWrite={false}
            toneMapped={false}
          />
        </Sphere>
      )}

      {/* Atmospheric Soft Glow (faint outer ring) */}
      <Sphere args={[1.015, 64, 64]} renderOrder={2}>
        <meshBasicMaterial
          color="#BEE3ED"
          transparent={true}
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>

      {/* Interactive Region Markers — renders last (always on top of globe) */}
      <group renderOrder={3}>
        <RegionMarkers
          regions={regions}
          onSelect={onSelectRegion}
          selectedId={selectedRegion?.id}
        />
      </group>
    </group>
  );
}
