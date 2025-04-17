import React, { useState } from 'react';

const Forecast = () => {
  const [forecastParams, setForecastParams] = useState({
    productCategory: '',
    timeRange: '30',
    confidenceLevel: '95'
  });

  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);

  const categories = {
    electronics: {
      name: 'Electronics',
      subcategories: ['Smartphones', 'Laptops', 'Gaming Consoles', 'Smart Phone', 'Audio Devices']
    },
    fashion: {
      name: 'Clothing',
      subcategories: ['Men\'s Apparel', 'Women\'s Apparel', 'Kids Wear', 'Footwear', 'Accessories']
    },
    groceries: {
      name: 'Groceries',
      subcategories: ['Fresh Produce', 'Dairy', 'Beverages', 'Snacks', 'Canned Goods']
    },
  };

  // Dummy data generator function
  const generateDummyData = (category) => {
    const baseValue = Math.floor(Math.random() * 1000) + 500;
    const seasonalFactor = Math.random() * 0.3 + 0.85; // 0.85 to 1.15
    const trendFactor = Math.random() * 0.1 + 0.95; // 0.95 to 1.05
    
    const predictions = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      const predicted = Math.round(baseValue * Math.pow(trendFactor, index) * seasonalFactor);
      const actual = index < 3 ? Math.round(predicted * (Math.random() * 0.1 + 0.95)) : null;
      const variance = predicted * 0.15;
      
      return {
        date: date.toISOString().split('T')[0],
        predicted,
        actual,
        lower: Math.round(predicted - variance),
        upper: Math.round(predicted + variance)
      };
    });

    const categoryInsights = {
      electronics: [
        'High demand spike expected during tech launch season',
        'Gaming consoles showing strong growth trend',
        'Smart home devices demand increasing steadily',
        'Premium segment outperforming budget segment'
      ],
      fashion: [
        'Seasonal collection transition impacting sales',
        'Accessories showing consistent growth',
        'Premium brands maintaining steady demand',
        'Online sales outpacing offline channels'
      ],
      groceries: [
        'Fresh produce demand peaks on weekends',
        'Organic products showing strong growth',
        'Seasonal fruits driving category growth',
        'Private labels gaining market share'
      ],
      home: [
        'Work-from-home furniture demand remains strong',
        'Seasonal decor items trending upward',
        'Storage solutions in high demand',
        'Eco-friendly products gaining traction'
      ],
      beauty: [
        'Skincare segment leading category growth',
        'Natural products showing strong demand',
        'Premium brands maintaining market share',
        'New launches driving category momentum'
      ],
      sports: [
        'Home fitness equipment demand stable',
        'Seasonal sports gear trending up',
        'Premium athleisure showing strong growth',
        'Recovery products gaining popularity'
      ]
    };

    return {
      predictions,
      metrics: {
        accuracy: (90 + Math.random() * 5).toFixed(1),
        mape: (2 + Math.random() * 3).toFixed(1),
        rmse: (3 + Math.random() * 2).toFixed(1)
      },
      insights: categoryInsights[category] || categoryInsights.electronics,
      trends: {
        weeklyGrowth: ((Math.random() * 8) - 4).toFixed(1),
        monthlyGrowth: ((Math.random() * 15) - 7).toFixed(1),
        seasonalImpact: ((Math.random() * 20) - 10).toFixed(1),
        confidenceScore: (85 + Math.random() * 10).toFixed(1)
      }
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call with category-specific data
    setTimeout(() => {
      setForecastData(generateDummyData(forecastParams.productCategory));
      setLoading(false);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForecastParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Forecast Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Generate Forecast</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700">
              Product Category
            </label>
            <select
              id="productCategory"
              name="productCategory"
              value={forecastParams.productCategory}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select a category</option>
              {Object.entries(categories).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>
          </div>

          {forecastParams.productCategory && (
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                Subcategory
              </label>
              <select
                id="subcategory"
                name="subcategory"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Subcategories</option>
                {categories[forecastParams.productCategory].subcategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700">
                Time Range (Days)
              </label>
              <input
                type="number"
                name="timeRange"
                id="timeRange"
                value={forecastParams.timeRange}
                onChange={handleChange}
                min="1"
                max="365"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="confidenceLevel" className="block text-sm font-medium text-gray-700">
                Confidence Level (%)
              </label>
              <input
                type="number"
                name="confidenceLevel"
                id="confidenceLevel"
                value={forecastParams.confidenceLevel}
                onChange={handleChange}
                min="1"
                max="99"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Generating Forecast...' : 'Generate Forecast'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {forecastData ? (
        <div className="space-y-6">
          {/* Forecast Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Forecast Accuracy</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">{forecastData.metrics.accuracy}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Weekly Growth</h3>
              <p className={`mt-2 text-3xl font-semibold ${
                parseFloat(forecastData.trends.weeklyGrowth) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {forecastData.trends.weeklyGrowth}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Monthly Growth</h3>
              <p className={`mt-2 text-3xl font-semibold ${
                parseFloat(forecastData.trends.monthlyGrowth) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {forecastData.trends.monthlyGrowth}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Seasonal Impact</h3>
              <p className={`mt-2 text-3xl font-semibold ${
                parseFloat(forecastData.trends.seasonalImpact) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {forecastData.trends.seasonalImpact}%
              </p>
            </div>
          </div>

          {/* Forecast Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Forecast Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Predicted
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lower Bound
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upper Bound
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forecastData.predictions.map((day, index) => (
                      <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{day.predicted}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {day.actual ? (
                            <span className="text-green-600 font-medium">{day.actual}</span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{day.lower}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{day.upper}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
            <ul className="space-y-3">
              {forecastData.insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            {loading ? (
              <p>Generating forecast...</p>
            ) : (
              <p>Submit the form to generate a forecast</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecast; 