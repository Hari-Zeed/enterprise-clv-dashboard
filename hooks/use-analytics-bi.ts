'use client';

import { useMemo, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useDebounce } from './use-debounce';
import type { FullAnalytics, AnalyticsFilters } from '@/types/analytics';

// ─────────────────────────────────────────────────────────────
// Fetcher
// ─────────────────────────────────────────────────────────────

async function fetcher(url: string): Promise<FullAnalytics> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as FullAnalytics;
}

function buildUrl(filters: AnalyticsFilters): string {
  const params = new URLSearchParams();
  if (filters.days)       params.set('days',       String(filters.days));
  if (filters.segment)    params.set('segment',    filters.segment);
  if (filters.minRevenue != null) params.set('minRevenue', String(filters.minRevenue));
  if (filters.maxRevenue != null) params.set('maxRevenue', String(filters.maxRevenue));
  if (filters.search)     params.set('search',     filters.search);
  return `/api/analytics/segments?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export type DateRangeOption = '7' | '30' | '90' | '180' | '365';

export interface AnalyticsBIState {
  // Filter state
  dateRange: DateRangeOption;
  segment: string;
  minRevenue: number;
  maxRevenue: number | undefined;
  searchId: string;

  // Setters
  setDateRange: (v: DateRangeOption) => void;
  setSegment: (v: string) => void;
  setMinRevenue: (v: number) => void;
  setMaxRevenue: (v: number | undefined) => void;
  setSearchId: (v: string) => void;
  resetFilters: () => void;

  // Data
  data: FullAnalytics | undefined;
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;

  // Derived convenience
  hasData: boolean;
  activeFilterCount: number;
}

export function useAnalyticsBI(): AnalyticsBIState {
  const [dateRange, setDateRange] = useState<DateRangeOption>('180');
  const [segment, setSegment] = useState('all');
  const [minRevenue, setMinRevenue] = useState(0);
  const [maxRevenue, setMaxRevenue] = useState<number | undefined>(undefined);
  const [searchId, setSearchId] = useState('');

  const debouncedSearchId = useDebounce(searchId, 400);
  const debouncedMinRevenue = useDebounce(minRevenue, 400);

  const filters = useMemo<AnalyticsFilters>(() => ({
    days: parseInt(dateRange, 10),
    segment,
    minRevenue: debouncedMinRevenue > 0 ? debouncedMinRevenue : undefined,
    maxRevenue,
    search: debouncedSearchId.trim() || undefined,
  }), [dateRange, segment, debouncedMinRevenue, maxRevenue, debouncedSearchId]);

  const url = useMemo(() => buildUrl(filters), [filters]);

  const { data, isLoading, error, mutate } = useSWR<FullAnalytics>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,   // 30 s cache
    keepPreviousData: true,     // don't flash skeleton on filter change
  });

  const resetFilters = useCallback(() => {
    setDateRange('180');
    setSegment('all');
    setMinRevenue(0);
    setMaxRevenue(undefined);
    setSearchId('');
  }, []);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (dateRange !== '180') n++;
    if (segment !== 'all') n++;
    if (minRevenue > 0) n++;
    if (maxRevenue != null) n++;
    if (searchId.trim()) n++;
    return n;
  }, [dateRange, segment, minRevenue, maxRevenue, searchId]);

  const hasData = Boolean(data && (data.kpis.totalCustomers > 0 || data.clvBuckets.length > 0));

  return {
    dateRange, setDateRange,
    segment, setSegment,
    minRevenue, setMinRevenue,
    maxRevenue, setMaxRevenue,
    searchId, setSearchId,
    resetFilters,
    data,
    isLoading,
    isError: Boolean(error),
    mutate,
    hasData,
    activeFilterCount,
  };
}
