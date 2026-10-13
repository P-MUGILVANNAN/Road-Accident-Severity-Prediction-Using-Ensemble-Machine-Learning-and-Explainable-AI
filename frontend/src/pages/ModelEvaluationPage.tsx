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
import { Target, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { fetchExperiments } from '../services/api';
import { Experiment } from '../types';

export const ModelEvaluationPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExp, setSelectedExp] = useState<Experiment | null>(null);

  useEffect(() => {
    fetchExperiments().then((data) => {
      setExperiments(data);
      if (data.length > 0) {
        // default select best model
        const best = data.reduce((prev, curr) => (curr.macro_f1 > prev.macro_f1 ? curr : prev), data[0]);
        setSelectedExp(best);
      }
    });
  }, []);

  const chartData = experiments.map((e) => ({
    name: e.experiment_id,
    label: e.algorithm,
    Accuracy: Number((e.accuracy * 100).toFixed(1)),
    Macro_F1: Number((e.macro_f1 * 100).toFixed(1)),
    Fatal_Recall: Number((e.fatal_recall * 100).toFixed(1)),
  }));

  const cm = selectedExp?.metrics_json?.confusion_matrix || [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const perClass = selectedExp?.metrics_json?.per_class || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Model Performance & Evaluation Diagnostics</h2>
        <p className="text-xs text-slate-500">
          Rigorous multiclass diagnostic evaluation highlighting sensitivity on minority fatal and serious collisions
        </p>
      </div>

      {/* Model Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 mr-2">Select Evaluated Run:</span>
        {experiments.map((exp) => (
          <button
            key={exp.id}
            onClick={() => setSelectedExp(exp)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedExp?.id === exp.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {exp.experiment_id} ({exp.algorithm})
          </button>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Comparative Evaluation Across Algorithms & Resampling Strategies
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Notice how cost-weighted ensemble lifts minority Fatal Recall from 0% to over 6%
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
              <YAxis fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(val: any) => [`${val}%`]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Accuracy" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Macro_F1" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Fatal_Recall" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail Grid for Selected Model */}
      {selectedExp && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Confusion Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Confusion Matrix &middot; {selectedExp.experiment_name}
              </h3>
              <p className="text-xs text-slate-500">
                Holdout test set predictions vs ground-truth severity
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 text-slate-400 font-normal">Ground Truth \ Predicted</th>
                    <th className="py-2 font-semibold text-emerald-700">Pred Slight</th>
                    <th className="py-2 font-semibold text-amber-700">Pred Serious</th>
                    <th className="py-2 font-semibold text-rose-700">Pred Fatal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-semibold text-emerald-700 text-left pl-2">True Slight</td>
                    <td className="py-3 bg-emerald-50 font-bold text-slate-900">{cm[0]?.[0]}</td>
                    <td className="py-3 text-slate-600">{cm[0]?.[1]}</td>
                    <td className="py-3 text-slate-600">{cm[0]?.[2]}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-amber-700 text-left pl-2">True Serious</td>
                    <td className="py-3 text-slate-600">{cm[1]?.[0]}</td>
                    <td className="py-3 bg-amber-50 font-bold text-slate-900">{cm[1]?.[1]}</td>
                    <td className="py-3 text-slate-600">{cm[1]?.[2]}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-rose-700 text-left pl-2">True Fatal</td>
                    <td className="py-3 text-slate-600">{cm[2]?.[0]}</td>
                    <td className="py-3 text-slate-600">{cm[2]?.[1]}</td>
                    <td className="py-3 bg-rose-50 font-bold text-slate-900">{cm[2]?.[2]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-Class Metrics */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Per-Class Multiclass Diagnostics</h3>
              <p className="text-xs text-slate-500">
                Precision, sensitivity (recall), and harmonic F1 score per severity level
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-semibold text-slate-500">
                    <th className="py-2.5 px-3">Severity Level</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Recall</th>
                    <th className="py-2.5 px-3">F1-Score</th>
                    <th className="py-2.5 px-3">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {['Slight', 'Serious', 'Fatal'].map((lvl) => {
                    const row = perClass[lvl] || { precision: 0, recall: 0, f1_score: 0, support: 0 };
                    return (
                      <tr key={lvl} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-slate-900">{lvl}</td>
                        <td className="py-3 px-3">{(row.precision * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3">{(row.recall * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3 font-bold text-blue-700">{(row.f1_score * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3 text-slate-500">{row.support}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Macro F1 Score</p>
                <p className="text-base font-bold text-slate-900">{selectedExp.macro_f1.toFixed(4)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">One-vs-Rest ROC-AUC</p>
                <p className="text-base font-bold text-blue-700">
                  {selectedExp.roc_auc_ovr ? selectedExp.roc_auc_ovr.toFixed(4) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
