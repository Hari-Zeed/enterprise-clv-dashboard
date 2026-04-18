import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((j) => j.data);

export interface ActiveModelData {
   hasActiveModel: boolean;
   modelDetails?: {
       version: number;
       updatedAt: string;
       accuracy: number;
       rmse: number;
       features: string[];
   }
}

export function useActiveModel() {
  const { data, error, isLoading, mutate } = useSWR<ActiveModelData>('/api/models/active', fetcher, {
     refreshInterval: 10_000 // Poll every 10s so training status updates live
  });

  return {
    model: data ?? { hasActiveModel: false },
    isLoading,
    isError: !!error,
    mutate,
  };
}
