import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const [activeTab, setActiveTab] = useState('rag');

  const features = {
    rag: {
      title: 'RAG Pipeline',
      description: 'Advanced Retrieval-Augmented Generation for retail analytics',
      image: 'https://chatgen.ai/wp-content/uploads/2023/12/DALL%C2%B7E-2023-12-19-22.57.20-A-minimalistic-image-for-a-blog-article-titled-Evaluation-of-RAG-pipeline-using-LLMs-with-correct-spelling.-The-design-maintains-sleek-simple-line-1.png',
      details: [
        'Real-time data processing',
        'Contextual understanding',
        'Advanced vector search',
        'Intelligent chunking'
      ]
    },
    forecast: {
      title: 'Demand Forecasting',
      description: 'AI-powered demand prediction system',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSELoyjeL8o1fhLxyclKhFj-RPVeZVh-zNTNy3xDcEXtCIZ1yOTjvEoYH-VmsegEVvpnB4&usqp=CAU',
      details: [
        'Time series analysis',
        'Multi-variable forecasting',
        'Seasonal adjustment',
        'Confidence intervals'
      ]
    },
    inventory: {
      title: 'Inventory Management',
      description: 'Smart inventory optimization system',
      image: 'https://i0.wp.com/www.globaltrademag.com/wp-content/uploads/2022/04/shutterstock_585073000-scaled.jpg?fit=2560%2C1706&ssl=1x`',
      details: [
        'Real-time tracking',
        'Automated reordering',
        'Stock level optimization',
        'Supplier management'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <motion.h1 
          className="text-4xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Powerful Features for Retail Analytics
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Discover our comprehensive suite of tools designed to revolutionize your retail operations
        </motion.p>
      </div>

      {/* Feature Navigation */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-center space-x-4">
          {Object.keys(features).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {features[key].title}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Content */}
      <motion.div 
        className="max-w-7xl mx-auto"
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Feature Image */}
            <div className="relative h-64 lg:h-full">
              <img
                src={features[activeTab].image}
                alt={features[activeTab].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-600/80">
                <div className="p-12 text-white h-full flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-4">{features[activeTab].title}</h2>
                  <p className="text-lg opacity-90">{features[activeTab].description}</p>
                </div>
              </div>
            </div>

            {/* Feature Details */}
            <div className="p-12">
              <h3 className="text-2xl font-semibold mb-6">Key Capabilities</h3>
              <div className="grid gap-6">
                {features[activeTab].details.map((detail, index) => (
                  <motion.div
                    key={detail}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{detail}</h4>
                      <p className="text-gray-500">
                        Advanced capabilities powered by our AI technology
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-semibold mb-6">Interactive Demo</h3>
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg">
            {/* Placeholder for interactive demo */}
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Interactive demo coming soon</p>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">Performance</h4>
            <p className="text-gray-600">Lightning-fast response times with our optimized infrastructure</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-purple-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">Security</h4>
            <p className="text-gray-600">Enterprise-grade security with end-to-end encryption</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-green-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">Scalability</h4>
            <p className="text-gray-600">Handles millions of queries with automatic scaling</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Features; 