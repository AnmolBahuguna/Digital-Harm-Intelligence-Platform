import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle, Activity, Eye, Clock, MapPin } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  riskLevel: string;
  timestamp: string;
  description: string;
  location: string;
  affectedUsers: number;
}

const AlertsDashboard = () => {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_APIKEY;

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        // Mock data for now
        const mockAlerts: Alert[] = [
          {
            id: '1',
            type: 'Phishing',
            riskLevel: 'high',
            timestamp: new Date().toISOString(),
            description: 'Suspicious login attempt detected',
            location: 'Mumbai, India',
            affectedUsers: 150
          },
          {
            id: '2', 
            type: 'Malware',
            riskLevel: 'critical',
            timestamp: new Date().toISOString(),
            description: 'Malware detected in system scan',
            location: 'Delhi, India',
            affectedUsers: 75
          }
        ];
        setAlerts(mockAlerts);
      } catch (err) {
        setError('Unable to load real-time alerts. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const typeCounts = alerts.reduce((acc: Record<string, number>, alert) => {
    const type = alert.type || 'Unknown';
    acc[type] = (acc[type] || 0) + (Number(alert.affectedUsers) || 1);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 dark:bg-blue-700 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Security Alerts Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real-time threat intelligence and security monitoring
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Threats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">247</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Users Protected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1.2M</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Security Alerts</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Activity className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!loading && !error && alerts.length > 0 && (
            <div className="space-y-4">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRiskColor(alert.riskLevel)}`}>
                          {alert.riskLevel}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {String(alert.type)}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{alert.timestamp}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{alert.location}</span>
                        </span>
                        <span>{alert.affectedUsers} affected</span>
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && alerts.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg">No security alerts at this time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;
