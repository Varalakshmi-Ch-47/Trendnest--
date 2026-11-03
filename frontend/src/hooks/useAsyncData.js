import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

export function useAsyncData(fetcher, key) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: '' });
  const fetcherRef = useRef(fetcher);
  const requestKey = `${key}#${reloadCount}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) {
          setResult({ key: requestKey, data, error: '' });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setResult({ key: requestKey, data: null, error: getErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const ready = result.key === requestKey;
  return {
    data: ready ? result.data : null,
    error: ready ? result.error : '',
    loading: !ready,
    reload,
  };
}