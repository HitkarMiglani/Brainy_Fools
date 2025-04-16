import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';

export default function Dashboard() {
  const [forecast, setForecast] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [item, setItem] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [forecastRes, inventoryRes, itemRes] = await Promise.all([
        axios.get('http://localhost:8000/forecast'),
        axios.get('http://localhost:8000/inventory-recommendations'),
        axios.get('http://localhost:8000/upload-data')
      ]);
      
      setForecast(forecastRes.data.forecast);
      setInventory(inventoryRes.data.recommendations);
      setItem(itemRes.data.item);
      
      // Calculate statistics
      const totalProducts = itemRes.data.item.length;
      const lowStock = inventoryRes.data.recommendations.filter(
        item => item.status === 'Reorder needed'
      ).length;
      const outOfStock = inventoryRes.data.recommendations.filter(
        item => item.current_stock === 0
      ).length;
      const totalValue = itemRes.data.item.reduce(
        (sum, item) => sum + (item.current_stock * item.price), 0
      );

      setStats({
        totalProducts,
        lowStock,
        outOfStock,
        totalValue: totalValue.toFixed(2)
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${stats.totalValue}</p>
            </CardContent>
          </Card>
        </div>

        {/* Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Demand Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ds" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="yhat" stroke="#8884d8" name="Forecast" />
                  <Line type="monotone" dataKey="yhat_lower" stroke="#82ca9d" name="Lower Bound" />
                  <Line type="monotone" dataKey="yhat_upper" stroke="#ffc658" name="Upper Bound" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Point</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {item && inventory.map((item) => (
                    <tr key={item.product_id} className={item.status === 'Reorder needed' ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.product_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.current_stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.reorder_point}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'Reorder needed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-indigo-600 hover:text-indigo-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 