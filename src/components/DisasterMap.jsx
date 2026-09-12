import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on severity
const getMarkerIcon = (severity) => {
  const colors = {
    'Critical': '#FF5252',
    'CRITICAL': '#FF5252',
    'High': '#FF9800',
    'Moderate': '#FFC107',
    'Low': '#4CAF50',
  };
  const color = colors[severity] || '#4b41e1';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: bold;
    ">⚠️</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Fit bounds component
const FitBounds = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  
  return null;
};

const DisasterMap = ({ 
  incidents = [], 
  shelters = [], 
  center = [27.7172, 85.3240], 
  zoom = 12,
  height = '500px',
}) => {
  // Use state to track incidents so we can update them
  const [mapIncidents, setMapIncidents] = useState(incidents);
  const [mapShelters, setMapShelters] = useState(shelters);

  // Update when props change
  useEffect(() => {
    setMapIncidents(incidents);
    setMapShelters(shelters);
  }, [incidents, shelters]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const data = JSON.parse(localStorage.getItem('disasterData') || '[]');
        console.log('🔄 Map detected localStorage change. Incidents:', data.length);
        setMapIncidents(data);
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab updates
    window.addEventListener('disasterDataUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('disasterDataUpdated', handleStorageChange);
    };
  }, []);

  // Get positions for bounds
  const positions = [
    ...mapIncidents.map(i => [i.lat || 27.7172, i.lng || 85.3240]),
    ...mapShelters.map(s => [s.lat || 27.7172, s.lng || 85.3240]),
  ].filter(pos => pos[0] && pos[1]);

  // Shelter icon
  const shelterIcon = L.divIcon({
    className: 'shelter-marker',
    html: `<div style="
      background-color: #4b41e1;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
    ">🏠</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  // Log markers for debugging
  console.log('🗺️ Rendering map with', mapIncidents.length, 'incidents');

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        zoomControl={true}
        dragging={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Incident Markers */}
        {mapIncidents.map((incident) => {
          const lat = incident.lat || 27.7172;
          const lng = incident.lng || 85.3240;
          const severity = incident.severity || 'Moderate';
          
          return (
            <Marker
              key={`incident-${incident.id}`}
              position={[lat, lng]}
              icon={getMarkerIcon(severity)}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="font-bold">{incident.title || 'Incident'}</div>
                  <div className="text-sm text-gray-600">{incident.location || 'Unknown'}</div>
                  <div className="text-sm font-semibold mt-1">Severity: {severity}</div>
                  {incident.peopleAffected && (
                    <div className="text-xs text-gray-500">👥 {incident.peopleAffected} affected</div>
                  )}
                  <button className="mt-2 text-xs text-blue-600 font-semibold hover:underline">
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shelter Markers */}
        {mapShelters.map((shelter) => {
          const lat = shelter.lat || 27.7172;
          const lng = shelter.lng || 85.3240;

          return (
            <Marker
              key={`shelter-${shelter.id}`}
              position={[lat, lng]}
              icon={shelterIcon}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="font-bold">🏠 {shelter.name}</div>
                  <div className="text-sm text-gray-600">{shelter.location}</div>
                  <div className="mt-1 text-sm">
                    Capacity: {shelter.occupancy || 0}/{shelter.capacity || 0}
                  </div>
                  <div className="text-sm">
                    Status: {shelter.status || 'Open'}
                  </div>
                  <button className="mt-2 text-xs text-blue-600 font-semibold hover:underline">
                    Get Directions →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {positions.length > 0 && <FitBounds positions={positions} />}
      </MapContainer>
    </div>
  );
};

export default DisasterMap;