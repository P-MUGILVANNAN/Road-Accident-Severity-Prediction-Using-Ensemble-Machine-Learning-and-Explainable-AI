import React, { useEffect, useState } from 'react';
import { FlaskConical, Award, FileCode, CheckCircle, HelpCircle } from 'lucide-react';
import { fetchExperiments } from '../services/api';
import { Experiment } from '../types';

export const ResearchExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    fetchExperiments().then(setExperiments).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Research Experiment Manager & Benchmark Suite</h2>
        <p className="text-xs text-slate-500">
          Tracking empirical benchmarks across baseline classifiers, ensemble voting, and class-imbalance strategies
        </p>
      </div>

      {/* Research Questions Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
            RQ-1: Architecture
          </span>
          <h3 className="text-xs font-bold text-slate-900">
            Does an ensemble improve multiclass severity classification?
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong>Finding:</strong> Yes. Soft-voting ensemble of Random Forest, XGBoost, and LightGBM achieves superior balance (Macro F1 = 0.3984) over single decision tree baselines.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 uppercase">
            RQ-2: Class Imbalance
          </span>
          <h3 className="text-xs font-bold text-slate-900">
            How do resampling techniques affect minority fatal recall?
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong>Finding:</strong> Unweighted models fail completely on fatal collisions (0.00% recall). Cost-sensitive class weighting boosted Fatal recall to 6.67%.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
            RQ-3: Explainable AI
          </span>
          <h3 className="text-xs font-bold text-slate-900">
            Can Tree SHAP explain multi-variable interactions?
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong>Finding:</strong> SHAP successfully quantified non-causal attribution, highlighting speed limits (60+ mph) and unlit darkness as primary severity amplifiers.
          </p>
        </div>
      </div>

      {/* Benchmark Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Controlled Benchmark Comparison (Fixed 20% Holdout Test Set)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated strictly with 0% data leakage and identical stratified train/test partitions
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Random Seed: 42</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase">
                <th className="py-2.5 px-3">Exp ID</th>
                <th className="py-2.5 px-3">Architecture Description</th>
                <th className="py-2.5 px-3">Imbalance Handling</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Macro F1</th>
                <th className="py-2.5 px-3">Fatal Recall</th>
                <th className="py-2.5 px-3">Weighted F1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {experiments.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{e.experiment_id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{e.experiment_name}</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {e.imbalance_strategy}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{(e.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">{e.macro_f1.toFixed(4)}</td>
                  <td className="py-2.5 px-3 font-bold text-rose-600">
                    {(e.fatal_recall * 100).toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3">{(e.weighted_f1 * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
