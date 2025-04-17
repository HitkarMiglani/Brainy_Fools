import React from 'react';

const Dashboard = () => {
  const stats = [
    { 
      name: 'Total Inventory Value', 
      value: '$1.2M',
      change: '+12.5%',
      trend: 'up'
    },
    { 
      name: 'Forecast Accuracy', 
      value: '94.8%',
      change: '+2.3%',
      trend: 'up'
    },
    { 
      name: 'Stock Turnover Rate', 
      value: '4.2x',
      change: '-0.5x',
      trend: 'down'
    },
    { 
      name: 'Out of Stock Items', 
      value: '23',
      change: '-5',
      trend: 'down'
    },
  ];

  const recentQueries = [
    { 
      query: 'Predict next month electronics demand',
      time: '5 mins ago',
      status: 'Completed',
      result: 'Expected 15% increase in demand',
      confidence: 95
    },
    { 
      query: 'Analyze clothing inventory levels',
      time: '10 mins ago',
      status: 'Completed',
      result: 'Current stock sufficient for 45 days',
      confidence: 92
    },
    { 
      query: 'Forecast holiday season demand',
      time: '15 mins ago',
      status: 'Completed',
      result: 'Prepare for 40% increase in demand',
      confidence: 88
    },
    { 
      query: 'Check stock levels for SKU-123',
      time: '20 mins ago',
      status: 'Completed',
      result: 'Reorder point reached',
      confidence: 97
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                <span className="ml-1">{stat.change}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Queries */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Queries</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentQueries.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.query}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.result}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 font-medium">{item.confidence}%</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 rounded-full h-2" 
                            style={{ width: `${item.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 