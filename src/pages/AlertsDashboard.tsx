import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, AlertTriangle, Clock, Filter, Loader2, RefreshCw, CheckCircle } from 'lucide-react';

const AlertsDashboard = () => {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Your API Key
   const apiKey = import.meta.env.VITE_APIKEY;

  const threatTypes = ['all', 'Digital Arrest Scam', 'UPI Fraud', 'Job Scam', 'Romance Scam', 'Crypto Fraud', 'Phishing'];
  const states = ['all', 'Uttarakhand','Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Telangana'];

  const fetchRealTimeAlerts = async () => {
    setLoading(true);
    setError(null);
    setAlerts([]);

    try {
      // Constructing a search-oriented prompt
      const filterContext = `
        Filter criteria:
        - Location: ${selectedState === 'all' ? 'Anywhere in India' : selectedState}
        - Threat Type: ${selectedType === 'all' ? 'Any Cyber Scam' : selectedType}
      `;

      const prompt = `
        Search for recent news reports, police advisories, and social media warnings about cybersecurity threats and scams in India.
        ${filterContext}

        Based on the search results, generate a JSON array of 5 to 7 specific, recent threat alerts.
        
        Each object in the array MUST follow this exact schema:
        {
          "id": "string (unique)",
          "type": "string (e.g., Digital Arrest, UPI Fraud)",
          "location": "string (State or City)",
          "riskLevel": "low" | "medium" | "high" | "critical",
          "description": "string (short summary of the specific incident)",
          "timestamp": "string (e.g., '2 hours ago', 'Yesterday')",
          "affectedUsers": number (estimated count based on report context, e.g., 500)
        }

        Return ONLY the JSON array. Do not include markdown formatting.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }], // Enable Google Search for real-time data
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch alerts');
      }

      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No data found.");

      // Clean Markdown
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

      const parsedAlerts = JSON.parse(text);
      // Ensure it's an array to prevent "Objects are not valid as React child" errors if API returns weird data
      setAlerts(Array.isArray(parsedAlerts) ? parsedAlerts : []);

    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Unable to load real-time alerts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch & Filter Change Listener
  useEffect(() => {
    fetchRealTimeAlerts();
  }, [selectedState, selectedType]);

  const getRiskColor = (level) => {
    switch (String(level).toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Dynamic Statistics based on fetched data
  const getTrendingThreats = () => {
    if (!Array.isArray(alerts) || alerts.length === 0) return [];
    
    const typeCounts = alerts.reduce((acc, alert) => {
      const type = alert.type || 'Unknown';
      acc[type] = (acc[type] || 0) + (Number(alert.affectedUsers) || 1);
      return acc;
    }, {});

    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  };

  const trendingThreats = getTrendingThreats();
  
  // Calculate Dynamic Risk Percentage
  const calculateRiskPercentage = () => {
    if (!Array.isArray(alerts) || alerts.length === 0) return 0;
    const criticalCount = alerts.filter(a => {
      const level = String(a.riskLevel).toLowerCase();
      return level === 'critical' || level === 'high';
    }).length;
    return Math.round((criticalCount / alerts.length) * 100);
  };
  
  const riskPercentage = calculateRiskPercentage();

  return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 shadow-lg">
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Predictive Alerts Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real-time threat intelligence powered by AI & live news data
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Live Filters</span>
            </div>
            {loading && <span className="text-sm text-blue-600 animate-pulse">Updating live feed...</span>}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State/Region
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                {states.map(state => (
                  <option key={state} value={state}>
                    {state === 'all' ? 'All States' : state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Threat Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                {threatTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Alerts List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[400px]">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Active Threat Alerts
                </h2>
                <button 
                  onClick={fetchRealTimeAlerts} 
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
                  <p>Scanning news sources...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-red-500 p-4 text-center">
                  <AlertTriangle className="h-10 w-10 mb-4" />
                  <p>{error}</p>
                  <button onClick={fetchRealTimeAlerts} className="mt-4 text-blue-600 underline">Try Again</button>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4 text-center">
                  <CheckCircle className="h-10 w-10 mb-4 text-green-500" />
                  <p>No major alerts found matching your criteria right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {alerts.map((alert, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {alert.type}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRiskColor(alert.riskLevel)}`}>
                            {String(alert.riskLevel)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          <Clock className="h-4 w-4" />
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{alert.location}</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          ~{alert.affectedUsers} affected
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trending Threats Sidebar */}
          <div className="space-y-6">
            
            {/* Risk Meter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Regional Risk Meter
              </h3>
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${riskPercentage * 2.827} 283`}
                      className={`transition-all duration-1000 ${
                        riskPercentage > 75 ? 'text-red-500' : 
                        riskPercentage > 40 ? 'text-orange-500' : 'text-green-500'
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{riskPercentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {riskPercentage > 75 ? 'Critical Threat Activity' : 
                   riskPercentage > 40 ? 'Elevated Threat Level' : 'Moderate Activity'}
                </p>
              </div>
            </div>

            {/* Trending Threats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Trending in Filter
              </h3>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>)}
                </div>
              ) : trendingThreats.length > 0 ? (
                <div className="space-y-3">
                  {trendingThreats.map((threat, index) => (
                    <div key={threat.type} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-400 w-5">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                          {threat.type}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full">
                        {threat.count > 1000 ? '1k+' : threat.count} hits
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No trend data available.</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center shadow-lg">
              <h3 className="text-lg font-bold mb-2">Stay Protected</h3>
              <p className="text-blue-100 text-sm mb-4">
                Get notified instantly when new scams are reported in {selectedState === 'all' ? 'India' : selectedState}.
              </p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                Enable Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;
   
      
       