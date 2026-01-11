import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, AlertTriangle, Shield, Activity, Zap } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CyberThreatHeatmap = () => {
  const [threats, setThreats] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [filter, setFilter] = useState('all');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [stats, setStats] = useState({
    totalThreats: 0,
    averageRisk: 0,
    highRiskCount: 0,
    activeRegions: 0
  });
  const [wsConnection, setWsConnection] = useState(null);
  const mapRef = useRef(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (realTimeEnabled) {
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('Connected to threat intelligence server');
        ws.send(JSON.stringify({ type: 'subscribe-threats' }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'threat-analyzed') {
          setThreats(prev => {
            const newThreats = [data.report, ...prev.slice(0, 99)]; // Keep last 100
            return newThreats;
          });
        }
        
        if (data.type === 'initial-data') {
          setThreats(data.recentThreats || []);
          setRegionalData(data.regionalThreats || []);
          setStats(data.stats || {});
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      
      setWsConnection(ws);
      
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [realTimeEnabled]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        const data = await response.json();
        
        // Mock regional data for demonstration
        const mockRegionalData = [
          {
            region: 'Delhi',
            lat: 28.6139,
            lng: 77.2090,
            totalThreats: 245,
            highRiskThreats: 89,
            riskLevel: 'high',
            threats: [
              { type: 'phone', entity: '+91-9876543210', riskScore: 8.5 },
              { type: 'url', entity: 'http://fake-bank.com', riskScore: 9.2 }
            ]
          },
          {
            region: 'Mumbai',
            lat: 19.0760,
            lng: 72.8777,
            totalThreats: 189,
            highRiskThreats: 67,
            riskLevel: 'medium',
            threats: [
              { type: 'email', entity: 'scam@fake.com', riskScore: 7.8 },
              { type: 'upi', entity: 'fake@paytm', riskScore: 6.5 }
            ]
          },
          {
            region: 'Bangalore',
            lat: 12.9716,
            lng: 77.5946,
            totalThreats: 156,
            highRiskThreats: 43,
            riskLevel: 'medium',
            threats: [
              { type: 'social', entity: 'fake-facebook', riskScore: 7.2 }
            ]
          },
          {
            region: 'Chennai',
            lat: 13.0827,
            lng: 80.2707,
            totalThreats: 134,
            highRiskThreats: 38,
            riskLevel: 'medium',
            threats: [
              { type: 'phone', entity: '+91-9876543211', riskScore: 6.8 }
            ]
          },
          {
            region: 'Kolkata',
            lat: 22.5726,
            lng: 88.3639,
            totalThreats: 98,
            highRiskThreats: 29,
            riskLevel: 'low',
            threats: [
              { type: 'url', entity: 'http://scam-site.in', riskScore: 5.2 }
            ]
          }
        ];
        
        setRegionalData(mockRegionalData);
        
        // Mock threats for demonstration
        const mockThreats = [
          {
            id: '1',
            type: 'phone',
            entity: '+91-9876543210',
            riskScore: 8.5,
            location: { lat: 28.6139, lng: 77.2090, city: 'Delhi' },
            timestamp: Date.now() - 3600000,
            trend: 'up'
          },
          {
            id: '2',
            type: 'url',
            entity: 'http://fake-bank.com',
            riskScore: 9.2,
            location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
            timestamp: Date.now() - 7200000,
            trend: 'up'
          },
          {
            id: '3',
            type: 'email',
            entity: 'scam@fake.com',
            riskScore: 7.8,
            location: { lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
            timestamp: Date.now() - 10800000,
            trend: 'stable'
          }
        ];
        
        setThreats(mockThreats);
        
        setStats({
          totalThreats: mockThreats.length,
          averageRisk: 7.8,
          highRiskCount: mockThreats.filter(t => t.riskScore > 7).length,
          activeRegions: mockRegionalData.length
        });
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);

  // Custom marker icons based on threat type
  const getThreatIcon = (type, riskScore) => {
    const color = riskScore > 7 ? '#ef4444' : riskScore > 5 ? '#f59e0b' : '#10b981';
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${getThreatIconSymbol(type)}
        </div>
      `,
      className: 'custom-threat-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getThreatIconSymbol = (type) => {
    const symbols = {
      phone: '📱',
      url: '🌐',
      email: '📧',
      upi: '💰',
      social: '👥'
    };
    return symbols[type] || '⚠️';
  };

  // Filter threats based on selected filter
  const filteredThreats = threats.filter(threat => {
    if (filter === 'all') return true;
    if (filter === 'high') return threat.riskScore > 7;
    if (filter === 'medium') return threat.riskScore > 5 && threat.riskScore <= 7;
    if (filter === 'low') return threat.riskScore <= 5;
    return threat.type === filter;
  });

  // Map component for updating bounds
  const MapUpdater = () => {
    const map = useMap();
    
    useEffect(() => {
      if (filteredThreats.length > 0) {
        const bounds = L.latLngBounds(
          filteredThreats.map(threat => [threat.location.lat, threat.location.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [filteredThreats, map]);
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Activity className="w-8 h-8 text-red-500" />
            Interactive Cyber Threat Heatmap
          </h1>
          <p className="text-gray-400">Real-time cyber threat intelligence across India</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Threats</p>
                <p className="text-2xl font-bold">{stats.totalThreats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Risk</p>
                <p className="text-2xl font-bold">{stats.averageRisk.toFixed(1)}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Risk</p>
                <p className="text-2xl font-bold">{stats.highRiskCount}</p>
              </div>
              <Zap className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Regions</p>
                <p className="text-2xl font-bold">{stats.activeRegions}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Threats</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
                <option value="phone">Phone</option>
                <option value="url">URL</option>
                <option value="email">Email</option>
                <option value="upi">UPI</option>
                <option value="social">Social</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Real-time Updates:</label>
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`px-3 py-1 rounded border ${
                  realTimeEnabled 
                    ? 'bg-green-600 border-green-500' 
                    : 'bg-gray-600 border-gray-500'
                }`}
              >
                {realTimeEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">High Risk</span>
              <div className="w-3 h-3 bg-yellow-500 rounded-full ml-2"></div>
              <span className="text-sm">Medium Risk</span>
              <div className="w-3 h-3 bg-green-500 rounded-full ml-2"></div>
              <span className="text-sm">Low Risk</span>
            </div>
          </div>
        </div>

        {/* Map and Threat List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden" style={{ height: '600px' }}>
              <MapContainer
                center={[20.5937, 78.9629]} // Center of India
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapUpdater />
                
                {/* Regional threat circles */}
                {regionalData.map(region => (
                  <Circle
                    key={region.region}
                    center={[region.lat, region.lng]}
                    radius={Math.sqrt(region.totalThreats) * 20000}
                    pathOptions={{
                      color: region.riskLevel === 'high' ? '#ef4444' : 
                             region.riskLevel === 'medium' ? '#f59e0b' : '#10b981',
                      fillColor: region.riskLevel === 'high' ? '#ef4444' : 
                                region.riskLevel === 'medium' ? '#f59e0b' : '#10b981',
                      fillOpacity: 0.3
                    }}
                  >
                    <Popup>
                      <div className="text-black">
                        <h3 className="font-bold">{region.region}</h3>
                        <p>Total Threats: {region.totalThreats}</p>
                        <p>High Risk: {region.highRiskThreats}</p>
                        <p>Risk Level: {region.riskLevel}</p>
                      </div>
                    </Popup>
                  </Circle>
                ))}
                
                {/* Individual threat markers */}
                {filteredThreats.map(threat => (
                  <Marker
                    key={threat.id}
                    position={[threat.location.lat, threat.location.lng]}
                    icon={getThreatIcon(threat.type, threat.riskScore)}
                    eventHandlers={{
                      click: () => setSelectedThreat(threat)
                    }}
                  >
                    <Popup>
                      <div className="text-black">
                        <h3 className="font-bold capitalize">{threat.type} Threat</h3>
                        <p>Entity: {threat.entity}</p>
                        <p>Risk Score: {threat.riskScore.toFixed(1)}</p>
                        <p>Location: {threat.location.city}</p>
                        <p>Trend: {threat.trend}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
          
          {/* Threat List */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4" style={{ height: '600px', overflowY: 'auto' }}>
            <h2 className="text-xl font-bold mb-4">Recent Threats</h2>
            
            {filteredThreats.length === 0 ? (
              <p className="text-gray-400">No threats found</p>
            ) : (
              <div className="space-y-3">
                {filteredThreats.map(threat => (
                  <div
                    key={threat.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedThreat?.id === threat.id 
                        ? 'bg-blue-900 border-blue-500' 
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize font-medium">{threat.type}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        threat.riskScore > 7 ? 'bg-red-600' :
                        threat.riskScore > 5 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}>
                        {threat.riskScore.toFixed(1)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-1">{threat.entity}</p>
                    <p className="text-xs text-gray-400">
                      {threat.location.city} • {new Date(threat.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Selected Threat Details */}
        {selectedThreat && (
          <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h2 className="text-xl font-bold mb-4">Threat Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Type</p>
                <p className="capitalize">{selectedThreat.type}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Entity</p>
                <p>{selectedThreat.entity}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Risk Score</p>
                <p>{selectedThreat.riskScore.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p>{selectedThreat.location.city}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Trend</p>
                <p className="capitalize">{selectedThreat.trend}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Detected</p>
                <p>{new Date(selectedThreat.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CyberThreatHeatmap;
