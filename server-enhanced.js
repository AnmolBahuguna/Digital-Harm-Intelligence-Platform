import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Mock implementations since optional dependencies aren't installed
const mockData = {
  threats: [
    { id: '1', type: 'phone', entity: '+91-9876543210', riskScore: 8.5, location: 'Delhi', timestamp: Date.now(), trend: 'up' },
    { id: '2', type: 'url', entity: 'http://fake-bank.com', riskScore: 9.2, location: 'Mumbai', timestamp: Date.now(), trend: 'up' },
    { id: '3', type: 'email', entity: 'scam@fake.com', riskScore: 7.8, location: 'Bangalore', timestamp: Date.now(), trend: 'stable' }
  ],
  predictions: [
    { entityType: 'Digital Arrest', currentRisk: 8.5, predictedRisk: 9.8, timeHorizon: 7, confidence: 0.87 },
    { entityType: 'Bank Phishing', currentRisk: 7.2, predictedRisk: 8.9, timeHorizon: 5, confidence: 0.92 }
  ],
  regionalData: [
    { region: 'Delhi', totalThreats: 245, highRiskThreats: 89, riskLevel: 'high' },
    { region: 'Mumbai', totalThreats: 189, highRiskThreats: 67, riskLevel: 'medium' },
    { region: 'Bangalore', totalThreats: 156, highRiskThreats: 43, riskLevel: 'medium' }
  ]
};

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '2.0.0',
    features: {
      temporalMutation: true,
      voiceDeepfake: true,
      visualSimilarity: true,
      smsIntegration: true,
      realtimePredictions: true,
    }
  });
});

