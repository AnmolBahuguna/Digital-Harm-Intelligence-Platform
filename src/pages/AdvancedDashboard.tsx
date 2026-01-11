import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  Eye, 
  Mic, 
  Camera, 
  Map, 
  Zap,
  Globe,
  Phone,
  Mail,
  CreditCard,
  Users,
  BarChart3,
  Clock,
  Target,
  Radar,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface RealTimeThreat {
  id: string;
  type: string;
  entity: string;
  riskScore: number;
  location: string;
  timestamp: number;
  trend: 'up' | 'down' | 'stable';
}

interface PredictionData {
  entityType: string;
  currentRisk: number;
  predictedRisk: number;
  timeHorizon: number;
  confidence: number;
  variants: Array<{
    type: string;
    probability: number;
  }>;
}

interface RegionalData {
  region: string;
  totalThreats: number;
  highRiskThreats: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  topScamTypes: Array<{
    type: string;
    count: number;
    trend: string;
  }>;
}

const AdvancedDashboard: React.FC = () => {
  const [realTimeThreats, setRealTimeThreats] = useState<RealTimeThreat[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [stats, setStats] = useState({
    totalThreats: 0,
    averageRisk: 0,
    threatsAnalyzed: 0,
    predictionsMade: 0,
    accuracy: 0
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time data updates
    const initializeData = async () => {
      // Mock real-time threats
      const mockThreats: RealTimeThreat[] = [
        {
          id: '1',
          type: 'phone',
          entity: '+91-9876543210',
          riskScore: 8.5,
          location: 'Delhi',
          timestamp: Date.now() - 300000,
          trend: 'up'
        },
        {
          id: '2',
          type: 'url',
          entity: 'http://fake-bank-login.com',
          riskScore: 9.2,
          location: 'Mumbai',
          timestamp: Date.now() - 180000,
          trend: 'up'
        },
        {
          id: '3',
          type: 'email',
          entity: 'scammer@fake-service.com',
          riskScore: 7.8,
          location: 'Bangalore',
          timestamp: Date.now() - 90000,
          trend: 'stable'
        }
      ];

      // Mock predictions
      const mockPredictions: PredictionData[] = [
        {
          entityType: 'Digital Arrest',
          currentRisk: 8.5,
          predictedRisk: 9.8,
          timeHorizon: 7,
          confidence: 0.87,
          variants: [
            { type: 'Customs Officer', probability: 0.65 },
            { type: 'Tax Evasion', probability: 0.25 },
            { type: 'Court Summons', probability: 0.10 }
          ]
        },
        {
          entityType: 'Bank Phishing',
          currentRisk: 7.2,
          predictedRisk: 8.9,
          timeHorizon: 5,
          confidence: 0.92,
          variants: [
            { type: 'KYC Update', probability: 0.70 },
            { type: 'Account Lock', probability: 0.20 },
            { type: 'Reward Points', probability: 0.10 }
          ]
        }
      ];

      // Mock regional data
      const mockRegionalData: RegionalData[] = [
        {
          region: 'Delhi',
          totalThreats: 245,
          highRiskThreats: 89,
          riskLevel: 'high',
          topScamTypes: [
            { type: 'Digital Arrest', count: 67, trend: 'up' },
            { type: 'Bank Fraud', count: 45, trend: 'stable' },
            { type: 'Job Scam', count: 32, trend: 'down' }
          ]
        },
        {
          region: 'Mumbai',
          totalThreats: 189,
          highRiskThreats: 67,
          riskLevel: 'medium',
          topScamTypes: [
            { type: 'Investment Fraud', count: 56, trend: 'up' },
            { type: 'Lottery Scam', count: 34, trend: 'stable' },
            { type: 'Romance Scam', count: 28, trend: 'up' }
          ]
        },
        {
          region: 'Bangalore',
          totalThreats: 156,
          highRiskThreats: 43,
          riskLevel: 'medium',
          topScamTypes: [
            { type: 'Tech Support', count: 48, trend: 'down' },
            { type: 'UPI Scam', count: 41, trend: 'up' },
            { type: 'Crypto Scam', count: 25, trend: 'stable' }
          ]
        }
      ];

      setRealTimeThreats(mockThreats);
      setPredictions(mockPredictions);
      setRegionalData(mockRegionalData);
      setStats({
        totalThreats: 590,
        averageRisk: 7.8,
        threatsAnalyzed: 1247,
        predictionsMade: 89,
        accuracy: 94.2
      });
      setIsLoading(false);
    };

    initializeData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealTimeThreats(prev => {
        const newThreat: RealTimeThreat = {
          id: Date.now().toString(),
          type: ['phone', 'url', 'email', 'upi'][Math.floor(Math.random() * 4)],
          entity: `New threat ${Date.now()}`,
          riskScore: Math.random() * 10,
          location: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 5)],
          timestamp: Date.now(),
          trend: (['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable')
        };
        return [newThreat, ...prev.slice(0, 9)];
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score: number) => {
    if (score >= 8) return '#ef4444';
    if (score >= 6) return '#f97316';
    if (score >= 4) return '#f59e0b';
    return '#10b981';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return 'Critical';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  const trendData = [
    { name: 'Mon', threats: 45, risk: 7.2 },
    { name: 'Tue', threats: 52, risk: 7.8 },
    { name: 'Wed', threats: 48, risk: 6.9 },
    { name: 'Thu', threats: 61, risk: 8.1 },
    { name: 'Fri', threats: 58, risk: 7.5 },
    { name: 'Sat', threats: 39, risk: 6.8 },
    { name: 'Sun', threats: 42, risk: 7.0 },
  ];

  const scamTypeData = [
    { name: 'Digital Arrest', value: 35, color: '#ef4444' },
    { name: 'Bank Fraud', value: 28, color: '#f97316' },
    { name: 'Investment Scam', value: 22, color: '#f59e0b' },
    { name: 'Job Scam', value: 18, color: '#3b82f6' },
    { name: 'Romance Scam', value: 15, color: '#8b5cf6' },
    { name: 'Other', value: 12, color: '#6b7280' },
  ];

  const radarData = [
    { subject: 'Detection Accuracy', A: 95, B: 88, fullMark: 100 },
    { subject: 'Prediction Rate', A: 87, B: 92, fullMark: 100 },
    { subject: 'Response Time', A: 92, B: 85, fullMark: 100 },
    { subject: 'False Positives', A: 8, B: 12, fullMark: 100 },
    { subject: 'Coverage', A: 94, B: 89, fullMark: 100 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Advanced Dashboard</h2>
          <p className="text-gray-600">Initializing AI-powered threat intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Threat Intelligence</h1>
              <p className="text-gray-600">Real-time AI-powered cyber security monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Run Full Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Threats</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalThreats}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRisk.toFixed(1)}</p>
            </div>
            <Target className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Threats Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.threatsAnalyzed}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Predictions Made</p>
              <p className="text-2xl font-bold text-gray-900">{stats.predictionsMade}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
            </div>
            <Radar className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Threats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Real-time Threats
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {realTimeThreats.map((threat) => (
                <div key={threat.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {threat.type === 'phone' && <Phone className="h-4 w-4 text-blue-600" />}
                      {threat.type === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                      {threat.type === 'url' && <Globe className="h-4 w-4 text-blue-600" />}
                      {threat.type === 'upi' && <CreditCard className="h-4 w-4 text-blue-600" />}
                      <span className="font-medium text-gray-900">{threat.entity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getRiskColor(threat.riskScore) }}
                      ></div>
                      <span className="text-sm font-medium">{getRiskLevel(threat.riskScore)}</span>
                      {threat.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{threat.location}</span>
                    <span>{new Date(threat.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              AI Predictions
            </h2>
            
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{prediction.entityType}</h3>
                    <div className="text-sm text-gray-600">
                      <span>Confidence: </span>
                      <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Current Risk</p>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRiskColor(prediction.currentRisk) }}
                        ></div>
                        <span className="font-bold">{prediction.currentRisk.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Predicted Risk</p>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRiskColor(prediction.predictedRisk) }}
                        ></div>
                        <span className="font-bold">{prediction.predictedRisk.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Predicted Variants ({prediction.timeHorizon} days)</p>
                    <div className="space-y-1">
                      {prediction.variants.map((variant, vIndex) => (
                        <div key={vIndex} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{variant.type}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-purple-600"
                                style={{ width: `${variant.probability * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-600">{(variant.probability * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Regional Threats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
              <Map className="h-5 w-5 mr-2 text-green-600" />
              Regional Threats
            </h2>
            
            <div className="space-y-4">
              {regionalData.map((region) => (
                <div key={region.region} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{region.region}</h3>
                    <div 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: getRiskColor(region.riskLevel === 'critical' ? 9 : region.riskLevel === 'high' ? 7.5 : region.riskLevel === 'medium' ? 5 : 2) }}
                    >
                      {region.riskLevel.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Threats:</span>
                      <span className="font-medium">{region.totalThreats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Risk:</span>
                      <span className="font-medium text-red-600">{region.highRiskThreats}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Top Scam Types:</p>
                    <div className="space-y-1">
                      {region.topScamTypes.slice(0, 3).map((scam, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">{scam.type}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">{scam.count}</span>
                            {scam.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                            {scam.trend === 'down' && <TrendingUp className="h-3 w-3 text-green-500 transform rotate-180" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Radar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
              <Radar className="h-5 w-5 mr-2 text-indigo-600" />
              System Performance
            </h2>
            
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis type="number" domain={[0, 100]} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Target" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Deep Scan</span>
              </button>
              
              <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2">
                <Mic className="h-4 w-4" />
                <span>Voice Analysis</span>
              </button>
              
              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Visual Check</span>
              </button>
              
              <button className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Team Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Threat Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Threat Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="threats" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scamTypeData}
                dataKey="value"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
              >
                {scamTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
