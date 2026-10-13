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
  AreaChart,
  Area,
} from 'recharts';
import { Info, BarChart2 } from 'lucide-react';
import { fetchEdaData } from '../services/api';

export const EdaPage: React.FC = () => {
  const [eda, setEda] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEdaData()
      .then(setEda)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
        Calculating multi-variable cross-tabulations and distributions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 shadow-xs flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-950">
            Exploratory Data Analysis: Multi-Variable Risk Distributions
          </h3>
          <p className="mt-0.5 text-blue-800">
            {eda?.causation_disclaimer ||
              'Observational associations reflect empirical patterns in historical data and do not confirm deterministic causation.'}
          </p>
        </div>
      </div>

      {/* Grid of Cross-Tab Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Severity by Speed Limit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Severity Distribution by Speed Limit (mph)
            </h3>
            <p className="text-xs text-slate-500">
              High speed limits (60–70 mph) show higher proportion of serious and fatal collisions
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eda?.severity_by_speed_limit || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v} mph`} />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Slight" stackId="a" fill="#10b981" />
                <Bar dataKey="Serious" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Fatal" stackId="a" fill="#e11d48" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity by Lighting Conditions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Severity Distribution by Ambient Lighting
            </h3>
            <p className="text-xs text-slate-500">
              Darkness with unlit or absent streetlights correlates with elevated severity rates
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eda?.severity_by_lighting || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" fontSize={11} stroke="#64748b" />
                <YAxis dataKey="category" type="category" width={130} fontSize={10} stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Slight" stackId="a" fill="#10b981" />
                <Bar dataKey="Serious" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Fatal" stackId="a" fill="#e11d48" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity by Road Surface */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Severity by Road Surface Friction Conditions
            </h3>
            <p className="text-xs text-slate-500">
              Wet, snow, and icy pavements reduce tire friction and increase impact velocity
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eda?.severity_by_surface || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" fontSize={10} stroke="#64748b" interval={0} angle={-15} textAnchor="end" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Slight" stackId="a" fill="#10b981" />
                <Bar dataKey="Serious" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Fatal" stackId="a" fill="#e11d48" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity by Urban vs Rural Area */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Severity by Urban vs Rural Environment
            </h3>
            <p className="text-xs text-slate-500">
              Rural collisions exhibit disproportionately higher fatality rates due to higher average speeds
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eda?.severity_by_area || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Slight" stackId="a" fill="#10b981" />
                <Bar dataKey="Serious" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Fatal" stackId="a" fill="#e11d48" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Trend (24-Hour Distribution) */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              24-Hour Diurnal Accident Severity Trend
            </h3>
            <p className="text-xs text-slate-500">
              Morning peak (07:00–09:00) and evening peak (16:00–18:00) vs. late-night severity spike
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={eda?.hourly_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="Slight" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.7} />
                <Area type="monotone" dataKey="Serious" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.7} />
                <Area type="monotone" dataKey="Fatal" stackId="1" stroke="#e11d48" fill="#e11d48" fillOpacity={0.7} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
