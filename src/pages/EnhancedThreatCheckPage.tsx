import React, { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Loader2, Lock, Globe, Phone, Mail, CreditCard, Mic, MicOff, Camera, TrendingUp, Brain, Eye } from 'lucide-react';
import { apiClient } from '../lib/api-client';

const EnhancedThreatCheckPage: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedType, setSelectedType] = useState<'phone' | 'url' | 'email' | 'upi'>('url');
  
  // Advanced ML Features State
  const [mutationPrediction, setMutationPrediction] = useState<any>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<any>(null);
  const [visualAnalysis, setVisualAnalysis] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    apiClient.initializeSocket();
    
    return () => {
      apiClient.disconnect();
    };
  }, []);

  // Enhanced threat analysis with ML
  const analyzeInput = async () => {
    if (!inputData.trim()) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      // Perform basic analysis using API client
      const basicAnalysis = await apiClient.analyzeThreat({
        entity: inputData,
        type: selectedType,
        isAnonymous: true,
      });
      
      setAnalysis(basicAnalysis);

      // Trigger advanced ML analyses in background
      if (basicAnalysis.riskScore > 5) {
        performAdvancedAnalyses(inputData, basicAnalysis);
      }

    } catch (err) {
      console.error("Analysis Error:", err);
      setError((err as Error).message || "Unable to complete analysis. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performAdvancedAnalyses = async (input: string, basicAnalysis: any) => {
    try {
      // Temporal Mutation Detection using API client
      if (basicAnalysis.category === 'Phone' || basicAnalysis.category === 'Email') {
        const prediction = await apiClient.generatePrediction(input, basicAnalysis.category.toLowerCase());
        setMutationPrediction(prediction);
      }

      // Visual Similarity Detection for URLs using API client
      if (basicAnalysis.category === 'URL') {
        const visualResult = await apiClient.analyzeVisual(input);
        setVisualAnalysis(visualResult);
      }
    } catch (error) {
      console.error('Advanced analysis error:', error);
    }
  };

  // Voice analysis functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      setIsRecording(true);

      // For now, just indicate recording is active
      // In a real implementation, you would send audio data to the API
      console.log('Voice recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setMediaStream(null);
    }
    setIsRecording(false);
    console.log('Voice recording stopped');
  };

  // Visual analysis for file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      // Analyze screenshot for phishing
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        try {
          // Use API client to analyze the image
          const analysis = await apiClient.analyzeVisual(undefined, result);
          setVisualAnalysis(analysis);
        } catch (error) {
          console.error('Error analyzing image:', error);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/')) {
      try {
        // Use API client to analyze audio
        const analysis = await apiClient.analyzeVoice(file);
        setVoiceAnalysis(analysis);
      } catch (error) {
        console.error('Error analyzing audio:', error);
      }
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 2) return { 
      level: 'Safe', 
      color: 'text-green-600 bg-green-50 border-green-200', 
      barColor: 'bg-green-500',
      icon: <CheckCircle className="h-6 w-6 text-green-600" />
    };
    if (score <= 4) return { 
      level: 'Low Risk', 
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      barColor: 'bg-yellow-500',
      icon: <Clock className="h-6 w-6 text-yellow-600" />
    };
    if (score <= 7) return { 
      level: 'Medium Risk', 
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      barColor: 'bg-orange-500',
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />
    };
    return { 
      level: 'Critical Risk', 
      color: 'text-red-700 bg-red-50 border-red-200',
      barColor: 'bg-red-600',
      icon: <XCircle className="h-6 w-6 text-red-700" />
    };
  };

  const riskInfo = analysis ? getRiskLevel(analysis.riskScore) : null;

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('email')) return <Mail className="h-5 w-5" />;
    if (cat.includes('phone')) return <Phone className="h-5 w-5" />;
    if (cat.includes('url') || cat.includes('web')) return <Globe className="h-5 w-5" />;
    if (cat.includes('upi') || cat.includes('payment')) return <CreditCard className="h-5 w-5" />;
    return <Search className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 pt-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/50 mb-6">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            AI-Powered Threat Intelligence
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Advanced ML analysis with temporal mutation detection, voice deepfake detection, and visual similarity analysis
          </p>
        </div>

        {/* Analysis Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Text Analysis
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'voice'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Mic className="h-4 w-4 inline mr-2" />
              Voice Analysis
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'visual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Visual Analysis
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              ML Insights
            </button>
          </div>
        </div>

        {/* Basic Text Analysis */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Type Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Analysis Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'url' as const, icon: Globe, label: 'Website URL' },
                  { type: 'phone' as const, icon: Phone, label: 'Phone Number' },
                  { type: 'email' as const, icon: Mail, label: 'Email Address' },
                  { type: 'upi' as const, icon: CreditCard, label: 'UPI ID' },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                      selectedType === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && analyzeInput()}
                    placeholder="e.g., suspicious-site.com, +1234567890, email@domain.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-blue-500 bg-transparent text-lg placeholder-gray-400 dark:text-white"
                  />
                </div>
                <button
                  onClick={analyzeInput}
                  disabled={!inputData.trim() || isAnalyzing}
                  className="md:w-auto w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      <span>Analyze with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && riskInfo && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {/* Main Score Card */}
                <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-l-8 overflow-hidden ${riskInfo.color.replace('bg-', 'border-').replace('text-', 'border-')}`}>
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300`}>
                          {getCategoryIcon(analysis.category)}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Detected Type</span>
                          <p className="font-bold text-gray-800 dark:text-white capitalize">{analysis.category}</p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-3 px-5 py-3 rounded-xl border ${riskInfo.color} dark:bg-opacity-20`}>
                        {riskInfo.icon}
                        <div>
                          <p className="text-xs font-bold opacity-70 uppercase tracking-wider text-gray-900 dark:text-white">Risk Level</p>
                          <p className="font-bold text-lg leading-none text-gray-900 dark:text-white">{riskInfo.level}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{analysis.riskScore.toFixed(1)}<span className="text-lg text-gray-400 font-medium">/10</span></span>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Confidence: {analysis.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div 
                          className={`h-full ${riskInfo.barColor} transition-all duration-1000 ease-out`}
                          style={{ width: `${(analysis.riskScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Search className="h-4 w-4 mr-2 text-blue-500" />
                        Analysis Summary
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {analysis.summary || "No summary available."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Threats and Recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                      Identified Threats
                    </h3>
                    {analysis.threats && analysis.threats.length > 0 ? (
                      <ul className="space-y-3">
                        {analysis.threats.map((threat: string, index: number) => (
                          <li key={index} className="flex items-start bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-2 mr-3 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{threat}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400 text-sm italic py-4 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        No specific threats detected.
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Lock className="h-5 w-5 text-blue-500 mr-2" />
                      Security Advice
                    </h3>
                    <ul className="space-y-3">
                      {analysis.recommendations && analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Analysis Tab */}
        {activeTab === 'voice' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Mic className="h-6 w-6 mr-3 text-blue-600" />
              Voice Deepfake Detection
            </h2>
            
            <div className="text-center">
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`mx-auto p-8 rounded-full transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-12 w-12 text-white" />
                ) : (
                  <Mic className="h-12 w-12 text-white" />
                )}
              </button>
              
              <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                {isRecording ? 'Recording... Click to stop' : 'Click to start voice analysis'}
              </p>
              
              {voiceAnalysis && (
                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                  <h3 className="font-bold text-lg mb-4">Voice Analysis Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Deepfake Probability:</span>
                      <p className="font-bold">{(voiceAnalysis.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Risk Score:</span>
                      <p className="font-bold">{voiceAnalysis.riskScore.toFixed(1)}/10</p>
                    </div>
                  </div>
                  {voiceAnalysis.warnings.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Warnings:</h4>
                      <ul className="space-y-1">
                        {voiceAnalysis.warnings.map((warning: string, index: number) => (
                          <li key={index} className="text-sm text-orange-600">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visual Analysis Tab */}
        {activeTab === 'visual' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Eye className="h-6 w-6 mr-3 text-blue-600" />
              Visual Phishing Detection
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                Upload a screenshot or enter a URL to analyze
              </p>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
              
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Or enter a URL to analyze..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                      // Analyze URL using API client
                      apiClient.analyzeVisual((e.target as HTMLInputElement).value).then(setVisualAnalysis);
                    }
                  }}
                />
              </div>
            </div>
            
            {visualAnalysis && (
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-bold text-lg mb-4">Visual Analysis Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Phishing Probability:</span>
                    <p className="font-bold">{(visualAnalysis.similarityScore * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Risk Score:</span>
                    <p className="font-bold">{visualAnalysis.riskScore.toFixed(1)}/10</p>
                  </div>
                </div>
                
                {visualAnalysis.legitimateSite && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm"><strong>Similar to:</strong> {visualAnalysis.legitimateSite.name}</p>
                    <p className="text-sm"><strong>Confidence:</strong> {(visualAnalysis.legitimateSite.confidence * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ML Insights Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {mutationPrediction && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-purple-600" />
                  Temporal Mutation Prediction
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Current Pattern</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mutationPrediction.currentPattern.type}</p>
                    <p className="text-sm">Risk Level: <span className="font-bold">{mutationPrediction.riskLevel}</span></p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Prediction</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mutationPrediction.confidence > 0.7 ? 'High confidence' : 'Low confidence'} 
                      {' '}mutation in {mutationPrediction.timeToMutation} days
                    </p>
                    <div className="mt-2">
                      <div className="text-sm text-gray-600">Confidence:</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${mutationPrediction.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {mutationPrediction.predictedVariants.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Predicted Variants</h3>
                    <div className="space-y-2">
                      {mutationPrediction.predictedVariants.map((variant: any, index: number) => (
                        <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-sm font-medium">Variant {index + 1}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {variant.script.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!mutationPrediction && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ML Insights Available
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analyze a threat first to see advanced ML predictions and insights
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedThreatCheckPage;
