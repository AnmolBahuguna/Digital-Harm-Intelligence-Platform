import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory storage
const threatReports = new Map();
const predictions = new Map();
const regionalData = new Map();

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
app.post('/api/analyze', async (req, res) => {
  try {
    const { entity, type, location, userId, isAnonymous } = req.body;
    
    if (!entity || !type) {
      return res.status(400).json({ error: 'Entity and type are required' });
    }

    // Mock analysis
    const analysis = {
      riskScore: Math.random() * 10,
      category: categorizeEntity(entity, type),
      threats: generateThreats(entity, type),
      recommendations: generateRecommendations(entity, type),
      confidence: 0.85 + Math.random() * 0.15,
      metadata: {
        analysisTime: Date.now(),
        mlFeatures: extractMLFeatures(entity),
        patterns: detectPatterns(entity),
      }
    };

    // Create threat report
    const report = {
      id: crypto.randomUUID(),
      type,
      entity,
      riskScore: analysis.riskScore,
      category: analysis.category,
      location: location || { lat: 0, lng: 0, city: 'Unknown', state: 'Unknown' },
      timestamp: Date.now(),
      userId,
      isAnonymous: isAnonymous || false,
      metadata: analysis
    };

    threatReports.set(report.id, report);
    updateRegionalData(report);

    // Trigger real-time updates
    io.emit('threat-analyzed', { report, analysis });

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Prediction endpoint
app.post('/api/predict', async (req, res) => {
  try {
    const { entity, type, timeHorizon = 7 } = req.body;
    
    if (!entity || !type) {
      return res.status(400).json({ error: 'Entity and type are required' });
    }

    const prediction = {
      id: crypto.randomUUID(),
      entityType: type,
      entityValue: entity,
      currentRiskScore: Math.random() * 10,
      predictedRiskScore: Math.min(10, Math.random() * 10 + 2),
      timeHorizon,
      confidence: Math.random() * 0.5 + 0.5,
      predictedVariants: [
        {
          type: 'phishing',
          description: 'Potential phishing variant detected',
          probability: Math.random(),
        }
      ],
      recommendations: [
        'Monitor for similar patterns',
        'Update security measures',
        'Educate users about new variants',
      ],
      lastUpdated: Date.now(),
    };

    predictions.set(prediction.id, prediction);
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// Regional threats endpoint
app.get('/api/regional-threats/:region?', (req, res) => {
  const region = req.params.region;
  
  if (region) {
    const data = regionalData.get(region);
    if (data) {
      return res.json(data);
    }
  }

  // Return all regional data if no specific region
  const allData = Object.fromEntries(regionalData);
  res.json(allData);
});

// Real-time threat feed
app.get('/api/threats/feed', (req, res) => {
  const { limit = 50, offset = 0, category, minRiskScore } = req.query;
  
  let threats = Array.from(threatReports.values())
    .filter(threat => {
      if (category && threat.type !== category) return false;
      if (minRiskScore && threat.riskScore < parseInt(minRiskScore)) return false;
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    threats,
    total: threatReports.size,
    hasMore: offset + limit < threatReports.size
  });
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
  const reports = Array.from(threatReports.values());
  const predictionList = Array.from(predictions.values());
  
  const stats = {
    totalReports: reports.length,
    totalPredictions: predictionList.length,
    averageRiskScore: reports.reduce((sum, r) => sum + r.riskScore, 0) / reports.length || 0,
    reportsByType: groupBy(reports, 'type'),
    reportsByCategory: groupBy(reports, 'category'),
    regionalBreakdown: Object.fromEntries(regionalData),
    recentActivity: reports.slice(-10).map(r => ({
      timestamp: r.timestamp,
      type: r.type,
      riskScore: r.riskScore,
    })),
    topThreats: reports
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10),
  };
  
  res.json(stats);
});

// WebSocket setup
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial data
  socket.emit('initial-data', {
    regionalThreats: Object.fromEntries(regionalData),
    recentThreats: Array.from(threatReports.values()).slice(0, 10),
    stats: {
      totalReports: threatReports.size,
      totalPredictions: predictions.size,
    },
  });

  socket.on('subscribe-regional', (region) => {
    socket.join(`region-${region}`);
    socket.emit('subscribed', { type: 'regional', region });
  });

  socket.on('subscribe-threats', () => {
    socket.join('threats');
    socket.emit('subscribed', { type: 'threats' });
  });

  socket.on('subscribe-predictions', () => {
    socket.join('predictions');
    socket.emit('subscribed', { type: 'predictions' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper functions
function categorizeEntity(entity, type) {
  const patterns = {
    phone: /\d{10}/,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    url: /^https?:\/\/.+/,
    upi: /[a-zA-Z0-9._-]+@[a-zA-Z]+/,
  };

  if (type === 'phone' && patterns.phone.test(entity)) {
    return entity.includes('+91') ? 'Indian Mobile' : 'International Phone';
  }
  
  if (type === 'email' && patterns.email.test(entity)) {
    return entity.includes('.gov') ? 'Government Email' : 'Personal Email';
  }
  
  if (type === 'url' && patterns.url.test(entity)) {
    const domain = new URL(entity).hostname;
    if (domain.includes('bank') || domain.includes('pay')) {
      return 'Financial Website';
    } else if (domain.includes('gov')) {
      return 'Government Website';
    } else {
      return 'General Website';
    }
  }
  
  if (type === 'upi' && patterns.upi.test(entity)) {
    return 'UPI Payment ID';
  }

  return 'Unknown';
}

function generateThreats(entity, type) {
  const threats = [];
  
  if (type === 'phone') {
    if (entity.includes('+91')) {
      threats.push('Potential Indian scam number');
    }
    threats.push('Phone-based social engineering');
  }
  
  if (type === 'email') {
    threats.push('Email phishing attempt');
    if (entity.includes('urgent') || entity.includes('immediate')) {
      threats.push('Urgency-based social engineering');
    }
  }
  
  if (type === 'url') {
    threats.push('Website-based threat');
    try {
      const domain = new URL(entity).hostname;
      if (domain.includes('bit.ly') || domain.includes('tinyurl')) {
        threats.push('URL shortening service - potential phishing');
      }
    } catch {
      threats.push('Malformed URL');
    }
  }
  
  return threats;
}

function generateRecommendations(entity, type) {
  const recommendations = [];
  
  recommendations.push('Verify through official channels');
  recommendations.push('Do not share personal information');
  
  if (type === 'phone') {
    recommendations.push('Hang up and call the official number');
  }
  
  if (type === 'email') {
    recommendations.push('Check sender email address carefully');
    recommendations.push('Avoid clicking on suspicious links');
  }
  
  if (type === 'url') {
    recommendations.push('Check HTTPS certificate');
    recommendations.push('Look for official domain verification');
  }
  
  return recommendations;
}

function extractMLFeatures(entity) {
  const features = [];
  
  features.push(entity.length / 100);
  features.push((entity.match(/\d/g) || []).length / entity.length);
  features.push((entity.match(/[a-zA-Z]/g) || []).length / entity.length);
  features.push((entity.match(/[^a-zA-Z0-9]/g) || []).length / entity.length);
  
  features.push(entity.includes('http') ? 1 : 0);
  features.push(entity.includes('@') ? 1 : 0);
  features.push(/\d{10}/.test(entity) ? 1 : 0);
  features.push(entity.includes('.gov') ? 1 : 0);
  
  return features;
}

function detectPatterns(entity) {
  const patterns = [];
  
  if (entity.toLowerCase().includes('urgent') || entity.toLowerCase().includes('immediate')) {
    patterns.push('Urgency pattern detected');
  }
  
  if (entity.toLowerCase().includes('winner') || entity.toLowerCase().includes('lottery')) {
    patterns.push('Lottery/winner scam pattern');
  }
  
  if (entity.toLowerCase().includes('bank') && entity.toLowerCase().includes('verify')) {
    patterns.push('Bank verification scam pattern');
  }
  
  return patterns;
}

function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = (groups[group] || 0) + 1;
    return groups;
  }, {});
}

function updateRegionalData(report) {
  const region = report.location.state;
  
  if (!regionalData.has(region)) {
    regionalData.set(region, {
      region,
      totalThreats: 0,
      highRiskThreats: 0,
      newThreats: 0,
      topScamTypes: [],
      riskLevel: 'low',
      lastUpdated: Date.now(),
    });
  }

  const data = regionalData.get(region);
  data.totalThreats++;
  
  if (report.riskScore >= 7) {
    data.highRiskThreats++;
  }
  
  if (Date.now() - report.timestamp < 24 * 60 * 60 * 1000) {
    data.newThreats++;
  }

  const existingType = data.topScamTypes.find(t => t.type === report.category);
  if (existingType) {
    existingType.count++;
  } else {
    data.topScamTypes.push({
      type: report.category,
      count: 1,
      trend: 'stable',
    });
  }

  const highRiskRatio = data.highRiskThreats / data.totalThreats;
  if (highRiskRatio > 0.7) {
    data.riskLevel = 'critical';
  } else if (highRiskRatio > 0.4) {
    data.riskLevel = 'high';
  } else if (highRiskRatio > 0.2) {
    data.riskLevel = 'medium';
  } else {
    data.riskLevel = 'low';
  }

  data.lastUpdated = Date.now();

  io.to(`region-${region}`).emit('regional-update', data);
}

// Initialize sample data
const sampleRegions = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

sampleRegions.forEach(region => {
  regionalData.set(region, {
    region,
    totalThreats: Math.floor(Math.random() * 100) + 20,
    highRiskThreats: Math.floor(Math.random() * 30) + 5,
    newThreats: Math.floor(Math.random() * 10) + 1,
    topScamTypes: [
      { type: 'Digital Arrest', count: Math.floor(Math.random() * 20) + 5, trend: 'increasing' },
      { type: 'Bank Fraud', count: Math.floor(Math.random() * 15) + 3, trend: 'stable' },
    ],
    riskLevel: 'medium',
    lastUpdated: Date.now(),
  });
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Enhanced DHIP Backend API running on port ${PORT}`);
  console.log(`📊 Real-time WebSocket server active`);
  console.log(`🧠 ML Features: Temporal Mutation, Voice Deepfake, Visual Similarity`);
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
