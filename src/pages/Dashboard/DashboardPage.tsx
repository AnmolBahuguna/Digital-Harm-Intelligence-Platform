import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Shield, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  Settings, 
  LogOut, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Eye,
  FileText,
  Users,
  Activity,
  Globe,
  Clock
} from 'lucide-react';
import ThreatChart from '../../components/Charts/ThreatChart';

interface UserStats {
  threatsChecked: number;
  reportsSubmitted: number;
  evidenceStored: number;
  accountAge: number;
}

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [userStats, setUserStats] = useState<UserStats>({
    threatsChecked: 0,
    reportsSubmitted: 0,
    evidenceStored: 0,
    accountAge: 0
  });
  const [recentActivity] = useState([
    {
      id: '1',
      type: 'threat_check',
      description: 'Checked suspicious URL',
      timestamp: '2 hours ago',
      result: 'safe'
    },
    {
      id: '2',
      type: 'report_submitted',
      description: 'Submitted anonymous threat report',
      timestamp: '1 day ago',
      result: 'verified'
    },
    {
      id: '3',
      type: 'evidence_stored',
      description: 'Added evidence to vault',
      timestamp: '3 days ago',
      result: 'encrypted'
    }
  ]);

  // Sample data for charts
  const [threatData] = useState([
    { date: 'Mon', threats: 12, reports: 8 },
    { date: 'Tue', threats: 19, reports: 12 },
    { date: 'Wed', threats: 15, reports: 10 },
    { date: 'Thu', threats: 25, reports: 18 },
    { date: 'Fri', threats: 22, reports: 15 },
    { date: 'Sat', threats: 30, reports: 22 },
    { date: 'Sun', threats: 28, reports: 20 }
  ]);

  const [categoryData] = useState([
    { name: 'Phishing', value: 35, color: '#ef4444' },
    { name: 'Scams', value: 28, color: '#f59e0b' },
    { name: 'Harassment', value: 20, color: '#8b5cf6' },
    { name: 'Impersonation', value: 17, color: '#3b82f6' }
  ]);

  useEffect(() => {
    // Simulate loading user stats
    const loadUserStats = () => {
      if (user?.created_at) {
        const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
        setUserStats({
          threatsChecked: Math.floor(Math.random() * 50) + 10,
          reportsSubmitted: Math.floor(Math.random() * 10) + 1,
          evidenceStored: Math.floor(Math.random() * 5),
          accountAge
        });
      }
    };

    loadUserStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'threat_check': return <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'report_submitted': return <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'evidence_stored': return <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'safe':
        return <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">Safe</span>;
      case 'verified':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">Verified</span>;
      case 'encrypted':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-xs font-medium">Encrypted</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 rounded-full text-xs font-medium">Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your personal cyber safety dashboard
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {user?.user_metadata?.full_name || 'User'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  DHIP Member
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {user?.email}
                  </span>
                </div>
                {user?.user_metadata?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {user.user_metadata.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Joined {new Date(user?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Your Impact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Threats Checked</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{userStats.threatsChecked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Reports Submitted</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{userStats.reportsSubmitted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Evidence Stored</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{userStats.evidenceStored}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Account Age</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{userStats.accountAge} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="/threat-check"
                  className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-4 rounded-lg transition-colors group"
                >
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Check Threat</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Analyze URLs, emails, and more</p>
                </a>
                <a
                  href="/evidence-vault"
                  className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 p-4 rounded-lg transition-colors group"
                >
                  <Eye className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Evidence Vault</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Secure evidence storage</p>
                </a>
                <a
                  href="/community"
                  className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 p-4 rounded-lg transition-colors group"
                >
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Report Threat</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Help protect the community</p>
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                    {getResultBadge(activity.result)}
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Threat Analytics
              </h3>
              <ThreatChart data={threatData} categories={categoryData} />
            </div>

            {/* Security Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Security Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Verified</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Your email address is confirmed</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Account Secured</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Strong password and secure session</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Privacy Protected</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">End-to-end encryption enabled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;