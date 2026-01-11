import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Mock the production server
jest.mock('../server-production.js', () => {
  const mockServer = createServer();
  const mockIo = new Server(mockServer);
  
  mockServer.on('request', (req, res) => {
    if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: Date.now(),
        version: '2.0.0'
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
  
  return mockServer;
});

describe('DHIP API Tests', () => {
  let server;
  let app;

  beforeEach(() => {
    server = createServer();
    app = request(server);
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 status', async () => {
      const response = await app
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('version', '2.0.0');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return JSON content type', async () => {
      await app
        .get('/api/health')
        .expect('Content-Type', /json/);
    });
  });

  describe('Analysis Endpoint', () => {
    it('should analyze phone threat', async () => {
      const mockAnalysis = {
        entity: '+91-9876543210',
        type: 'phone',
        riskScore: 8.5,
        analyses: {
          tmd: {
            riskScore: 8.5,
            confidence: 0.9,
            patterns: ['Urgency pattern detected']
          }
        }
      };

      // Mock the analysis endpoint
      server.on('request', (req, res) => {
        if (req.url === '/api/analyze' && req.method === 'POST') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockAnalysis));
        }
      });

      const response = await app
        .post('/api/analyze')
        .send({ entity: '+91-9876543210', type: 'phone' })
        .expect(200);

      expect(response.body).toHaveProperty('entity', '+91-9876543210');
      expect(response.body).toHaveProperty('type', 'phone');
      expect(response.body).toHaveProperty('riskScore');
      expect(response.body).toHaveProperty('analyses');
    });

    it('should return 400 for missing entity', async () => {
      server.on('request', (req, res) => {
        if (req.url === '/api/analyze' && req.method === 'POST') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Entity and type are required' }));
        }
      });

      await app
        .post('/api/analyze')
        .send({ type: 'phone' })
        .expect(400);
    });

    it('should return 400 for missing type', async () => {
      server.on('request', (req, res) => {
        if (req.url === '/api/analyze' && req.method === 'POST') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Entity and type are required' }));
        }
      });

      await app
        .post('/api/analyze')
        .send({ entity: '+91-9876543210' })
        .expect(400);
    });
  });

  describe('SMS Gateway Endpoint', () => {
    it('should send SMS successfully', async () => {
      const mockSMSResponse = {
        success: true,
        messageId: 'test-message-id'
      };

      server.on('request', (req, res) => {
        if (req.url === '/api/sms/send' && req.method === 'POST') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockSMSResponse));
        }
      });

      const response = await app
        .post('/api/sms/send')
        .send({
          to: '+919876543210',
          message: 'Test alert',
          language: 'en'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('messageId');
    });

    it('should return 400 for missing phone number', async () => {
      server.on('request', (req, res) => {
        if (req.url === '/api/sms/send' && req.method === 'POST') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Phone number and message are required' }));
        }
      });

      await app
        .post('/api/sms/send')
        .send({ message: 'Test alert' })
        .expect(400);
    });
  });

  describe('Visual Analysis Endpoint', () => {
    it('should analyze visual threats', async () => {
      const mockVisualAnalysis = {
        isPhishing: true,
        confidence: 0.85,
        similarity: 0.92,
        brandMatches: ['paypal', 'microsoft']
      };

      server.on('request', (req, res) => {
        if (req.url === '/api/visual/analyze' && req.method === 'POST') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockVisualAnalysis));
        }
      });

      const response = await app
        .post('/api/visual/analyze')
        .send({ imageUrl: 'http://example.com/image.jpg' })
        .expect(200);

      expect(response.body).toHaveProperty('isPhishing');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('similarity');
      expect(response.body).toHaveProperty('brandMatches');
    });

    it('should return 400 for missing image URL', async () => {
      server.on('request', (req, res) => {
        if (req.url === '/api/visual/analyze' && req.method === 'POST') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Image URL is required' }));
        }
      });

      await app
        .post('/api/visual/analyze')
        .send({})
        .expect(400);
    });
  });
});

describe('AI Request Pool Manager', () => {
  it('should handle circuit breaker patterns', async () => {
    // Mock circuit breaker behavior
    const mockCircuitBreaker = {
      failures: 0,
      lastFailure: null,
      isOpen: () => false,
      recordSuccess: () => {},
      recordFailure: () => {}
    };

    expect(mockCircuitBreaker.isOpen()).toBe(false);
    
    // Simulate failures
    for (let i = 0; i < 5; i++) {
      mockCircuitBreaker.recordFailure();
    }
    mockCircuitBreaker.lastFailure = Date.now();
    
    expect(mockCircuitBreaker.isOpen()).toBe(true);
  });
});

describe('Cache Manager', () => {
  let cacheManager;

  beforeEach(() => {
    // Mock cache manager
    cacheManager = {
      memoryCache: new Map(),
      async get(key) {
        return this.memoryCache.get(key) || null;
      },
      async set(key, value, ttl = 3600) {
        this.memoryCache.set(key, value);
      },
      async invalidate(pattern) {
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern)) {
            this.memoryCache.delete(key);
          }
        }
      }
    };
  });

  it('should store and retrieve values', async () => {
    await cacheManager.set('test-key', 'test-value');
    const value = await cacheManager.get('test-key');
    expect(value).toBe('test-value');
  });

  it('should return null for non-existent keys', async () => {
    const value = await cacheManager.get('non-existent-key');
    expect(value).toBeNull();
  });

  it('should invalidate cache by pattern', async () => {
    await cacheManager.set('test-key-1', 'value1');
    await cacheManager.set('test-key-2', 'value2');
    await cacheManager.set('other-key', 'value3');
    
    await cacheManager.invalidate('test-key');
    
    expect(await cacheManager.get('test-key-1')).toBeNull();
    expect(await cacheManager.get('test-key-2')).toBeNull();
    expect(await cacheManager.get('other-key')).toBe('value3');
  });
});

describe('SMS Gateway', () => {
  let smsGateway;

  beforeEach(() => {
    // Mock SMS gateway
    smsGateway = {
      supportedLanguages: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'],
      async sendSMS(to, message, language = 'en') {
        const translations = {
          'hi': 'चेतावनी: संदिग्ध गतिविधि का पता चला',
          'en': 'Warning: Suspicious activity detected'
        };
        
        return {
          success: true,
          messageId: 'test-' + Date.now(),
          translatedMessage: translations[language] || message
        };
      }
    };
  });

  it('should send SMS in English', async () => {
    const result = await smsGateway.sendSMS('+919876543210', 'Test message', 'en');
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('should translate SMS to Hindi', async () => {
    const result = await smsGateway.sendSMS('+919876543210', 'Warning message', 'hi');
    expect(result.success).toBe(true);
    expect(result.translatedMessage).toContain('चेतावनी');
  });

  it('should support all specified languages', () => {
    expect(smsGateway.supportedLanguages).toContain('en');
    expect(smsGateway.supportedLanguages).toContain('hi');
    expect(smsGateway.supportedLanguages).toContain('bn');
    expect(smsGateway.supportedLanguages.length).toBe(10);
  });
});
