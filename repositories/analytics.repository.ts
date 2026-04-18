import { prisma } from '@/lib/prisma';
import type { AnalyticsFilters } from '@/types/analytics';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function buildWhereClause(userId: string, filters?: AnalyticsFilters) {
  const since = new Date();
  since.setDate(since.getDate() - (filters?.days ?? 180));

  const segmentFilter =
    filters?.segment && filters.segment !== 'all'
      ? { segment: filters.segment }
      : {};

  const revenueFilter: Record<string, unknown> = {};
  if (filters?.minRevenue != null) revenueFilter.gte = filters.minRevenue;
  if (filters?.maxRevenue != null) revenueFilter.lte = filters.maxRevenue;

  return {
    userId,
    createdAt: { gte: since },
    ...(Object.keys(segmentFilter).length ? segmentFilter : {}),
    ...(Object.keys(revenueFilter).length
      ? { predictedValue: revenueFilter }
      : {}),
  };
}

// ─────────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────────

export const analyticsRepository = {
  // ── Existing KPI queries ──────────────────────────────────

  async getPredictionCount(userId: string) {
    return prisma.prediction.count({ where: { userId } });
  },

  async getAverageClv(userId: string): Promise<number> {
    const result = await prisma.prediction.aggregate({
      where: { userId },
      _avg: { predictedValue: true },
    });
    return result._avg.predictedValue ?? 0;
  },

  async getHighValueCount(userId: string): Promise<number> {
    return prisma.prediction.count({
      where: { userId, segment: { in: ['High Value', 'VIP', 'Champions'] } },
    });
  },

  async getTotalPredictedRevenue(userId: string): Promise<number> {
    const result = await prisma.prediction.aggregate({
      where: { userId },
      _sum: { predictedValue: true },
    });
    return result._sum.predictedValue ?? 0;
  },

  async getSegmentDistribution(userId: string, filters?: AnalyticsFilters) {
    return prisma.prediction.groupBy({
      by: ['segment'],
      where: { ...buildWhereClause(userId, filters), segment: { not: null } },
      _count: { segment: true },
      _avg: { predictedValue: true },
      _sum: { predictedValue: true },
    });
  },

  async getRecentPredictions(userId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return prisma.prediction.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { predictedValue: true, segment: true, createdAt: true },
    });
  },

  // ── New BI queries ────────────────────────────────────────

  /** Previous period KPIs for trend % calculation */
  async getPreviousPeriodKPIs(userId: string, days: number) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() - days);
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - days);

    const [count, agg, highValue] = await Promise.all([
      prisma.prediction.count({
        where: { userId, createdAt: { gte: periodStart, lt: periodEnd } },
      }),
      prisma.prediction.aggregate({
        where: { userId, createdAt: { gte: periodStart, lt: periodEnd } },
        _avg: { predictedValue: true },
        _sum: { predictedValue: true },
      }),
      prisma.prediction.count({
        where: {
          userId,
          createdAt: { gte: periodStart, lt: periodEnd },
          segment: { in: ['High Value', 'VIP', 'Champions'] },
        },
      }),
    ]);

    return {
      count,
      avgClv: agg._avg.predictedValue ?? 0,
      totalRevenue: agg._sum.predictedValue ?? 0,
      highValue,
    };
  },

  /** CLV percentiles for dynamic segment thresholds */
  async getClvPercentiles(userId: string) {
    // Fetch all predicted values sorted ascending
    const rows = await prisma.prediction.findMany({
      where: { userId },
      select: { predictedValue: true },
      orderBy: { predictedValue: 'asc' },
    });
    const vals = rows.map((r) => r.predictedValue);
    const len = vals.length;
    if (len === 0) return { p25: 0, p50: 0, p75: 0, p90: 0 };

    const pct = (p: number) => vals[Math.floor((p / 100) * len)] ?? vals[len - 1] ?? 0;
    return {
      p25: Math.round(pct(25)),
      p50: Math.round(pct(50)),
      p75: Math.round(pct(75)),
      p90: Math.round(pct(90)),
    };
  },

  /** Max CLV in dataset — used for dynamic filter slider */
  async getMaxClv(userId: string): Promise<number> {
    const result = await prisma.prediction.aggregate({
      where: { userId },
      _max: { predictedValue: true },
    });
    return result._max.predictedValue ?? 0;
  },

  /** Top customers by CLV, with filters applied */
  async getTopCustomers(userId: string, limit = 10, filters?: AnalyticsFilters) {
    // Text search on inputData JSON is done in-process after fetching
    // (Postgres JSON text-search would need raw query; this is simpler and
    //  the result set is small enough)
    const rows = await prisma.prediction.findMany({
      where: buildWhereClause(userId, filters),
      orderBy: { predictedValue: 'desc' },
      take: filters?.search ? limit * 5 : limit, // over-fetch if searching
      select: {
        id: true,
        inputData: true,
        segment: true,
        predictedValue: true,
        confidenceScore: true,
        createdAt: true,
      },
    });

    // Apply text search filter in-process
    const filtered = filters?.search
      ? rows.filter((r) => {
          try {
            const d = JSON.parse(r.inputData);
            return String(d.customer_id ?? '').toLowerCase().includes(filters.search!.toLowerCase());
          } catch {
            return false;
          }
        })
      : rows;

    return filtered.slice(0, limit);
  },

  /** Revenue grouped by segment for distribution chart */
  async getRevenueBySegmentFiltered(userId: string, filters?: AnalyticsFilters) {
    return prisma.prediction.groupBy({
      by: ['segment'],
      where: { ...buildWhereClause(userId, filters), segment: { not: null } },
      _count: { segment: true },
      _sum: { predictedValue: true },
      _avg: { predictedValue: true },
    });
  },

  /** CLV bucket data for histogram — fetches all values in range */
  async getClvValuesForHistogram(userId: string, filters?: AnalyticsFilters) {
    return prisma.prediction.findMany({
      where: buildWhereClause(userId, filters),
      select: { predictedValue: true, segment: true },
    });
  },

  /** Time-series: predictions with date, for trend aggregation */
  async getPredictionsTimeSeries(userId: string, filters?: AnalyticsFilters) {
    return prisma.prediction.findMany({
      where: buildWhereClause(userId, filters),
      orderBy: { createdAt: 'asc' },
      select: { predictedValue: true, segment: true, createdAt: true },
    });
  },
};
