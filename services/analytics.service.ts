import { analyticsRepository } from '@/repositories/analytics.repository';
import { logger } from '@/lib/logger';
import { formatCompactCurrency } from '@/lib/utils';
import type {
  DashboardKPIs,
  AnalyticsTrends,
  ClvTrendPoint,
  SegmentRevenue,
  SegmentDistribution,
  WeeklyMetric,
  SegmentThresholds,
  AnalyticsFilters,
  TopCustomer,
  RevenueDistribution,
  ClvBucket,
  FullAnalytics,
} from '@/types/analytics';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

export const SEGMENT_COLORS: Record<string, string> = {
  'High Value': '#6366f1',
  'VIP':        '#8b5cf6',
  'Champions':  '#06b6d4',
  'Medium Value':'#3b82f6',
  'Loyal':      '#10b981',
  'At Risk':    '#f97316',
  'Low Value':  '#64748b',
  'Inactive':   '#ef4444',
};

// ─────────────────────────────────────────────────────────────
// Pure helper utilities (no DB calls, fully testable)
// ─────────────────────────────────────────────────────────────

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function sortedVals(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.floor((p / 100) * sorted.length)] ?? sorted[sorted.length - 1] ?? 0;
}

function classifyByThresholds(value: number, thresholds: SegmentThresholds): string {
  if (value >= thresholds.p75) return 'High Value';
  if (value >= thresholds.p50) return 'Medium Value';
  return 'Low Value';
}

/**
 * Build CLV histogram buckets from raw prediction values.
 * Uses 8 evenly-spaced buckets between 0 and maxVal.
 */
export function buildClvBuckets(
  predictions: { predictedValue: number; segment: string | null }[],
  thresholds: SegmentThresholds,
  bucketCount = 8,
): ClvBucket[] {
  if (predictions.length === 0) return [];

  const maxVal = Math.max(...predictions.map((p) => p.predictedValue), 1);
  const step = maxVal / bucketCount;

  const buckets: ClvBucket[] = Array.from({ length: bucketCount }, (_, i) => {
    const lo = Math.round(i * step);
    const hi = Math.round((i + 1) * step);
    return {
      label: `${formatCompactCurrency(lo)} – ${formatCompactCurrency(hi)}`,
      count: 0,
      segment: 'Low Value',
    };
  });

  for (const p of predictions) {
    const idx = Math.min(Math.floor(p.predictedValue / step), bucketCount - 1);
    buckets[idx].count += 1;
    buckets[idx].segment = p.segment ?? classifyByThresholds(p.predictedValue, thresholds);
  }

  return buckets;
}

// ─────────────────────────────────────────────────────────────
// Analytics Service
// ─────────────────────────────────────────────────────────────

