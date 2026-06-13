"use client";

import { motion } from "framer-motion";

export const MeshBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#F8F9FA]">
      {/* Mesh Gradient Base */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* Blurred Gradient Blobs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-[10%] -left-[10%] h-[70%] w-[70%] rounded-full bg-aws-orange/15 blur-[120px]"
      />

      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-[20%] -right-[10%] h-[85%] w-[85%] rounded-full bg-aws-charcoal/30 blur-[130px]"
      />

      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
        }}
        className="absolute top-1/4 right-1/4 h-[40%] w-[40%] rounded-full bg-aws-slate/20 blur-[100px]"
      />

      {/* Surface Depth Layers */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
    </div>
  );
};
