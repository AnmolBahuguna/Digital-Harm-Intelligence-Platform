import React, { useState } from 'react';
import { Shield, Lock, Users, Phone, MessageCircle, BookOpen, AlertTriangle, Heart, Eye, EyeOff, CheckCircle, ArrowRight, ExternalLink, FileText, HelpCircle, UserCheck } from 'lucide-react';

interface SupportLayersProps {
  onLayerSelect: (layer: number) => void;
}

const SupportLayers: React.FC<SupportLayersProps> = ({ onLayerSelect }) => {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  const layers = [
    {
      id: 1,
      name: 'Private Help',
      subtitle: 'Zero Disclosure',
      icon: EyeOff,
      color: 'bg-green-500',
      description: 'Complete privacy with no information sharing',
      features: [
        { icon: Lock, title: 'Encrypted Evidence Vault', description: 'Client-side encryption, stored only on your device' },
        { icon: Shield, title: 'AI Safety Planner', description: 'Generate personalized safety strategies' },
        { icon: MessageCircle, title: '24/7 Anonymous Chatbot', description: 'Trauma-informed AI support' },
        { icon: Phone, title: 'Silent Panic Button', description: 'Alert contacts without revealing anything' },
        { icon: AlertTriangle, title: 'Reality Check Module', description: 'Counter fear tactics and manipulation' }
      ],
      privacy: '100% Anonymous - No data shared',
      access: 'Instant access'
    },
    {
      id: 2,
      name: 'Support Network',
      subtitle: 'Controlled Sharing',
      icon: Users,
      color: 'bg-blue-500',
      description: 'Connect with verified support while maintaining control',
      features: [
        { icon: UserCheck, title: 'Vetted NGO Directory', description: '200+ verified organizations across India' },
        { icon: Users, title: 'Anonymous Peer Groups', description: 'Connect with survivors privately' },
        { icon: Phone, title: 'Mental Health Helplines', description: '24/7 professional counseling support' },
        { icon: BookOpen, title: 'Legal Awareness Library', description: 'Understand your rights and options' },
        { icon: Heart, title: 'Trauma Support Resources', description: 'Specialized healing and recovery tools' }
      ],
      privacy: 'Pseudonymous - You control what to share',
      access: 'Optional registration'
    },
    {
      id: 3,
      name: 'Legal Action',
      subtitle: 'User-Controlled',
      icon: Shield,
      color: 'bg-purple-500',
      description: 'Take formal action with comprehensive support',
      features: [
        { icon: FileText, title: 'One-Click FIR Filing', description: 'Integrated with cyber crime portals' },
        { icon: Users, title: 'Women\'s Commission Links', description: 'Direct access to state and national bodies' },
        { icon: UserCheck, title: 'Verified Lawyer Network', description: 'Pro-bono legal assistance' },
        { icon: Shield, title: 'Case Progress Tracker', description: 'Monitor your case status securely' },
        { icon: Phone, title: 'Emergency Response Coordination', description: 'Immediate help when needed' }
      ],
      privacy: 'Verified identity for legal processes',
      access: 'Identity verification required'
    }
  ];

  const handleLayerClick = (layerId: number) => {
    setSelectedLayer(layerId);
    onLayerSelect(layerId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Progressive Support System
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Choose your comfort level. You maintain complete control over what information you share.
        </p>
      </div>

      {/* Layers */}
      <div className="space-y-6">
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <div
              key={layer.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                selectedLayer === layer.id ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-xl'
              }`}
            >
              {/* Layer Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`${layer.color} p-3 rounded-xl text-white`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Layer {layer.id}: {layer.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{layer.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLayerClick(layer.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedLayer === layer.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {selectedLayer === layer.id ? 'Selected' : 'Choose Layer'}
                  </button>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {layer.description}
                </p>

                {/* Privacy Info */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Privacy Level</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{layer.privacy}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Access</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{layer.access}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Available Features:</h4>
                  <div className="grid gap-3">
                    {layer.features.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className={`${layer.color} p-2 rounded-lg text-white mt-1`}>
                            <FeatureIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                              {feature.title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {layer.id === 1 && 'Perfect for: Immediate private support'}
                    {layer.id === 2 && 'Perfect for: Building support network'}
                    {layer.id === 3 && 'Perfect for: Taking legal action'}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-green-600 dark:text-green-400 mt-1" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Your Privacy is Our Priority
            </h4>
            <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
              Every layer is designed with your safety in mind. You can switch between layers at any time, 
              and you always have control over what information you choose to share. Our system uses 
              end-to-end encryption and follows trauma-informed design principles.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Help */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-3">
            <Phone className="h-6 w-6 text-red-600 dark:text-red-400 mt-1" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Emergency Helpline
              </h4>
              <p className="text-red-800 dark:text-red-200 text-sm">
                24/7 Women Helpline: 1091 | Cyber Crime: 1930
              </p>
            </div>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Call Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportLayers;
