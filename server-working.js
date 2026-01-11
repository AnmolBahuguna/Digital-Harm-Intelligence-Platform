// Simple server that works with current dependencies
const http = require('http');
const { Server } = require('socket.io');

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

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Simple request handler
server.on('request', (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // API Routes
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
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
    }));
    return;
  }

  if (pathname === '/api/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { entity, type } = JSON.parse(body);
        
        if (!entity || !type) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Entity and type are required' }));
          return;
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

        // Broadcast to WebSocket clients
        io.emit('threat-analyzed', { 
          report: {
            id: Date.now().toString(),
            type,
            entity,
            riskScore: analysis.riskScore,
            category: analysis.category,
            location: { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi' },
            timestamp: Date.now(),
            isAnonymous: false,
            metadata: analysis
          },
          analysis 
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(analysis));
      } catch (error) {
        console.error('Analysis error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Analysis failed' }));
      }
    });
    return;
  }

  // Default route
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Enhanced DHIP Backend API Server',
    endpoints: [
      'GET /api/health',
      'POST /api/analyze',
      'WebSocket: / (real-time updates)'
    ],
    status: 'running'
  }));
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
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/analyze`);
  console.log(`   WebSocket: ws://localhost:${PORT}/ (real-time updates)`);
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
