import useSWR from 'swr';
import type { AnalyticsTrends } from '@/types/analytics';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAnalyticsTrends(days = 180) {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsTrends>(
    `/api/analytics/trends?days=${days}`,
    fetcher,
    { refreshInterval: 120_000 }
  );

  return {
    trends: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
