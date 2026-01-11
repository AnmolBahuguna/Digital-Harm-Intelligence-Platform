import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { io, Socket } from 'socket.io-client';

// API Interfaces
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
  timeHorizon: number;
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

export interface AnalysisRequest {
  entity: string;
  type: 'phone' | 'url' | 'email' | 'upi' | 'voice' | 'visual';
  location?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
  userId?: string;
  isAnonymous?: boolean;
  audioData?: any;
  imageData?: any;
}

export interface AnalysisResponse {
  riskScore: number;
  category: string;
  threats: string[];
  recommendations: string[];
  confidence: number;
  metadata: {
    analysisTime: number;
    mlFeatures: number[];
    patterns: string[];
  };
  fromCache?: boolean;
}

class FrontendAPI {
  private client: AxiosInstance;
  private socket: Socket | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Initialize WebSocket connection
  public initializeSocket(): Socket {
    if (!this.socket) {
      this.socket = io(this.baseURL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔌 WebSocket connection error:', error);
      });
    }

    return this.socket;
  }

  // Get socket instance
  public getSocket(): Socket | null {
    return this.socket;
  }

  // Health check
  public async healthCheck(): Promise<any> {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Analyze threat
  public async analyzeThreat(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await this.client.post('/api/analyze', request);
      return response.data;
    } catch (error) {
      console.error('Threat analysis failed:', error);
      throw error;
    }
  }

  // Generate prediction
  public async generatePrediction(entity: string, type: string, timeHorizon: number = 7): Promise<PredictionData> {
    try {
      const response = await this.client.post('/api/predict', {
        entity,
        type,
        timeHorizon,
      });
      return response.data;
    } catch (error) {
      console.error('Prediction generation failed:', error);
      throw error;
    }
  }

  // Get regional threats
  public async getRegionalThreats(region?: string): Promise<RegionalThreatData | Record<string, RegionalThreatData>> {
    try {
      const url = region ? `/api/regional-threats/${region}` : '/api/regional-threats';
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to get regional threats:', error);
      throw error;
    }
  }

  // Get threat feed
  public async getThreatFeed(options: {
    limit?: number;
    offset?: number;
    category?: string;
    minRiskScore?: number;
  } = {}): Promise<{
    threats: ThreatReport[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.category) params.append('category', options.category);
      if (options.minRiskScore) params.append('minRiskScore', options.minRiskScore.toString());

      const response = await this.client.get(`/api/threats/feed?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get threat feed:', error);
      throw error;
    }
  }

  // Get mutation trends
  public async getMutationTrends(days: number = 30): Promise<any> {
    try {
      const response = await this.client.get(`/api/insights/mutation-trends?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get mutation trends:', error);
      throw error;
    }
  }

  // Analyze voice
  public async analyzeVoice(audioData: any, format: string = 'wav'): Promise<any> {
    try {
      const response = await this.client.post('/api/voice/analyze', {
        audioData,
        format,
      });
      return response.data;
    } catch (error) {
      console.error('Voice analysis failed:', error);
      throw error;
    }
  }

  // Analyze visual
  public async analyzeVisual(imageUrl?: string, imageData?: any): Promise<any> {
    try {
      const response = await this.client.post('/api/visual/analyze', {
        imageUrl,
        imageData,
      });
      return response.data;
    } catch (error) {
      console.error('Visual analysis failed:', error);
      throw error;
    }
  }

  // Bulk analysis
  public async bulkAnalyze(entities: Array<{ value: string; type: string }>): Promise<{ analyses: any[] }> {
    try {
      const response = await this.client.post('/api/bulk/analyze', {
        entities,
      });
      return response.data;
    } catch (error) {
      console.error('Bulk analysis failed:', error);
      throw error;
    }
  }

  // Get statistics
  public async getStatistics(): Promise<any> {
    try {
      const response = await this.client.get('/api/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw error;
    }
  }

  // Security audit
  public async runSecurityAudit(): Promise<any> {
    try {
      const response = await this.client.post('/api/security/audit');
      return response.data;
    } catch (error) {
      console.error('Security audit failed:', error);
      throw error;
    }
  }

  // WebSocket subscription methods
  public subscribeToRegionalThreats(region: string): void {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('subscribe-regional', region);
    }
  }

  public subscribeToThreats(): void {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('subscribe-threats');
    }
  }

  public subscribeToPredictions(): void {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('subscribe-predictions');
    }
  }

  // WebSocket event listeners
  public onThreatAnalyzed(callback: (data: { report: ThreatReport; analysis: AnalysisResponse }) => void): void {
    const socket = this.getSocket();
    if (socket) {
      socket.on('threat-analyzed', callback);
    }
  }

  public onRegionalUpdate(callback: (data: RegionalThreatData) => void): void {
    const socket = this.getSocket();
    if (socket) {
      socket.on('regional-update', callback);
    }
  }

  public onInitialData(callback: (data: {
    regionalThreats: Record<string, RegionalThreatData>;
    recentThreats: ThreatReport[];
    stats: any;
  }) => void): void {
    const socket = this.getSocket();
    if (socket) {
      socket.on('initial-data', callback);
    }
  }

  // Cleanup
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create singleton instance
export const apiClient = new FrontendAPI();

// Export types
export type { FrontendAPI };
