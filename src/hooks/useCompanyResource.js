import { useEffect, useRef, useState } from 'react';
import { fetchCompanyResource, hasUsableData, isAbortError } from '../services/companyDataApi.js';

/**
 * Fetch a company-data resource with static fallback.
 * fallbackData is captured by ref so inline array/object literals at the call
 * site do not retrigger the effect every render.
 */
export function useCompanyResource(resource, fallbackData, { enabled = true } = {}) {
  const fallbackRef = useRef(fallbackData);
  fallbackRef.current = fallbackData;

  const [state, setState] = useState({
    data: fallbackData,
    meta: null,
    status: 'fallback',
    error: null,
  });

  useEffect(() => {
    if (!enabled || !resource) {
      setState((prev) => ({ ...prev, data: fallbackRef.current, status: 'fallback' }));
      return undefined;
    }

    const controller = new AbortController();
    setState((prev) => ({
      ...prev,
      data: prev.data ?? fallbackRef.current,
      status: prev.status === 'live' ? 'live' : 'loading',
      error: null,
    }));

    fetchCompanyResource(resource, { signal: controller.signal })
      .then((payload) => {
        const fallback = fallbackRef.current;
        const nextData = hasUsableData(payload.data) ? payload.data : fallback;
        setState({
          data: nextData,
          meta: {
            resource: payload.resource,
            source: payload.source,
            fetchedAt: payload.fetchedAt,
            count: payload.count,
          },
          status: hasUsableData(payload.data) ? 'live' : 'fallback',
          error: null,
        });
      })
      .catch((error) => {
        if (isAbortError(error)) return;
        setState({
          data: fallbackRef.current,
          meta: null,
          status: 'fallback',
          error,
        });
      });

    return () => controller.abort();
  }, [enabled, resource]);

  return {
    ...state,
    isLive: state.status === 'live',
    isLoading: state.status === 'loading',
  };
}
