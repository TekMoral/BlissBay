import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useDashboardData from '../hooks/useDashboardData'; // Importing the custom hook

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const { stats, recentOrders, popularProducts, loading, error, retryCount } = useDashboardData(token);

  // Pagination state for orders and products
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const [currentPageProducts, setCurrentPageProducts] = useState(1);
  const itemsPerPage = 5;

  // Slice the data for pagination
  const paginatedOrders = recentOrders ? recentOrders.slice(
    (currentPageOrders - 1) * itemsPerPage,
    currentPageOrders * itemsPerPage
  ) : [];

  const paginatedProducts = popularProducts ? popularProducts.slice(
    (currentPageProducts - 1) * itemsPerPage,
    currentPageProducts * itemsPerPage
  ) : [];

  const handlePageChangeOrders = (pageNumber) => setCurrentPageOrders(pageNumber);
  const handlePageChangeProducts = (pageNumber) => setCurrentPageProducts(pageNumber);

  if (loading) {
    return <div className="text-center text-lg font-medium p-6">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold p-6">
        {error} {retryCount > 0 && `- Retry Attempt ${retryCount}`}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          link="/admin/users"
          linkText="View Users"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          link="/admin/products"
          linkText="View Products"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          link="/admin/orders"
          linkText="View Orders"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}`}
          link="/admin/orders"
          linkText="View Revenue"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
        {paginatedOrders.length === 0 ? (
          <p>No recent orders found.</p>
        ) : (
          <ul className="space-y-2">
            {paginatedOrders.map((order) => (
              <li key={order._id} className="flex justify-between border-b pb-2">
                <span>Order #{order._id.slice(-6).toUpperCase()}</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        {recentOrders && recentOrders.length > itemsPerPage && (
          <div className="flex justify-between mt-4">
            <button
              onClick={() => handlePageChangeOrders(currentPageOrders - 1)}
              disabled={currentPageOrders === 1}
              className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChangeOrders(currentPageOrders + 1)}
              disabled={currentPageOrders * itemsPerPage >= recentOrders.length}
              className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Popular Products */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Popular Products</h3>
        {paginatedProducts.length === 0 ? (
          <p>No popular products found.</p>
        ) : (
          <ul className="space-y-2">
            {paginatedProducts.map((product) => (
              <li key={product._id} className="flex justify-between border-b pb-2">
                <span>{product.name}</span>
                <span>{product.count} sold</span>
              </li>
            ))}
          </ul>
        )}
        {popularProducts && popularProducts.length > itemsPerPage && (
          <div className="flex justify-between mt-4">
            <button
              onClick={() => handlePageChangeProducts(currentPageProducts - 1)}
              disabled={currentPageProducts === 1}
              className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChangeProducts(currentPageProducts + 1)}
              disabled={currentPageProducts * itemsPerPage >= popularProducts.length}
              className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, link, linkText }) => (
  <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
    <div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-lg">{value}</p>
    </div>
    <Link to={link} className="text-blue-500 hover:text-blue-700">
      {linkText}
    </Link>
  </div>
);

export default Dashboard;