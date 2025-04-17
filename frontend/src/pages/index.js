import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Layout from "../components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Alert, AlertDescription } from "../components/ui/Alert";

const API_BASE_URL = "http://localhost:8000/api";
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const [forecast, setForecast] = useState([]);
  const [inventoryRecommendations, setInventoryRecommendations] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [forecastType, setForecastType] = useState("ensemble");
  const [forecastDays, setForecastDays] = useState(30);

  // Styled status indicators
  const getStatusStyle = (status) => {
    if (status === "Reorder needed") {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (status === "Stock sufficient") {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (status === "Out of Stock") {
      return "bg-red-500 text-white border-red-600"; 
    } else {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  useEffect(() => {
    // Load initial data
    fetchInitialData();
    
    // Set up refresh interval
    const interval = setInterval(() => fetchInventoryData(), 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch products, stores, and categories first
      const [productsRes, storesRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/stores`),
        axios.get(`${API_BASE_URL}/categories`)
      ]);
      
      setProducts(productsRes.data.products);
      setStores(storesRes.data.stores);
      setCategories(categoriesRes.data.categories);
      
      // If we have products, select the first one and load its data
      if (productsRes.data.products.length > 0 && storesRes.data.stores.length > 0) {
        const firstProduct = productsRes.data.products[0]['Product ID'];
        const firstStore = storesRes.data.stores[0]['Store ID'];
        
        setSelectedProduct(firstProduct);
        setSelectedStore(firstStore);
        
        // Now fetch data for the selected product and store
        await fetchProductData(firstProduct, firstStore);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err.message || "Failed to load initial data");
      setLoading(false);
    }
  };

  const fetchProductData = async (productId, storeId) => {
    setLoading(true);
    try {
      const [forecastRes, inventoryRes, healthRes] = await Promise.all([
        axios.post(`${API_BASE_URL}/forecast`, {
          product_id: productId,
          store_id: storeId,
          forecast_days: forecastDays,
          forecast_type: forecastType
        }),
        axios.post(`${API_BASE_URL}/inventory/recommendations`, {
          product_id: productId,
          store_id: storeId,
          forecast_days: forecastDays
        }),
        axios.post(`${API_BASE_URL}/inventory/health`, {
          product_id: productId,
          store_id: storeId,
          forecast_days: forecastDays
        })
      ]);
      
      setForecast(forecastRes.data.forecast);
      setInventoryRecommendations(inventoryRes.data.recommendations);
      setInventoryHealth(healthRes.data.inventory_health);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError(err.message || "Failed to fetch product data");
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    if (selectedProduct && selectedStore) {
      try {
        const [inventoryRes, healthRes] = await Promise.all([
          axios.post(`${API_BASE_URL}/inventory/recommendations`, {
            product_id: selectedProduct,
            store_id: selectedStore,
            forecast_days: forecastDays
          }),
          axios.post(`${API_BASE_URL}/inventory/health`, {
            product_id: selectedProduct,
            store_id: selectedStore,
            forecast_days: forecastDays
          })
        ]);
        
        setInventoryRecommendations(inventoryRes.data.recommendations);
        setInventoryHealth(healthRes.data.inventory_health);
      } catch (err) {
        console.error("Error refreshing inventory data:", err);
      }
    }
  };

  const handleProductStoreChange = async () => {
    if (selectedProduct && selectedStore) {
      await fetchProductData(selectedProduct, selectedStore);
    }
  };

  const handleForecastTypeChange = (e) => {
    setForecastType(e.target.value);
  };

  const handleForecastDaysChange = (e) => {
    setForecastDays(parseInt(e.target.value));
  };

  if (loading && !forecast.length) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600"></div>
          <span className="ml-4 text-xl text-indigo-600">Loading data...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-800">
            <span className="font-bold">Error:</span> {error}
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  // Prepare data for inventory health pie chart
  const inventoryPieData = inventoryHealth ? [
    { name: 'Products Needing Reorder', value: inventoryHealth.products_needing_reorder },
    { name: 'Healthy Stock', value: inventoryHealth.total_products - inventoryHealth.products_needing_reorder }
  ] : [];

  return (
    <Layout>
      <div className="space-y-6 p-4">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-6 rounded-xl shadow-lg mb-8 text-white">
          <h1 className="text-3xl font-bold">Retail Demand Forecasting Dashboard</h1>
          <p className="mt-2 opacity-90">Optimize inventory with AI-powered forecasting and recommendations</p>
        </div>

        {/* Controls for product selection and forecast options */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {products.map(product => (
                  <option key={product['Product ID']} value={product['Product ID']}>
                    {product['Name']}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
              <select 
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {stores.map(store => (
                  <option key={store['Store ID']} value={store['Store ID']}>
                    {store['Store ID']} - {store['Region']}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Type</label>
              <select 
                value={forecastType}
                onChange={handleForecastTypeChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="prophet">Prophet</option>
                <option value="lstm">LSTM</option>
                <option value="ensemble">Ensemble</option>
              </select>
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Days to Forecast</label>
              <select 
                value={forecastDays}
                onChange={handleForecastDaysChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            
            <div className="col-span-1 flex items-end">
              <button 
                onClick={handleProductStoreChange}
                className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Update Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {inventoryHealth && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-l-4 border-indigo-600 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-600">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-700">{inventoryHealth.total_products}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-l-4 border-amber-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-600">Products Needing Reorder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-500">{inventoryHealth.products_needing_reorder}</p>
                <p className="text-sm text-gray-500">{inventoryHealth.reorder_percentage.toFixed(1)}% of inventory</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-l-4 border-red-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-600">High Risk Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-500">{inventoryHealth.high_risk_products}</p>
                <p className="text-sm text-gray-500">{inventoryHealth.high_risk_percentage.toFixed(1)}% risk of stockout</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-600">Total Reorder Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">${inventoryHealth.total_reorder_value.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forecast Chart */}
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl text-gray-800">Demand Forecast</CardTitle>
              <p className="text-sm text-gray-500">Predicted demand for the next {forecastDays} days</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecast} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey={forecastType === "ensemble" ? "ds" : "ds"} 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [parseFloat(value).toFixed(2), "Units"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Legend />
                    {forecastType === "prophet" && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="yhat" 
                          stroke="#8884d8" 
                          strokeWidth={2} 
                          name="Forecast" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="yhat_lower" 
                          stroke="#82ca9d" 
                          strokeWidth={1} 
                          strokeDasharray="5 5" 
                          name="Lower Bound" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="yhat_upper" 
                          stroke="#ffc658" 
                          strokeWidth={1} 
                          strokeDasharray="5 5" 
                          name="Upper Bound" 
                        />
                      </>
                    )}
                    {forecastType === "lstm" && (
                      <Line 
                        type="monotone" 
                        dataKey="lstm_forecast" 
                        stroke="#ff7300" 
                        strokeWidth={2} 
                        name="LSTM Forecast" 
                        activeDot={{ r: 8 }} 
                      />
                    )}
                    {forecastType === "ensemble" && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="ensemble_forecast" 
                          stroke="#8884d8" 
                          strokeWidth={2} 
                          name="Ensemble Forecast" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="prophet_forecast" 
                          stroke="#82ca9d" 
                          strokeWidth={1} 
                          strokeDasharray="3 3" 
                          name="Prophet Forecast" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="lstm_forecast" 
                          stroke="#ff7300" 
                          strokeWidth={1} 
                          strokeDasharray="3 3" 
                          name="LSTM Forecast" 
                        />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Health */}
          <Card className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl text-gray-800">Inventory Health</CardTitle>
              <p className="text-sm text-gray-500">Current inventory status and recommendations</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {inventoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Products"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-col justify-center space-y-4">
                  {inventoryHealth && (
                    <>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        <p className="text-sm text-indigo-800 font-medium">Avg. Days Until Stockout</p>
                        <p className="text-xl font-bold text-indigo-900">
                          {inventoryHealth.average_days_until_stockout === Infinity 
                            ? "∞" 
                            : inventoryHealth.average_days_until_stockout.toFixed(1)}
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <p className="text-sm text-amber-800 font-medium">Reorder Percentage</p>
                        <p className="text-xl font-bold text-amber-900">
                          {inventoryHealth.reorder_percentage.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <p className="text-sm text-emerald-800 font-medium">Total Products</p>
                        <p className="text-xl font-bold text-emerald-900">
                          {inventoryHealth.total_products}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Recommendations */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow mt-6">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">Inventory Recommendations</CardTitle>
            <p className="text-sm text-gray-500">Detailed inventory status and actions</p>
          </CardHeader>
          <CardContent className="p-0"> {/* Remove padding for the table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reorder Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Optimal Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Until Stockout
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryRecommendations && inventoryRecommendations.map((item, index) => (
                    <tr key={index} className={item.Status === "Reorder needed" ? "bg-red-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item['Product ID']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item['Category']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item['Current Inventory']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item['Reorder Point'].toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item['Optimal Order Quantity'].toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item['Days Until Stockout'] === Infinity ? 
                          "∞" : 
                          item['Days Until Stockout'].toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(item['Status'])}`}>
                          {item['Status']}
                        </span>
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
