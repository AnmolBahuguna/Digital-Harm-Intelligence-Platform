import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { TemporalMutationDetector } from './src/lib/temporal-mutation-detector';
import { VoiceDeepfakeDetector } from './src/lib/voice-deepfake-detector';
import { VisualSimilarityDetector } from './src/lib/visual-similarity-detector';
import { SMSService } from './src/lib/sms-service';
import { ThreatAnalysisCache } from './src/lib/cache-manager';
import { SecurityAuditFramework } from './src/lib/security-audit-framework';

export interface ThreatReport {
  id: string;
  type: 'phone' | 'url' | 'email' | 'upi' | 'voice' | 'visual';
  entity: string;
  riskScore: number;
  category: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
  timestamp: number;
  userId?: string;
  isAnonymous: boolean;
  metadata: any;
}

export interface PredictionData {
  id: string;
  entityType: string;
  entityValue: string;
  currentRiskScore: number;
  predictedRiskScore: number;
  timeHorizon: number; // days
  confidence: number;
  predictedVariants: Array<{
    type: string;
    description: string;
    probability: number;
  }>;
  recommendations: string[];
  lastUpdated: number;
}

export interface RegionalThreatData {
  region: string;
  totalThreats: number;
  highRiskThreats: number;
  newThreats: number;
  topScamTypes: Array<{
    type: string;
    count: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: number;
}

export class BackendAPI {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private tmd: TemporalMutationDetector;
  private vdd: VoiceDeepfakeDetector;
  private vsd: VisualSimilarityDetector;
  private sms: SMSService;
  private cache: ThreatAnalysisCache;
  private securityAudit: SecurityAuditFramework;
  private threatReports: Map<string, ThreatReport> = new Map();
  private predictions: Map<string, PredictionData> = new Map();
  private regionalData: Map<string, RegionalThreatData> = new Map();

  constructor() {
    this.app = express();
    this.tmd = new TemporalMutationDetector();
    this.vdd = new VoiceDeepfakeDetector();
    this.vsd = new VisualSimilarityDetector();
    this.sms = new SMSService();
    this.cache = ThreatAnalysisCache.getInstance();
    this.securityAudit = new SecurityAuditFramework();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.initializeData();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/api/health', (req, res) => {
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
    this.app.post('/api/analyze', async (req, res) => {
      try {
        const { entity, type, location, userId, isAnonymous } = req.body;
        
        if (!entity || !type) {
          return res.status(400).json({ error: 'Entity and type are required' });
        }

        // Check cache first
        const cacheKey = `analysis:${type}:${entity}`;
        const cached = await this.cache.get(cacheKey);
        
        if (cached) {
          return res.json({ ...cached, fromCache: true });
        }

        // Perform analysis based on type
        let analysis;
        switch (type) {
          case 'phone':
          case 'email':
          case 'url':
          case 'upi':
            analysis = await this.analyzeTextEntity(entity, type);
            break;
          case 'voice':
            analysis = await this.analyzeVoiceEntity(req.body.audioData);
            break;
          case 'visual':
            analysis = await this.analyzeVisualEntity(req.body.imageData);
            break;
          default:
            return res.status(400).json({ error: 'Invalid entity type' });
        }

        // Store in cache
        await this.cache.set(cacheKey, analysis, { memoryTTL: 1800000 }); // 30 min

        // Create threat report
        const report: ThreatReport = {
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

        this.threatReports.set(report.id, report);
        this.updateRegionalData(report);

        // Trigger real-time updates
        this.io.emit('threat-analyzed', { report, analysis });

        res.json(analysis);
      } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Analysis failed' });
      }
    });

    // Prediction endpoint
    this.app.post('/api/predict', async (req, res) => {
      try {
        const { entity, type, timeHorizon = 7 } = req.body;
        
        if (!entity || !type) {
          return res.status(400).json({ error: 'Entity and type are required' });
        }

        const prediction = await this.generatePrediction(entity, type, timeHorizon);
        this.predictions.set(prediction.id, prediction);

        res.json(prediction);
      } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Prediction failed' });
      }
    });

    // Regional threats endpoint
    this.app.get('/api/regional-threats/:region?', (req, res) => {
      const { region } = req.params;
      
      if (region) {
        const data = this.regionalData.get(region);
        if (data) {
          return res.json(data);
        }
      }

      // Return all regional data if no specific region
      const allData = Object.fromEntries(this.regionalData);
      res.json(allData);
    });

