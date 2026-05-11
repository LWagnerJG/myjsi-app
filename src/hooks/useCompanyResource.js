import { useEffect, useState } from 'react';
import { fetchCompanyResource, hasUsableData, isAbortError } from '../services/companyDataApi.js';

export function useCompanyResource(resource, fallbackData, { enabled = true } = {}) {
  const [state, setState] = useState({
    data: fallbackData,
    meta: null,
    status: 'fallback',
    error: null,
  });

  useEffect(() => {
    if (!enabled || !resource) {
      setState((prev) => ({ ...prev, data: fallbackData, status: 'fallback' }));
      return undefined;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, data: prev.data ?? fallbackData, status: prev.status === 'live' ? 'live' : 'loading', error: null }));

    fetchCompanyResource(resource, { signal: controller.signal })
      .then((payload) => {
        const nextData = hasUsableData(payload.data) ? payload.data : fallbackData;
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
          data: fallbackData,
          meta: null,
          status: 'fallback',
          error,
        });
      });

    return () => controller.abort();
  }, [enabled, fallbackData, resource]);

  return {
    ...state,
    isLive: state.status === 'live',
    isLoading: state.status === 'loading',
  };
}
