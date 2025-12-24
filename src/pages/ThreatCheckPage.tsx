import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Loader2, Lock, Globe, Phone, Mail, CreditCard, MessageSquare, FileText, Send, X } from 'lucide-react';

const ThreatCheckPage = () => {
  const [inputData, setInputData] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  
  // State for Extra Features
  const [loadingAction, setLoadingAction] = useState(null); // 'simulate' | null
  const [simulation, setSimulation] = useState(null);
  
  // Complaint Form State
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintData, setComplaintData] = useState({ name: '', number: '', message: '' });
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'submitting' | 'success' | 'error' | null

  // Hardcoded API Key as requested
  const apiKey = import.meta.env.VITE_APIKEY;

  // Helper for API calls with retry logic
  const callGeminiAPI = async (payload) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    let lastError = null;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (err) {
        console.warn(`Attempt ${i + 1} failed:`, err);
        lastError = err;
        // Exponential backoff: 1s, 2s, 4s
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  };

  const analyzeInput = async () => {
    if (!inputData.trim()) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setSimulation(null);
    setShowComplaintForm(false);
    setSubmissionStatus(null);
    setError(null);

    try {
      const prompt = `
        Analyze the following input for cybersecurity threats: "${inputData}".
        
        1. Identify the Category: Email, URL, Phone Number, UPI ID, or Unknown.
        2. Perform a Google Search to check if this specific input is reported in fraud databases, consumer complaints, or phishing lists.
        3. Assess the Risk Score (0-10) based on your findings. 
           - 0-2: Safe (Official domains, known contacts)
           - 3-5: Low/Medium (Unknown, no history)
           - 6-10: High/Critical (Reported scams, suspicious patterns, phishing)
        4. Provide specific threats and recommendations.

        Return ONLY a JSON object with this schema:
        {
          "riskScore": number,
          "category": "string",
          "threats": ["string"],
          "recommendations": ["string"],
          "confidence": number,
          "summary": "string" 
        }
      `;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
      };

      const result = await callGeminiAPI(payload);

      let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No data received from AI.");
      
      // Clean up markdown formatting if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Attempt to find JSON start/end if there is extra text
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

      setAnalysis(JSON.parse(text));

    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || "Unable to complete analysis. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Feature 1: Generate Scam Simulation
  const generateSimulation = async () => {
    if (!analysis) return;
    setLoadingAction('simulate');
    try {
      const prompt = `
        Generate a realistic example of a scam message (SMS, WhatsApp, or Email) that a fraudster would use involving this identifier: "${inputData}".
        The goal is to educate the user on what patterns to look out for. 
        Context: The user input is categorized as ${analysis.category} with a risk summary of: ${analysis.summary}.
        
        Return ONLY a JSON object: { "type": "SMS/Email/WhatsApp", "content": "The message text here..." }
      `;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const result = await callGeminiAPI(payload);
      
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setSimulation(JSON.parse(text));
    } catch (e) {
      console.error(e);
      setSimulation({ type: "Error", content: `Failed to generate: ${e.message}` });
    } finally {
      setLoadingAction(null);
    }
  };

  // Feature 2: Handle Complaint Form
  const openComplaintForm = () => {
    setComplaintData({
      name: '',
      number: '',
      message: `I would like to report suspicious activity regarding: ${inputData}. \n\nDetails: `
    });
    setShowComplaintForm(true);
    setSubmissionStatus(null);
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus('submitting');
    
    // Google Form Details
    const FORM_ID = "1FAIpQLSd9mwrPiabivQg1nWWh09iZ2UbzAGtpMtQzfdIWoTN1M-feiA";
    const formUrl = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

    try {
      const formData = new URLSearchParams();
      formData.append('entry.1488923519', complaintData.name);   // Name
      formData.append('entry.461506030', complaintData.number);  // Number
      formData.append('entry.747599057', complaintData.message); // Complaint

      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors', // Essential for Google Forms to work without CORS errors
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
      
      setSubmissionStatus('success');
      
      // Clear form and close after delay
      setTimeout(() => {
        setShowComplaintForm(false);
        setSubmissionStatus(null);
      }, 3000);

    } catch (err) {
      console.error("Submission Error:", err);
      setSubmissionStatus('error');
    }
  };

  const getRiskLevel = (score) => {
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

  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('email')) return <Mail className="h-5 w-5" />;
    if (cat.includes('phone')) return <Phone className="h-5 w-5" />;
    if (cat.includes('url') || cat.includes('web')) return <Globe className="h-5 w-5" />;
    if (cat.includes('upi') || cat.includes('payment')) return <CreditCard className="h-5 w-5" />;
    return <Search className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12">
      {/* Background Overlay */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      
      <div className="relative max-w-3xl mx-auto z-10">
        
        {/* Header */}
        <div className="text-center mb-10 pt-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/50 mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            Threat Intelligence Scanner
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            Enter a URL, phone number, email, or UPI ID to scan for potential fraud.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 mb-8 transition-transform hover:scale-[1.01] duration-300">
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
                placeholder="e.g., suspicious-site.com, +1234567890"
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
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Analyze Risk</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl mb-8 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

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

            {/* AI Action Tools */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white p-1">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                 <h3 className="text-lg font-bold mb-4 flex items-center">
                   <Shield className="h-5 w-5 mr-2 text-yellow-300" /> 
                   AI Protection Tools
                 </h3>
                 
                 {!showComplaintForm ? (
                   <div className="grid md:grid-cols-2 gap-4">
                     {/* Button 1: Simulate */}
                     <button 
                       onClick={generateSimulation}
                       disabled={loadingAction === 'simulate'}
                       className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 transition-colors p-4 rounded-xl border border-white/20 text-left"
                     >
                        {loadingAction === 'simulate' ? <Loader2 className="animate-spin h-5 w-5" /> : <MessageSquare className="h-6 w-6 text-yellow-300" />}
                        <div>
                          <div className="font-bold text-sm">✨ Scam Simulator</div>
                          <div className="text-xs opacity-80">See how this scam works</div>
                        </div>
                     </button>

                     {/* Button 2: File Complaint */}
                     <button 
                       onClick={openComplaintForm}
                       className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 transition-colors p-4 rounded-xl border border-white/20 text-left"
                     >
                        <FileText className="h-6 w-6 text-yellow-300" />
                        <div>
                          <div className="font-bold text-sm">File Complaint</div>
                          <div className="text-xs opacity-80">Report to authorities</div>
                        </div>
                     </button>
                   </div>
                 ) : (
                   /* Complaint Form */
                   <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-gray-900 dark:text-white animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          File Official Complaint
                        </h4>
                        <button onClick={() => setShowComplaintForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {submissionStatus === 'success' ? (
                        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center justify-center flex-col text-center">
                          <CheckCircle className="h-10 w-10 mb-2" />
                          <p className="font-bold">Complaint Filed Successfully!</p>
                          <p className="text-sm">We have recorded your report.</p>
                        </div>
                      ) : submissionStatus === 'error' ? (
                         <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center justify-center flex-col text-center">
                          <XCircle className="h-10 w-10 mb-2" />
                          <p className="font-bold">Submission Failed</p>
                          <p className="text-sm">Please try again later.</p>
                          <button 
                            onClick={() => setSubmissionStatus(null)}
                            className="mt-2 text-sm underline hover:text-red-800 dark:hover:text-red-200"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleComplaintSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                            <input 
                              type="text" 
                              required
                              value={complaintData.name}
                              onChange={(e) => setComplaintData({...complaintData, name: e.target.value})}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                            <input 
                              type="tel" 
                              required
                              value={complaintData.number}
                              onChange={(e) => setComplaintData({...complaintData, number: e.target.value})}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                              placeholder="+1 234 567 8900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Complaint Details</label>
                            <textarea 
                              required
                              rows={4}
                              value={complaintData.message}
                              onChange={(e) => setComplaintData({...complaintData, message: e.target.value})}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                            />
                          </div>
                          <button 
                            type="submit"
                            disabled={submissionStatus === 'submitting'}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            {submissionStatus === 'submitting' ? (
                              <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                            <span>{submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Complaint'}</span>
                          </button>
                        </form>
                      )}
                   </div>
                 )}

                 {/* Simulation Result */}
                 {simulation && (
                    <div className="mt-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl animate-in slide-in-from-top-2">
                       <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center">
                         <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                         Example {simulation.type} Pattern
                       </h4>
                       <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm border-l-4 border-orange-500">
                         "{simulation.content}"
                       </div>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                         *This is an AI-generated example for educational purposes only.
                       </p>
                    </div>
                 )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Threats Column */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  Identified Threats
                </h3>
                {analysis.threats && analysis.threats.length > 0 ? (
                  <ul className="space-y-3">
                    {analysis.threats.map((threat, index) => (
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

              {/* Recommendations Column */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lock className="h-5 w-5 text-blue-500 mr-2" />
                  Security Advice
                </h3>
                <ul className="space-y-3">
                  {analysis.recommendations && analysis.recommendations.map((rec, index) => (
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
    </div>
  );
};

export default ThreatCheckPage;

  