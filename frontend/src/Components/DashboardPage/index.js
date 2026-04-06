import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State passed from CustomersPage → { totalDistanceKm, totalTravelCostInr, visits }
  const data = location.state?.formattedData;

  const totalDistance = data?.totalDistanceKm ?? 0;
  const totalCost = data?.totalTravelCostInr ?? 0;
  const totalCustomers = data?.visits?.length ?? 0;

  if (!data) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Route Optimization Dashboard</h1>
        <div className="dashboard-error">
          No data available. Please start from the home page.
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Route Optimization Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon distance-icon">🗺️</div>
          <div className="stat-content">
            <p className="stat-label">Total Distance</p>
            <p className="stat-value">
              {totalDistance.toFixed(2)}
              <span className="stat-unit">km</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cost-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Travel Cost</p>
            <p className="stat-value">
              ₹{totalCost.toFixed(2)}
              <span className="stat-unit">INR</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Customers Visited</p>
            <p className="stat-value">
              {totalCustomers}
              <span className="stat-unit">customers</span>
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-summary">
        <p>
          Optimized route created with <strong>{totalCustomers}</strong> borrowers
          across <strong>{totalDistance.toFixed(2)} km</strong> at a cost of{' '}
          <strong>₹{totalCost.toFixed(2)}</strong>
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Home
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
