import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { fetchRiskFactors } from '../services/api';

export const RoadSafetyInsightsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskFactors()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
        Calculating relative risk ratios and highway safety policy implications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Road Safety Risk Analytics & Interventions</h2>
        <p className="text-xs text-slate-500">
          Empirical relative risk ratios and targeted countermeasure recommendations based on {data?.total_analyzed?.toLocaleString()} collision records
        </p>
      </div>

      {/* Baseline Metric */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-xs flex items-center justify-between">
        <div>
          <span className="font-bold text-blue-950">Baseline Severe Accident Rate:</span>{' '}
          <span>{data?.baseline_severe_percentage}% of historical collisions resulted in Serious or Fatal injuries.</span>
        </div>
        <span className="rounded-full bg-blue-600 px-3 py-1 font-bold text-white text-[11px]">
          Benchmark Rate: {data?.baseline_severe_percentage}%
        </span>
      </div>

      {/* Risk Factors Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {data?.risk_factors?.map((rf: any, index: number) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Risk Factor #{index + 1}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{rf.factor_name}</h3>
                <p className="text-xs text-slate-500">{rf.condition}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-rose-600">{rf.relative_risk}x</span>
                <p className="text-[10px] text-slate-400">Relative Risk</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Severe Collision Rate</p>
                <p className="font-bold text-slate-900">{rf.severe_accident_rate}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sample Analyzed</p>
                <p className="font-semibold text-slate-700">{rf.sample_size.toLocaleString()} crashes</p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-950 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900 block mb-0.5">Recommended Countermeasure:</span>
                <p className="text-emerald-800 text-[11px] leading-relaxed">{rf.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
