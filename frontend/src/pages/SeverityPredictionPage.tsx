import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldAlert,
  Clock,
  Car,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { SeverityBadge } from '../components/SeverityBadge';
import { predictSingleSeverity, predictBatchSeverity, explainSinglePrediction } from '../services/api';
import { PredictionResult, LocalExplanationResult } from '../types';

export const SeverityPredictionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single Prediction Form State
  const [form, setForm] = useState({
    speed_limit: 60,
    road_type: 'Single carriageway',
    road_class: 'A',
    urban_or_rural_area: 'Rural',
    weather_conditions: 'Raining no high winds',
    road_surface_conditions: 'Wet or damp',
    light_conditions: 'Darkness - no lighting',
    junction_detail: 'Not at junction',
    number_of_vehicles: 2,
    accident_time: '22:30',
    day_of_week: 'Friday',
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [explanation, setExplanation] = useState<LocalExplanationResult | null>(null);

  // Batch Prediction State
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<any | null>(null);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await predictSingleSeverity(form);
      setPrediction(res);

      // fetch local SHAP explanation simultaneously
      const expRes = await explainSinglePrediction(form);
      setExplanation(expRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFile) return;
    try {
      setBatchLoading(true);
      const res = await predictBatchSeverity(batchFile);
      setBatchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setBatchLoading(false);
    }
  };

  const probChartData = prediction
    ? [
        { name: 'Slight', prob: Number((prediction.probabilities.Slight * 100).toFixed(1)), color: '#10b981' },
        { name: 'Serious', prob: Number((prediction.probabilities.Serious * 100).toFixed(1)), color: '#f59e0b' },
        { name: 'Fatal', prob: Number((prediction.probabilities.Fatal * 100).toFixed(1)), color: '#e11d48' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Accident Severity Prediction Engine</h2>
          <p className="text-xs text-slate-500">
            Interactive multiclass collision severity probability estimation and local SHAP explanations
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs">
          <button
            onClick={() => setActiveTab('single')}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              activeTab === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Collision Analysis
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              activeTab === 'batch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch CSV Prediction
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Input Form (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Collision Context & Pre-Crash Features
            </h3>

            <form onSubmit={handleSingleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Speed Limit</label>
                  <select
                    value={form.speed_limit}
                    onChange={(e) => setForm({ ...form, speed_limit: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value={20}>20 mph</option>
                    <option value={30}>30 mph</option>
                    <option value={40}>40 mph</option>
                    <option value={50}>50 mph</option>
                    <option value={60}>60 mph</option>
                    <option value={70}>70 mph</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Area Classification</label>
                  <select
                    value={form.urban_or_rural_area}
                    onChange={(e) => setForm({ ...form, urban_or_rural_area: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Road Layout</label>
                  <select
                    value={form.road_type}
                    onChange={(e) => setForm({ ...form, road_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Single carriageway">Single carriageway</option>
                    <option value="Dual carriageway">Dual carriageway</option>
                    <option value="Roundabout">Roundabout</option>
                    <option value="Slip road">Slip road</option>
                    <option value="One way street">One way street</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Road Class</label>
                  <select
                    value={form.road_class}
                    onChange={(e) => setForm({ ...form, road_class: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="A">A Class</option>
                    <option value="B">B Class</option>
                    <option value="C">C Class</option>
                    <option value="Motorway">Motorway</option>
                    <option value="Unclassified">Unclassified</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ambient Lighting</label>
                <select
                  value={form.light_conditions}
                  onChange={(e) => setForm({ ...form, light_conditions: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Daylight">Daylight</option>
                  <option value="Darkness - lights lit">Darkness - lights lit</option>
                  <option value="Darkness - lights unlit">Darkness - lights unlit</option>
                  <option value="Darkness - no lighting">Darkness - no lighting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Weather Condition</label>
                  <select
                    value={form.weather_conditions}
                    onChange={(e) => setForm({ ...form, weather_conditions: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Fine no high winds">Fine without winds</option>
                    <option value="Raining no high winds">Raining</option>
                    <option value="Raining + high winds">Raining + winds</option>
                    <option value="Fog or mist">Fog or mist</option>
                    <option value="Snowing">Snowing</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Surface Friction</label>
                  <select
                    value={form.road_surface_conditions}
                    onChange={(e) => setForm({ ...form, road_surface_conditions: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Dry">Dry</option>
                    <option value="Wet or damp">Wet or damp</option>
                    <option value="Frost or ice">Frost or ice</option>
                    <option value="Snow">Snow</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Junction Detail</label>
                  <select
                    value={form.junction_detail}
                    onChange={(e) => setForm({ ...form, junction_detail: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Not at junction">Not at junction</option>
                    <option value="Crossroads">Crossroads</option>
                    <option value="T or staggered junction">T / Staggered junction</option>
                    <option value="Roundabout">Roundabout</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vehicles Involved</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.number_of_vehicles}
                    onChange={(e) => setForm({ ...form, number_of_vehicles: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Collision Time (HH:MM)</label>
                  <input
                    type="text"
                    value={form.accident_time}
                    onChange={(e) => setForm({ ...form, accident_time: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Day of Week</label>
                  <select
                    value={form.day_of_week}
                    onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? 'Evaluating Model Output...' : 'Run Severity Prediction'}</span>
              </button>
            </form>
          </div>

          {/* Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {prediction ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Predicted Collision Outcome</h3>
                    <p className="text-xs text-slate-500">
                      Evaluated using {prediction.model_algorithm || 'Ensemble Architecture'}
                    </p>
                  </div>
                  <SeverityBadge severity={prediction.predicted_severity} size="lg" />
                </div>

                {/* Probability Distribution Bar */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Estimated Class Probability Spectrum</h4>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={probChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                        <YAxis fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          formatter={(v: any) => [`${v}%`, 'Probability']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
                          {probChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Local SHAP Explanations */}
                {explanation && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">
                        Top Contributing Risk Factors (Local SHAP Attribution)
                      </h4>
                      <span className="text-[10px] text-slate-400">Tree SHAP Game Theory</span>
                    </div>

                    <div className="space-y-1.5">
                      {explanation.top_contributions.slice(0, 5).map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                        >
                          <span className="font-medium text-slate-800">{f.feature}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                f.direction === 'increases_risk' ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {f.shap_value > 0 ? `+${f.shap_value.toFixed(3)}` : f.shap_value.toFixed(3)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {f.direction === 'increases_risk' ? 'elevates risk' : 'reduces risk'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer Alert */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{prediction.disclaimer}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center text-slate-400">
                <Car className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-600">No Prediction Evaluated Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Adjust pre-collision features in the form and click "Run Severity Prediction" to generate model posterior probabilities and SHAP attributions.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch Prediction Tab */
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="max-w-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload Dataset for Batch Severity Classification</h3>
            <p className="text-xs text-slate-500">
              Upload a CSV containing STATS19 formatted collision rows to compute class probabilities and severity labels across all rows simultaneously.
            </p>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setBatchFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  id="batch-file-input"
                />
                <label htmlFor="batch-file-input" className="cursor-pointer block space-y-2">
                  <FileSpreadsheet className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">
                    {batchFile ? batchFile.name : 'Select CSV file for batch classification'}
                  </p>
                  <p className="text-[11px] text-slate-400">Supports up to 2,000 records per batch job</p>
                </label>
              </div>

              <button
                type="submit"
                disabled={!batchFile || batchLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>{batchLoading ? 'Processing Batch Inference...' : 'Run Batch Inference'}</span>
              </button>
            </form>
          </div>

          {/* Results table */}
          {batchResults && (
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  Processed {batchResults.total_processed} Records Successfully
                </h4>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Collision Index</th>
                      <th className="py-2.5 px-3">Predicted Severity</th>
                      <th className="py-2.5 px-3">Confidence</th>
                      <th className="py-2.5 px-3">Slight Prob</th>
                      <th className="py-2.5 px-3">Serious Prob</th>
                      <th className="py-2.5 px-3">Fatal Prob</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {batchResults.predictions.slice(0, 10).map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-900">{r.accident_index}</td>
                        <td className="py-2 px-3">
                          <SeverityBadge severity={r.predicted_severity} size="sm" />
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {(r.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 px-3">{(r.probabilities.Slight * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3">{(r.probabilities.Serious * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 font-semibold text-rose-600">
                          {(r.probabilities.Fatal * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
