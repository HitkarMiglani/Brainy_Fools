import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [forecast, setForecast] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [item, setItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [forecastRes, inventoryRes,item] = await Promise.all([
        axios.get('http://localhost:8000/forecast'),
        axios.get('http://localhost:8000/inventory-recommendations'),
        axios.get('http://localhost:8000/upload-data')
      ]);
      
      setForecast(forecastRes.data.forecast);
      setInventory(inventoryRes.data.recommendations);
      setItem(item.data.item);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  console.log('inventory:', item);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Retail Demand Forecasting Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Forecast Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Demand Forecast</h2>
          <LineChart width={500} height={300} data={forecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ds" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="yhat" stroke="#8884d8" />
            <Line type="monotone" dataKey="yhat_lower" stroke="#82ca9d" />
            <Line type="monotone" dataKey="yhat_upper" stroke="#ffc658" />
          </LineChart>
        </div>

        {/* Inventory Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Inventory Status</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Current Stock</th>
                  <th className="px-4 py-2">Reorder Point</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {item && inventory.map((item) => (
                  <tr key={item.product_id} className={item.status === 'Reorder needed' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2">{item.product_id}</td>
                    <td className="px-4 py-2">{item.current_stock}</td>
                    <td className="px-4 py-2">{item.reorder_point}</td>
                    <td className="px-4 py-2">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 