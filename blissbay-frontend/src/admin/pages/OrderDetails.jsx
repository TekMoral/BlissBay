import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../lib/axiosInstance";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.get(`/api/admin/orders/${orderId}`);
        setOrder(res.data.data);
        setStatus(res.data.data.status);
        setPaymentStatus(res.data.data.paymentStatus);
        setTransactionId(res.data.data.transactionId || "");
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleUpdate = async () => {
    try {
      const payload = {
        status,
        paymentStatus,
        transactionId,
      };

      const res = await axiosInstance.patch(`/api/admin/orders/${orderId}`, payload);
      alert("Order updated successfully.");
      setOrder(res.data.data.order);
    } catch (err) {
      alert("Update failed.");
      console.error(err);
    }
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Order Details - {order._id}</h2>
      <p><strong>Customer:</strong> {order.user?.name}</p>
      <p><strong>Email:</strong> {order.user?.email}</p>
      <p><strong>Amount:</strong> ${order.totalAmount.toFixed(2)}</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block font-semibold">Order Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2 rounded">
            <option value="">-- Select --</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Payment Status</label>
          <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="border p-2 rounded">
            <option value="">-- Select --</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Transaction ID</label>
          <input value={transactionId} onChange={e => setTransactionId(e.target.value)} className="border p-2 w-full rounded" />
        </div>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Order
        </button>
      </div>
    </div>
  );
}
