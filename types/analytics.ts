export interface DashboardKPIs {
  totalCustomers: number;
  avgClv: number;
  highValueCustomers: number;
  predictedRevenue: number;
  totalCustomersTrend: number;
  avgClvTrend: number;
  highValueTrend: number;
  revenueTrend: number;
}

export interface ClvTrendPoint {
  month: string;
  avgClv: number;
  medianClv: number;
  q75Clv: number;
}

export interface SegmentRevenue {
  segment: string;
  revenue: number;
  customers: number;
}

export interface SegmentDistribution {
  name: string;
  value: number;
  fill: string;
}

export interface WeeklyMetric {
  week: string;
  newCustomers: number;
  churn: number;
  clvGrowth: number;
}

export interface AnalyticsTrends {
  clvTrends: ClvTrendPoint[];
  segmentRevenue: SegmentRevenue[];
  segmentDistribution: SegmentDistribution[];
  weeklyMetrics: WeeklyMetric[];
}

// ──────────────────────────────────────────────
// New BI types
// ──────────────────────────────────────────────

/** Dynamic CLV percentile thresholds used to classify segments */
export interface SegmentThresholds {
  p25: number; // Low Value boundary
  p50: number; // Medium Value lower boundary
  p75: number; // High Value lower boundary
  p90: number; // Top-tier boundary
}

/** Filters sent by the UI and forwarded to the service/repo */
export interface AnalyticsFilters {
  days?: number;         // lookback window in days
  segment?: string;     // 'all' | 'High Value' | 'Medium Value' | 'Low Value'
  minRevenue?: number;  // filter by predictedValue >=
  maxRevenue?: number;  // filter by predictedValue <=
  search?: string;      // partial match on customer_id inside inputData JSON
}

/** One row in the top-customers table */
export interface TopCustomer {
  id: string;            // prediction id
  customerId: string;    // parsed from inputData.customer_id
  segment: string;
  clv: number;
  confidenceScore: number;
  percentile: number;    // 0-100, computed by service
  createdAt: string;
}

/** Revenue contribution by segment */
export interface RevenueDistribution {
  segment: string;
  revenue: number;
  percentage: number;   // share of total revenue
  customers: number;
  avgClv: number;
  fill: string;
}

/** CLV histogram bucket */
export interface ClvBucket {
  label: string;        // e.g. "$0 – $500"
  count: number;
  segment: string;      // dominant segment in bucket
}

/** Full payload returned by /api/analytics/segments */
export interface FullAnalytics {
  kpis: DashboardKPIs;
  thresholds: SegmentThresholds;
  revenueDistribution: RevenueDistribution[];
  topCustomers: TopCustomer[];
  clvBuckets: ClvBucket[];
  clvTrends: ClvTrendPoint[];
  segmentDistribution: SegmentDistribution[];
  maxClv: number;       // for dynamic filter slider ceiling
}
