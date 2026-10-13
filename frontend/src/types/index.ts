export type SeverityLevel = 'Slight' | 'Serious' | 'Fatal';

export interface AccidentRecord {
  id: number;
  accident_index: string;
  accident_date: string;
  accident_time: string;
  day_of_week: string;
  urban_or_rural_area: string;
  road_type: string;
  road_class: string;
  speed_limit: number;
  weather_conditions: string;
  road_surface_conditions: string;
  light_conditions: string;
  junction_detail: string;
  number_of_vehicles: number;
  latitude: number | null;
  longitude: number | null;
  region: string | null;
  accident_severity: SeverityLevel;
  is_synthetic: boolean;
}

export interface PaginatedAccidents {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: AccidentRecord[];
}

export interface DashboardSummary {
  total_records: number;
  severity_distribution: {
    Slight: number;
    Serious: number;
    Fatal: number;
  };
  proportions: {
    slight_pct: number;
    serious_pct: number;
    fatal_pct: number;
    serious_fatal_combined_pct: number;
  };
  by_road_type: Array<{ category: string; count: number }>;
  by_weather: Array<{ category: string; count: number }>;
  by_lighting: Array<{ category: string; count: number }>;
  by_day_of_week: Array<{ day: string; count: number }>;
  best_model_summary: {
    experiment_id: string;
    experiment_name: string;
    algorithm: string;
    accuracy: number;
    macro_f1: number;
    fatal_recall: number;
    roc_auc: number | null;
  } | null;
}

export interface PredictionProbabilities {
  Slight: number;
  Serious: number;
  Fatal: number;
}

export interface PredictionResult {
  predicted_severity: SeverityLevel;
  confidence: number;
  probabilities: PredictionProbabilities;
  model_algorithm?: string;
  model_strategy?: string;
  disclaimer?: string;
}

export interface ShapContribution {
  feature: string;
  feature_value: number;
  shap_value: number;
  direction: 'increases_risk' | 'decreases_risk';
  abs_impact: number;
}

export interface LocalExplanationResult {
  predicted_severity: SeverityLevel;
  probabilities: PredictionProbabilities;
  base_value: number;
  top_contributions: ShapContribution[];
  interpretability_notice: string;
}

export interface GlobalShapRanking {
  feature: string;
  importance: number;
  fatal_importance: number;
  serious_importance: number;
  slight_importance: number;
}

export interface Experiment {
  id: number;
  experiment_id: string;
  experiment_name: string;
  algorithm: string;
  imbalance_strategy: string;
  accuracy: number;
  macro_f1: number;
  weighted_f1: number;
  fatal_recall: number;
  roc_auc_ovr: number | null;
  metrics_json: any;
}
