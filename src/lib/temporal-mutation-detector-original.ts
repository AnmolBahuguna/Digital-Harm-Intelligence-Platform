// import * as tf from '@tensorflow/tfjs';
import { GeminiAPI } from './gemini';

export interface ScamPattern {
  id: string;
  type: string;
  script: string;
  features: number[];
  timestamp: number;
  location?: string;
  targetProfile?: string;
  mutationProbability: number;
}

export interface MutationPrediction {
  currentPattern: ScamPattern;
  predictedVariants: ScamPattern[];
  confidence: number;
  timeToMutation: number; // days
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class TemporalMutationDetector {
  private model: tf.LayersModel | null = null;
  private patternHistory: ScamPattern[] = [];
  private geminiAPI: GeminiAPI;
  
  constructor() {
    this.geminiAPI = new GeminiAPI();
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    // Create a neural network for pattern mutation prediction
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [50], // Feature vector size
          units: 128,
          activation: 'relu',
          name: 'dense1'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          name: 'dense2'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          name: 'dense3'
        }),
        tf.layers.dense({
          units: 10, // Output: next pattern features
          activation: 'sigmoid',
          name: 'output'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    this.model = model;
  }

  // Extract features from scam script using NLP
  private async extractFeatures(script: string): Promise<number[]> {
    // Feature extraction: urgency words, authority claims, threat indicators
    const urgencyWords = ['urgent', 'immediate', 'act now', 'limited time', 'expire'];
    const authorityWords = ['police', 'court', 'government', 'bank', 'official'];
    const threatWords = ['arrest', 'suspend', 'block', 'legal action', 'penalty'];
    
    const features = [];
    
    // Text-based features
    features.push(this.calculateKeywordDensity(script, urgencyWords));
    features.push(this.calculateKeywordDensity(script, authorityWords));
    features.push(this.calculateKeywordDensity(script, threatWords));
    features.push(script.length / 1000); // Normalized length
    features.push(this.countNumbers(script) / 10); // Normalized number count
    
    // Pattern-based features
    features.push(this.hasPhonePattern(script) ? 1 : 0);
    features.push(this.hasUrlPattern(script) ? 1 : 0);
    features.push(this.hasUpiPattern(script) ? 1 : 0);
    features.push(this.hasThreatLanguage(script) ? 1 : 0);
    features.push(this.calculateUrgencyScore(script));
    
    // Temporal features
    features.push(new Date().getDay() / 7); // Day of week
    features.push(new Date().getHours() / 24); // Hour of day
    
    // Fill remaining features with embeddings (simplified)
    for (let i = features.length; i < 50; i++) {
      features.push(Math.random() * 0.1); // Placeholder for actual embeddings
    }
    
    return features;
  }

  private calculateKeywordDensity(text: string, keywords: string[]): number {
    const words = text.toLowerCase().split(/\s+/);
    const keywordCount = keywords.reduce((count, keyword) => {
      return count + (text.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    return keywordCount / words.length;
  }

  private countNumbers(text: string): number {
    return (text.match(/\d+/g) || []).length;
  }

  private hasPhonePattern(text: string): boolean {
    return /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  }

  private hasUrlPattern(text: string): boolean {
    return /https?:\/\/[^\s]+/.test(text);
  }

  private hasUpiPattern(text: string): boolean {
    return /[a-zA-Z0-9._-]+@[a-zA-Z]+/.test(text);
  }

  private hasThreatLanguage(text: string): boolean {
    const threats = ['arrest', 'suspend', 'block', 'legal', 'court', 'police'];
    return threats.some(threat => text.toLowerCase().includes(threat));
  }

  private calculateUrgencyScore(text: string): number {
    const urgencyIndicators = ['immediately', 'urgent', 'now', 'today', 'asap'];
    return urgencyIndicators.reduce((score, indicator) => {
      const regex = new RegExp(indicator, 'gi');
      const matches = text.match(regex);
      return score + (matches ? matches.length : 0);
    }, 0) / 10;
  }

  // Analyze new scam report for mutation patterns
  async analyzeScamPattern(
    script: string, 
    location?: string, 
    targetProfile?: string
  ): Promise<ScamPattern> {
    const features = await this.extractFeatures(script);
    
    const pattern: ScamPattern = {
      id: crypto.randomUUID(),
      type: await this.classifyScamType(script),
      script,
      features,
      timestamp: Date.now(),
      location,
      targetProfile,
      mutationProbability: 0
    };

    // Add to history
    this.patternHistory.push(pattern);
    
    // Keep only last 1000 patterns
    if (this.patternHistory.length > 1000) {
      this.patternHistory = this.patternHistory.slice(-1000);
    }

    return pattern;
  }

  private async classifyScamType(script: string): Promise<string> {
    const prompt = `
      Classify this scam script into one of these categories:
      - Digital Arrest
      - Bank Fraud
      - KYC Update
      - Lottery/Prize
      - Job Offer
      - Investment
      - Romance
      - Other
      
      Script: "${script}"
      
      Return only the category name.
    `;

    try {
      const response = await this.geminiAPI.generateContent(prompt);
      return response.trim();
    } catch (error) {
      console.error('Error classifying scam type:', error);
      return 'Other';
    }
  }

  // Predict how this scam might mutate
  async predictMutations(currentPattern: ScamPattern): Promise<MutationPrediction> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    // Find similar patterns in history
    const similarPatterns = this.findSimilarPatterns(currentPattern);
    
    if (similarPatterns.length < 3) {
      // Not enough data for prediction
      return {
        currentPattern,
        predictedVariants: [],
        confidence: 0,
        timeToMutation: 0,
        riskLevel: 'low'
      };
    }

    // Prepare training data
    const trainingData = this.prepareTrainingData(similarPatterns);
    
    // Train model on similar patterns (simplified)
    const features = tf.tensor2d(trainingData.inputs);
    const labels = tf.tensor2d(trainingData.outputs);
    
    await this.model.fit(features, labels, {
      epochs: 10,
      batchSize: 2,
      verbose: 0
    });

    // Predict next mutation
    const currentFeatures = tf.tensor2d([currentPattern.features]);
    const prediction = this.model.predict(currentFeatures) as tf.Tensor;
    const predictedFeatures = await prediction.data();

    // Generate predicted variants
    const predictedVariants = await this.generateVariants(
      currentPattern, 
      Array.from(predictedFeatures)
    );

    // Calculate confidence based on pattern similarity
    const confidence = Math.min(0.95, similarPatterns.length / 10);
    
    // Estimate time to mutation based on historical patterns
    const timeToMutation = this.estimateTimeToMutation(similarPatterns);
    
    // Determine risk level
    const riskLevel = this.calculateRiskLevel(currentPattern, predictedVariants);

    return {
      currentPattern,
      predictedVariants,
      confidence,
      timeToMutation,
      riskLevel
    };
  }

  private findSimilarPatterns(pattern: ScamPattern): ScamPattern[] {
    return this.patternHistory
      .filter(p => p.id !== pattern.id)
      .filter(p => p.type === pattern.type)
      .map(p => ({
        ...p,
        similarity: this.calculateSimilarity(pattern.features, p.features)
      }))
      .filter(p => p.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  }

  private calculateSimilarity(features1: number[], features2: number[]): number {
    const dotProduct = features1.reduce((sum, val, i) => sum + val * features2[i], 0);
    const magnitude1 = Math.sqrt(features1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(features2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }

  private prepareTrainingData(patterns: ScamPattern[]): { inputs: number[][], outputs: number[][] } {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    for (let i = 0; i < patterns.length - 1; i++) {
      inputs.push(patterns[i].features);
      outputs.push(patterns[i + 1].features);
    }

    return { inputs, outputs };
  }

  private async generateVariants(
    basePattern: ScamPattern, 
    predictedFeatures: number[]
  ): Promise<ScamPattern[]> {
    const variants: ScamPattern[] = [];
    
    // Generate 3-5 variants based on predicted features
    for (let i = 0; i < 3; i++) {
      const variantScript = await this.mutateScript(basePattern.script, i);
      const variantFeatures = this.blendFeatures(
        basePattern.features, 
        predictedFeatures, 
        0.3 + (i * 0.2)
      );
      
      variants.push({
        id: crypto.randomUUID(),
        type: basePattern.type,
        script: variantScript,
        features: variantFeatures,
        timestamp: Date.now() + (i * 86400000), // Future timestamps
        location: basePattern.location,
        targetProfile: basePattern.targetProfile,
        mutationProbability: 0.8 - (i * 0.1)
      });
    }

    return variants;
  }

  private async mutateScript(originalScript: string, variantIndex: number): Promise<string> {
    const mutations = [
      // Variant 1: Change authority figure
      () => originalScript.replace(/police|officer|constable/gi, 'customs officer'),
      // Variant 2: Change threat type
      () => originalScript.replace(/arrest|detain/gi, 'account suspension'),
      // Variant 3: Change urgency level
      () => originalScript.replace(/immediately|urgent/gi, 'within 24 hours')
    ];

    const mutation = mutations[variantIndex % mutations.length];
    return mutation();
  }

  private blendFeatures(
    features1: number[], 
    features2: number[], 
    weight: number
  ): number[] {
    return features1.map((val, i) => {
      const val2 = features2[i] || 0;
      return (val * (1 - weight)) + (val2 * weight);
    });
  }

  private estimateTimeToMutation(patterns: ScamPattern[]): number {
    if (patterns.length < 2) return 7; // Default 7 days
    
    const timeDiffs = [];
    for (let i = 1; i < patterns.length; i++) {
      const diff = patterns[i].timestamp - patterns[i-1].timestamp;
      timeDiffs.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
    }
    
    const avgTimeToMutation = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    return Math.round(avgTimeToMutation);
  }

  private calculateRiskLevel(
    currentPattern: ScamPattern, 
    variants: ScamPattern[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const avgUrgency = variants.reduce((sum, v) => 
      sum + this.calculateUrgencyScore(v.script), 0) / variants.length;
    
    if (avgUrgency > 0.7) return 'critical';
    if (avgUrgency > 0.5) return 'high';
    if (avgUrgency > 0.3) return 'medium';
    return 'low';
  }

  // Get mutation trends over time
  getMutationTrends(timeWindow: number = 30): {
    date: string;
    mutations: number;
    scamTypes: Record<string, number>;
  }[] {
    const cutoff = Date.now() - (timeWindow * 24 * 60 * 60 * 1000);
    const recentPatterns = this.patternHistory.filter(p => p.timestamp > cutoff);
    
    const trends: Record<string, { mutations: number; scamTypes: Record<string, number> }> = {};
    
    recentPatterns.forEach(pattern => {
      const date = new Date(pattern.timestamp).toISOString().split('T')[0];
      
      if (!trends[date]) {
        trends[date] = { mutations: 0, scamTypes: {} };
      }
      
      trends[date].mutations++;
      trends[date].scamTypes[pattern.type] = (trends[date].scamTypes[pattern.type] || 0) + 1;
    });
    
    return Object.entries(trends)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Export model for persistence
  async exportModel(): Promise<Uint8Array> {
    if (!this.model) {
      throw new Error('No model to export');
    }
    return await this.model.save('localstorage://tmd-model');
  }

  // Load model from storage
  async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel('localstorage://tmd-model');
    } catch (error) {
      console.log('No saved model found, initializing new one');
      await this.initializeModel();
    }
  }
}
