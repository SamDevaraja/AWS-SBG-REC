"use client";

import { useQuery } from "@tanstack/react-query";
import { getArticle } from "@/services/feed.api";

export function useArticle(id: string | null) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => {
      if (id === null) {
        throw new Error("Article id is required");
      }

      return getArticle(id);
    },
    enabled: id !== null,
  });
}
