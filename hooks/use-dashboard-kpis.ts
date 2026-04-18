import useSWR from 'swr';
import type { DashboardKPIs } from '@/types/analytics';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDashboardKPIs() {
  const { data, error, isLoading, mutate } = useSWR<DashboardKPIs>(
    '/api/analytics/dashboard',
    fetcher,
    { refreshInterval: 60_000 }
  );

  return {
    kpis: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
