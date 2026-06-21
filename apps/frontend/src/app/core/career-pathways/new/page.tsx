"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

function NewCareerRoleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/core/certifications?tab=pathways&new=true");
  }, [router]);

  return null;
}

export default function NewCareerRolePage() {
  return (
    <Suspense fallback={null}>
      <NewCareerRoleRedirect />
    </Suspense>
  );
}
