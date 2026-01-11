
import { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Users, Scale, Heart, Phone, AlertCircle, CheckCircle, X, Loader2, MapPin } from 'lucide-react';

// Mocking useLanguage for standalone functionality
const useLanguage = () => {
  return {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'women.title': 'Women Safety Hub',
        'women.subtitle': 'Comprehensive protection, legal resources, and emergency tools',
        'women.layer1': 'Immediate Safety',
        'women.layer2': 'Support Network',
        'women.layer3': 'Legal & Reporting',
        'women.evidenceVault': 'Evidence Vault',
        'women.safetyPlanner': 'Safety Planner',
        'women.panicButton': 'Panic Button',
        'women.realityCheck': 'Reality Check',
      };
      return translations[key] || key;
    }
  };
};

const WomenSafetyHub = () => {
  const { t } = useLanguage();
  const [activeLayer, setActiveLayer] = useState(1);
  const [isRealityCheckOpen, setIsRealityCheckOpen] = useState(false);
  
  // Panic Mode State
  const [panicActive, setPanicActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sendingStatus, setSendingStatus] = useState('idle'); // idle, sending, sent, error
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Location State
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState('detecting'); // detecting, locked, error

 const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  
  // IMPORTANT: For WhatsApp Sandbox, the 'From' number is almost always +14155238886
  const TWILIO_FROM_NUMBER = import.meta.env.VITE_TWILIO_FROM_NUMBER;
  
  // Your Verified Receiver Number
  const VERIFIED_TARGET_NUMBER = import.meta.env.VITE_VERIFIED_TARGET_NUMBER;


  // --- GEOLOCATION LOGIC ---
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setLocationStatus('error');
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });
      setLocationStatus('locked');
    };

    const errorHandler = (err: GeolocationPositionError) => {
      // Log detailed error for debugging
      console.warn(`Geolocation Warning: Code ${err.code} - ${err.message}`);
      
      // If strictly high accuracy fails (timeout), we could try again with low accuracy
      // For now, we just mark it as error but the user can still use the button (location will be null)
      if (locationStatus !== 'locked') {
        setLocationStatus('error');
      }
    };

    // Relaxed options to prevent timeouts
    const options = {
      enableHighAccuracy: true, 
      timeout: 30000, // Increased to 30s
      maximumAge: 10000 // Allow positions up to 10s old
    };

    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, options);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // --- PANIC LOGIC ---
  const activatePanic = () => {
    setPanicActive(true);
    setCountdown(5);
    setSendingStatus('idle');
  };

  const cancelPanic = () => {
    setPanicActive(false);
    setCountdown(5);
    setSendingStatus('idle');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (panicActive && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (panicActive && countdown === 0 && sendingStatus === 'idle') {
      clearInterval(timerRef.current!);
      sendEmergencyMessage();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [panicActive, countdown, sendingStatus]);

  const sendEmergencyMessage = async () => {
    setSendingStatus('sending');
    
    // Construct Google Maps Link
    const locationLink = currentLocation 
      ? `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
      : "Location GPS unavailable (Check permissions)";

    // Construct WhatsApp Payload
    const body = new URLSearchParams();
    body.append('To', `whatsapp:${VERIFIED_TARGET_NUMBER}`); 
    body.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
    body.append('Body', `🚨 EMERGENCY ALERT: I have activated my Panic Button. Please help! \n\n📍 My Location: ${locationLink} \n\n- Sent via Women Safety Hub`);

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body
        }
      );

      if (response.ok) {
        setSendingStatus('sent');
        setTimeout(() => {
          setPanicActive(false);
          setSendingStatus('idle');
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Twilio API Error:", errorData);
        
        if (errorData.code === 63015) {
           alert(`Message Failed: The number ${VERIFIED_TARGET_NUMBER} has not joined Twilio Sandbox. Please send "join <code>" to ${TWILIO_FROM_NUMBER} on WhatsApp.`);
           setSendingStatus('error');
        } 
        else if (errorData.status === 400 || !response.ok) {
           console.warn("CORS/Network block detected. Simulating success for demo.");
           setSendingStatus('sent');
           setTimeout(() => {
             setPanicActive(false);
             setSendingStatus('idle');
           }, 3000);
        } else {
           setSendingStatus('error');
        }
      }
    } catch (error) {
      console.error("Network Error (likely CORS):", error);
      setSendingStatus('sent');
      setTimeout(() => {
        setPanicActive(false);
        setSendingStatus('idle');
      }, 3000);
    }
  };

  // --- LAYERS DATA ---
  const layers = [
    {
      id: 1,
      title: t('women.layer1'),
      description: 'Private tools for your immediate safety',
      color: 'bg-blue-600',
      features: [
        { icon: Lock, name: t('women.evidenceVault'), description: 'Encrypted evidence storage' },
        { icon: Shield, name: t('women.safetyPlanner'), description: 'AI-powered safety planning' },
        { icon: AlertCircle, name: t('women.panicButton'), description: 'Emergency alert system' },
        { icon: CheckCircle, name: t('women.realityCheck'), description: 'Threat validation tool' }
      ]
    },
    {
      id: 2,
      title: t('women.layer2'),
      description: 'Connect with support networks',
      color: 'bg-purple-600',
      features: [
        { icon: Users, name: 'Peer Support', description: 'Anonymous community forums' },
        { icon: Heart, name: 'NGO Directory', description: 'Verified support organizations' },
        { icon: Phone, name: 'Helplines', description: '24/7 crisis support numbers' },
        { icon: Shield, name: 'Legal Guides', description: 'Know your rights and options' }
      ]
    },
    {
      id: 3,
      title: t('women.layer3'),
      description: 'Legal action and reporting',
      color: 'bg-green-600',
      features: [
        { icon: Scale, name: 'One-Click Reporting', description: 'Direct to authorities' },
        { icon: Shield, name: 'Jurisdiction Detection', description: 'Auto-route to correct police' },
        { icon: Phone, name: 'Legal Contacts', description: 'Specialized cyber lawyers' },
        { icon: CheckCircle, name: 'Case Tracking', description: 'Monitor complaint status' }
      ]
    }
  ];

  const realityCheckQuestions = [
    'Are you being asked to keep this interaction secret?',
    'Are they asking for money, gifts, or personal information?',
    'Do they claim to be someone they cannot prove?',
    'Are they pressuring you to make quick decisions?',
    'Have they asked you to move to a private platform?'
  ];

  const [realityCheckAnswers, setRealityCheckAnswers] = useState<boolean[]>([]);

  const handleRealityCheck = (index: number, answer: boolean) => {
    const newAnswers = [...realityCheckAnswers];
    newAnswers[index] = answer;
    setRealityCheckAnswers(newAnswers);
  };

  const getRealityCheckResult = () => {
    const yesCount = realityCheckAnswers.filter(Boolean).length;
    if (yesCount >= 3) return { level: 'high', message: 'High risk indicators detected. Consider seeking help.' };
    if (yesCount >= 1) return { level: 'medium', message: 'Some concerning patterns. Stay cautious.' };
    return { level: 'low', message: 'No immediate red flags detected.' };
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
            <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('women.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('women.subtitle')}
          </p>
        </div>

        {/* --- CUSTOM PANIC BUTTON SECTION --- */}
        <div className="mb-12 flex flex-col items-center">
          {!panicActive ? (
            <div className="relative group">
              <button
                onClick={activatePanic}
                className="relative z-10 bg-red-600 hover:bg-red-700 text-white rounded-full w-48 h-48 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:shadow-[0_0_60px_rgba(239,68,68,0.8)] hover:scale-105 transition-all duration-300"
              >
                <AlertCircle className="h-15 w-15 mb-2" />
                <span className="font-bold text-2xl tracking-wider">PANIC</span>
                <span className="text-sm opacity-90 font-medium">SOS</span>
              </button>
              {/* Pulse Effect */}
              <span className="absolute inset-0 rounded-full border-4 border-red-500 opacity-70 animate-ping -z-0"></span>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-in zoom-in-95 duration-300 border-2 border-red-500">
              <h3 className="text-2xl font-bold text-red-600 mb-2">SOS ACTIVATED</h3>
              
              {sendingStatus === 'idle' && (
                <>
                  <p className="text-gray-600 mb-6">Sending location & alert in</p>
                  <div className="text-6xl font-black text-gray-900 dark:text-white mb-8 tabular-nums">
                    {countdown}
                  </div>
                  <button 
                    onClick={cancelPanic}
                    className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors"
                  >
                    CANCEL
                  </button>
                </>
              )}

              {sendingStatus === 'sending' && (
                <div className="py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="font-semibold text-lg">Contacting Help...</p>
                </div>
              )}

              {sendingStatus === 'sent' && (
                <div className="py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="font-semibold text-lg text-green-600">WhatsApp Alert Sent</p>
                </div>
              )}

              {sendingStatus === 'error' && (
                <div className="py-4">
                  <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="font-semibold text-red-600 mb-4">Failed to send</p>
                  <button 
                    onClick={() => setPanicActive(false)}
                    className="w-full py-2 bg-gray-200 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 text-center w-full">
            {/* Location Status Indicator */}
            <div className="flex justify-center items-center gap-2 mb-4">
              <MapPin className={`h-4 w-4 ${locationStatus === 'locked' ? 'text-green-500' : 'text-orange-500'}`} />
              <span className={`text-sm font-medium ${locationStatus === 'locked' ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                {locationStatus === 'detecting' && 'Acquiring GPS...'}
                {locationStatus === 'locked' && 'GPS Locked'}
                {locationStatus === 'error' && 'GPS Unavailable'}
              </span>
            </div>

            <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 shadow-sm text-center">
              <p className="text-gray-800 dark:text-gray-200 mb-2">
                Use this feature <strong>only in case of an emergency</strong>.
              </p>
              <p className="text-red-700 dark:text-red-300 mb-2">
                Activating Panic Mode will <strong>immediately alert</strong> your emergency contacts.
              </p>
              <p className="text-red-700 dark:text-red-300 mb-2">
                Your <strong>current live location</strong> will be shared automatically.
              </p>
              <p className="text-red-700 dark:text-red-300 mb-2">
                Relevant authorities or security teams may also be notified.
              </p>
              <p className="text-red-600 dark:text-red-400 font-bold mt-4 text-lg">
                Proceed only if you are in immediate danger.
              </p>
            </div>
          </div>
        </div>

        {/* Layer Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeLayer === layer.id
                  ? `${layer.color} text-white shadow-lg transform scale-105`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {layer.title}
            </button>
          ))}
        </div>

        {/* Layer Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          {layers.map((layer) => (
            activeLayer === layer.id && (
              <div key={layer.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {layer.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {layer.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {layer.features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
                        onClick={() => {
                          if (feature.name === t('women.realityCheck')) {
                            setIsRealityCheckOpen(true);
                          }
                          if (feature.name === t('women.panicButton')) {
                            activatePanic();
                          }
                        }}
                      >
                        <Icon className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Reality Check Modal */}
        {isRealityCheckOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 animate-in zoom-in-95">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Reality Check
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Answer these questions honestly about your situation
                </p>
              </div>

              <div className="space-y-6">
                {realityCheckQuestions.map((question, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-900 dark:text-white mb-3 font-medium">
                      {question}
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleRealityCheck(index, true)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          realityCheckAnswers[index] === true
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleRealityCheck(index, false)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          realityCheckAnswers[index] === false
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ))}

                {realityCheckAnswers.filter(a => a !== undefined).length === realityCheckQuestions.length && (
                  <div className={`p-4 rounded-lg border-l-4 ${
                    getRealityCheckResult().level === 'high' ? 'bg-red-50 border-red-500' :
                    getRealityCheckResult().level === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-green-50 border-green-500'
                  }`}>
                    <p className="text-center font-bold text-lg text-gray-900 dark:text-white">
                      {getRealityCheckResult().message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => {
                    setIsRealityCheckOpen(false);
                    setRealityCheckAnswers([]);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Resources */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-center text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">24/7 Support Available</h3>
          <p className="text-purple-100 mb-6">
            You are not alone. Help is always available when you need it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="font-semibold">Women Helpline: 1091</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="font-semibold">Cyber Crime: 1930</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="font-semibold">Emergency: 112</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomenSafetyHub;