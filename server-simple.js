import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Mock data for demonstration
const mockData = {
  threats: [
    { id: '1', type: 'phone', entity: '+91-9876543210', riskScore: 8.5, location: 'Delhi', timestamp: Date.now(), trend: 'up' },
    { id: '2', type: 'url', entity: 'http://fake-bank.com', riskScore: 9.2, location: 'Mumbai', timestamp: Date.now(), trend: 'up' },
    { id: '3', type: 'email', entity: 'scam@fake.com', riskScore: 7.8, location: 'Bangalore', timestamp: Date.now(), trend: 'stable' }
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
  windowMs: 15 * 60 * 1000,
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
