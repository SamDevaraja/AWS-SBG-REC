"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CareerPathwaysPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/core/certifications?tab=pathways");
  }, [router]);

  return null;
}
