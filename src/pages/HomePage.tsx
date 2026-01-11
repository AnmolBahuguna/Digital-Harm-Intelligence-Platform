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
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm"></div>
        <div className="relative max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 lg:py-24 xl:py-32">
          <div className="text-center max-w-5xl xl:max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8 leading-tight sm:leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 lg:mb-12 leading-relaxed max-w-4xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 lg:mt-16">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className={`${action.color} text-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] flex flex-col justify-between`}
                  >
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mb-3 sm:mb-4" />
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2">{action.title}</h3>
                      <p className="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4 line-clamp-2">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mx-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
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
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Powered by Collective Intelligence
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Every anonymous report strengthens our predictive models, creating a safer digital ecosystem for all
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <Icon className={`h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 ${feature.color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`} />
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8 xl:px-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
            Join the Movement
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto">
            Help us build a safer digital India, one anonymous report at a time
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center">
            <Link
              to="/threat-check"
              className="bg-white text-blue-600 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base lg:text-lg"
            >
              Start Checking Threats
            </Link>
            <Link
              to="/community"
              className="border-2 border-white text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base lg:text-lg"
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