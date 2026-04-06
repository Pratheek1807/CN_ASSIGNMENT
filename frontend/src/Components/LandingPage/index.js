import './index.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { fetchOptimizedRoute, mapVisit } from '../../api';

const LandingPage = () => {
  const navigate = useNavigate();

  const [agentLat, setAgentLat] = useState('12.9716');
  const [agentLon, setAgentLon] = useState('77.5946');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    const lat = parseFloat(agentLat);
    const lon = parseFloat(agentLon);

    if (isNaN(lat) || isNaN(lon)) {
      setError('Please enter valid latitude and longitude values.');
      return;
    }
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90.');
      return;
    }
    if (lon < -180 || lon > 180) {
      setError('Longitude must be between -180 and 180.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await fetchOptimizedRoute(lat, lon);
      const visits = data.visits.map(mapVisit);
      navigate('/customers', {
        state: {
          customers: {
            agent_start: data.agent_start,
            total_distance_km: data.total_distance_km,
            total_travel_cost_inr: data.total_travel_cost_inr,
            best_weights: data.best_weights,
            visits,
          },
        },
      });
    } catch (err) {
      setError(`Failed to fetch route: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page">
      <div className="landing-card">
        <h1 className="landing-title">Field Agent Route Optimizer</h1>
        <p className="landing-subtitle">
          Enter your current location to generate the optimal borrower visit sequence.
        </p>

        <div className="location-form">
          <div className="input-group">
            <label htmlFor="agentLat">Latitude</label>
            <input
              id="agentLat"
              type="number"
              step="any"
              value={agentLat}
              onChange={(e) => setAgentLat(e.target.value)}
              placeholder="e.g. 12.9716"
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="agentLon">Longitude</label>
            <input
              id="agentLon"
              type="number"
              step="any"
              value={agentLon}
              onChange={(e) => setAgentLon(e.target.value)}
              placeholder="e.g. 77.5946"
              disabled={loading}
            />
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button
          className="request-btn"
          onClick={handleFetch}
          disabled={loading}
        >
          {loading ? 'Optimizing Route…' : 'Generate Optimized Route'}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;