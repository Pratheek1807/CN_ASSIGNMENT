import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import { updateVisit } from '../../api';
import RouteMap from '../RouteMap';

const CustomersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data arrives already in camelCase (mapped in LandingPage via mapVisit())
  const rawData = location.state?.customers;

  const [customersData, setCustomersData] = useState(
    (rawData?.visits ?? []).map((c) => ({
      ...c,
      // preserve remark & remarked from mapVisit (which reads them from DB)
      // only add the UI-only fields that mapVisit doesn't set
      updating: false,
      updateError: '',
    }))
  );

  // PATCH /api/v1/visits/:id  — only fires the API if borrowerId (UUID) exists
  const handleUpdate = async (borrowerId) => {
    const customer = customersData.find((c) => c.borrowerId === borrowerId);
    if (!customer) return;

    // Optimistic: mark as updating
    setCustomersData((prev) =>
      prev.map((c) =>
        c.borrowerId === borrowerId ? { ...c, updating: true, updateError: '' } : c
      )
    );

    try {
      if (customer.borrowerId) {
        // We have a real UUID from the backend — call the PATCH endpoint
        await updateVisit(customer.borrowerId, { remark: customer.remark });
      }
      // Mark as remarked regardless (works even with mock data that has no UUID)
      setCustomersData((prev) =>
        prev.map((c) =>
          c.borrowerId === borrowerId
            ? { ...c, remarked: true, updating: false }
            : c
        )
      );
    } catch (err) {
      setCustomersData((prev) =>
        prev.map((c) =>
          c.borrowerId === borrowerId
            ? { ...c, updating: false, updateError: err.message }
            : c
        )
      );
    }
  };

  const onFinish = () => {
    navigate('/dashboard', {
      state: {
        formattedData: {
          totalDistanceKm: rawData?.total_distance_km ?? 0,
          totalTravelCostInr: rawData?.total_travel_cost_inr ?? 0,
          visits: customersData,
        },
      },
    });
  };

  if (!rawData || customersData.length === 0) {
    return (
      <div className="customers-view">
        <h1 className="customer-header">Customer List</h1>
        <p style={{ color: '#fff', marginTop: 40 }}>
          No customer data found. Please go back and generate a route first.
        </p>
        <button className="finish-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    );
  }

  // Pull agent start coords from rawData (set by LandingPage from backend response)
  const agentLat = rawData?.agent_start?.latitude ?? 12.9716;
  const agentLon = rawData?.agent_start?.longitude ?? 77.5946;

  return (
    <div className="customers-view">
      <h1 className="customer-header">Customer List</h1>

      {/* ── Interactive Route Map ── */}
      <RouteMap
        agentLat={agentLat}
        agentLon={agentLon}
        visits={customersData}
      />

      <ul className="customers-list">
        {customersData.map((customer) => (
          <li key={customer.borrowerId} className="customer-item">
            <div className="customer-rank">#{customer.visitRank}</div>
            <p className="customer-name">{customer.borrowerName}</p>
            <p className="customer-meta">{customer.city}</p>
            <p className="customer-email">
              Amount to Collect:{' '}
              <strong>₹{(customer.outstandingLoanAmount ?? 0).toLocaleString()}</strong>
            </p>
            <p className="customer-email">
              Distance: <strong>{customer.distanceKm} km</strong> &nbsp;|&nbsp; Travel
              Cost: <strong>₹{customer.travelCostInr}</strong>
            </p>
            <p className="customer-email">
              Days Past Due: <strong>{customer.daysPastDue}</strong>
            </p>

            <div className="remark-section">
              <label>
                Remarks:
                <br />
                <input
                  type="text"
                  value={customer.remark}
                  placeholder="Any remarks…"
                  disabled={customer.remarked || customer.updating}
                  onChange={(e) =>
                    setCustomersData((prev) =>
                      prev.map((c) =>
                        c.borrowerId === customer.borrowerId
                          ? { ...c, remark: e.target.value }
                          : c
                      )
                    )
                  }
                />
              </label>

              {customer.updateError && (
                <p className="update-error">{customer.updateError}</p>
              )}

              {customer.remarked ? (
                <span className="remarked-badge">✓ Remarked</span>
              ) : (
                <button
                  onClick={() => handleUpdate(customer.borrowerId)}
                  disabled={customer.updating}
                >
                  {customer.updating ? 'Saving…' : 'Update'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button className="finish-button" onClick={onFinish}>
        Finish &amp; View Dashboard
      </button>
    </div>
  );
};

export default CustomersPage;