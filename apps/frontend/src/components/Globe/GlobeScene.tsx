"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import Globe from './Globe';
import { AWSRegionData } from '@/lib/api';

interface GlobeSceneProps {
  regions: AWSRegionData[];
  onSelectRegion: (region: AWSRegionData) => void;
  selectedRegion: AWSRegionData | null;
}

export default function GlobeScene({ regions, onSelectRegion, selectedRegion }: GlobeSceneProps) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (selectedRegion && controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      // Default position of camera is [0, 0, 6.5] and target is [0, 0, 0]
      const hasMoved = Math.abs(camera.position.x) > 0.05 ||
                       Math.abs(camera.position.y) > 0.05 ||
                       Math.abs(camera.position.z - 6.5) > 0.05 ||
                       Math.abs(target.x) > 0.05 ||
                       Math.abs(target.y) > 0.05 ||
                       Math.abs(target.z) > 0.05;
      
      if (hasMoved) {
        controlsRef.current.reset();
      }
    }
  }, [selectedRegion]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 10], fov: 45 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6.5]} fov={40} />
        <OrbitControls 
          ref={controlsRef}
          enablePan={false} 
          enableZoom={false} 
          minDistance={6.5} 
          maxDistance={6.5}
          autoRotate={false} 
        />
        
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} intensity={2} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={1.5} color="#00A3FF" />
        <pointLight position={[0, -10, 0]} intensity={1} color="#0073BB" />
        
        <Globe 
          regions={regions} 
          onSelectRegion={onSelectRegion} 
          selectedRegion={selectedRegion} 
        />

        <ContactShadows 
          position={[0, -4.5, 0]} 
          opacity={0.1} 
          scale={30} 
          blur={3} 
          far={10} 
        />
      </Canvas>
    </div>
  );
}


