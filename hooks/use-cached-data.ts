import { useState, useEffect, useCallback } from 'react';

interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
}

export function useCachedData<T>(
  fetcher: () => Promise<T>,
  config: CacheConfig
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Check if we're in the browser before accessing localStorage
      if (typeof window !== 'undefined') {
        // Check cache first
        const cached = localStorage.getItem(config.key);
        if (cached) {
          try {
            const { data: cachedData, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            // If cache is still valid, use it
            if (!config.ttl || now - timestamp < config.ttl) {
              setData(cachedData);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Invalid JSON in localStorage, ignore and fetch fresh data
            console.warn(`Invalid cache data for key ${config.key}`, e);
          }
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      
      // Cache the new data if in browser
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            config.key,
            JSON.stringify({
              data: freshData,
              timestamp: Date.now(),
            })
          );
        } catch (e) {
          // Handle localStorage errors (quota exceeded, etc.)
          console.warn(`Failed to cache data for key ${config.key}`, e);
        }
      }

      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [config.key, config.ttl, fetcher]);

  useEffect(() => {
    fetchData();
  }, [config.key, config.ttl]); // Remove fetcher from dependencies

  return { data, error, loading, refetch: fetchData };
}
