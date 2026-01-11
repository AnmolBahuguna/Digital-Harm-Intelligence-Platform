import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, HardDrive, Wifi, AlertTriangle, TrendingUp, TrendingDown, Zap, Shield, Database, Globe, Link, Hash, Blocks } from 'lucide-react';

interface BlockData {
  index: number;
  timestamp: number;
  data: {
    id: string;
    type: string;
    entity: string;
    riskScore: number;
    location: {
      lat: number;
      lng: number;
      city: string;
      state: string;
    };
    timestamp: number;
    verifiedBy: string[];
    aiAnalysis: any;
    blockchainHash: string;
  };
  previousHash: string;
  hash: string;
  nonce: number;
}

interface BlockchainStats {
  totalBlocks: number;
  totalThreats: number;
  pendingRecords: number;
  averageRisk: number;
}

const BlockchainDashboard: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [stats, setStats] = useState<BlockchainStats>({
    totalBlocks: 0,
    totalThreats: 0,
    pendingRecords: 0,
    averageRisk: 0
  });
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);
  const [threatHistory, setThreatHistory] = useState<any[]>([]);

  // Fetch blockchain data
  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/blockchain');
        const data = await response.json();
        setBlocks(data);
      } catch (error) {
        console.error('Failed to fetch blockchain data:', error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/blockchain/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch blockchain stats:', error);
      }
    };

    fetchBlockchainData();
    fetchStats();

    // Set up real-time updates
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        fetchBlockchainData();
        fetchStats();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [realTimeEnabled]);

  // Mock data for charts
  const blockGenerationData = blocks.slice(-10).map((block, index) => ({
    index: block.index,
    timestamp: new Date(block.timestamp).toLocaleTimeString(),
    riskScore: block.data.riskScore,
    blockSize: JSON.stringify(block).length
  }));

  const threatTypeData = [
    { name: 'Phone', value: blocks.filter(b => b.data.type === 'phone').length, color: '#ef4444' },
    { name: 'URL', value: blocks.filter(b => b.data.type === 'url').length, color: '#f59e0b' },
    { name: 'Email', value: blocks.filter(b => b.data.type === 'email').length, color: '#3b82f6' },
    { name: 'UPI', value: blocks.filter(b => b.data.type === 'upi').length, color: '#10b981' },
    { name: 'Social', value: blocks.filter(b => b.data.type === 'social').length, color: '#8b5cf6' }
  ];

  const riskDistribution = [
    { range: '0-2', count: blocks.filter(b => b.data.riskScore <= 2).length, color: '#10b981' },
    { range: '3-5', count: blocks.filter(b => b.data.riskScore > 2 && b.data.riskScore <= 5).length, color: '#3b82f6' },
    { range: '6-8', count: blocks.filter(b => b.data.riskScore > 5 && b.data.riskScore <= 8).length, color: '#f59e0b' },
    { range: '9-10', count: blocks.filter(b => b.data.riskScore > 8).length, color: '#ef4444' }
  ];

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getThreatIcon = (type: string) => {
    const icons = {
      phone: '📱',
      url: '🌐',
      email: '📧',
      upi: '💰',
      social: '👥'
    };
    return icons[type as keyof typeof icons] || '⚠️';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Blocks className="w-8 h-8 text-purple-500" />
            Blockchain Threat Intelligence
          </h1>
          <p className="text-gray-400">Immutable threat records with blockchain verification</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Blocks</p>
                <p className="text-2xl font-bold">{stats.totalBlocks}</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Threats Recorded</p>
                <p className="text-2xl font-bold">{stats.totalThreats}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Records</p>
                <p className="text-2xl font-bold">{stats.pendingRecords}</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Risk</p>
                <p className="text-2xl font-bold">{stats.averageRisk.toFixed(1)}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex items-center gap-4">
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
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Block Generation Chart */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Block Generation Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={blockGenerationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelFormatter={(value) => `Time: ${value}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                  name="Risk Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="blockSize" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                  name="Block Size"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Threat Type Distribution */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Threat Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Risk Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Bar dataKey="count" fill="#f59e0b" name="Threat Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Blockchain Performance */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Blockchain Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hash Rate</span>
                <span className="text-green-400">{(Math.random() * 1000).toFixed(0)} H/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Difficulty</span>
                <span className="text-yellow-400">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Block Time</span>
                <span className="text-blue-400">10.5s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Network Nodes</span>
                <span className="text-purple-400">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Blocks */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Threat Records</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {blocks.slice(-10).reverse().map((block) => (
              <div
                key={block.index}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedBlock?.index === block.index 
                    ? 'bg-purple-900 border-purple-500' 
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedBlock(block)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Block #{block.index}</span>
                    <span className="text-lg">{getThreatIcon(block.data.type)}</span>
                    <span className="capitalize font-medium">{block.data.type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    block.data.riskScore > 7 ? 'bg-red-600' :
                    block.data.riskScore > 5 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}>
                    {block.data.riskScore.toFixed(1)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-1">{block.data.entity}</p>
                <p className="text-xs text-gray-400 mb-2">
                  {block.data.location.city} • {formatTimestamp(block.timestamp)}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {block.hash.substring(0, 8)}...
                  </span>
                  <span className="flex items-center gap-1">
                    <Link className="w-3 h-3" />
                    {block.previousHash.substring(0, 8)}...
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {block.data.verifiedBy.length} verifications
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Block Details */}
        {selectedBlock && (
          <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4">Block Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Block Index</p>
                <p>#{selectedBlock.index}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Block Hash</p>
                <p className="font-mono text-xs">{selectedBlock.hash}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Previous Hash</p>
                <p className="font-mono text-xs">{selectedBlock.previousHash}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Nonce</p>
                <p>{selectedBlock.nonce}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Threat Type</p>
                <p className="capitalize">{selectedBlock.data.type}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Risk Score</p>
                <p>{selectedBlock.data.riskScore.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p>{selectedBlock.data.location.city}, {selectedBlock.data.location.state}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Verified By</p>
                <p>{selectedBlock.data.verifiedBy.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Timestamp</p>
                <p>{formatTimestamp(selectedBlock.timestamp)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Record Hash</p>
                <p className="font-mono text-xs">{selectedBlock.data.blockchainHash}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainDashboard;
