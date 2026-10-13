import { useState, useEffect } from 'react';
import { fetchAccidents } from '../services/api';
import { AccidentRecord } from '../types';

export function useAccidents(initialParams: Record<string, any> = {}) {
  const [records, setRecords] = useState<AccidentRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(initialParams.page || 1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = async (params: Record<string, any> = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAccidents({ page, page_size: 15, ...params });
      setRecords(res.records);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accident records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [page]);

  return { records, total, totalPages, page, setPage, loading, error, refetch: loadRecords };
}
