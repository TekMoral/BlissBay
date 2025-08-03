import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance"; 

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/orders");
        setOrders(res.data.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="p-4 border rounded-lg shadow">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
            <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:underline">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}










