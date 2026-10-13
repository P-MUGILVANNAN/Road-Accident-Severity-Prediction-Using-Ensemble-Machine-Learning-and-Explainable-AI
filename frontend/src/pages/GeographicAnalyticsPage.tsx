import React, { useEffect, useState } from 'react';
import { MapPin, Filter, Flame, AlertCircle } from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { fetchGeographicData } from '../services/api';

export const GeographicAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchGeographicData(severityFilter ? { severity: severityFilter } : {})
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [severityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Geographic Collision Hotspots & Spatial Analytics</h2>
          <p className="text-xs text-slate-500">
            Interactive OpenStreetMap mapping of verified UK STATS19 collision coordinates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="">All Collision Severities</option>
            <option value="Slight">Slight Collisions (Green)</option>
            <option value="Serious">Serious Collisions (Amber)</option>
            <option value="Fatal">Fatal Collisions (Red)</option>
          </select>
        </div>
      </div>

      {/* Map Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        {loading ? (
          <div className="flex h-[520px] items-center justify-center text-slate-400 text-xs">
            Loading geographic map tiles and collision coordinate markers...
          </div>
        ) : (
          <LeafletMap points={data?.points || []} height="520px" zoom={6} />
        )}
      </div>

      {/* Hotspots & Regional Summaries */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hotspots Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Severe Collision Density Hotspot Rankings</h3>
          </div>
          <p className="text-xs text-slate-500">
            Regions ranked by percentage of collisions resulting in serious injury or fatality
          </p>

          <div className="space-y-2">
            {data?.hotspot_rankings?.map((h: any, i: number) => (
              <div
                key={h.region}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    #{i + 1} {h.region}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {h.severe_collisions} severe incidents out of {h.total_collisions} total collisions
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600">{h.severe_percentage}%</span>
                  <p className="text-[10px] text-slate-400">Severe Density</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Breakdown Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Regional Incident Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-semibold text-slate-500">
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Slight</th>
                  <th className="py-2.5 px-3">Serious</th>
                  <th className="py-2.5 px-3">Fatal</th>
                  <th className="py-2.5 px-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data?.regional_breakdown?.map((r: any) => (
                  <tr key={r.region} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{r.region}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">{r.Slight}</td>
                    <td className="py-2.5 px-3 text-amber-700 font-medium">{r.Serious}</td>
                    <td className="py-2.5 px-3 text-rose-700 font-bold">{r.Fatal}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.total}</td>
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
