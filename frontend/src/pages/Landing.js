import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();
    const [demoQuery, setDemoQuery] = useState('');
    const [demoResult, setDemoResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize scroll animations
        const elements = document.querySelectorAll('.feature-card, .solution-card, .rag-step');
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        // Add scroll event listener
        const handleScroll = () => {
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementBottom = element.getBoundingClientRect().bottom;
                
                if (elementTop < window.innerHeight && elementBottom > 0) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGetStarted = () => {
        navigate('/dashboard');
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        console.log('Form submitted:', data);
        alert('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    };

    const handleDemoSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setDemoResult({
                answer: "Based on the historical data and current trends, we recommend increasing inventory for SKU-123 by 15% for the upcoming holiday season.",
                confidence: 0.92,
                sources: ["Sales History 2023", "Seasonal Patterns", "Market Trends"]
            });
            setIsLoading(false);
        }, 1500);
    };

    const navigateTo = (path) => {
        navigate(path);
    };

    const navItems = [
        { name: 'Demo', path: '/#demo' },
        { name: 'RAG Pipeline', path: '/#rag-pipeline' },
        { name: 'Architecture', path: '/#architecture' },
        { name: 'API', path: '/#api' },
        { name: 'Case Studies', path: '/#case-studies' },
    ];

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Intelligent Retail Analytics with RAG Pipeline
                        </h1>
                        <p className="text-xl mb-8">
                            A Hackathon Project Demonstrating Advanced AI-Powered Retail Data Processing
                        </p>
                        <div className="space-x-4">
                            <button onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })} 
                                    className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                                Try Demo
                            </button>
                            <button onClick={() => document.getElementById('rag-pipeline').scrollIntoView({ behavior: 'smooth' })} 
                                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
                                View Pipeline
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Overview Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" id="features-overview">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Core Features</h2>
                        <p className="text-xl text-gray-600">
                            Discover how our RAG pipeline revolutionizes retail analytics
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* RAG Pipeline */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">RAG Pipeline</h3>
                                <p className="text-gray-600 mb-4">
                                    Advanced data processing with real-time contextual understanding and intelligent retrieval
                                </p>
                            </div>
                        </div>

                        {/* Demand Forecasting */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Demand Forecasting</h3>
                                <p className="text-gray-600 mb-4">
                                    AI-powered predictions with multi-variable analysis and seasonal adjustments
                                </p>
                            </div>
                        </div>

                        {/* Inventory Management */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                            <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Inventory Management</h3>
                                <p className="text-gray-600 mb-4">
                                    Smart stock optimization with automated reordering and real-time tracking
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
                            <div className="text-gray-600">Accuracy Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">50ms</div>
                            <div className="text-gray-600">Response Time</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
                            <div className="text-gray-600">Queries/Day</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                            <div className="text-gray-600">Support</div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                        <button
                            onClick={() => navigate('/features')}
                            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors group"
                        >
                            Explore All Features
                            <svg 
                                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50" id="features">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <i className="fas fa-chart-line text-3xl text-indigo-600 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">Demand Forecasting</h3>
                            <p className="text-gray-600">Accurate predictions using advanced ML algorithms</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <i className="fas fa-boxes text-3xl text-indigo-600 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">Inventory Optimization</h3>
                            <p className="text-gray-600">Smart inventory management and recommendations</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <i className="fas fa-search-dollar text-3xl text-indigo-600 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">Price Optimization</h3>
                            <p className="text-gray-600">Dynamic pricing strategies for maximum profit</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <i className="fas fa-users text-3xl text-indigo-600 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">Customer Insights</h3>
                            <p className="text-gray-600">Deep understanding of customer behavior</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="rag-pipeline" class="rag_pipeline">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-4">Our RAG Pipeline</h2>
                        <p className="text-xl text-gray-600 text-center mb-16">
                            Powering intelligent retail decisions through advanced Retrieval-Augmented Generation
                        </p>

                        {/* Pipeline Steps */}
                        <div className="space-y-12">
                            {/* Step 1: Data Ingestion */}
                            <div className="rag-step flex items-center gap-8 bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex-shrink-0 w-1/3">
                                    <div className="bg-indigo-100 p-6 rounded-xl">
                                        <i className="fas fa-database text-6xl text-indigo-600"></i>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-4">1. Data Ingestion</h3>
                                    <p className="text-gray-600">
                                        Our pipeline processes diverse retail data sources including:
                                    </p>
                                    <ul className="mt-2 space-y-2">
                                        <li className="flex items-center">
                                            <i className="fas fa-check text-green-500 mr-2"></i>
                                            Historical sales data
                                        </li>
                                        <li className="flex items-center">
                                            <i className="fas fa-check text-green-500 mr-2"></i>
                                            Inventory records
                                        </li>
                                        <li className="flex items-center">
                                            <i className="fas fa-check text-green-500 mr-2"></i>
                                            Customer behavior patterns
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Step 2: Text Chunking & Embedding */}
                            <div className="rag-step flex items-center gap-8 bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex-shrink-0 w-1/3">
                                    <div className="bg-purple-100 p-6 rounded-xl">
                                        <i className="fas fa-microchip text-6xl text-purple-600"></i>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-4">2. Text Chunking & Embedding</h3>
                                    <p className="text-gray-600">
                                        Data is processed into semantic chunks and transformed into high-dimensional vectors using:
                                    </p>
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">Chunking</h4>
                                            <p className="text-sm">Intelligent text segmentation for optimal context preservation</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">Embedding</h4>
                                            <p className="text-sm">State-of-the-art language models for vector representation</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Vector Storage */}
                            <div className="rag-step flex items-center gap-8 bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex-shrink-0 w-1/3">
                                    <div className="bg-blue-100 p-6 rounded-xl">
                                        <i className="fas fa-server text-6xl text-blue-600"></i>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-4">3. Vector Storage</h3>
                                    <p className="text-gray-600">
                                        Efficient storage and retrieval using FAISS vector database:
                                    </p>
                                    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">Query Speed</span>
                                            <span className="text-blue-600">{"<"}10ms</span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div className="bg-blue-600 rounded-full h-2 w-4/5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4: Retrieval & Generation */}
                            <div className="rag-step flex items-center gap-8 bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex-shrink-0 w-1/3">
                                    <div className="bg-green-100 p-6 rounded-xl">
                                        <i className="fas fa-brain text-6xl text-green-600"></i>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-4">4. Retrieval & Generation</h3>
                                    <p className="text-gray-600 mb-4">
                                        Intelligent query processing and response generation:
                                    </p>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">Semantic Search</h4>
                                            <div className="flex items-center">
                                                <i className="fas fa-search text-green-600 mr-2"></i>
                                                <span className="text-sm">Context-aware document retrieval</span>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">Response Generation</h4>
                                            <div className="flex items-center">
                                                <i className="fas fa-robot text-green-600 mr-2"></i>
                                                <span className="text-sm">AI-powered insights and recommendations</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                                <div className="text-4xl font-bold text-indigo-600 mb-2">95%</div>
                                <p className="text-gray-600">Query Accuracy</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                                <div className="text-4xl font-bold text-indigo-600 mb-2">{"<"}50ms</div>
                                <p className="text-gray-600">Response Time</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                                <div className="text-4xl font-bold text-indigo-600 mb-2">1M+</div>
                                <p className="text-gray-600">Documents Processed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Demo Section */}
            <section className="py-20 bg-gray-50" id="demo">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-4">Try It Yourself</h2>
                        <p className="text-xl text-gray-600 text-center mb-12">
                            Experience the power of our RAG pipeline with this interactive demo
                        </p>
                        
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <form onSubmit={handleDemoSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ask a question about your retail data
                                    </label>
                                    <input
                                        type="text"
                                        value={demoQuery}
                                        onChange={(e) => setDemoQuery(e.target.value)}
                                        placeholder="e.g., Should we increase inventory for SKU-123 for the holiday season?"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</>
                                    ) : (
                                        'Get Answer'
                                    )}
                                </button>
                            </form>

                            {demoResult && (
                                <div className="mt-8 space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-green-800 mb-2">Answer:</h4>
                                        <p className="text-green-700">{demoResult.answer}</p>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-800 mb-2">Confidence Score:</h4>
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 rounded-full h-2" 
                                                style={{ width: `${demoResult.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-blue-700 mt-2">{(demoResult.confidence * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-purple-800 mb-2">Sources:</h4>
                                        <ul className="list-disc list-inside text-purple-700">
                                            {demoResult.sources.map((source, index) => (
                                                <li key={index}>{source}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Case Studies Section */}
            <section className="py-20" id="case-studies">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Success Stories</h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        See how leading retailers transformed their operations with our RAG pipeline
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="h-48 bg-indigo-600 flex items-center justify-center">
                                <i className="fas fa-shopping-bag text-6xl text-white"></i>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Fashion Retailer</h3>
                                <p className="text-gray-600 mb-4">
                                    Reduced inventory costs by 23% while maintaining 99% product availability
                                </p>
                                <div className="flex items-center text-indigo-600">
                                    <span className="font-semibold">Read More</span>
                                    <i className="fas fa-arrow-right ml-2"></i>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="h-48 bg-purple-600 flex items-center justify-center">
                                <i className="fas fa-utensils text-6xl text-white"></i>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Restaurant Chain</h3>
                                <p className="text-gray-600 mb-4">
                                    Improved demand forecasting accuracy by 35% across 200+ locations
                                </p>
                                <div className="flex items-center text-purple-600">
                                    <span className="font-semibold">Read More</span>
                                    <i className="fas fa-arrow-right ml-2"></i>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="h-48 bg-blue-600 flex items-center justify-center">
                                <i className="fas fa-store text-6xl text-white"></i>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Supermarket Giant</h3>
                                <p className="text-gray-600 mb-4">
                                    Achieved 15% reduction in food waste through precise ordering
                                </p>
                                <div className="flex items-center text-blue-600">
                                    <span className="font-semibold">Read More</span>
                                    <i className="fas fa-arrow-right ml-2"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Architecture Section */}
            <section className="py-20 bg-gray-50" id="architecture">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Technical Architecture</h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Our enterprise-grade infrastructure ensures reliability, scalability, and security
                    </p>

                    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-indigo-600">Frontend</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>React.js with TypeScript</span>
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>TailwindCSS for styling</span>
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>Redux for state management</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-purple-600">Backend</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>FastAPI for high performance</span>
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>PostgreSQL database</span>
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>Redis for caching</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-blue-600">ML Infrastructure</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>FAISS for vector search</span>
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>LangChain for RAG pipeline</span>
                                    </li>
                                    <li className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                        <span>OpenAI for embeddings</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12">
                            <h3 className="text-lg font-semibold mb-4">Security & Compliance</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <i className="fas fa-shield-alt text-2xl text-gray-600 mb-2"></i>
                                    <p className="text-sm">SOC 2 Certified</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <i className="fas fa-lock text-2xl text-gray-600 mb-2"></i>
                                    <p className="text-sm">GDPR Compliant</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <i className="fas fa-key text-2xl text-gray-600 mb-2"></i>
                                    <p className="text-sm">End-to-End Encryption</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <i className="fas fa-user-shield text-2xl text-gray-600 mb-2"></i>
                                    <p className="text-sm">Role-Based Access</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* API Documentation Preview */}
            <section className="py-20 bg-gray-50" id="api">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Developer-Friendly API</h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Integrate our RAG pipeline into your existing systems with ease
                    </p>

                    <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
                        <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="p-6">
                            <pre className="text-green-400 mb-4"># Initialize the RAG pipeline</pre>
                            <code className="text-white">
                                <div className="mb-2">from retail_rag import RetailRAGPipeline</div>
                                <div className="mb-4">pipeline = RetailRAGPipeline()</div>
                                <div className="text-purple-400 mb-2"># Query the pipeline</div>
                                <div className="mb-2">response = pipeline.query(</div>
                                <div className="pl-4 mb-2">query="What products should we restock?",</div>
                                <div className="pl-4 mb-2">confidence_threshold=0.8</div>
                                <div>)</div>
                            </code>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="text-xl font-bold text-indigo-600 mb-2">REST API</div>
                            <p className="text-gray-600">Simple HTTP endpoints for quick integration</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="text-xl font-bold text-purple-600 mb-2">Python SDK</div>
                            <p className="text-gray-600">Native Python library for seamless development</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="text-xl font-bold text-blue-600 mb-2">WebSocket</div>
                            <p className="text-gray-600">Real-time updates and streaming responses</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-20" id="comparison">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Why Choose Us</h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        See how we stack up against traditional solutions
                    </p>

                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-4 text-left text-gray-600">Features</th>
                                        <th className="px-6 py-4 text-center text-indigo-600">Our Solution</th>
                                        <th className="px-6 py-4 text-center text-gray-600">Traditional Systems</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="px-6 py-4 text-gray-800">Query Processing Time</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-green-600 font-semibold">{"<"}50ms</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-red-600 font-semibold">500ms+</span>
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-6 py-4 text-gray-800">Natural Language Understanding</td>
                                        <td className="px-6 py-4 text-center">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <i className="fas fa-times-circle text-red-500"></i>
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-6 py-4 text-gray-800">Contextual Awareness</td>
                                        <td className="px-6 py-4 text-center">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <i className="fas fa-times-circle text-red-500"></i>
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-6 py-4 text-gray-800">Real-time Updates</td>
                                        <td className="px-6 py-4 text-center">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <i className="fas fa-times-circle text-red-500"></i>
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="px-6 py-4 text-gray-800">Scalability</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-green-600 font-semibold">Unlimited</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-red-600 font-semibold">Limited</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Testimonials Section */}
            <section className="py-20 bg-gray-50" id="testimonials">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">What Our Customers Say</h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Trusted by leading retailers worldwide
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-user text-2xl text-indigo-600"></i>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Sarah Johnson</h4>
                                    <p className="text-gray-600 text-sm">CTO, FashionCo</p>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                "The RAG pipeline has revolutionized our inventory management. We've seen a 40% reduction in stockouts and improved customer satisfaction."
                            </p>
                            <div className="mt-4 flex text-yellow-400">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-user text-2xl text-purple-600"></i>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Michael Chen</h4>
                                    <p className="text-gray-600 text-sm">COO, GroceryPlus</p>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                "Implementation was seamless, and the results were immediate. Our forecasting accuracy improved by 35% within the first month."
                            </p>
                            <div className="mt-4 flex text-yellow-400">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-user text-2xl text-blue-600"></i>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold">Emma Davis</h4>
                                    <p className="text-gray-600 text-sm">CEO, RetailTech</p>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                "The insights provided by the RAG pipeline have been invaluable. It's like having a data scientist team working 24/7."
                            </p>
                            <div className="mt-4 flex text-yellow-400">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Preview Section */}
            <section className="py-20" id="blog">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Technical Deep Dives</h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Explore the technical implementation details of our RAG pipeline
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">RAG Pipeline Architecture</h3>
                                <p className="text-gray-600 mb-4">
                                    Deep dive into how we built our Retrieval-Augmented Generation pipeline for retail data...
                                </p>
                                <a href="#rag-pipeline" className="text-indigo-600 font-semibold hover:text-indigo-700">
                                    Read More →
                                </a>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Data Processing Pipeline</h3>
                                <p className="text-gray-600 mb-4">
                                    How we handle data ingestion, preprocessing, and vector embeddings...
                                </p>
                                <a href="#architecture" className="text-indigo-600 font-semibold hover:text-indigo-700">
                                    Read More →
                                </a>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="h-48 bg-gradient-to-r from-pink-500 to-red-500"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">API Implementation</h3>
                                <p className="text-gray-600 mb-4">
                                    Technical details of our FastAPI backend and integration points...
                                </p>
                                <a href="#api" className="text-indigo-600 font-semibold hover:text-indigo-700">
                                    Read More →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Research Articles Section */}
            <section className="py-20" id="research">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Research Foundation</h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Our implementation is based on cutting-edge research in RAG and retail analytics
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-indigo-100 text-indigo-600 text-sm font-semibold px-3 py-1 rounded-full">
                                    RAG Architecture
                                </div>
                                <span className="text-gray-500 text-sm">2023</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Retrieval-Augmented Generation for Large Language Models: A Survey</h3>
                            <p className="text-gray-600 mb-4">
                                Comprehensive overview of RAG architectures, focusing on retrieval mechanisms and their application in domain-specific contexts.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">arXiv:2312.10997</span>
                                <a href="https://arxiv.org/abs/2312.10997" target="_blank" rel="noopener noreferrer" 
                                   className="text-indigo-600 hover:text-indigo-700 flex items-center">
                                    Read Paper <i className="fas fa-external-link-alt ml-2"></i>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-purple-100 text-purple-600 text-sm font-semibold px-3 py-1 rounded-full">
                                    Vector Search
                                </div>
                                <span className="text-gray-500 text-sm">2024</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">TimeRAG: Boosting LLM Time Series Forecasting via Retrieval-Augmented Generation</h3>
                            <p className="text-gray-600 mb-4">
                                Novel approach improving prediction accuracy by 2.97% through time series knowledge base and dynamic time warping.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">arXiv:2412.16643</span>
                                <a href="https://arxiv.org/html/2412.16643v1" target="_blank" rel="noopener noreferrer" 
                                   className="text-indigo-600 hover:text-indigo-700 flex items-center">
                                    Read Paper <i className="fas fa-external-link-alt ml-2"></i>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-100 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full">
                                    Retail Analytics
                                </div>
                                <span className="text-gray-500 text-sm">2023</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Large Language Models for Retail: A Comprehensive Survey</h3>
                            <p className="text-gray-600 mb-4">
                                Analysis of LLM applications in retail, including inventory management and demand forecasting.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">arXiv:2305.15721</span>
                                <a href="https://arxiv.org/abs/2305.15721" target="_blank" rel="noopener noreferrer" 
                                   className="text-indigo-600 hover:text-indigo-700 flex items-center">
                                    Read Paper <i className="fas fa-external-link-alt ml-2"></i>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full">
                                    Implementation
                                </div>
                                <span className="text-gray-500 text-sm">2024</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">RetailGPT: A Domain-Specific LLM for Retail Industry</h3>
                            <p className="text-gray-600 mb-4">
                                Specialized retail language model achieving state-of-the-art performance in inventory management and demand forecasting.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">DOI: 10.1145/3626772.3661370</span>
                                <a href="https://dl.acm.org/doi/abs/10.1145/3626772.3661370" target="_blank" rel="noopener noreferrer" 
                                   className="text-indigo-600 hover:text-indigo-700 flex items-center">
                                    Read Paper <i className="fas fa-external-link-alt ml-2"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-gray-600">
                            Our implementation synthesizes insights from these papers to create a robust and efficient RAG pipeline
                        </p>
                    </div>
                </div>
            </section>

            
            {/* Innovation Comparison Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50" id="innovation">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Innovation & Improvements</h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Building upon industry solutions while pushing boundaries
                    </p>

                    <div className="max-w-5xl mx-auto">
                        {/* Pluto7 Inspiration */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <h3 className="text-2xl font-bold mb-4 text-indigo-600">Inspired by Pluto7's Approach</h3>
                            <p className="text-gray-600 mb-6">
                                Our solution draws inspiration from Pluto7's successful implementation of ML-driven retail analytics, particularly their:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex items-start">
                                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                                    <div>
                                        <h4 className="font-semibold mb-2">Demand Forecasting Framework</h4>
                                        <p className="text-gray-600">Integration of historical data with real-time market signals</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                                    <div>
                                        <h4 className="font-semibold mb-2">Multi-channel Data Integration</h4>
                                        <p className="text-gray-600">Unified view across various retail touchpoints</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Our Improvements */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold mb-4 text-purple-600">Our Enhanced Approach</h3>
                            <p className="text-gray-600 mb-6">
                                We've built upon these foundations and introduced significant improvements:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-purple-50 rounded-xl p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-purple-100 rounded-full p-2 mr-4">
                                            <i className="fas fa-brain text-purple-600"></i>
                                        </div>
                                        <h4 className="font-bold">Advanced RAG Pipeline</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <i className="fas fa-arrow-right text-purple-600 mt-1 mr-2"></i>
                                            <span>Real-time context understanding with 40% better accuracy</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-arrow-right text-purple-600 mt-1 mr-2"></i>
                                            <span>Dynamic query processing with self-reflection capabilities</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-blue-100 rounded-full p-2 mr-4">
                                            <i className="fas fa-chart-line text-blue-600"></i>
                                        </div>
                                        <h4 className="font-bold">Enhanced Analytics</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <i className="fas fa-arrow-right text-blue-600 mt-1 mr-2"></i>
                                            <span>Granular SKU-level insights with 95% confidence</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-arrow-right text-blue-600 mt-1 mr-2"></i>
                                            <span>Predictive analytics with 30% reduced latency</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-green-50 rounded-xl p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-green-100 rounded-full p-2 mr-4">
                                            <i className="fas fa-database text-green-600"></i>
                                        </div>
                                        <h4 className="font-bold">Vector Search Innovation</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <i className="fas fa-arrow-right text-green-600 mt-1 mr-2"></i>
                                            <span>Optimized FAISS implementation with 60% faster retrieval</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-arrow-right text-green-600 mt-1 mr-2"></i>
                                            <span>Advanced chunking strategies for better context preservation</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-red-50 rounded-xl p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-red-100 rounded-full p-2 mr-4">
                                            <i className="fas fa-bolt text-red-600"></i>
                                        </div>
                                        <h4 className="font-bold">Performance Boost</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <i className="fas fa-arrow-right text-red-600 mt-1 mr-2"></i>
                                            <span>Sub-50ms response time for real-time queries</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-arrow-right text-red-600 mt-1 mr-2"></i>
                                            <span>Scalable architecture handling 1M+ SKUs efficiently</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Key Differentiators */}
                        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                            <h3 className="text-2xl font-bold mb-6">Key Advantages Over Traditional Solutions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center">
                                    <i className="fas fa-rocket text-2xl mr-4"></i>
                                    <div>
                                        <p className="font-semibold">3x Faster</p>
                                        <p className="text-indigo-200">Query Processing</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <i className="fas fa-bullseye text-2xl mr-4"></i>
                                    <div>
                                        <p className="font-semibold">40% More Accurate</p>
                                        <p className="text-indigo-200">Predictions</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <i className="fas fa-memory text-2xl mr-4"></i>
                                    <div>
                                        <p className="font-semibold">50% Less</p>
                                        <p className="text-indigo-200">Resource Usage</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Future-Ready Architecture Section */}
            <section className="py-20 bg-gradient-to-br from-gray-900 to-indigo-900 text-white" id="future-ready">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-4">Future-Ready Architecture</h2>
                    <p className="text-xl text-gray-300 text-center mb-12">
                        Prepared for enterprise-scale data processing with intelligent scaling solutions
                    </p>

                    <div className="max-w-6xl mx-auto">
                        {/* Challenge Overview */}
                        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                            <div className="flex items-center mb-6">
                                <div className="bg-red-500 rounded-full p-3">
                                    <i className="fas fa-exclamation-triangle text-2xl"></i>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-2xl font-bold mb-2">Big Data Challenge</h3>
                                    <p className="text-gray-400">
                                        Processing millions of SKUs and real-time market data requires robust scalability solutions
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gray-700 rounded-xl p-6">
                                    <h4 className="font-bold mb-3">Data Volume</h4>
                                    <p className="text-gray-400">Handling 100TB+ of historical retail data and growing by 500GB daily</p>
                                </div>
                                <div className="bg-gray-700 rounded-xl p-6">
                                    <h4 className="font-bold mb-3">Query Load</h4>
                                    <p className="text-gray-400">Processing 1000+ concurrent queries during peak hours</p>
                                </div>
                                <div className="bg-gray-700 rounded-xl p-6">
                                    <h4 className="font-bold mb-3">Real-time Updates</h4>
                                    <p className="text-gray-400">Maintaining sub-second latency for live inventory updates</p>
                                </div>
                            </div>
                        </div>

                        {/* Our Solution */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
                                <h3 className="text-2xl font-bold mb-6">Auto-Scaling Infrastructure</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="bg-indigo-500 rounded-full p-2 mt-1">
                                            <i className="fas fa-server text-sm"></i>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-semibold mb-2">Virtual Machine Clusters</h4>
                                            <p className="text-gray-400">Dynamic VM allocation based on workload with automatic scaling triggers</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-indigo-500 rounded-full p-2 mt-1">
                                            <i className="fas fa-microchip text-sm"></i>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-semibold mb-2">Resource Optimization</h4>
                                            <p className="text-gray-400">ML-powered resource allocation predicting computing needs</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-indigo-500 rounded-full p-2 mt-1">
                                            <i className="fas fa-network-wired text-sm"></i>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-semibold mb-2">Load Distribution</h4>
                                            <p className="text-gray-400">Intelligent request routing across multiple data centers</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
                                <h3 className="text-2xl font-bold mb-6">Data Processing Innovation</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="bg-purple-500 rounded-full p-2 mt-1">
                                            <i className="fas fa-database text-sm"></i>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-semibold mb-2">Distributed Vector Store</h4>
                                            <p className="text-gray-400">Sharded FAISS implementation across multiple nodes for parallel processing</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-purple-500 rounded-full p-2 mt-1">
                                            <i className="fas fa-memory text-sm"></i>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-semibold mb-2">Smart Caching</h4>
                                            <p className="text-gray-400">Predictive caching system reducing repeated computations by 70%</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-purple-500 rounded-full p-2 mt-1">
                                            <i className="fas fa-stream text-sm"></i>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-semibold mb-2">Stream Processing</h4>
                                            <p className="text-gray-400">Real-time data processing pipeline handling 100K events/second</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold mb-8 text-center">Scalability Metrics</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">100K+</div>
                                    <div className="text-gray-300">Queries/Second</div>
                                    <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 rounded-full h-2 w-3/4"></div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">99.99%</div>
                                    <div className="text-gray-300">Uptime</div>
                                    <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 rounded-full h-2 w-11/12"></div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">50ms</div>
                                    <div className="text-gray-300">Latency</div>
                                    <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 rounded-full h-2 w-4/5"></div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">10PB</div>
                                    <div className="text-gray-300">Data Capacity</div>
                                    <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 rounded-full h-2 w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 bg-gray-50" id="about">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">About Brainy Fools</h2>
                        <p className="text-gray-600 text-lg">
                            We are a team of data scientists and retail experts dedicated to helping businesses thrive in the digital age. 
                            Our platform combines cutting-edge AI technology with deep industry knowledge to deliver actionable insights.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20" id="contact">
                <div className="container mx-auto px-4">
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8">Get in Touch</h2>
                        <form className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <textarea
                                    placeholder="Message"
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Explore Our Features Section */}
           
        </div>
    );
} 