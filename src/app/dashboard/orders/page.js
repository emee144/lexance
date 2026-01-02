'use client';

import { useState, useEffect } from 'react';
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/auth/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Order History</h1>

        {orders.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No orders yet</p>
        ) : (
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left">Time</th>
                  <th className="px-6 py-4 text-left">Pair</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t border-gray-800">
                    <td className="px-6 py-4">
                      {new Date(order.filledAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{order.pair}</td>
                    <td className="px-6 py-4">
                      <span className={order.side === 'buy' ? 'text-green-400' : 'text-red-400'}>
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">${order.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{order.quantity}</td>
                    <td className="px-6 py-4 text-right">${order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}