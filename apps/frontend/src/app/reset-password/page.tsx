"use client";

import { ResetPasswordCard } from "@/components/ResetPasswordCard";
import { AuthLayout } from "@/components/AuthLayout";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-slate-800 font-bold animate-pulse">Loading secure session...</div>}>
        <ResetPasswordCard />
      </Suspense>
    </AuthLayout>
  );
}
