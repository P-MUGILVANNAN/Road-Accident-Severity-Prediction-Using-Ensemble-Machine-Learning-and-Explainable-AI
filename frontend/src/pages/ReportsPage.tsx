import React, { useEffect, useState } from 'react';
import { FileText, Download, Printer, CheckCircle, ShieldAlert } from 'lucide-react';
import { fetchReportsSummary } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsSummary()
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
        Compiling comprehensive research summary and experimental findings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Research Reports & Publication Artifacts</h2>
          <p className="text-xs text-slate-500">
            Export experimental summaries, benchmark results, and formatted IEEE research documentation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export/benchmarks-csv"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Download CSV</span>
          </a>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Document Sheet */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xs space-y-6 text-slate-800">
        <div className="border-b border-slate-200 pb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Technical Research Report
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{report?.report_title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard: UK Department for Transport STATS19 Collision Framework &middot; Target Venue: IEEE ITS
          </p>
        </div>

        {/* Dataset Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">1. Dataset Overview & Class Distribution</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The empirical analysis evaluated {report?.dataset_metadata?.total_records?.toLocaleString()} collision records conforming to UK DfT STATS19 standards. The dataset displays typical asymmetric class distribution:
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
              <span className="text-emerald-700 font-semibold block text-[11px]">Slight Collisions</span>
              <span className="text-lg font-bold text-emerald-950">
                {report?.dataset_metadata?.slight_percentage}%
              </span>
              <span className="text-[10px] text-emerald-600 block">
                ({report?.dataset_metadata?.severity_counts?.Slight} records)
              </span>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
              <span className="text-amber-700 font-semibold block text-[11px]">Serious Collisions</span>
              <span className="text-lg font-bold text-amber-950">
                {report?.dataset_metadata?.serious_percentage}%
              </span>
              <span className="text-[10px] text-amber-600 block">
                ({report?.dataset_metadata?.severity_counts?.Serious} records)
              </span>
            </div>
            <div className="rounded-lg bg-rose-50 border border-rose-100 p-3">
              <span className="text-rose-700 font-semibold block text-[11px]">Fatal Collisions</span>
              <span className="text-lg font-bold text-rose-950">
                {report?.dataset_metadata?.fatal_percentage}%
              </span>
              <span className="text-[10px] text-rose-600 block">
                ({report?.dataset_metadata?.severity_counts?.Fatal} records)
              </span>
            </div>
          </div>
        </div>

        {/* Benchmark Results */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900">2. Empirical Benchmark Outcomes</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-semibold text-slate-500">
                  <th className="py-2 px-3">Run ID</th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Accuracy</th>
                  <th className="py-2 px-3">Macro F1</th>
                  <th className="py-2 px-3">Fatal Recall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {report?.benchmarks?.map((b: any) => (
                  <tr key={b.id}>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{b.name}</td>
                    <td className="py-2 px-3">{(b.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{b.macro_f1.toFixed(4)}</td>
                    <td className="py-2 px-3 font-bold text-rose-600">{(b.fatal_recall * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Research Questions & Findings */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900">3. Research Inquiries & Verified Findings</h3>
          <div className="space-y-2 text-xs">
            {report?.research_questions_findings?.map((rq: any, idx: number) => (
              <div key={idx} className="rounded-lg bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">{rq.question}</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">{rq.finding}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Limitations */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-slate-900">4. Decision-Support Boundaries & Limitations</h3>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
            {report?.system_limitations?.map((lim: string, idx: number) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
