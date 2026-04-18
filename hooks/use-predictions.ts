import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then(j => j.data);

export interface PredictionHistoryItem {
  id: string;
  inputData: string;
  predictedValue: number;
  confidenceScore: number;
  segment: string | null;
  clvScore: number | null;
  createdAt: string;
}

export function usePredictions(limit = 20) {
  const { data, error, isLoading, mutate } = useSWR<PredictionHistoryItem[]>(
    `/api/predictions?limit=${limit}`,
    fetcher
  );

  return {
    predictions: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
