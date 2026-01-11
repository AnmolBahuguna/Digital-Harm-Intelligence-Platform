export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

export interface Translation {
  [key: string]: string | Translation;
}

export class MultilingualService {
  private currentLanguage: string = 'en';
  private translations: Map<string, Translation> = new Map();
  private supportedLanguages: Language[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      rtl: false,
      flag: '🇺🇸'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      rtl: false,
      flag: '🇮🇳'
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      rtl: false,
      flag: '🇧🇩'
    },
    {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      rtl: false,
      flag: '🇱🇰'
    },
    {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      rtl: false,
      flag: '🇮🇳'
    }
  ];

  constructor() {
    this.initializeTranslations();
  }

  private initializeTranslations(): void {
    // English translations (base)
    const enTranslations: Translation = {
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        filter: 'Filter',
        submit: 'Submit',
        reset: 'Reset'
      },
      navigation: {
        home: 'Home',
        dashboard: 'Dashboard',
        threatCheck: 'Threat Check',
        alerts: 'Alerts',
        womenSafety: 'Women Safety',
        adultSafety: 'Adult Safety',
        community: 'Community',
        evidence: 'Evidence Vault',
        heatmap: 'Risk Heatmap',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout'
      },
      threatAnalysis: {
        title: 'Threat Intelligence Scanner',
        placeholder: 'e.g., suspicious-site.com, +1234567890',
        analyze: 'Analyze Risk',
        scanning: 'Scanning...',
        riskScore: 'Risk Score',
        confidence: 'Confidence',
        category: 'Category',
        threats: 'Identified Threats',
        recommendations: 'Security Advice',
        summary: 'Analysis Summary',
        safe: 'Safe',
        lowRisk: 'Low Risk',
        mediumRisk: 'Medium Risk',
        criticalRisk: 'Critical Risk'
      },
      womenSafety: {
        title: 'Women Safety Hub',
        layer1: 'Private Help',
        layer2: 'Support Network',
        layer3: 'Legal Action',
        emergencyButton: 'Emergency Button',
        evidenceVault: 'Evidence Vault',
        supportGroups: 'Support Groups',
        legalHelp: 'Legal Help'
      },
      alerts: {
        title: 'Security Alerts',
        newThreat: 'New Threat Detected',
        highRiskArea: 'High Risk Area',
        scamAlert: 'Scam Alert',
        viewDetails: 'View Details',
        markAsRead: 'Mark as Read'
      }
    };

    // Hindi translations
    const hiTranslations: Translation = {
      common: {
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफलता',
        warning: 'चेतावनी',
        info: 'जानकारी',
        cancel: 'रद्द करें',
        confirm: 'पुष्टि करें',
        save: 'सेव करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        close: 'बंद करें',
        back: 'पीछे',
        next: 'अगला',
        previous: 'पिछला',
        search: 'खोजें',
        filter: 'फ़िल्टर',
        submit: 'जमा करें',
        reset: 'रीसेट करें'
      },
      navigation: {
        home: 'होम',
        dashboard: 'डैशबोर्ड',
        threatCheck: 'खतरा जांच',
        alerts: 'अलर्ट',
        womenSafety: 'महिला सुरक्षा',
        adultSafety: 'वयस्क सुरक्षा',
        community: 'समुदाय',
        evidence: 'सबूत वॉल्ट',
        heatmap: 'जोखिम हीटमैप',
        profile: 'प्रोफ़ाइल',
        settings: 'सेटिंग्स',
        logout: 'लॉग आउट'
      },
      threatAnalysis: {
        title: 'खतरा खुफिया स्कैनर',
        placeholder: 'जैसे: suspicious-site.com, +1234567890',
        analyze: 'जोखिम का विश्लेषण करें',
        scanning: 'स्कैन हो रहा है...',
        riskScore: 'जोखिम स्कोर',
        confidence: 'आत्मविश्वास',
        category: 'श्रेणी',
        threats: 'पहचाने गए खतरे',
        recommendations: 'सुरक्षा सलाह',
        summary: 'विश्लेषण सारांश',
        safe: 'सुरक्षित',
        lowRisk: 'कम जोखिम',
        mediumRisk: 'मध्यम जोखिम',
        criticalRisk: 'गंभीर जोखिम'
      },
      womenSafety: {
        title: 'महिला सुरक्षा हब',
        layer1: 'निजी मदद',
        layer2: 'सहायता नेटवर्क',
        layer3: 'कानूनी कार्रवाई',
        emergencyButton: 'आपातकालीन बटन',
        evidenceVault: 'सबूत वॉल्ट',
        supportGroups: 'सहायता समूह',
        legalHelp: 'कानूनी मदद'
      },
      alerts: {
        title: 'सुरक्षा अलर्ट',
        newThreat: 'नया खतरा पाया गया',
        highRiskArea: 'उच्च जोखिम क्षेत्र',
        scamAlert: 'घोटाला अलर्ट',
        viewDetails: 'विवरण देखें',
        markAsRead: 'पढ़ा गया चिह्नित करें'
      }
    };

    // Bengali translations
    const bnTranslations: Translation = {
      common: {
        loading: 'লোড হচ্ছে...',
        error: 'ত্রুটি',
        success: 'সফল',
        warning: 'সতর্কতা',
        info: 'তথ্য',
        cancel: 'বাতিল',
        confirm: 'নিশ্চিত করুন',
        save: 'সংরক্ষণ করুন',
        delete: 'মুছে ফেলুন',
        edit: 'সম্পাদনা',
        close: 'বন্ধ',
        back: 'পিছনে',
        next: 'পরবর্তী',
        previous: 'পূর্ববর্তী',
        search: 'অনুসন্ধান',
        filter: 'ফিল্টার',
        submit: 'জমা দিন',
        reset: 'রিসেট'
      },
      navigation: {
        home: 'হোম',
        dashboard: 'ড্যাশবোর্ড',
        threatCheck: 'হুমকি পরীক্ষা',
        alerts: 'সতর্কতা',
        womenSafety: 'নারী নিরাপত্তা',
        adultSafety: 'প্রাপ্তবয়স্ক নিরাপত্তা',
        community: 'সম্প্রদায়',
        evidence: 'প্রমাণ ভল্ট',
        heatmap: 'ঝুঁকি হিটম্যাপ',
        profile: 'প্রোফাইল',
        settings: 'সেটিংস',
        logout: 'লগআউট'
      }
    };

    // Tamil translations
    const taTranslations: Translation = {
      common: {
        loading: 'ஏற்றுகிறது...',
        error: 'பிழை',
        success: 'வெற்றி',
        warning: 'எச்சரிக்கை',
        info: 'தகவல்',
        cancel: 'ரத்துசெய்',
        confirm: 'உறுதிப்படுத்து',
        save: 'சேமி',
        delete: 'நீக்கு',
        edit: 'திருத்து',
        close: 'மூடு',
        back: 'பின்',
        next: 'அடுத்து',
        previous: 'முந்தைய',
        search: 'தேடு',
        filter: 'வடிகட்டு',
        submit: 'சமர்ப்பி',
        reset: 'மீட்டமைக்க'
      },
      navigation: {
        home: 'முகப்பு',
        dashboard: 'டாஷ்போர்டு',
        threatCheck: 'அச்சுறுத்தல் சோதனை',
        alerts: 'எச்சரிக்கைகள்',
        womenSafety: 'பெண்கள் பாதுகாப்பு',
        adultSafety: 'பெரியயர் பாதுகாப்பு',
        community: 'சமூகம்',
        evidence: 'ஆதாரம் தொகுப்பு',
        heatmap: 'ஆபத்து வெப்ப வரைபடம்',
        profile: 'சுயவிவரம்',
        settings: 'அமைப்புகள்',
        logout: 'வெளியேறு'
      }
    };

    // Telugu translations
    const teTranslations: Translation = {
      common: {
        loading: 'లోడ్ అవుతోంది...',
        error: 'లోపం',
        success: 'విజయం',
        warning: 'హెచ్చరిక',
        info: 'సమాచారం',
        cancel: 'రద్దు చేయండి',
        confirm: 'నిర్ధారించండి',
        save: 'సేవ్ చేయండి',
        delete: 'తొలగించండి',
        edit: 'సవరించండి',
        close: 'మూసివేయండి',
        back: 'వెనుకకు',
        next: 'తర్వాత',
        previous: 'ముందు',
        search: 'వెతకండి',
        filter: 'ఫిల్టర్',
        submit: 'సమర్పించండి',
        reset: 'రీసెట్'
      },
      navigation: {
        home: 'హోమ్',
        dashboard: 'డాష్‌బోర్డ్',
        threatCheck: 'ముప్పు పరిశీలన',
        alerts: 'హెచ్చరికలు',
        womenSafety: 'మహిళల భద్రత',
        adultSafety: 'పెద్దల భద్రత',
        community: 'సంఘం',
        evidence: 'ఆధారాల వాల్ట్',
        heatmap: 'రిస్క్ హీట్‌మ్యాప్',
        profile: 'ప్రొఫైల్',
        settings: 'సెట్టింగ్‌లు',
        logout: 'లాగ్‌అవుట్'
      }
    };

    // Store translations
    this.translations.set('en', enTranslations);
    this.translations.set('hi', hiTranslations);
    this.translations.set('bn', bnTranslations);
    this.translations.set('ta', taTranslations);
    this.translations.set('te', teTranslations);
  }

  // Get translation for a key
  t(key: string, language?: string): string {
    const lang = language || this.currentLanguage;
    const translation = this.translations.get(lang);
    
    if (!translation) {
      return key; // Return key if translation not found
    }

    return this.getNestedValue(translation, key) || key;
  }

  private getNestedValue(obj: any, path: string): string | null {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Set current language
  setLanguage(languageCode: string): void {
    if (this.supportedLanguages.find(lang => lang.code === languageCode)) {
      this.currentLanguage = languageCode;
      localStorage.setItem('dhip-language', languageCode);
    }
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Get supported languages
  getSupportedLanguages(): Language[] {
    return this.supportedLanguages;
  }

  // Detect language from browser or user preference
  detectLanguage(): string {
    // Check stored preference first
    const stored = localStorage.getItem('dhip-language');
    if (stored && this.supportedLanguages.find(lang => lang.code === stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    const supportedLang = this.supportedLanguages.find(lang => lang.code === browserLang);
    
    return supportedLang ? supportedLang.code : 'en';
  }

  // Initialize language on app start
  initializeLanguage(): void {
    this.currentLanguage = this.detectLanguage();
  }

  // Format date according to language
  formatDate(date: Date, language?: string): string {
    const lang = language || this.currentLanguage;
    const locale = this.getLocaleCode(lang);
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Format number according to language
  formatNumber(number: number, language?: string): string {
    const lang = language || this.currentLanguage;
    const locale = this.getLocaleCode(lang);
    
    return new Intl.NumberFormat(locale).format(number);
  }

  // Get locale code for formatting
  private getLocaleCode(languageCode: string): string {
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN'
    };
    
    return localeMap[languageCode] || 'en-US';
  }

  // Check if language is RTL
  isRTL(language?: string): boolean {
    const lang = language || this.currentLanguage;
    const languageData = this.supportedLanguages.find(l => l.code === lang);
    return languageData?.rtl || false;
  }

  // Get text direction for HTML
  getTextDirection(language?: string): 'rtl' | 'ltr' {
    return this.isRTL(language) ? 'rtl' : 'ltr';
  }

  // Translate scam-specific terms
  translateScamType(scamType: string, language?: string): string {
    const lang = language || this.currentLanguage;
    
    const scamTranslations: Record<string, Record<string, string>> = {
      'en': {
        'digital_arrest': 'Digital Arrest',
        'bank_fraud': 'Bank Fraud',
        'kyc_scam': 'KYC Scam',
        'investment_fraud': 'Investment Fraud',
        'job_scam': 'Job Scam',
        'lottery_scam': 'Lottery Scam',
        'romance_scam': 'Romance Scam'
      },
      'hi': {
        'digital_arrest': 'डिजिटल अरेस्ट',
        'bank_fraud': 'बैंक धोखाधड़ी',
        'kyc_scam': 'केवाईसी घोटाला',
        'investment_fraud': 'निवेश धोखाधड़ी',
        'job_scam': 'नौकरी घोटाला',
        'lottery_scam': 'लॉटरी घोटाला',
        'romance_scam': 'रोमांस घोटाला'
      },
      'bn': {
        'digital_arrest': 'ডিজিটাল গ্রেপ্তার',
        'bank_fraud': 'ব্যাংক জালিয়াতি',
        'kyc_scam': 'কেওয়াইসি প্রতারণা',
        'investment_fraud': 'বিনিয়োগ জালিয়াতি',
        'job_scam': 'চাকরি প্রতারণা',
        'lottery_scam': 'লটারি প্রতারণা',
        'romance_scam': 'প্রেম প্রতারণা'
      },
      'ta': {
        'digital_arrest': 'டிஜிட்டல் கைது',
        'bank_fraud': 'வங்கி மோசடி',
        'kyc_scam': 'கேஒய்சி ஏமாற்று',
        'investment_fraud': 'முதலீடு மோசடி',
        'job_scam': 'வேலை ஏமாற்று',
        'lottery_scam': 'லாட்டரி ஏமாற்று',
        'romance_scam': 'காதல் ஏமாற்று'
      },
      'te': {
        'digital_arrest': 'డిజిటల్ అరెస్ట్',
        'bank_fraud': 'బ్యాంకు మోసపూరితం',
        'kyc_scam': 'కేవైసీ మోసం',
        'investment_fraud': 'పెట్టుపులు మోసపూరితం',
        'job_scam': 'ఉద్యోగ మోసం',
        'lottery_scam': 'లాటరీ మోసం',
        'romance_scam': 'ప్రేమ మోసం'
      }
    };

    return scamTranslations[lang]?.[scamType] || scamType;
  }

  // Get emergency numbers in local language
  getEmergencyNumbers(language?: string): { name: string; number: string }[] {
    const lang = language || this.currentLanguage;
    
    const emergencyNumbers: Record<string, { name: string; number: string }[]> = {
      'en': [
        { name: 'Cyber Crime Helpline', number: '1930' },
        { name: 'Women Helpline', number: '1091' },
        { name: 'Police', number: '100' },
        { name: 'Ambulance', number: '108' }
      ],
      'hi': [
        { name: 'साइबर क्राइम हेल्पलाइन', number: '1930' },
        { name: 'महिला हेल्पलाइन', number: '1091' },
        { name: 'पुलिस', number: '100' },
        { name: 'एम्बुलेंस', number: '108' }
      ],
      'bn': [
        { name: 'সাইবার ক্রাইম হেল্পলাইন', number: '1930' },
        { name: 'নারী হেল্পলাইন', number: '1091' },
        { name: 'পুলিশ', number: '100' },
        { name: 'অ্যাম্বুলেন্স', number: '108' }
      ],
      'ta': [
        { name: 'சைபர் கிரைம் ஹெல்ப்லைன்', number: '1930' },
        { name: 'பெண்கள் ஹெல்ப்லைன்', number: '1091' },
        { name: 'போலீஸ்', number: '100' },
        { name: 'ஆம்புலன்ஸ்', number: '108' }
      ],
      'te': [
        { name: 'సైబర్ క్రైమ్ హెల్ప్‌లైన్', number: '1930' },
        { name: 'మహిళా హెల్ప్‌లైన్', number: '1091' },
        { name: 'పోలీస్', number: '100' },
        { name: 'యాంబులెన్స్', number: '108' }
      ]
    };

    return emergencyNumbers[lang] || emergencyNumbers['en'];
  }
}
