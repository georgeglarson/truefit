import { useState, useCallback } from "react";

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const call = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      setState({ data: null, error: null, loading: true });
      try {
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
          ...options,
        });

        if (res.status === 204) {
          setState({ data: null, error: null, loading: false });
          return null;
        }

        const json = await res.json();

        if (!res.ok) {
          const msg = json.error || `HTTP ${res.status}`;
          setState({ data: null, error: msg, loading: false });
          return null;
        }

        setState({ data: json, error: null, loading: false });
        return json;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setState({ data: null, error: msg, loading: false });
        return null;
      }
    },
    []
  );

  return { ...state, call };
}
