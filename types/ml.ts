export interface PredictionInput {
  customer_id?: string;
  recency: number;
  frequency: number;
  monetary_value: number;
  tenure: number;
}

export interface PredictionRecord {
  clv: number;
  confidence: number;
  segment: string;
  customer_id: string;
}

export interface MLPredictionSummary {
  total_predictions: number;
  avg_clv: number;
  std_clv: number;
  min_clv: number;
  max_clv: number;
}

export interface MLPredictionResult {
  success: boolean;
  predictions?: PredictionRecord[];
  summary?: MLPredictionSummary;
  error?: string;
}

export interface MLTrainingMetrics {
  train_r2: number;
  test_r2: number;
  rmse: number;
  mae: number;
  best_params: Record<string, unknown>;
  cv_score: number;
}

export interface MLTrainingResult {
  success: boolean;
  metrics?: MLTrainingMetrics;
  data_shape?: number[];
  error?: string;
}
