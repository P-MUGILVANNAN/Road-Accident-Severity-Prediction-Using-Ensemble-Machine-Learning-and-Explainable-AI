import {
  DashboardSummary,
  PaginatedAccidents,
  AccidentRecord,
  PredictionResult,
  LocalExplanationResult,
  GlobalShapRanking,
  Experiment
} from '../types';

const API_BASE = '/api';

export async function fetchDashboardSummary(filters?: Record<string, string>): Promise<DashboardSummary> {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/dashboard/summary?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchAccidents(params: Record<string, any>): Promise<PaginatedAccidents> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });
  const res = await fetch(`${API_BASE}/accidents?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch accident records');
  return res.json();
}

export async function fetchAccidentDetail(id: number): Promise<AccidentRecord> {
  const res = await fetch(`${API_BASE}/accidents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch accident details');
  return res.json();
}

export async function uploadAccidentsCsv(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/accidents/upload/csv`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function fetchEdaData(): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/eda`);
  if (!res.ok) throw new Error('Failed to fetch EDA data');
  return res.json();
}

export async function fetchGeographicData(params?: Record<string, string>): Promise<any> {
  const query = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/analytics/geographic?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch geographic data');
  return res.json();
}

export async function fetchRiskFactors(): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/risk-factors`);
  if (!res.ok) throw new Error('Failed to fetch risk factors');
  return res.json();
}

export async function fetchExperiments(): Promise<Experiment[]> {
  const res = await fetch(`${API_BASE}/models/experiments`);
  if (!res.ok) throw new Error('Failed to fetch experiments');
  return res.json();
}

export async function triggerModelTraining(data: { algorithm: string; imbalance_strategy: string; random_seed: number }): Promise<any> {
  const res = await fetch(`${API_BASE}/models/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to trigger training');
  return res.json();
}

export async function predictSingleSeverity(data: any): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predictions/severity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to predict accident severity');
  return res.json();
}

export async function predictBatchSeverity(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/predictions/batch`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to run batch prediction');
  return res.json();
}

export async function fetchPredictionHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/predictions/history`);
  if (!res.ok) throw new Error('Failed to fetch prediction history');
  return res.json();
}

export async function explainSinglePrediction(data: any): Promise<LocalExplanationResult> {
  const res = await fetch(`${API_BASE}/explanations/instance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to generate SHAP explanation');
  return res.json();
}

export async function fetchGlobalExplanations(): Promise<{ feature_rankings: GlobalShapRanking[]; samples_analyzed: number; algorithm: string }> {
  const res = await fetch(`${API_BASE}/explanations/global`);
  if (!res.ok) throw new Error('Failed to fetch global SHAP explanations');
  return res.json();
}

export async function fetchReportsSummary(): Promise<any> {
  const res = await fetch(`${API_BASE}/reports/summary`);
  if (!res.ok) throw new Error('Failed to fetch reports summary');
  return res.json();
}