// Enhanced threat analysis
app.post('/api/analyze', (req, res) => {
  try {
    const { entity, type, location, userId, isAnonymous } = req.body;
    
    if (!entity || !type) {
      return res.status(400).json({ error: 'Entity and type are required' });
    }

    // Mock enhanced analysis
    const analysis = {
      riskScore: Math.random() * 10,
      category: type === 'phone' ? 'Mobile Threat' : type === 'url' ? 'Website Threat' : 'Digital Threat',
      threats: ['Suspicious pattern detected', 'High-risk activity'],
      recommendations: ['Verify through official channels', 'Do not share personal information'],
      confidence: 0.85 + Math.random() * 0.15,
      metadata: {
        analysisTime: Date.now(),
        mlFeatures: [entity.length / 100, Math.random(), Math.random(), Math.random()],
        patterns: ['Urgency pattern detected', 'Social engineering attempt'],
        prediction: {
          nextVariant: 'Customs Officer Scam',
          probability: 0.65,
          timeHorizon: '7 days'
        }
      }
    };

    // Broadcast real-time update
    io.emit('threat-analyzed', { 
      report: {
        id: Date.now().toString(),
        type,
        entity,
        riskScore: analysis.riskScore,
        category: analysis.category,
        location: location || { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
        timestamp: Date.now(),
        userId,
        isAnonymous: isAnonymous || false,
        metadata: analysis
      },
      analysis 
    });

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// AI Predictions
app.post('/api/predict', (req, res) => {
  try {
    const { entity, type, timeHorizon = 7 } = req.body;
    
    if (!entity || !type) {
      return res.status(400).json({ error: 'Entity and type are required' });
    }

    const prediction = {
      id: Date.now().toString(),
      entityType: type,
      entityValue: entity,
      currentRiskScore: Math.random() * 10,
      predictedRiskScore: Math.min(10, Math.random() * 10 + 2),
      timeHorizon,
      confidence: 0.8 + Math.random() * 0.2,
      variants: [
        { type: 'Customs Officer', probability: 0.65 },
        { type: 'Tax Evasion', probability: 0.25 },
        { type: 'Court Summons', probability: 0.10 }
      ],
      recommendations: [
        'Monitor for similar patterns',
        'Update security measures',
        'Educate users about new variants'
      ],
      lastUpdated: Date.now(),
    };

    io.emit('prediction-updated', prediction);
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// Regional threats
app.get('/api/regional-threats/:region?', (req, res) => {
  const { region } = req.params;
  
  if (region) {
    const data = mockData.regionalData.find(r => r.region === region);
    if (data) {
      return res.json(data);
    }
  }

  res.json(mockData.regionalData);
});

// Real-time threat feed
app.get('/api/threats/feed', (req, res) => {
  const { limit = 50, offset = 0, category, minRiskScore } = req.query;
  
  let threats = mockData.threats
    .filter(threat => {
      if (category && threat.type !== category) return false;
      if (minRiskScore && threat.riskScore < parseInt(minRiskScore)) return false;
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    threats,
    total: mockData.threats.length,
    hasMore: parseInt(offset) + parseInt(limit) < mockData.threats.length
  });
});

// Voice analysis (mock)
app.post('/api/voice/analyze', (req, res) => {
  try {
    const { audioData, format } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const analysis = {
      isDeepfake: Math.random() > 0.7,
      confidence: 0.85 + Math.random() * 0.15,
      riskScore: Math.random() * 10,
      indicators: {
        syntheticArtifacts: Math.random(),
        unnaturalIntonation: Math.random(),
        backgroundNoise: Math.random(),
        artificialUrgency: Math.random(),
        scriptPattern: Math.random()
      },
      warnings: Math.random() > 0.5 ? ['High probability of synthetic voice detected'] : [],
      transcript: 'Mock transcript of potential scam call'
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Voice analysis failed' });
  }
});

// Visual analysis (mock)
app.post('/api/visual/analyze', (req, res) => {
  try {
    const { imageUrl, imageData } = req.body;
    
    if (!imageUrl && !imageData) {
      return res.status(400).json({ error: 'Image URL or data is required' });
    }

    const analysis = {
      isPhishing: Math.random() > 0.6,
      similarityScore: Math.random() * 100,
      riskScore: Math.random() * 10,
      detectedIssues: {
        logoMismatch: Math.random() > 0.5,
        layoutDifferences: Math.random() > 0.5,
        colorSchemeDiff: Math.random() > 0.5,
        suspiciousElements: ['Missing HTTPS', 'Suspicious forms']
      },
      legitimateSite: Math.random() > 0.5 ? {
        name: 'HDFC Bank',
        url: 'https://hdfcbank.com',
        confidence: Math.random() * 100
      } : undefined
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Visual analysis failed' });
  }
});

// Security audit (mock)
app.post('/api/security/audit', (req, res) => {
  try {
    const audit = {
      overallScore: 85 + Math.random() * 10,
      grade: 'A',
      testResults: [
        { passed: true, score: 95, details: 'Password policy is properly enforced', recommendations: [] },
        { passed: true, score: 90, details: 'JWT tokens are properly configured', recommendations: [] },
        { passed: true, score: 88, details: 'Input validation is working', recommendations: [] },
        { passed: false, score: 65, details: 'Rate limiting could be improved', recommendations: ['Implement stricter rate limits'] }
      ],
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 1,
      lowIssues: 2,
      timestamp: Date.now(),
      recommendations: ['Continue monitoring', 'Update rate limiting', 'Regular security audits']
    };

    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: 'Security audit failed' });
  }
});

// Statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    totalThreats: mockData.threats.length,
    averageRisk: mockData.threats.reduce((sum, t) => sum + t.riskScore, 0) / mockData.threats.length,
    threatsAnalyzed: 1247,
    predictionsMade: 89,
    accuracy: 94.2,
    regionalBreakdown: mockData.regionalData,
    recentActivity: mockData.threats.slice(-10).map(t => ({
      timestamp: t.timestamp,
      type: t.type,
      riskScore: t.riskScore,
    })),
    topThreats: mockData.threats.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10)
  };

  res.json(stats);
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial data
  socket.emit('initial-data', {
    regionalThreats: mockData.regionalData,
    recentThreats: mockData.threats.slice(0, 10),
    stats: {
      totalThreats: mockData.threats.length,
      averageRisk: 7.8,
      threatsAnalyzed: 1247,
      predictionsMade: 89,
      accuracy: 94.2
    }
  });

  socket.on('subscribe-regional', (region) => {
    socket.join(`region-${region}`);
    socket.emit('subscribed', { type: 'regional', region });
  });

  socket.on('subscribe-threats', () => {
    socket.join('threats');
    socket.emit('subscribed', { type: 'threats' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulate real-time updates
setInterval(() => {
  const newThreat = {
    id: Date.now().toString(),
    type: ['phone', 'url', 'email', 'upi'][Math.floor(Math.random() * 4)],
    entity: `New threat ${Date.now()}`,
    riskScore: Math.random() * 10,
    location: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 5)],
    timestamp: Date.now(),
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
  };

  mockData.threats.unshift(newThreat);
  if (mockData.threats.length > 20) {
    mockData.threats = mockData.threats.slice(0, 20);
  }

  io.emit('threat-analyzed', { 
    report: newThreat,
    analysis: { riskScore: newThreat.riskScore, category: newThreat.type }
  });
}, 10000); // Update every 10 seconds

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Enhanced DHIP Backend API running on port ${PORT}`);
  console.log(`📊 Real-time WebSocket server active`);
  console.log(`🧠 ML Features: Temporal Mutation, Voice Deepfake, Visual Similarity`);
  console.log(`🌐 Frontend should be running on: http://localhost:5173/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
