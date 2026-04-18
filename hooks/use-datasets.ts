import useSWR from 'swr';
import type { DatasetRecord } from '@/types/dataset';

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((j) => j.data);

export function useDatasets() {
  const { data, error, isLoading, mutate } = useSWR<DatasetRecord[]>('/api/datasets', fetcher);

  return {
    datasets: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
