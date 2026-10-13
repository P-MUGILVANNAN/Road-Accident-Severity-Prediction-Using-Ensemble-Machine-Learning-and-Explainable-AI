import React, { useEffect, useState } from 'react';
import {
  Car,
  AlertTriangle,
  Skull,
  ShieldCheck,
  TrendingUp,
  Filter,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { fetchDashboardSummary } from '../services/api';
import { DashboardSummary } from '../types';

const SEVERITY_COLORS: Record<string, string> = {
  Slight: '#10b981',
  Serious: '#f59e0b',
  Fatal: '#e11d48',
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    road_type: '',
    weather: '',
    urban_rural: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardSummary(filters);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const severityPieData = data
    ? [
        { name: 'Slight', value: data.severity_distribution.Slight, color: '#10b981' },
        { name: 'Serious', value: data.severity_distribution.Serious, color: '#f59e0b' },
        { name: 'Fatal', value: data.severity_distribution.Fatal, color: '#e11d48' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Road Safety Overview</h2>
          <p className="text-xs text-slate-500">
            Real-time aggregate analytics from UK STATS19 collision registry
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="">All Severities</option>
            <option value="Slight">Slight</option>
            <option value="Serious">Serious</option>
            <option value="Fatal">Fatal</option>
          </select>

          <select
            value={filters.road_type}
            onChange={(e) => setFilters({ ...filters, road_type: e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="">All Road Types</option>
            <option value="Single carriageway">Single carriageway</option>
            <option value="Dual carriageway">Dual carriageway</option>
            <option value="Roundabout">Roundabout</option>
            <option value="Slip road">Slip road</option>
          </select>

          <select
            value={filters.urban_rural}
            onChange={(e) => setFilters({ ...filters, urban_rural: e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="">Urban & Rural</option>
            <option value="Urban">Urban</option>
            <option value="Rural">Rural</option>
          </select>

          <button
            onClick={() => setFilters({ severity: '', road_type: '', weather: '', urban_rural: '' })}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collisions"
          value={data ? data.total_records.toLocaleString() : '...'}
          subtitle="STATS19 audited records"
          icon={Car}
          badge="100% Quality"
          badgeColor="blue"
        />
        <StatCard
          title="Slight Severity"
          value={data ? data.severity_distribution.Slight.toLocaleString() : '...'}
          subtitle={data ? `${data.proportions.slight_pct}% of total records` : ''}
          icon={ShieldCheck}
          badgeColor="emerald"
          badge={data ? `${data.proportions.slight_pct}%` : undefined}
        />
        <StatCard
          title="Serious Severity"
          value={data ? data.severity_distribution.Serious.toLocaleString() : '...'}
          subtitle={data ? `${data.proportions.serious_pct}% required hospitalization` : ''}
          icon={AlertTriangle}
          badgeColor="amber"
          badge={data ? `${data.proportions.serious_pct}%` : undefined}
        />
        <StatCard
          title="Fatal Collisions"
          value={data ? data.severity_distribution.Fatal.toLocaleString() : '...'}
          subtitle={data ? `${data.proportions.fatal_pct}% fatal road accidents` : ''}
          icon={Skull}
          badgeColor="rose"
          badge={data ? `${data.proportions.fatal_pct}%` : undefined}
        />
      </div>

      {/* Model Benchmark Banner */}
      {data?.best_model_summary && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Best Trained Model Architecture
                </span>
                <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-300">
                  {data.best_model_summary.experiment_id}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {data.best_model_summary.experiment_name} ({data.best_model_summary.algorithm})
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="rounded-lg bg-white/80 border border-blue-200 px-3 py-1.5 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Accuracy</p>
              <p className="font-bold text-slate-900">
                {(data.best_model_summary.accuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-white/80 border border-blue-200 px-3 py-1.5 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Macro F1</p>
              <p className="font-bold text-blue-700">
                {data.best_model_summary.macro_f1.toFixed(4)}
              </p>
            </div>
            <div className="rounded-lg bg-white/80 border border-blue-200 px-3 py-1.5 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Fatal Recall</p>
              <p className="font-bold text-rose-600">
                {(data.best_model_summary.fatal_recall * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Severity Distribution Pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Historical Accident Severity Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Proportional split showing severe class imbalance in STATS19 records
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Collisions']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collisions by Road Type */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Accidents by Road Type</h3>
          <p className="text-xs text-slate-500 mb-4">
            Collision frequency across carriageway layouts
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.by_road_type || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" fontSize={11} stroke="#64748b" />
                <YAxis dataKey="category" type="category" width={110} fontSize={11} stroke="#64748b" />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Collisions']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collisions by Weather */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Accidents by Weather Conditions</h3>
          <p className="text-xs text-slate-500 mb-4">
            Volume of collisions under precipitation and wind conditions
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.by_weather || []} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="category"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  fontSize={10}
                  stroke="#64748b"
                />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Collisions']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Line */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Collisions by Day of Week</h3>
          <p className="text-xs text-slate-500 mb-4">
            Day-to-day frequency fluctuation across weekdays and weekends
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.by_day_of_week || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Collisions']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
