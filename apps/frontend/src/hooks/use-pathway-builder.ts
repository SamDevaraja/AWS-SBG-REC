"use client";

import { useState, useCallback, useEffect } from "react";
import { RoleCertification } from "@/lib/types";

interface UsePathwayBuilderProps {
  initialPathway: RoleCertification[];
}

export function usePathwayBuilder({ initialPathway }: UsePathwayBuilderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Initialize from existing pathway
  useEffect(() => {
    if (initialPathway.length > 0 && selectedIds.length === 0) {
      setSelectedIds(initialPathway.map((rc) => rc.certificationId));
    }
  }, [initialPathway]);

  const selectCertification = useCallback((certId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(certId)) return prev;
      return [...prev, certId];
    });
  }, []);

  const deselectCertification = useCallback((certId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== certId));
  }, []);

  const toggleCertification = useCallback(
    (certId: string) => {
      if (selectedIds.includes(certId)) {
        deselectCertification(certId);
      } else {
        selectCertification(certId);
      }
    },
    [selectedIds, selectCertification, deselectCertification]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (certId: string) => selectedIds.includes(certId),
    [selectedIds]
  );

  const getOrder = useCallback(
    (certId: string) => {
      const index = selectedIds.indexOf(certId);
      return index === -1 ? null : index + 1;
    },
    [selectedIds]
  );

  const hasChanges = useCallback(() => {
    const initialIds = initialPathway.map((rc) => rc.certificationId);
    if (selectedIds.length !== initialIds.length) return true;
    return selectedIds.some((id, i) => id !== initialIds[i]);
  }, [selectedIds, initialPathway]);

  return {
    selectedIds,
    selectCertification,
    deselectCertification,
    toggleCertification,
    clearSelection,
    isSelected,
    getOrder,
    hasChanges,
    count: selectedIds.length,
  };
}
