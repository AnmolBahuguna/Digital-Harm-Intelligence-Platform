import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { AlertTriangle, Shield, TrendingUp, Activity, Filter, Download, Eye, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ThreatData {
  id: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  district: string;
  riskScore: number;
  scamType: string;
  reports: number;
  lastUpdated: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  population: number;
}

interface TimeSeriesData {
  date: string;
  threats: number;
  riskScore: number;
  reports: number;
}

interface ScamTypeData {
  name: string;
  value: number;
  color: string;
}

const CyberRiskHeatmap: React.FC = () => {
  const [threatData, setThreatData] = useState<ThreatData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [scamTypeData, setScamTypeData] = useState<ScamTypeData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedScamType, setSelectedScamType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);

  // Mock data generation - replace with real API calls
  useEffect(() => {
    generateMockData();
  }, [selectedTimeRange, selectedScamType, selectedRegion]);

  const generateMockData = () => {
    setIsLoading(true);
    
    // Generate threat data for Indian cities
    const cities = [
      { name: 'Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi', district: 'Central' },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra', district: 'Mumbai City' },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946, state: 'Karnataka', district: 'Bangalore Urban' },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', district: 'Chennai' },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'West Bengal', district: 'Kolkata' },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana', district: 'Hyderabad' },
      { name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra', district: 'Pune' },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, state: 'Gujarat', district: 'Ahmedabad' },
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873, state: 'Rajasthan', district: 'Jaipur' },
      { name: 'Lucknow', lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', district: 'Lucknow' },
    ];

    const scamTypes = ['Digital Arrest', 'Bank Fraud', 'KYC Scam', 'Investment Fraud', 'Job Scam'];
    const scamColors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

    const threats: ThreatData[] = cities.map((city, index) => ({
      id: `threat-${index}`,
      lat: city.lat + (Math.random() - 0.5) * 0.5,
      lng: city.lng + (Math.random() - 0.5) * 0.5,
      city: city.name,
      state: city.state,
      district: city.district,
      riskScore: Math.random() * 10,
      scamType: scamTypes[Math.floor(Math.random() * scamTypes.length)],
      reports: Math.floor(Math.random() * 500) + 10,
      lastUpdated: new Date().toISOString(),
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
      population: Math.floor(Math.random() * 10000000) + 1000000
    }));

    setThreatData(threats);

    // Generate time series data
    const timeSeries: TimeSeriesData[] = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      timeSeries.push({
        date: date.toISOString().split('T')[0],
        threats: Math.floor(Math.random() * 100) + 50,
        riskScore: Math.random() * 5 + 3,
        reports: Math.floor(Math.random() * 200) + 20
      });
    }
    setTimeSeriesData(timeSeries);

    // Generate scam type distribution
    const scamDistribution: ScamTypeData[] = scamTypes.map((type, index) => ({
      name: type,
      value: Math.floor(Math.random() * 100) + 20,
      color: scamColors[index]
    }));
    setScamTypeData(scamDistribution);

    setTimeout(() => setIsLoading(false), 1000);
  };

  const getRiskColor = (riskScore: number): string => {
    if (riskScore <= 3) return '#10b981'; // Green
    if (riskScore <= 6) return '#f59e0b'; // Yellow
    if (riskScore <= 8) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getRiskRadius = (reports: number): number => {
    return Math.min(Math.max(reports / 10, 5), 30);
  };

  const filteredThreatData = useMemo(() => {
    return threatData.filter(threat => {
      if (selectedScamType !== 'all' && threat.scamType !== selectedScamType) {
        return false;
      }
      if (selectedRegion !== 'all' && threat.state !== selectedRegion) {
        return false;
      }
      return true;
    });
  }, [threatData, selectedScamType, selectedRegion]);

  const totalThreats = filteredThreatData.length;
  const averageRiskScore = filteredThreatData.reduce((sum, t) => sum + t.riskScore, 0) / (totalThreats || 1);
  const totalReports = filteredThreatData.reduce((sum, t) => sum + t.reports, 0);

  const exportData = () => {
    const csvContent = [
      ['City', 'State', 'District', 'Risk Score', 'Scam Type', 'Reports', 'Trend'],
      ...filteredThreatData.map(t => [
        t.city, t.state, t.district, t.riskScore.toFixed(2), t.scamType, t.reports, t.trend
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber-risk-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Loading Cyber Risk Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cyber Risk Heatmap</h1>
                <p className="text-gray-600">Real-time threat intelligence across India</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showAnalytics 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <select
              value={selectedScamType}
              onChange={(e) => setSelectedScamType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Scam Types</option>
              <option value="Digital Arrest">Digital Arrest</option>
              <option value="Bank Fraud">Bank Fraud</option>
              <option value="KYC Scam">KYC Scam</option>
              <option value="Investment Fraud">Investment Fraud</option>
              <option value="Job Scam">Job Scam</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Regions</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Telangana">Telangana</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Threats</p>
                <p className="text-2xl font-bold text-gray-900">{totalThreats}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageRiskScore.toFixed(1)}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{totalReports.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Regions</p>
                <p className="text-2xl font-bold text-gray-900">{new Set(filteredThreatData.map(t => t.state)).size}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Threat Distribution Map</h2>
              <p className="text-sm text-gray-600">Click on markers for detailed information</p>
            </div>
            <div className="h-96">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {filteredThreatData.map((threat) => (
                  <CircleMarker
                    key={threat.id}
                    center={[threat.lat, threat.lng]}
                    radius={getRiskRadius(threat.reports)}
                    fillColor={getRiskColor(threat.riskScore)}
                    color={getRiskColor(threat.riskScore)}
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.6}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-lg">{threat.city}</h3>
                        <p className="text-sm text-gray-600">{threat.district}, {threat.state}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm"><strong>Risk Score:</strong> {threat.riskScore.toFixed(1)}/10</p>
                          <p className="text-sm"><strong>Scam Type:</strong> {threat.scamType}</p>
                          <p className="text-sm"><strong>Reports:</strong> {threat.reports}</p>
                          <p className="text-sm"><strong>Trend:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              threat.trend === 'increasing' ? 'bg-red-100 text-red-800' :
                              threat.trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {threat.trend}
                            </span>
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Analytics Panel */}
          {showAnalytics && (
            <>
              {/* Time Series Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Threat Trends (30 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="threats" stroke="#3b82f6" name="Threats" />
                    <Line type="monotone" dataKey="reports" stroke="#ef4444" name="Reports" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Scam Type Distribution */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Scam Type Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scamTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scamTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CyberRiskHeatmap;
