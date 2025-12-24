import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const PanicButton: React.FC = () => {
  const { t } = useLanguage();
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActivated && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isActivated && countdown === 0) {
      setIsActive(true);
      // Here you would trigger actual emergency protocols
      console.log('PANIC MODE ACTIVATED - Emergency protocols initiated');
    }

    return () => clearInterval(interval);
  }, [isActivated, countdown]);

  const handlePanicActivation = () => {
    setIsActivated(true);
  };

  const handleCancel = () => {
    setIsActivated(false);
    setIsActive(false);
    setCountdown(5);
  };

  if (isActive) {
    return (
      <div className="fixed inset-0 bg-red-600 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md w-full">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            {t('panic.title')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('panic.subtitle')}
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <span className="text-green-600">{t('panic.calling')}</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600">{t('panic.location')}</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t('panic.cancel')}
          </button>
        </div>
      </div>
    );
  }

  if (isActivated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md w-full">
          <div className="text-6xl font-bold text-red-600 mb-4">
            {countdown}
          </div>
          <p className="text-xl text-gray-700 mb-6">
            Emergency activation in {countdown} seconds
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <X className="h-5 w-5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
        Emergency Panic Button
      </h3>
      <p className="text-red-600 dark:text-red-400 mb-6 text-sm">
        Press only in case of immediate danger. This will alert emergency contacts and authorities.
      </p>
      <button
        onClick={handlePanicActivation}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors transform hover:scale-105 shadow-lg"
      >
        🚨 ACTIVATE PANIC MODE
      </button>
    </div>
  );
};

export default PanicButton;