import React, { useState } from 'react';
import { Shield, AlertTriangle, DollarSign, Smartphone, Briefcase, CreditCard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AdultSafety: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('sextortion');

  const categories = [
    {
      id: 'sextortion',
      title: 'Sextortion & Blackmail',
      icon: Shield,
      color: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      description: 'Private support for intimate image abuse and blackmail',
      actions: [
        'Document all evidence immediately',
        'Do not pay any demands',
        'Block all communication channels',
        'Report to cyber crime cell',
        'Seek legal consultation'
      ]
    },
    {
      id: 'digital-arrest',
      title: 'Digital Arrest Scams',
      icon: AlertTriangle,
      color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      description: 'Fake police/government official video calls demanding money',
      actions: [
        'Hang up immediately',
        'Real police never arrest over video call',
        'Verify with local police station',
        'Report the scam number',
        'Educate family members'
      ]
    },
    {
      id: 'crypto',
      title: 'Cryptocurrency Fraud',
      icon: DollarSign,
      color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      description: 'Investment scams and fake trading platforms',
      actions: [
        'Verify platform legitimacy',
        'Never share private keys',
        'Research before investing',
        'Use only reputable exchanges',
        'Report fraudulent platforms'
      ]
    },
    {
      id: 'romance',
      title: 'Romance Scams',
      icon: Smartphone,
      color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
      description: 'Fake relationships for financial exploitation',
      actions: [
        'Never send money to online contacts',
        'Verify identity through video calls',
        'Be suspicious of quick emotional attachment',
        'Research photos using reverse image search',
        'Trust your instincts'
      ]
    },
    {
      id: 'job',
      title: 'Job & Business Scams',
      icon: Briefcase,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      description: 'Fake job offers and business opportunities',
      actions: [
        'Research company thoroughly',
        'Never pay for job opportunities',
        'Verify contact information',
        'Meet in official locations',
        'Get everything in writing'
      ]
    },
    {
      id: 'financial',
      title: 'Financial Fraud',
      icon: CreditCard,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      description: 'Banking, loan, and credit card scams',
      actions: [
        'Never share OTPs or passwords',
        'Banks never ask for credentials via call/SMS',
        'Check official bank communications',
        'Report suspicious transactions immediately',
        'Enable transaction alerts'
      ]
    }
  ];

  const selectedCat = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('adult.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('adult.subtitle')}
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg transform scale-105'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                }`}
              >
                <div className={`inline-flex items-center justify-center p-2 rounded-lg mb-4 ${category.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Category Details */}
        {selectedCat && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className={`inline-flex items-center justify-center p-3 rounded-lg mr-4 ${selectedCat.color}`}>
                <selectedCat.icon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCat.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedCat.description}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Immediate Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Immediate Actions
                </h3>
                <ul className="space-y-3">
                  {selectedCat.actions.map((action, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Resources */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Get Help
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Cyber Crime Helpline</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">1930</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-700 dark:text-green-300 font-medium">Consumer Helpline</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">1915</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-purple-700 dark:text-purple-300 font-medium">Online Complaint</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">cybercrime.gov.in</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reality Check Section */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Remember: You Are Not Alone
          </h3>
          <p className="text-yellow-100 text-lg mb-6">
            These scams are designed to create shame and isolation. Speaking up is the first step to protection.
          </p>
          <div className="bg-white/20 rounded-lg p-4 text-white">
            <p className="font-semibold">
              "If it feels too good to be true, or creates urgency and secrecy, it's likely a scam."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdultSafety;