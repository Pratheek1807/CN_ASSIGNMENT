import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's broken default icon paths in CRA/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

// Red icon for agent depot
const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
  shadowSize: [41, 41],
});

// Blue icon for borrowers
const borrowerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
  shadowSize: [41, 41],
});

/**
 * RouteMap
 * Props:
 *   agentLat {number}  - agent/depot latitude
 *   agentLon {number}  - agent/depot longitude
 *   visits   {Array}   - camelCase visit objects from mapVisit()
 */
const RouteMap = ({ agentLat, agentLon, visits }) => {
  if (!visits || visits.length === 0) return null;

  // Sort visits by rank order and build polyline coords
  const sorted = [...visits].sort((a, b) => a.visitRank - b.visitRank);
  const routeCoords = [
    [agentLat, agentLon],
    ...sorted.map((v) => [v.latitude, v.longitude]),
    [agentLat, agentLon],
  ];

  return (
    <div style={{
      width: '100%',
      height: '420px',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
    }}>
      <MapContainer
        center={[agentLat, agentLon]}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Agent / Depot Marker */}
        <Marker position={[agentLat, agentLon]} icon={depotIcon}>
          <Popup>
            <strong>🏠 Agent Start</strong><br />
            ({agentLat.toFixed(4)}, {agentLon.toFixed(4)})
          </Popup>
        </Marker>

        {/* Borrower Markers */}
        {sorted.map((v) => (
          <Marker
            key={v.borrowerId}
            position={[v.latitude, v.longitude]}
            icon={borrowerIcon}
          >
            <Popup>
              <strong>#{v.visitRank} — {v.borrowerName}</strong><br />
              📍 {v.city}<br />
              💰 ₹{(v.outstandingLoanAmount ?? 0).toLocaleString()}<br />
              ⏱ {v.daysPastDue} days past due<br />
              🚗 {v.distanceKm} km | ₹{v.travelCostInr}<br />
              ⭐ Priority: {(v.priorityScore ?? 0).toFixed(4)}
              {v.remark && (<><br />📝 <em>{v.remark}</em></>)}
            </Popup>
          </Marker>
        ))}

        {/* Dashed route polyline */}
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: '#6366f1', weight: 3, opacity: 0.85, dashArray: '8 5' }}
        />
      </MapContainer>
    </div>
  );
};

export default RouteMap;