export const analyticsService = {

  // ── Existing: Dashboard KPIs (enhanced with real trend %) ──

  async getDashboardKPIs(userId: string, days = 30): Promise<DashboardKPIs> {
    logger.info('AnalyticsService', 'Fetching dashboard KPIs', { userId });

    const [count, avgClv, highValue, totalRevenue, prev] = await Promise.all([
      analyticsRepository.getPredictionCount(userId),
      analyticsRepository.getAverageClv(userId),
      analyticsRepository.getHighValueCount(userId),
      analyticsRepository.getTotalPredictedRevenue(userId),
      analyticsRepository.getPreviousPeriodKPIs(userId, days),
    ]);

    return {
      totalCustomers: count,
      avgClv: Math.round(avgClv * 100) / 100,
      highValueCustomers: highValue,
      predictedRevenue: Math.round(totalRevenue),
      totalCustomersTrend: pctChange(count, prev.count),
      avgClvTrend: pctChange(avgClv, prev.avgClv),
      highValueTrend: pctChange(highValue, prev.highValue),
      revenueTrend: pctChange(totalRevenue, prev.totalRevenue),
    };
  },

  // ── Existing: legacy trends (used by main dashboard page) ──

  async getAnalyticsTrends(userId: string, days = 180): Promise<AnalyticsTrends> {
    logger.info('AnalyticsService', 'Fetching analytics trends', { userId, days });

    const [recentPredictions, segmentData] = await Promise.all([
      analyticsRepository.getRecentPredictions(userId, days),
      analyticsRepository.getSegmentDistribution(userId),
    ]);

    const monthMap = new Map<string, number[]>();
    for (const p of recentPredictions) {
      const key = new Date(p.createdAt).toLocaleString('default', { month: 'short' });
      if (!monthMap.has(key)) monthMap.set(key, []);
      monthMap.get(key)!.push(p.predictedValue);
    }

    const clvTrends: ClvTrendPoint[] = Array.from(monthMap.entries()).map(([month, vals]) => {
      const sorted = [...vals].sort((a, b) => a - b);
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
      const q75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;
      return { month, avgClv: Math.round(avg), medianClv: Math.round(median), q75Clv: Math.round(q75) };
    });

    const segmentRevenue: SegmentRevenue[] = segmentData.map((s) => ({
      segment: s.segment ?? 'Unknown',
      revenue: Math.round(s._sum.predictedValue ?? 0),
      customers: s._count.segment,
    }));

    const totalCustomers = segmentRevenue.reduce((s, r) => s + r.customers, 0) || 1;
    const segmentDistribution: SegmentDistribution[] = segmentRevenue.map((s) => ({
      name: s.segment,
      value: Math.round((s.customers / totalCustomers) * 100),
      fill: SEGMENT_COLORS[s.segment] ?? '#94a3b8',
    }));

    const weeklyMetrics: WeeklyMetric[] = [1, 2, 3, 4].map((w) => {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (w - 1) * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      const weekPredictions = recentPredictions.filter(
        (p) => new Date(p.createdAt) >= weekStart && new Date(p.createdAt) < weekEnd
      );
      const weekVals = weekPredictions.map((p) => p.predictedValue);
      const prevWeekEnd = new Date(weekStart);
      const prevWeekStart = new Date(prevWeekEnd);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      const prevPredictions = recentPredictions.filter(
        (p) => new Date(p.createdAt) >= prevWeekStart && new Date(p.createdAt) < prevWeekEnd
      );
      const prevAvg = prevPredictions.length
        ? prevPredictions.reduce((s, p) => s + p.predictedValue, 0) / prevPredictions.length
        : 0;
      const currAvg = weekVals.length
        ? weekVals.reduce((s, v) => s + v, 0) / weekVals.length
        : 0;
      return {
        week: `Week ${5 - w}`,
        newCustomers: weekPredictions.length,
        churn: 0,
        clvGrowth: Math.round(pctChange(currAvg, prevAvg)),
      };
    }).reverse();

    return { clvTrends, segmentRevenue, segmentDistribution, weeklyMetrics };
  },

  // ── New BI functions ──────────────────────────────────────

  /**
   * Calculate dynamic CLV segment thresholds from actual percentile data.
   * Replaces any hardcoded threshold approach.
   */
  async calculateSegments(userId: string): Promise<SegmentThresholds> {
    logger.info('AnalyticsService', 'Calculating dynamic segment thresholds', { userId });
    return analyticsRepository.getClvPercentiles(userId);
  },

  /**
   * Time-series CLV trends with filter support.
   * Groups by week (short range) or month (long range).
   */
  async getCLVTrends(userId: string, filters?: AnalyticsFilters): Promise<ClvTrendPoint[]> {
    logger.info('AnalyticsService', 'Fetching CLV trends', { userId, filters });
    const predictions = await analyticsRepository.getPredictionsTimeSeries(userId, filters);

    const days = filters?.days ?? 180;
    const groupByWeek = days <= 30;

    const map = new Map<string, number[]>();
    for (const p of predictions) {
      const d = new Date(p.createdAt);
      let key: string;
      if (groupByWeek) {
        const week = Math.ceil(d.getDate() / 7);
        key = `W${week} ${d.toLocaleString('default', { month: 'short' })}`;
      } else {
        key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      }
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p.predictedValue);
    }

    return Array.from(map.entries()).map(([label, vals]) => {
      const s = sortedVals(vals);
      const avg = vals.reduce((a, v) => a + v, 0) / vals.length;
      return {
        month: label,
        avgClv: Math.round(avg),
        medianClv: Math.round(percentile(s, 50)),
        q75Clv: Math.round(percentile(s, 75)),
      };
    });
  },

  /**
   * Revenue contribution by segment, with percentage share of total.
   */
  async getRevenueDistribution(userId: string, filters?: AnalyticsFilters): Promise<RevenueDistribution[]> {
    logger.info('AnalyticsService', 'Fetching revenue distribution', { userId, filters });
    const data = await analyticsRepository.getRevenueBySegmentFiltered(userId, filters);
    const totalRevenue = data.reduce((sum, s) => sum + (s._sum.predictedValue ?? 0), 0) || 1;

    return data
      .map((s) => ({
        segment: s.segment ?? 'Unknown',
        revenue: Math.round(s._sum.predictedValue ?? 0),
        percentage: Math.round(((s._sum.predictedValue ?? 0) / totalRevenue) * 100 * 10) / 10,
        customers: s._count.segment,
        avgClv: Math.round(s._avg.predictedValue ?? 0),
        fill: SEGMENT_COLORS[s.segment ?? 'Unknown'] ?? '#94a3b8',
      }))
      .sort((a, b) => b.revenue - a.revenue);
  },

  /**
   * Top customers by CLV, enriched with rank percentile.
   */
  async getTopCustomers(userId: string, filters?: AnalyticsFilters): Promise<TopCustomer[]> {
    logger.info('AnalyticsService', 'Fetching top customers', { userId, filters });

    const [rows, allCount] = await Promise.all([
      analyticsRepository.getTopCustomers(userId, 15, filters),
      analyticsRepository.getPredictionCount(userId),
    ]);

    return rows.map((row, idx) => {
      let customerId = `CUST-${row.id.slice(-6).toUpperCase()}`;
      try {
        const input = JSON.parse(row.inputData);
        if (input.customer_id) customerId = String(input.customer_id);
      } catch { /* ignore */ }

      const rank = idx + 1;
      const percentile = Math.round(((allCount - rank) / Math.max(allCount, 1)) * 100);

      return {
        id: row.id,
        customerId,
        segment: row.segment ?? 'Unknown',
        clv: Math.round(row.predictedValue),
        confidenceScore: Math.round(row.confidenceScore * 100),
        percentile,
        createdAt: row.createdAt.toISOString(),
      };
    });
  },

  /**
   * Complete BI payload: KPIs + thresholds + revenue dist + top customers +
   * CLV histogram + trend lines + donut distribution.
   * Single DB-round-trip bundle for the analytics page.
   */
  async getFullAnalytics(userId: string, filters?: AnalyticsFilters): Promise<FullAnalytics> {
    logger.info('AnalyticsService', 'Fetching full BI analytics', { userId, filters });

    const [kpis, thresholds, revenueDistribution, topCustomers, histogramRaw, trendPoints, maxClv] =
      await Promise.all([
        analyticsService.getDashboardKPIs(userId, filters?.days ?? 30),
        analyticsService.calculateSegments(userId),
        analyticsService.getRevenueDistribution(userId, filters),
        analyticsService.getTopCustomers(userId, filters),
        analyticsRepository.getClvValuesForHistogram(userId, filters),
        analyticsService.getCLVTrends(userId, filters),
        analyticsRepository.getMaxClv(userId),
      ]);

    const thresholdsData = thresholds as SegmentThresholds;

    // Build segment distribution from revenue distribution
    const totalCustomers = revenueDistribution.reduce((s, r) => s + r.customers, 0) || 1;
    const segmentDistribution: SegmentDistribution[] = revenueDistribution.map((r) => ({
      name: r.segment,
      value: Math.round((r.customers / totalCustomers) * 100),
      fill: r.fill,
    }));

    const clvBuckets = buildClvBuckets(histogramRaw, thresholdsData);

    return {
      kpis,
      thresholds: thresholdsData,
      revenueDistribution,
      topCustomers,
      clvBuckets,
      clvTrends: trendPoints,
      segmentDistribution,
      maxClv: Math.round(maxClv),
    };
  },
};