    // Real-time threat feed
    this.app.get('/api/threats/feed', (req, res) => {
      const { limit = 50, offset = 0, category, minRiskScore } = req.query;
      
      let threats = Array.from(this.threatReports.values())
        .filter(threat => {
          if (category && threat.type !== category) return false;
          if (minRiskScore && threat.riskScore < parseInt(minRiskScore as string)) return false;
          return true;
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));

      res.json({
        threats,
        total: this.threatReports.size,
        hasMore: offset + limit < this.threatReports.size
      });
    });

    // Advanced ML insights
    this.app.get('/api/insights/mutation-trends', async (req, res) => {
      try {
        const trends = this.tmd.getMutationTrends(30); // Last 30 days
        res.json(trends);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get mutation trends' });
      }
    });

    // Voice analysis results
    this.app.post('/api/voice/analyze', async (req, res) => {
      try {
        const { audioData, format } = req.body;
        
        if (!audioData) {
          return res.status(400).json({ error: 'Audio data is required' });
        }

        const analysis = await this.vdd.analyzeAudio(audioData);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: 'Voice analysis failed' });
      }
    });

    // Visual analysis results
    this.app.post('/api/visual/analyze', async (req, res) => {
      try {
        const { imageUrl, imageData } = req.body;
        
        if (!imageUrl && !imageData) {
          return res.status(400).json({ error: 'Image URL or data is required' });
        }

        const analysis = await this.vsd.analyzeUrl(imageUrl);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: 'Visual analysis failed' });
      }
    });

    // SMS webhook handler
    this.app.post('/api/sms/webhook', async (req, res) => {
      try {
        const { From, Body } = req.body;
        
        const response = await this.sms.processIncomingSMS(From, Body);
        
        // Send response back via SMS
        if (response.success) {
          // In production, this would send via Twilio
          console.log(`SMS Response sent to ${From}: ${response.message}`);
        }
        
        res.status(200).send();
      } catch (error) {
        console.error('SMS webhook error:', error);
        res.status(500).send();
      }
    });

    // Security audit
    this.app.post('/api/security/audit', async (req, res) => {
      try {
        const audit = await this.securityAudit.runFullAudit();
        res.json(audit);
      } catch (error) {
        res.status(500).json({ error: 'Security audit failed' });
      }
    });

    // Bulk operations
    this.app.post('/api/bulk/analyze', async (req, res) => {
      try {
        const { entities } = req.body;
        
        if (!Array.isArray(entities) || entities.length === 0) {
          return res.status(400).json({ error: 'Entities array is required' });
        }

        const results = await Promise.allSettled(
          entities.map(entity => this.analyzeTextEntity(entity.value, entity.type))
        );

        const analyses = results.map(result => 
          result.status === 'fulfilled' ? result.value : { error: result.reason }
        );

        res.json({ analyses });
      } catch (error) {
        res.status(500).json({ error: 'Bulk analysis failed' });
      }
    });

    // Statistics and analytics
    this.app.get('/api/stats', (req, res) => {
      const stats = this.generateStatistics();
      res.json(stats);
    });
  }

  private setupWebSocket(): void {
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Send initial data
      socket.emit('initial-data', {
        regionalThreats: Object.fromEntries(this.regionalData),
        recentThreats: Array.from(this.threatReports.values()).slice(0, 10),
        stats: this.generateStatistics(),
      });

      // Handle real-time subscriptions
      socket.on('subscribe-regional', (region: string) => {
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
  }

  private async analyzeTextEntity(entity: string, type: string): Promise<any> {
    // This would integrate with the existing threat analysis
    // For now, return mock analysis with enhanced features
    return {
      riskScore: Math.random() * 10,
      category: this.categorizeEntity(entity, type),
      threats: this.generateThreats(entity, type),
      recommendations: this.generateRecommendations(entity, type),
      confidence: 0.85 + Math.random() * 0.15,
      metadata: {
        analysisTime: Date.now(),
        mlFeatures: this.extractMLFeatures(entity),
        patterns: this.detectPatterns(entity),
      }
    };
  }

  private async analyzeVoiceEntity(audioData: any): Promise<any> {
    return await this.vdd.analyzeAudio(audioData);
  }

  private async analyzeVisualEntity(imageData: any): Promise<any> {
    return await this.vsd.analyzeUrl(imageData);
  }

  private async generatePrediction(entity: string, type: string, timeHorizon: number): Promise<PredictionData> {
    const currentAnalysis = await this.analyzeTextEntity(entity, type);
    
    // Use temporal mutation detector for prediction
    const pattern = await this.tmd.analyzeScamPattern(entity);
    const mutationPrediction = await this.tmd.predictMutations(pattern);
    
    return {
      id: crypto.randomUUID(),
      entityType: type,
      entityValue: entity,
      currentRiskScore: currentAnalysis.riskScore,
      predictedRiskScore: mutationPrediction.confidence > 0.7 ? 
        Math.min(10, currentAnalysis.riskScore + 2) : currentAnalysis.riskScore,
      timeHorizon,
      confidence: mutationPrediction.confidence,
      predictedVariants: mutationPrediction.predictedVariants.map(variant => ({
        type: variant.type,
        description: variant.script.substring(0, 100) + '...',
        probability: variant.mutationProbability,
      })),
      recommendations: [
        'Monitor for similar patterns',
        'Update security measures',
        'Educate users about new variants',
      ],
      lastUpdated: Date.now(),
    };
  }

  private updateRegionalData(report: ThreatReport): void {
    const region = report.location.state;
    
    if (!this.regionalData.has(region)) {
      this.regionalData.set(region, {
        region,
        totalThreats: 0,
        highRiskThreats: 0,
        newThreats: 0,
        topScamTypes: [],
        riskLevel: 'low',
        lastUpdated: Date.now(),
      });
    }

    const data = this.regionalData.get(region)!;
    data.totalThreats++;
    
    if (report.riskScore >= 7) {
      data.highRiskThreats++;
    }
    
    if (Date.now() - report.timestamp < 24 * 60 * 60 * 1000) {
      data.newThreats++;
    }

    // Update top scam types
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

    // Update risk level
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

    // Emit real-time update
    this.io.to(`region-${region}`).emit('regional-update', data);
  }

  private categorizeEntity(entity: string, type: string): string {
    // Enhanced categorization logic
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

  private generateThreats(entity: string, type: string): string[] {
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

  private generateRecommendations(entity: string, type: string): string[] {
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

  private extractMLFeatures(entity: string): number[] {
    // Extract ML features for advanced analysis
    const features = [];
    
    // Length-based features
    features.push(entity.length / 100); // Normalized length
    features.push((entity.match(/\d/g) || []).length / entity.length); // Digit ratio
    features.push((entity.match(/[a-zA-Z]/g) || []).length / entity.length); // Letter ratio
    features.push((entity.match(/[^a-zA-Z0-9]/g) || []).length / entity.length); // Special char ratio
    
    // Pattern-based features
    features.push(entity.includes('http') ? 1 : 0); // Is URL
    features.push(entity.includes('@') ? 1 : 0); // Is email
    features.push(/\d{10}/.test(entity) ? 1 : 0); // Is phone
    features.push(entity.includes('.gov') ? 1 : 0); // Is government
    
    return features;
  }

  private detectPatterns(entity: string): string[] {
    const patterns = [];
    
    // Common scam patterns
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

  private generateStatistics(): any {
    const reports = Array.from(this.threatReports.values());
    const predictions = Array.from(this.predictions.values());
    
    return {
      totalReports: reports.length,
      totalPredictions: predictions.length,
      averageRiskScore: reports.reduce((sum, r) => sum + r.riskScore, 0) / reports.length,
      reportsByType: this.groupBy(reports, 'type'),
      reportsByCategory: this.groupBy(reports, 'category'),
      regionalBreakdown: Object.fromEntries(this.regionalData),
      recentActivity: reports.slice(-10).map(r => ({
        timestamp: r.timestamp,
        type: r.type,
        riskScore: r.riskScore,
      })),
      topThreats: reports
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 10),
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = item[key] as string;
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  private initializeData(): void {
    // Initialize with sample data for demonstration
    const sampleRegions = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];
    
    sampleRegions.forEach(region => {
      this.regionalData.set(region, {
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
  }

  public start(port: number = 3001): void {
    this.server.listen(port, () => {
      console.log(`🚀 Enhanced DHIP Backend API running on port ${port}`);
      console.log(`📊 Real-time WebSocket server active`);
      console.log(`🧠 ML Features: Temporal Mutation, Voice Deepfake, Visual Similarity`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
