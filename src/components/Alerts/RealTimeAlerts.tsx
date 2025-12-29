import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, X, Bell, TrendingUp, MapPin, Clock, Users, Activity, Zap, Eye, Filter, RefreshCw } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  affectedUsers: number;
  severity: number;
  trend: 'rising' | 'stable' | 'falling';
  actions: string[];
}

const RealTimeAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      category: 'Digital Arrest Scam',
      title: 'Surge in Fake Police Calls',
      description: 'Multiple reports of impersonators claiming to be from cyber crime division',
      location: 'Delhi NCR',
      timestamp: '2 minutes ago',
      affectedUsers: 1247,
      severity: 9,
      trend: 'rising',
      actions: ['Block unknown numbers', 'Verify identity', 'Report to 1930']
    },
    {
      id: '2',
      type: 'high',
      category: 'Phishing',
      title: 'Banking App Phishing Campaign',
      description: 'Fake banking apps requesting OTPs and credentials',
      location: 'Maharashtra',
      timestamp: '15 minutes ago',
      affectedUsers: 892,
      severity: 8,
      trend: 'rising',
      actions: ['Download from official stores', 'Never share OTP', 'Check app permissions']
    },
    {
      id: '3',
      type: 'medium',
      category: 'UPI Fraud',
      title: 'QR Code Scam Alert',
      description: 'Scammers using fake QR codes for payment requests',
      location: 'Karnataka',
      timestamp: '1 hour ago',
      affectedUsers: 456,
      severity: 6,
      trend: 'stable',
      actions: ['Verify recipient details', 'Scan QR carefully', 'Use trusted payment apps']
    },
    {
      id: '4',
      type: 'low',
      category: 'Job Fraud',
      title: 'Fake Job Offers',
      description: 'Companies asking for payment for job offers',
      location: 'West Bengal',
      timestamp: '3 hours ago',
      affectedUsers: 234,
      severity: 4,
      trend: 'falling',
      actions: ['Never pay for jobs', 'Verify company', 'Check official websites']
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setLastUpdate(new Date());
      
      // Randomly update alert trends
      setAlerts(prev => prev.map(alert => ({
        ...alert,
        affectedUsers: alert.affectedUsers + Math.floor(Math.random() * 10) - 3,
        trend: Math.random() > 0.5 ? 'rising' : Math.random() > 0.5 ? 'stable' : 'falling' as const
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getSeverityIcon = (severity: number) => {
    if (severity >= 8) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (severity >= 6) return <Shield className="h-5 w-5 text-orange-600" />;
    if (severity >= 4) return <Bell className="h-5 w-5 text-yellow-600" />;
    return <Activity className="h-5 w-5 text-green-600" />;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'falling': return <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(alert => alert.type === filter);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Real-Time Threat Alerts
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Live threat intelligence from community reports
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Zap className={`h-4 w-4 ${isLive ? 'text-green-500' : 'text-gray-400'}`} />
            <span>{isLive ? 'Live' : 'Paused'}</span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isLive 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Users Affected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.reduce((sum, alert) => sum + alert.affectedUsers, 0).toLocaleString()}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical Threats</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.type === 'critical').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Update</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <div className="flex space-x-2">
          {['all', 'critical', 'high', 'medium', 'low'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <RefreshCw className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${getAlertColor(
              alert.type
            ).split(' ').slice(1).join(' ')}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Alert Header */}
                <div className="flex items-center space-x-3 mb-3">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {alert.category}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAlertColor(alert.type)}`}>
                    {alert.type.toUpperCase()}
                  </span>
                </div>

                {/* Alert Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {alert.description}
                </p>

                {/* Alert Metadata */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{alert.timestamp}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{alert.affectedUsers.toLocaleString()} affected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(alert.trend)}
                    <span>{alert.trend}</span>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommended Actions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {alert.actions.map((action, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => dismissAlert(alert.id)}
                className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No alerts found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {filter === 'all' 
              ? 'No active threats at the moment. Stay safe!' 
              : `No ${filter} level alerts currently.`
            }
          </p>
        </div>
      )}

      {/* Live Indicator */}
      {isLive && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Updates</span>
        </div>
      )}
    </div>
  );
};

export default RealTimeAlerts;
