import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, RegisterPayload } from '../services/apiService';
import { LeaderboardApiService } from '@/services/leaderboard.api';

const leaderboardApi = new LeaderboardApiService();

export function useEvents(filters?: {
  search?: string;
  category?: string;
  availability?: string;
}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => apiService.getEvents(filters),
  });
}

export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: ['event-details', eventId],
    queryFn: () => apiService.getEventById(eventId),
    enabled: !!eventId,
  });
}

export function useRegister(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => apiService.registerForEvent(eventId, payload),
    onSuccess: () => {
      // Invalidate events list and details cache to trigger re-renders on seats left
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => apiService.getMyTickets(),
  });
}

export function useLeaderboardMe() {
  return useQuery({
    queryKey: ['leaderboard-me'],
    queryFn: () => leaderboardApi.getMe(),
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
    retry: false,
  });
}
