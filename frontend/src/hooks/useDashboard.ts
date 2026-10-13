import { useState, useEffect } from 'react';
import { fetchDashboardSummary } from '../services/api';
import { DashboardSummary } from '../types';

export function useDashboard(initialFilters: Record<string, string> = {}) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardSummary(filters);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return { data, loading, error, filters, setFilters, refetch: loadData };
}
