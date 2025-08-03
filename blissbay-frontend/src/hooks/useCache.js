import { useState, useEffect } from 'react';

const useCache = (fetchFunction, dependencies = [], cacheTime = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(0);

  // Generate a cache key based on the function name and dependencies
  const getCacheKey = () => {
    const funcName = fetchFunction.name || 'anonymousFunction';
    const depsString = dependencies.map(dep => String(dep)).join('-');
    return `${funcName}:${depsString}`;
  };

  const fetchData = async (force = false) => {
    const now = Date.now();
    const cacheKey = getCacheKey();
    
    // Check if we have cached data in sessionStorage
    const cachedItem = sessionStorage.getItem(cacheKey);
    
    if (!force && cachedItem) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cachedItem);
        
        // If cache is still valid, use it
        if (now - timestamp < cacheTime) {
          setData(cachedData);
          setLoading(false);
          setLastFetched(timestamp);
          return;
        }
      } catch (err) {
        // If parsing fails, ignore cache and fetch fresh data
        console.error('Cache parsing error:', err);
      }
    }
    
    // Fetch fresh data
    setLoading(true);
    try {
      const result = await fetchFunction();
      setData(result);
      setError(null);
      
      // Store in sessionStorage
      const cacheEntry = JSON.stringify({
        data: result,
        timestamp: now
      });
      sessionStorage.setItem(cacheKey, cacheEntry);
      setLastFetched(now);
    } catch (err) {
      setError(err);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [...dependencies]);

  // Function to manually refetch data
  const refetch = () => fetchData(true);

  return { data, loading, error, refetch, lastFetched };
};

export default useCache;