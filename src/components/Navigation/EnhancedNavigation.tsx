import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Shield, 
  Brain, 
  Activity, 
  Eye, 
  Mic, 
  Camera, 
  Map, 
  Zap,
  Bell,
  Globe,
  Menu,
  X,
  Lock,
  Users,
  ChevronDown
} from 'lucide-react';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  isNew?: boolean;
  isAdvanced?: boolean;
}

const EnhancedNavigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      name: 'Home',
      path: '/',
      icon: <Home className="h-5 w-5" />,
      description: 'Dashboard overview'
    },
    {
      name: 'Threat Check',
      path: '/threat-check',
      icon: <Shield className="h-5 w-5" />,
      description: 'Basic threat analysis'
    },
    {
      name: 'AI Threat Check',
      path: '/threat-check-enhanced',
      icon: <Brain className="h-5 w-5" />,
      description: 'Advanced ML-powered analysis',
      isNew: true,
      isAdvanced: true
    },
    {
      name: 'Advanced Dashboard',
      path: '/advanced-dashboard',
      icon: <Activity className="h-5 w-5" />,
      description: 'Real-time intelligence',
      isNew: true,
      isAdvanced: true
    },
    {
      name: 'Risk Heatmap',
      path: '/heatmap',
      icon: <Map className="h-5 w-5" />,
      description: 'Geographic threat analysis',
      isAdvanced: true
    },
    {
      name: 'Alerts',
      path: '/alerts',
      icon: <Bell className="h-5 w-5" />,
      description: 'Security notifications',
      badge: '3'
    },
    {
      name: 'Women Safety',
      path: '/women-safety',
      icon: <Users className="h-5 w-5" />,
      description: 'Protective resources'
    },
    {
      name: 'Adult Safety',
      path: '/adult-safety',
      icon: <Lock className="h-5 w-5" />,
      description: 'Privacy-focused support'
    },
    {
      name: 'Community',
      path: '/community',
      icon: <Globe className="h-5 w-5" />,
      description: 'Collective intelligence'
    },
    {
      name: 'Evidence Vault',
      path: '/evidence-vault',
      icon: <Eye className="h-5 w-5" />,
      description: 'Secure evidence storage'
    }
  ];

  const quickActions = [
    {
      name: 'Voice Analysis',
      icon: <Mic className="h-4 w-4" />,
      path: '/threat-check-enhanced',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      name: 'Visual Scan',
      icon: <Camera className="h-4 w-4" />,
      path: '/threat-check-enhanced',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Deep Scan',
      icon: <Zap className="h-4 w-4" />,
      path: '/advanced-dashboard',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-xl' : ''
      }`}>
        <div className="max-w-9xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
                <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">DHIP</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Enhanced Intelligence Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navigationItems.slice(0, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-1.5 xl:space-x-2 px-2 xl:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="h-4 w-4 sm:h-5 sm:w-5">{item.icon}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.isNew && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded px-1 py-0.5 text-[10px] sm:text-xs">
                      NEW
                    </span>
                  )}
                </Link>
              ))}
              
              {/* More dropdown for desktop */}
              <div className="relative group">
                <button className="flex items-center space-x-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                  <span>More</span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {navigationItems.slice(5).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isActive(item.path) ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''
                      }`}
                    >
                      <span className="h-4 w-4">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.path}
                  className={`p-2 rounded-lg text-white transition-all duration-200 hover:scale-105 ${action.color}`}
                  title={action.name}
                >
                  {action.icon}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Navigation Items */}
              <div className="space-y-2 mb-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="h-5 w-5">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    {item.isNew && (
                      <span className="bg-green-500 text-white text-xs rounded px-2 py-1">
                        NEW
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Quick Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      to={action.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-white transition-all duration-200 hover:scale-105 ${action.color}`}
                    >
                      {action.icon}
                      <span className="font-medium">{action.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedNavigation;