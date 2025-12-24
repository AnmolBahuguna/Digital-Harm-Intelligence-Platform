import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.threatCheck': 'Threat Check',
    'nav.alerts': 'Alerts',
    'nav.womenSafety': 'Women Safety',
    'nav.adultSafety': 'Adult Safety',
    'nav.evidenceVault': 'Evidence Vault',
    'nav.community': 'Community',
    'hero.title': 'Transforming cyber safety from reactive response to predictive prevention',
    'hero.subtitle': 'AI-powered platform that converts anonymous threat reports into collective protective intelligence',
    'hero.checkThreat': 'Check Threat',
    'hero.reportAnonymously': 'Report Anonymously',
    'hero.womenSafety': 'Women Safety Hub',
    'stats.threatsDetected': 'Threats Detected',
    'stats.usersSafeguarded': 'Users Safeguarded',
    'stats.reportsProcessed': 'Anonymous Reports',
    'stats.accuracy': 'Detection Accuracy',
    'threat.title': 'Threat Analysis',
    'threat.subtitle': 'Check URLs, phone numbers, emails, UPI IDs for potential risks',
    'threat.enterData': 'Enter URL, phone number, email, or UPI ID',
    'threat.analyze': 'Analyze Threat',
    'threat.riskScore': 'Risk Score',
    'threat.safe': 'Safe',
    'threat.lowRisk': 'Low Risk',
    'threat.mediumRisk': 'Medium Risk',
    'threat.highRisk': 'High Risk',
    'threat.critical': 'Critical',
    'women.title': 'Women Safety Hub',
    'women.subtitle': 'Private, secure space for digital safety and support',
    'women.layer1': 'Private Protection',
    'women.layer2': 'Community Support',
    'women.layer3': 'Legal Action',
    'women.evidenceVault': 'Evidence Vault',
    'women.safetyPlanner': 'AI Safety Planner',
    'women.panicButton': 'Panic Button',
    'women.realityCheck': 'Reality Check',
    'adult.title': 'Adult Digital Safety',
    'adult.subtitle': 'Stigma-free support for all digital threats',
    'panic.title': 'Emergency Activated',
    'panic.subtitle': 'Help is on the way. Stay calm.',
    'panic.calling': 'Calling emergency contacts...',
    'panic.location': 'Sharing location...',
    'panic.cancel': 'Cancel',
  },
  hi: {
    'nav.home': 'होम',
    'nav.threatCheck': 'खतरा जांच',
    'nav.alerts': 'अलर्ट',
    'nav.womenSafety': 'महिला सुरक्षा',
    'nav.adultSafety': 'वयस्क सुरक्षा',
    'nav.evidenceVault': 'साक्ष्य तिजोरी',
    'nav.community': 'समुदाय',
    'hero.title': 'साइबर सुरक्षा को प्रतिक्रियाशील से भविष्यवादी रोकथाम में बदलना',
    'hero.subtitle': 'AI-संचालित प्लेटफॉर्म जो गुमनाम खतरे की रिपोर्ट को सामूहिक सुरक्षात्मक बुद्धिमत्ता में बदलता है',
    'hero.checkThreat': 'खतरा जांचें',
    'hero.reportAnonymously': 'गुमनाम रिपोर्ट',
    'hero.womenSafety': 'महिला सुरक्षा हब',
    'stats.threatsDetected': 'खतरे पाए गए',
    'stats.usersSafeguarded': 'उपयोगकर्ता सुरक्षित',
    'stats.reportsProcessed': 'गुमनाम रिपोर्ट',
    'stats.accuracy': 'पहचान सटीकता',
    'threat.title': 'खतरा विश्लेषण',
    'threat.subtitle': 'संभावित जोखिमों के लिए URLs, फोन नंबर, ईमेल, UPI IDs जांचें',
    'threat.enterData': 'URL, फोन नंबर, ईमेल, या UPI ID दर्ज करें',
    'threat.analyze': 'खतरे का विश्लेषण करें',
    'threat.riskScore': 'जोखिम स्कोर',
    'threat.safe': 'सुरक्षित',
    'threat.lowRisk': 'कम जोखिम',
    'threat.mediumRisk': 'मध्यम जोखिम',
    'threat.highRisk': 'उच्च जोखिम',
    'threat.critical': 'गंभीर',
    'women.title': 'महिला सुरक्षा हब',
    'women.subtitle': 'डिजिटल सुरक्षा और सहायता के लिए निजी, सुरक्षित स्थान',
    'women.layer1': 'निजी सुरक्षा',
    'women.layer2': 'समुदायिक सहायता',
    'women.layer3': 'कानूनी कार्रवाई',
    'women.evidenceVault': 'साक्ष्य तिजोरी',
    'women.safetyPlanner': 'AI सुरक्षा योजनाकार',
    'women.panicButton': 'पैनिक बटन',
    'women.realityCheck': 'रियलिटी चेक',
    'adult.title': 'वयस्क डिजिटल सुरक्षा',
    'adult.subtitle': 'सभी डिजिटल खतरों के लिए कलंक-मुक्त सहायता',
    'panic.title': 'आपातकाल सक्रिय',
    'panic.subtitle': 'मदद आ रही है। शांत रहें।',
    'panic.calling': 'आपातकालीन संपर्कों को कॉल कर रहे हैं...',
    'panic.location': 'स्थान साझा कर रहे हैं...',
    'panic.cancel': 'रद्द करें',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('dhip-language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('dhip-language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};