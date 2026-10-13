import React from 'react';
import { Settings, Database, Server, Cpu, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Platform & Environment Configuration</h2>
        <p className="text-xs text-slate-500">
          Backend server settings, active database instances, and serialized ML model registries
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Backend & DB Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Backend Server & Database</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
              <span className="text-slate-500">FastAPI Service Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" /> Healthy (Port 8000)
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
              <span className="text-slate-500">Database Engine</span>
              <span className="font-semibold text-slate-800">SQLAlchemy 2.1 (SQLite / PostgreSQL)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
              <span className="text-slate-500">Dataset Records Loaded</span>
              <span className="font-bold text-blue-700">5,000 Verified STATS19 Records</span>
            </div>
          </div>
        </div>

        {/* ML & XAI Registry Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Machine Learning Artifacts</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
              <span className="text-slate-500">Active Inference Artifact</span>
              <span className="font-semibold text-slate-800">ensemble_soft_voting_class_weight.joblib</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
              <span className="text-slate-500">Explainability Provider</span>
              <span className="font-semibold text-slate-800">SHAP (TreeExplainer v0.53)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
              <span className="text-slate-500">Target Encoding</span>
              <span className="font-semibold text-slate-800">Slight: 0, Serious: 1, Fatal: 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
