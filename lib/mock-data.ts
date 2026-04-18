import type {
  DashboardKPIs,
  AnalyticsTrends,
  FullAnalytics,
} from '@/types/analytics';

export function getMockDashboardKPIs(): DashboardKPIs {
  return {
    totalCustomers: 12450,
    avgClv: 854.20,
    highValueCustomers: 3120,
    predictedRevenue: 10634500,
    totalCustomersTrend: 15,
    avgClvTrend: 8,
    highValueTrend: 12,
    revenueTrend: 22,
  };
}

export function getMockAnalyticsTrends(): AnalyticsTrends {
  return {
    clvTrends: [
      { month: 'Oct', avgClv: 720, medianClv: 600, q75Clv: 850 },
      { month: 'Nov', avgClv: 750, medianClv: 620, q75Clv: 890 },
      { month: 'Dec', avgClv: 780, medianClv: 650, q75Clv: 920 },
      { month: 'Jan', avgClv: 810, medianClv: 680, q75Clv: 950 },
      { month: 'Feb', avgClv: 830, medianClv: 700, q75Clv: 980 },
      { month: 'Mar', avgClv: 854, medianClv: 720, q75Clv: 1050 },
    ],
    segmentRevenue: [
      { segment: 'VIP', revenue: 4500000, customers: 1200 },
      { segment: 'Loyal', revenue: 3200000, customers: 3500 },
      { segment: 'At Risk', revenue: 1500000, customers: 2800 },
      { segment: 'New', revenue: 1434500, customers: 4950 },
    ],
    segmentDistribution: [
      { name: 'VIP', value: 10, fill: '#8b5cf6' },
      { name: 'Loyal', value: 28, fill: '#10b981' },
      { name: 'At Risk', value: 22, fill: '#f97316' },
      { name: 'New', value: 40, fill: '#3b82f6' },
    ],
    weeklyMetrics: [
      { week: 'Week 1', newCustomers: 120, churn: 15, clvGrowth: 2 },
      { week: 'Week 2', newCustomers: 145, churn: 12, clvGrowth: 3 },
      { week: 'Week 3', newCustomers: 160, churn: 18, clvGrowth: 1 },
      { week: 'Week 4', newCustomers: 190, churn: 10, clvGrowth: 4 },
    ],
  };
}

export function getMockFullAnalytics(): FullAnalytics {
  return {
    kpis: getMockDashboardKPIs(),
    thresholds: {
      p25: 200,
      p50: 500,
      p75: 900,
      p90: 1500,
    },
    revenueDistribution: [
      { segment: 'VIP', revenue: 4500000, percentage: 42.3, customers: 1200, avgClv: 3750, fill: '#8b5cf6' },
      { segment: 'Loyal', revenue: 3200000, percentage: 30.1, customers: 3500, avgClv: 914, fill: '#10b981' },
      { segment: 'At Risk', revenue: 1500000, percentage: 14.1, customers: 2800, avgClv: 535, fill: '#f97316' },
      { segment: 'New', revenue: 1434500, percentage: 13.5, customers: 4950, avgClv: 289, fill: '#3b82f6' },
    ],
    segmentDistribution: [
      { name: 'VIP', value: 10, fill: '#8b5cf6' },
      { name: 'Loyal', value: 28, fill: '#10b981' },
      { name: 'At Risk', value: 22, fill: '#f97316' },
      { name: 'New', value: 40, fill: '#3b82f6' },
    ],
    clvBuckets: [
      { label: '₹0-500', count: 4200, segment: 'Low Value' },
      { label: '₹500-1K', count: 3800, segment: 'Medium Value' },
      { label: '₹1K-2K', count: 2500, segment: 'Loyal' },
      { label: '₹2K-5K', count: 1950, segment: 'VIP' },
    ],
    clvTrends: getMockAnalyticsTrends().clvTrends,
    topCustomers: [
      { id: '1', customerId: 'CUST-10492', segment: 'VIP', clv: 4920, confidenceScore: 98, percentile: 99, createdAt: new Date().toISOString() },
      { id: '2', customerId: 'CUST-84932', segment: 'VIP', clv: 4850, confidenceScore: 97, percentile: 99, createdAt: new Date().toISOString() },
      { id: '3', customerId: 'CUST-22394', segment: 'VIP', clv: 4710, confidenceScore: 95, percentile: 98, createdAt: new Date().toISOString() },
      { id: '4', customerId: 'CUST-11930', segment: 'VIP', clv: 4680, confidenceScore: 95, percentile: 98, createdAt: new Date().toISOString() },
      { id: '5', customerId: 'CUST-99201', segment: 'VIP', clv: 4500, confidenceScore: 94, percentile: 97, createdAt: new Date().toISOString() },
    ],
    maxClv: 5000,
  };
}

export function getMockPredictions() {
  return [
    { id: '1', inputData: '{}', predictedValue: 4920, confidenceScore: 0.98, segment: 'VIP', clvScore: 98, createdAt: new Date().toISOString() },
    { id: '2', inputData: '{}', predictedValue: 850, confidenceScore: 0.89, segment: 'Loyal', clvScore: 85, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', inputData: '{}', predictedValue: 320, confidenceScore: 0.75, segment: 'At Risk', clvScore: 45, createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];
}

export function getMockActiveModel() {
  return {
    hasActiveModel: true,
    modelDetails: {
      version: 2,
      updatedAt: new Date().toISOString(),
      accuracy: 0.94,
      rmse: 1.25,
      features: ['recency', 'frequency', 'monetary', 'tenure', 'avg_order_value']
    }
  };
}

export function getMockDatasets() {
  return [
    {
      id: 'mock-dataset-1',
      name: 'Q1 Customer Transactions',
      status: 'success',
      fileName: 'q1_transactions.csv',
      fileSize: 1048576,
      rowCount: 15420,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'mock-dataset-2',
      name: 'Holiday 2025 Campaign',
      status: 'success',
      fileName: 'holiday_data.csv',
      fileSize: 524288,
      rowCount: 8250,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    }
  ];
}
