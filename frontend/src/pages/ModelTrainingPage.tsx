import React, { useState, useEffect } from 'react';
import { Cpu, Play, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { triggerModelTraining, fetchExperiments } from '../services/api';
import { Experiment } from '../types';

export const ModelTrainingPage: React.FC = () => {
  const [algorithm, setAlgorithm] = useState('Ensemble (Soft Voting)');
  const [imbalanceStrategy, setImbalanceStrategy] = useState('class_weight');
  const [randomSeed, setRandomSeed] = useState(42);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  const loadExps = () => {
    fetchExperiments().then(setExperiments).catch(console.error);
  };

  useEffect(() => {
    loadExps();
  }, []);

  const handleTrainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatusMessage('Queuing background training job...');
      const res = await triggerModelTraining({
        algorithm,
        imbalance_strategy: imbalanceStrategy,
        random_seed: Number(randomSeed),
      });
      setStatusMessage(res.message);
      setTimeout(loadExps, 3000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Machine Learning Training Pipeline</h2>
        <p className="text-xs text-slate-500">
          Train reproducible multiclass severity classification models with strict data leakage prevention
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Configure Training Job</h3>
          </div>

          <form onSubmit={handleTrainSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Classifier Architecture</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Ensemble (Soft Voting)">Proposed Ensemble (Soft Voting)</option>
                <option value="XGBoost">XGBoost Classifier</option>
                <option value="LightGBM">LightGBM Classifier</option>
                <option value="Random Forest">Random Forest Classifier</option>
                <option value="Extra Trees">Extra Trees Classifier</option>
                <option value="Gradient Boosting">Gradient Boosting Classifier</option>
                <option value="Decision Tree">Decision Tree Classifier</option>
                <option value="Logistic Regression">Logistic Regression (Baseline)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Class Imbalance Strategy</label>
              <select
                value={imbalanceStrategy}
                onChange={(e) => setImbalanceStrategy(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="class_weight">Cost-Sensitive Class Weights (Balanced)</option>
                <option value="smote">SMOTE Over-sampling (Train split only)</option>
                <option value="none">No Resampling (Standard Empirical)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Note: Resampling is fitted exclusively inside train folds to prevent data leakage.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Random Seed</label>
              <input
                type="number"
                value={randomSeed}
                onChange={(e) => setRandomSeed(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Launch Training Job'}</span>
            </button>
          </form>

          {statusMessage && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Experiment History */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Recorded Training Runs & Experiments</h3>
            <button
              onClick={loadExps}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Architecture</th>
                  <th className="py-2.5 px-3">Imbalance</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Macro F1</th>
                  <th className="py-2.5 px-3">Fatal Recall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {experiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{exp.experiment_id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{exp.algorithm}</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {exp.imbalance_strategy}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{(exp.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">{exp.macro_f1.toFixed(4)}</td>
                    <td className="py-2.5 px-3 font-semibold text-rose-600">
                      {(exp.fatal_recall * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
