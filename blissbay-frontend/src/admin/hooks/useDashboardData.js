import { useState, useEffect } from 'react';
import axiosInstance from '../../lib/axiosInstance';

const useDashboardData = (token) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Retry logic - number of retries
  const maxRetries = 3;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (retryCount >= maxRetries) return; // Stop retrying after max retries

      try {
        setLoading(true);

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        // Fetching all necessary data at once
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          axiosInstance.get('/api/admin/dashboard/getDashboardStats', config),
          axiosInstance.get('/api/admin/dashboard/getRecentOrders', config),
          axiosInstance.get('/api/admin/dashboard/getPopularProducts', config),
        ]);

        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.orders || []);
        setPopularProducts(productsRes.data || []);
        setError('');
        setRetryCount(0); // Reset retry count on successful fetch
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(
          err.response?.data?.message ||
            'Something went wrong while fetching dashboard data.'
        );
        if (retryCount < maxRetries) {
          setRetryCount(retryCount + 1); // Retry the request
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setError('Authentication token is missing. Please log in again.');
      setLoading(false);
    }
  }, [token, retryCount]);

  return { stats, recentOrders, popularProducts, loading, error, retryCount };
};

export default useDashboardData;