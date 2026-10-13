import React, { useEffect, useState } from 'react';
import {
  Search,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { fetchAccidents, uploadAccidentsCsv } from '../services/api';
import { AccidentRecord } from '../types';

export const AccidentRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<AccidentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [roadType, setRoadType] = useState('');
  const [urbanRural, setUrbanRural] = useState('');

  // Selected Record Modal
  const [selectedRecord, setSelectedRecord] = useState<AccidentRecord | null>(null);

  // Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await fetchAccidents({
        page,
        page_size: 15,
        search,
        severity,
        road_type: roadType,
        urban_rural: urbanRural,
      });
      setRecords(res.records);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [page, severity, roadType, urbanRural]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRecords();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploadLoading(true);
      const res = await uploadAccidentsCsv(uploadFile);
      setUploadResult(res);
      if (res.success) {
        loadRecords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Accident Records Database</h2>
          <p className="text-xs text-slate-500">
            Search, filter, and inspect verified UK STATS19 collision records ({total.toLocaleString()} total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/accidents/export/csv"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => {
              setShowUploadModal(true);
              setUploadResult(null);
              setUploadFile(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Index, Region, Road type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="">All Severities</option>
            <option value="Slight">Slight</option>
            <option value="Serious">Serious</option>
            <option value="Fatal">Fatal</option>
          </select>

          <select
            value={roadType}
            onChange={(e) => {
              setRoadType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="">All Road Types</option>
            <option value="Single carriageway">Single carriageway</option>
            <option value="Dual carriageway">Dual carriageway</option>
            <option value="Roundabout">Roundabout</option>
            <option value="Slip road">Slip road</option>
          </select>

          <select
            value={urbanRural}
            onChange={(e) => {
              setUrbanRural(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="">Urban & Rural</option>
            <option value="Urban">Urban</option>
            <option value="Rural">Rural</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Index</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Road Type</th>
                <th className="py-3 px-4">Speed Limit</th>
                <th className="py-3 px-4">Weather</th>
                <th className="py-3 px-4">Lighting</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {r.accident_index}
                    </td>
                    <td className="py-3 px-4">
                      {r.accident_date} <span className="text-slate-400">{r.accident_time}</span>
                    </td>
                    <td className="py-3 px-4">{r.region || 'National'}</td>
                    <td className="py-3 px-4">{r.road_type}</td>
                    <td className="py-3 px-4 font-medium">{r.speed_limit} mph</td>
                    <td className="py-3 px-4 max-w-[140px] truncate" title={r.weather_conditions}>
                      {r.weather_conditions}
                    </td>
                    <td className="py-3 px-4 max-w-[140px] truncate" title={r.light_conditions}>
                      {r.light_conditions}
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={r.accident_severity} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="View Full Collision Record"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <div>
            Showing Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span> ({total} records)
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Collision Record #{selectedRecord.accident_index}
                </h3>
                <p className="text-xs text-slate-500">STATS19 Collision Parameters</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Severity Classification</p>
                <div className="mt-1">
                  <SeverityBadge severity={selectedRecord.accident_severity} size="md" />
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Date & Time</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedRecord.accident_date} at {selectedRecord.accident_time} ({selectedRecord.day_of_week})
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Road Type & Speed</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedRecord.road_type} ({selectedRecord.speed_limit} mph)
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Area Classification</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedRecord.urban_or_rural_area} ({selectedRecord.road_class}-Class)
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Weather Condition</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedRecord.weather_conditions}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Road Surface</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedRecord.road_surface_conditions}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Ambient Light</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedRecord.light_conditions}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Junction Detail</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedRecord.junction_detail}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400 font-medium">Geographic Coordinates & Region</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedRecord.region || 'National'} &middot; Lat: {selectedRecord.latitude ?? 'N/A'}, Lon: {selectedRecord.longitude ?? 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Import STATS19 CSV Dataset</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">
                    {uploadFile ? uploadFile.name : 'Click or drag STATS19 CSV file here'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Accepts standard UK Department for Transport schema files
                  </p>
                </label>
              </div>

              {uploadResult && (
                <div
                  className={`rounded-lg p-3 text-xs ${
                    uploadResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {uploadResult.success ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                    )}
                    <span>
                      {uploadResult.success
                        ? `Imported ${uploadResult.records_imported} records (Quality Score: ${uploadResult.quality_score}%)`
                        : uploadResult.message}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploadLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {uploadLoading ? 'Validating...' : 'Validate & Ingest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
