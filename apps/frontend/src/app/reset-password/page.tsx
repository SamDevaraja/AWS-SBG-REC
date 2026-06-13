"use client";

import { MeshBackground } from "@/components/MeshBackground";
import { ResetPasswordCard } from "@/components/ResetPasswordCard";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <main className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden bg-[#d6d4cf]">
      <MeshBackground />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <Suspense fallback={<div className="text-aws-neutral font-bold animate-pulse">Loading secure session...</div>}>
          <ResetPasswordCard />
        </Suspense>
      </div>
    </main>
  );
}
