import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Users, Target, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import StatsCounter from '../components/UI/StatsCounter';

const HomePage: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: 'Predictive Protection',
      description: 'AI-powered threat detection before harm occurs',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Users,
      title: 'Community Intelligence',
      description: 'Anonymous collective protection through shared insights',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      icon: Target,
      title: 'Precision Analysis',
      description: 'Real-time risk scoring with actionable recommendations',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: TrendingUp,
      title: 'Trend Monitoring',
      description: 'Track evolving scam patterns and emerging threats',
      color: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  const quickActions = [
    {
      title: t('hero.checkThreat'),
      description: 'Analyze URLs, phone numbers, emails, and UPI IDs',
      link: '/threat-check',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: Shield,
    },
    {
      title: t('hero.womenSafety'),
      description: 'Private, secure space for digital safety support',
      link: '/women-safety',
      color: 'bg-purple-600 hover:bg-purple-700',
      icon: Shield,
    },
    {
      title: t('hero.reportAnonymously'),
      description: 'Share threat intelligence to protect the community',
      link: '/community',
      color: 'bg-green-600 hover:bg-green-700',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group`}
                  >
                    <Icon className="h-8 w-8 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90 mb-4">{action.description}</p>
                    <ArrowRight className="h-5 w-5 mx-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatsCounter
              end={125847}
              label={t('stats.threatsDetected')}
              color="text-red-600 dark:text-red-400"
            />
            <StatsCounter
              end={2876543}
              label={t('stats.usersSafeguarded')}
              color="text-green-600 dark:text-green-400"
            />
            <StatsCounter
              end={98765}
              label={t('stats.reportsProcessed')}
              color="text-blue-600 dark:text-blue-400"
            />
            <StatsCounter
              end={97.8}
              label={t('stats.accuracy')}
              suffix="%"
              color="text-purple-600 dark:text-purple-400"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powered by Collective Intelligence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every anonymous report strengthens our predictive models, creating a safer digital ecosystem for all
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <Icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the Movement
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Help us build a safer digital India, one anonymous report at a time
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/threat-check"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Checking Threats
            </Link>
            <Link
              to="/community"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Report Anonymously
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;