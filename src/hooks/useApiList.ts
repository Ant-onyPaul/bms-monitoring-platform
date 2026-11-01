import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

/** Fetches a list endpoint and exposes a setter so creates can prepend rows. */
export function useApiList<T>(path: string | null) {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!path) return;
    setLoading(true);
    api<T[]>(path)
      .then((data) => { setRows(data); setError(null); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load data'))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(reload, [reload]);

  return { rows, setRows, error, isLoading, reload };
}

/** Fetches a single record, e.g. the vendor shown on a detail page. */
export function useApiRecord<T>(path: string | null) {
  const [record, setRecord] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    api<T>(path)
      .then((data) => { setRecord(data); setError(null); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load data'));
  }, [path]);

  return { record, setRecord, error };
}
