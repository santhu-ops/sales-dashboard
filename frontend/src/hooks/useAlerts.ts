import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '../services/api';

export const useAlerts = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    refetchInterval: 30000, // poll every 30s for new alerts
  });

  return {
    alerts: data?.alerts ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    refetch,
  };
};
