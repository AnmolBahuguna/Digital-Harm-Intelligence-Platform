import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, HardDrive, Wifi, AlertTriangle, TrendingUp, TrendingDown, Zap, Shield } from 'lucide-react';

interface MetricData {
  timestamp: number;
  value: number;
  label?: string;
}

interface SystemMetrics {
  cpu: MetricData[];
  memory: MetricData[];
  requests: MetricData[];
  errors: MetricData[];
  latency: MetricData[];
  cacheHitRate: MetricData[];
  aiRequests: MetricData[];
  threatTypes: Array<{ name: string; value: number; color: string }>;
  regionalStats: Array<{ region: string; threats: number; riskLevel: string }>;
}

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: [],
    memory: [],
    requests: [],
    errors: [],
    latency: [],
    cacheHitRate: [],
    aiRequests: [],
    threatTypes: [],
    regionalStats: []
  });
  
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>>([]);

  // Generate mock metrics data
  const generateMockData = () => {
    const now = Date.now();
    const timePoints = 60; // 60 data points for the selected time range
    
    return {
      cpu: Array.from({ length: timePoints }, (_, i) => ({
        timestamp: now - (timePoints - i) * 60000,
        value: Math.random() * 40 + 30 + Math.sin(i / 10) * 10
      })),
      memory: Array.from({ length: timePoints }, (_, i) => ({
        timestamp: now - (timePoints - i) * 60000,
        value: Math.random() * 30 + 50 + Math.cos(i / 8) * 5
      })),
      requests: Array.from({ length: timePoints }, (_, i) => ({
        timestamp: now - (timePoints - i) * 60000,
        value: Math.floor(Math.random() * 1000 + 500)
      })),
      errors: Array.from({ length: timePoints }, (_, i) => ({
        timestamp: now - (timePoints - i) * 60000,
        value: Math.floor(Math.random() * 10)
      })),
      latency: Array.from({ length: timePoints }, (_, i) => ({
        timestamp: now - (timePoints - i) * 60000,
        value: Math.random() * 200 + 100
      })),
      cacheHitRate: Array.from({ length: timePoints }, (_, i) => ({
        timestamp: now - (timePoints - i) * 60000,
        value: Math.random() * 20 + 75
      })),
      aiRequests: Array.from({ length: timePoints }, (_, i) => ({
        timestamp: now - (timePoints - i) * 60000,
        value: Math.floor(Math.random() * 50 + 20)
      })),
      threatTypes: [
        { name: 'Phone', value: 35, color: '#ef4444' },
        { name: 'URL', value: 28, color: '#f59e0b' },
        { name: 'Email', value: 20, color: '#3b82f6' },
        { name: 'UPI', value: 12, color: '#10b981' },
        { name: 'Social', value: 5, color: '#8b5cf6' }
      ],
      regionalStats: [
        { region: 'Delhi', threats: 245, riskLevel: 'high' },
        { region: 'Mumbai', threats: 189, riskLevel: 'medium' },
        { region: 'Bangalore', threats: 156, riskLevel: 'medium' },
        { region: 'Chennai', threats: 134, riskLevel: 'medium' },
        { region: 'Kolkata', threats: 98, riskLevel: 'low' }
      ]
    };
  };

  // Initialize metrics
  useEffect(() => {
    setMetrics(generateMockData());
    
    // Generate some sample alerts
    setAlerts([
      {
        id: '1',
        type: 'warning',
        message: 'CPU usage exceeded 80% threshold',
        timestamp: Date.now() - 300000
      },
      {
        id: '2',
        type: 'error',
        message: 'AI request pool queue length exceeded threshold',
        timestamp: Date.now() - 600000
      },
      {
        id: '3',
        type: 'info',
        message: 'New threat pattern detected in Delhi region',
        timestamp: Date.now() - 900000
      }
    ]);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      setMetrics(prev => {
        const now = Date.now();
        return {
          ...prev,
          cpu: [...prev.cpu.slice(1), { timestamp: now, value: Math.random() * 40 + 30 }],
          memory: [...prev.memory.slice(1), { timestamp: now, value: Math.random() * 30 + 50 }],
          requests: [...prev.requests.slice(1), { timestamp: now, value: Math.floor(Math.random() * 1000 + 500) }],
          errors: [...prev.errors.slice(1), { timestamp: now, value: Math.floor(Math.random() * 10) }],
          latency: [...prev.latency.slice(1), { timestamp: now, value: Math.random() * 200 + 100 }],
          cacheHitRate: [...prev.cacheHitRate.slice(1), { timestamp: now, value: Math.random() * 20 + 75 }],
          aiRequests: [...prev.aiRequests.slice(1), { timestamp: now, value: Math.floor(Math.random() * 50 + 20) }]
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get current values
  const getCurrentValue = (data: MetricData[]) => {
    return data.length > 0 ? data[data.length - 1].value : 0;
  };

  const getTrend = (data: MetricData[]) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-5);
    const avg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const prev = data.slice(-10, -5).reduce((sum, d) => sum + d.value, 0) / 5;
    return avg > prev * 1.1 ? 'up' : avg < prev * 0.9 ? 'down' : 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            System Monitoring & Observability
          </h1>
          <p className="text-gray-400">Real-time monitoring of DHIP infrastructure and AI services</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Time Range:</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="5m">5 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="6h">6 Hours</option>
                <option value="24h">24 Hours</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Real-time:</label>
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
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded border flex items-center gap-3 ${
                  alert.type === 'error' ? 'bg-red-900 border-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-900 border-yellow-500' :
                  'bg-blue-900 border-blue-500'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="flex-1">{alert.message}</span>
                <span className="text-sm text-gray-400">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span className="text-gray-400 text-sm">CPU Usage</span>
              </div>
              {getTrendIcon(getTrend(metrics.cpu))}
            </div>
            <p className="text-2xl font-bold">{getCurrentValue(metrics.cpu).toFixed(1)}%</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-green-500" />
                <span className="text-gray-400 text-sm">Memory</span>
              </div>
              {getTrendIcon(getTrend(metrics.memory))}
            </div>
            <p className="text-2xl font-bold">{getCurrentValue(metrics.memory).toFixed(1)}%</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-purple-500" />
                <span className="text-gray-400 text-sm">Requests/s</span>
              </div>
              {getTrendIcon(getTrend(metrics.requests))}
            </div>
            <p className="text-2xl font-bold">{getCurrentValue(metrics.requests)}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-400 text-sm">Latency</span>
              </div>
              {getTrendIcon(getTrend(metrics.latency))}
            </div>
            <p className="text-2xl font-bold">{getCurrentValue(metrics.latency).toFixed(0)}ms</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* CPU & Memory Chart */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">System Resources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.cpu}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelFormatter={formatTime}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="CPU %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Request Rate Chart */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Request Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.requests}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelFormatter={formatTime}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name="Requests/sec"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cache Hit Rate */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Cache Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.cacheHitRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelFormatter={formatTime}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  name="Hit Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Requests */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">AI Request Pool</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.aiRequests}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelFormatter={formatTime}
                />
                <Bar 
                  dataKey="value" 
                  fill="#f59e0b"
                  name="AI Requests"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Threat Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.threatTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.threatTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Regional Threat Statistics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.regionalStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="region" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Bar dataKey="threats" fill="#ef4444" name="Threat Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
