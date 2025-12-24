import React, { useState } from 'react';
import { Users, Shield, TrendingUp, AlertTriangle, Plus, MessageSquare } from 'lucide-react';

interface CommunityReport {
  id: string;
  type: string;
  description: string;
  location: string;
  timestamp: string;
  verified: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reports: number;
}

const CommunityIntel: React.FC = () => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    type: '',
    description: '',
    location: '',
    evidence: ''
  });

  const communityReports: CommunityReport[] = [
    {
      id: '1',
      type: 'UPI Fraud',
      description: 'Fake QR codes placed over legitimate ones at local restaurants',
      location: 'Bangalore, Karnataka',
      timestamp: '2 hours ago',
      verified: true,
      severity: 'high',
      reports: 23
    },
    {
      id: '2',
      type: 'Job Scam',
      description: 'Work-from-home offers requiring ₹5000 registration fee',
      location: 'Delhi NCR',
      timestamp: '4 hours ago',
      verified: true,
      severity: 'medium',
      reports: 45
    },
    {
      id: '3',
      type: 'Digital Arrest',
      description: 'Fake police officers conducting video arrests demanding payment',
      location: 'Mumbai, Maharashtra',
      timestamp: '6 hours ago',
      verified: true,
      severity: 'critical',
      reports: 67
    }
  ];

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Anonymous report submitted:', reportData);
    setReportData({ type: '', description: '', location: '', evidence: '' });
    setShowReportForm(false);
    // Show success message
  };

  const getSeverityColor = (severity: CommunityReport['severity']) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Community Intelligence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Anonymous threat reporting that strengthens our collective defense
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">2,847</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active Reports</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">98.2%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy Rate</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">156K</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Contributors</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1,205</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Threats Prevented</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Community Reports
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {communityReports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {report.type}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{report.location}</span>
                            <span>•</span>
                            <span>{report.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                          {report.severity.toUpperCase()}
                        </span>
                        {report.verified && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                            VERIFIED
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {report.reports} similar reports
                      </span>
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Button */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Help Protect Others
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                Your anonymous reports help the community stay safe
              </p>
              <button
                onClick={() => setShowReportForm(true)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Report Threat</span>
              </button>
            </div>

            {/* How It Works */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    1
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Submit anonymous threat reports
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    2
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    AI analyzes patterns and clusters
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    3
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Community gets real-time alerts
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Assurance */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white text-center">
              <Shield className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold mb-2">100% Anonymous</h3>
              <p className="text-purple-100 text-sm">
                Your identity is never stored or tracked. Only the threat data helps protect others.
              </p>
            </div>
          </div>
        </div>

        {/* Report Form Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Anonymous Threat Report
                </h3>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Threat Type
                  </label>
                  <select
                    value={reportData.type}
                    onChange={(e) => setReportData({...reportData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select threat type</option>
                    <option value="phishing">Phishing/Email Scam</option>
                    <option value="upi-fraud">UPI/Payment Fraud</option>
                    <option value="job-scam">Job/Employment Scam</option>
                    <option value="romance-scam">Romance Scam</option>
                    <option value="crypto-fraud">Cryptocurrency Fraud</option>
                    <option value="digital-arrest">Digital Arrest Scam</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location (State/City)
                  </label>
                  <input
                    type="text"
                    value={reportData.location}
                    onChange={(e) => setReportData({...reportData, location: e.target.value})}
                    placeholder="e.g., Mumbai, Maharashtra"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={reportData.description}
                    onChange={(e) => setReportData({...reportData, description: e.target.value})}
                    placeholder="Describe the threat, scam method, or suspicious activity..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Evidence (Optional)
                  </label>
                  <textarea
                    value={reportData.evidence}
                    onChange={(e) => setReportData({...reportData, evidence: e.target.value})}
                    placeholder="Phone numbers, websites, email addresses, or other details..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        Privacy Protected
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        This report is completely anonymous. No personal information is collected or stored.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityIntel;