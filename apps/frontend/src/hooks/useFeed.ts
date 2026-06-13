"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeed } from "@/services/feed.api";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: getFeed,
    refetchInterval: 6 * 60 * 60 * 1000, // Refetch every 6 hours
  });
}
