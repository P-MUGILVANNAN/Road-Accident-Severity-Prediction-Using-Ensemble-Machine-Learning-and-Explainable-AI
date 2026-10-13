import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HelpCircle, Sparkles, BookOpen, ShieldAlert } from 'lucide-react';
import { fetchGlobalExplanations } from '../services/api';
import { GlobalShapRanking } from '../types';

export const ExplainableAiPage: React.FC = () => {
  const [data, setData] = useState<{
    feature_rankings: GlobalShapRanking[];
    samples_analyzed: number;
    algorithm: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalExplanations()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = data?.feature_rankings.slice(0, 10).map((f) => ({
    feature: f.feature,
    Overall: Number(f.importance.toFixed(3)),
    Fatal: Number(f.fatal_importance.toFixed(3)),
    Serious: Number(f.serious_importance.toFixed(3)),
    Slight: Number(f.slight_importance.toFixed(3)),
  })) || [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
        Computing game-theoretic SHAP Shapley values across multiclass dimensions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Explainable AI (SHAP Interpretability)</h2>
        <p className="text-xs text-slate-500">
          Game-theoretic Shapley Additive exPlanations (Tree SHAP) revealing global and class-specific feature influence
        </p>
      </div>

      {/* Global Importance Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top 10 Global Features by Mean |SHAP Value|
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated across {data?.samples_analyzed} holdout collision samples ({data?.algorithm})
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            Tree SHAP Multiclass
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" fontSize={11} stroke="#64748b" />
              <YAxis dataKey="feature" type="category" width={140} fontSize={10} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Fatal" fill="#e11d48" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Serious" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Slight" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Ranking Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Granular Feature Attribution Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-semibold text-slate-500">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Feature Name</th>
                <th className="py-2.5 px-3">Mean |SHAP| (Overall)</th>
                <th className="py-2.5 px-3">Fatal Impact</th>
                <th className="py-2.5 px-3">Serious Impact</th>
                <th className="py-2.5 px-3">Slight Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data?.feature_rankings.map((f, i) => (
                <tr key={f.feature} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-400">#{i + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{f.feature}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">{f.importance.toFixed(4)}</td>
                  <td className="py-2.5 px-3 font-medium text-rose-600">{f.fatal_importance.toFixed(4)}</td>
                  <td className="py-2.5 px-3 font-medium text-amber-600">{f.serious_importance.toFixed(4)}</td>
                  <td className="py-2.5 px-3 font-medium text-emerald-600">{f.slight_importance.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Research Discussion */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Mathematical Formulation of Tree SHAP</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tree SHAP computes exact Shapley values in polynomial time <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">O(TLD^2)</code> by traversing tree paths in ensemble decision trees. For a feature <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">i</code>, its attribution reflects the expected marginal contribution across all feature subsets:
          </p>
          <div className="rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-800">
            phi_i = sum_S [ |S|!(|F| - |S| - 1)! / |F|! ] * [ f(S U {'{i}'}) - f(S) ]
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Interpretability Limitations & Biases</h3>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
            <li>
              <strong>Non-Causal Representation:</strong> High SHAP attribution signifies empirical association in STATS19 records, not causal proof that altering speed limit alone prevents crashes.
            </li>
            <li>
              <strong>Feature Correlation:</strong> High collinearity between weather conditions and road surface state distributes Shapley credit across both variables.
            </li>
            <li>
              <strong>Reporting Latency:</strong> Human reporting biases in minor vs serious classifications may marginally influence attribution margins.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
