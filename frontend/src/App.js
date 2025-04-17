import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/forecast';
import Inventory from './pages/inventory';
import Settings from './pages/settings';
import Features from './pages/Features';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/features" element={
          <Layout>
            <Features />
          </Layout>
        } />
        <Route path="/forecast" element={
          <Layout>
            <Forecast />
          </Layout>
        } />
        <Route path="/inventory" element={
          <Layout>
            <Inventory />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <Settings />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App; 