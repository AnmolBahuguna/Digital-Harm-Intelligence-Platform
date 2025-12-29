import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Info, ExternalLink, Phone, Mail, CreditCard, Globe } from 'lucide-react';

interface ThreatResultProps {
  analysis: {
    riskScore: number;
    category: string;
    confidence: number;
    details: string;
    recommendations: string[];
    reports: number;
    lastSeen: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  entityType: 'phone' | 'url' | 'email' | 'upi';
  entityValue: string;
}

const ThreatResult: React.FC<ThreatResultProps> = ({ analysis, entityType, entityValue }) => {
  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score <= 6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (score <= 8) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'high': return <XCircle className="h-5 w-5 text-orange-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'url': return <Globe className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'upi': return <CreditCard className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const riskColorClass = getRiskColor(analysis.riskScore);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${riskColorClass}`}>
            {getSeverityIcon(analysis.severity)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Threat Analysis Result
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              {getEntityIcon(entityType)}
              <span className="font-mono">{entityValue}</span>
            </div>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg ${riskColorClass}`}>
          <div className="text-2xl font-bold">{analysis.riskScore}/10</div>
          <div className="text-xs font-medium">{analysis.severity.toUpperCase()}</div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Score</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{analysis.riskScore}/10</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{analysis.category}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{analysis.confidence}%</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reports</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{analysis.reports}</div>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Analysis Details
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {analysis.details}
          </p>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Safety Recommendations</h4>
          <div className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Last seen: {analysis.lastSeen}</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4" />
              <span>{analysis.reports} reports</span>
            </div>
          </div>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm font-medium">View Full Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreatResult;
