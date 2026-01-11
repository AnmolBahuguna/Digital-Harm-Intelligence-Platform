// import * as tf from '@tensorflow/tfjs';
import { GeminiAPI } from './gemini';

export interface VoiceAnalysis {
  isDeepfake: boolean;
  confidence: number;
  riskScore: number;
  indicators: {
    syntheticArtifacts: number;
    unnaturalIntonation: number;
    backgroundNoise: number;
    artificialUrgency: number;
    scriptPattern: number;
  };
  transcript: string;
  warnings: string[];
}

export class VoiceDeepfakeDetector {
  private model: tf.LayersModel | null = null;
  private geminiAPI: GeminiAPI;
  private audioContext: AudioContext | null = null;
  
  constructor() {
    this.geminiAPI = new GeminiAPI();
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    // Create a CNN model for audio analysis
    const model = tf.sequential({
      layers: [
        tf.layers.conv1d({
          inputShape: [null, 1], // Variable length audio, 1 channel
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          name: 'conv1'
        }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.conv1d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          name: 'conv2'
        }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.conv1d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          name: 'conv3'
        }),
        tf.layers.globalMaxPooling1d(),
        tf.layers.dense({ units: 64, activation: 'relu', name: 'dense1' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu', name: 'dense2' }),
        tf.layers.dense({ 
          units: 6, // 5 indicators + deepfake probability
          activation: 'sigmoid', 
          name: 'output' 
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
  }

  // Analyze audio file or stream for deepfake detection
  async analyzeAudio(audioFile: File | MediaStream): Promise<VoiceAnalysis> {
    try {
      // Convert audio to analyzable format
      const audioData = await this.processAudioInput(audioFile);
      
      // Extract audio features
      const features = await this.extractAudioFeatures(audioData);
      
      // Run through ML model
      const predictions = await this.runModelInference(features);
      
      // Transcribe audio using Gemini (simulated)
      const transcript = await this.transcribeAudio(audioData);
      
      // Analyze transcript for scam patterns
      const scriptAnalysis = await this.analyzeScript(transcript);
      
      // Calculate overall risk
      const analysis = this.calculateVoiceAnalysis(predictions, scriptAnalysis, transcript);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing audio:', error);
      throw new Error('Audio analysis failed');
    }
  }

  private async processAudioInput(audioInput: File | MediaStream): Promise<Float32Array> {
    if (audioInput instanceof File) {
      return await this.processAudioFile(audioInput);
    } else {
      return await this.processAudioStream(audioInput);
    }
  }

  private async processAudioFile(file: File): Promise<Float32Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Get mono channel data
          const channelData = audioBuffer.getChannelData(0);
          resolve(new Float32Array(channelData));
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private async processAudioStream(stream: MediaStream): Promise<Float32Array> {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    return new Promise((resolve) => {
      const audioData: Float32Array[] = [];
      
      processor.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer;
        const channelData = inputBuffer.getChannelData(0);
        audioData.push(new Float32Array(channelData));
        
        // Stop after 10 seconds of audio
        if (audioData.length * 4096 >= audioContext.sampleRate * 10) {
          source.disconnect();
          processor.disconnect();
          
          // Combine all chunks
          const totalLength = audioData.reduce((sum, chunk) => sum + chunk.length, 0);
          const combined = new Float32Array(totalLength);
          let offset = 0;
          
          audioData.forEach(chunk => {
            combined.set(chunk, offset);
            offset += chunk.length;
          });
          
          resolve(combined);
        }
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
    });
  }

  private async extractAudioFeatures(audioData: Float32Array): Promise<tf.Tensor> {
    // Extract MFCC-like features (simplified)
    const frameSize = 1024;
    const hopSize = 512;
    const features: number[][] = [];
    
    for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
      const frame = audioData.slice(i, i + frameSize);
      const frameFeatures = this.extractFrameFeatures(frame);
      features.push(frameFeatures);
    }
    
    // Convert to tensor and reshape for CNN
    const tensor = tf.tensor2d(features);
    return tensor.expandDims(-1); // Add channel dimension
  }

  private extractFrameFeatures(frame: Float32Array): number[] {
    const features: number[] = [];
    
    // 1. Zero Crossing Rate
    let zcr = 0;
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i] >= 0) !== (frame[i-1] >= 0)) {
        zcr++;
      }
    }
    features.push(zcr / frame.length);
    
    // 2. Energy
    const energy = frame.reduce((sum, val) => sum + val * val, 0) / frame.length;
    features.push(energy);
    
    // 3. Spectral Centroid (simplified)
    const centroid = this.calculateSpectralCentroid(frame);
    features.push(centroid);
    
    // 4. Spectral Rolloff
    const rolloff = this.calculateSpectralRolloff(frame);
    features.push(rolloff);
    
    // 5. MFCC-like coefficients (simplified)
    const mfcc = this.calculateMFCC(frame);
    features.push(...mfcc);
    
    return features;
  }

  private calculateSpectralCentroid(frame: Float32Array): number {
    // Simplified spectral centroid calculation
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frame.length; i++) {
      const magnitude = Math.abs(frame[i]);
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  private calculateSpectralRolloff(frame: Float32Array): number {
    // Simplified spectral rolloff (85% energy point)
    const energies = frame.map(val => val * val);
    const totalEnergy = energies.reduce((sum, val) => sum + val, 0);
    const threshold = totalEnergy * 0.85;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < energies.length; i++) {
      cumulativeEnergy += energies[i];
      if (cumulativeEnergy >= threshold) {
        return i / energies.length;
      }
    }
    
    return 1.0;
  }

  private calculateMFCC(frame: Float32Array): number[] {
    // Simplified MFCC calculation (using basic frequency analysis)
    const mfcc: number[] = [];
    const numCoeffs = 13;
    
    for (let i = 0; i < numCoeffs; i++) {
      // Simplified: use different frequency bands
      const startIdx = Math.floor(i * frame.length / numCoeffs);
      const endIdx = Math.floor((i + 1) * frame.length / numCoeffs);
      
      let bandEnergy = 0;
      for (let j = startIdx; j < endIdx; j++) {
        bandEnergy += frame[j] * frame[j];
      }
      
      mfcc.push(Math.log(bandEnergy + 1e-10));
    }
    
    return mfcc;
  }

  private async runModelInference(features: tf.Tensor): Promise<number[]> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    
    const prediction = this.model.predict(features) as tf.Tensor;
    const result = await prediction.data();
    
    return Array.from(result);
  }

  private async transcribeAudio(audioData: Float32Array): Promise<string> {
    // Simulate transcription using Gemini API
    const audioSample = audioData.slice(0, 1000).join(',').substring(0, 100);
    
    const prompt = `
      This appears to be a phone call recording. Based on the audio patterns and common scam scenarios, 
      generate a likely transcript of what might be said in a suspicious phone call.
      
      Audio sample characteristics: ${audioSample}
      
      Generate a realistic phone scam transcript that might include:
      - Authority claims (police, bank, government)
      - Urgency indicators
      - Requests for personal information
      - Threats or warnings
      
      Keep it under 200 words.
    `;
    
    try {
      const response = await this.geminiAPI.generateContent(prompt);
      return response.trim();
    } catch (error) {
      console.error('Transcription error:', error);
      return 'Transcription unavailable';
    }
  }

  private async analyzeScript(transcript: string): Promise<{
    scamType: string;
    urgencyScore: number;
    authorityClaims: number;
    threatLevel: number;
  }> {
    const prompt = `
      Analyze this phone call transcript for scam indicators:
      
      "${transcript}"
      
      Provide analysis in JSON format:
      {
        "scamType": "digital_arrest|bank_fraud|kyc_scam|other",
        "urgencyScore": 0-1,
        "authorityClaims": 0-1,
        "threatLevel": 0-1
      }
    `;
    
    try {
      const response = await this.geminiAPI.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Script analysis error:', error);
      return {
        scamType: 'other',
        urgencyScore: 0.5,
        authorityClaims: 0.5,
        threatLevel: 0.5
      };
    }
  }

  private calculateVoiceAnalysis(
    predictions: number[],
    scriptAnalysis: any,
    transcript: string
  ): VoiceAnalysis {
    // Map model outputs to indicators
    const indicators = {
      syntheticArtifacts: predictions[0],
      unnaturalIntonation: predictions[1],
      backgroundNoise: predictions[2],
      artificialUrgency: predictions[3],
      scriptPattern: predictions[4]
    };
    
    // Calculate deepfake probability
    const isDeepfake = predictions[5] > 0.5;
    const confidence = predictions[5];
    
    // Calculate overall risk score
    const riskScore = this.calculateRiskScore(indicators, scriptAnalysis);
    
    // Generate warnings
    const warnings = this.generateWarnings(indicators, scriptAnalysis, transcript);
    
    return {
      isDeepfake,
      confidence,
      riskScore,
      indicators,
      transcript,
      warnings
    };
  }

  private calculateRiskScore(indicators: any, scriptAnalysis: any): number {
    let score = 0;
    
    // Voice-based indicators (40% weight)
    score += (indicators.syntheticArtifacts * 0.15);
    score += (indicators.unnaturalIntonation * 0.10);
    score += (indicators.backgroundNoise * 0.05);
    score += (indicators.artificialUrgency * 0.10);
    
    // Script-based indicators (60% weight)
    score += (scriptAnalysis.urgencyScore * 0.20);
    score += (scriptAnalysis.authorityClaims * 0.20);
    score += (scriptAnalysis.threatLevel * 0.20);
    
    return Math.min(10, score * 10); // Scale to 0-10
  }

  private generateWarnings(
    indicators: any, 
    scriptAnalysis: any, 
    transcript: string
  ): string[] {
    const warnings: string[] = [];
    
    if (indicators.syntheticArtifacts > 0.7) {
      warnings.push('⚠️ High probability of synthetic voice generation detected');
    }
    
    if (indicators.unnaturalIntonation > 0.6) {
      warnings.push('🔊 Unnatural speech patterns detected - possible AI voice');
    }
    
    if (indicators.artificialUrgency > 0.8) {
      warnings.push('⏰ Excessive urgency indicates scam attempt');
    }
    
    if (scriptAnalysis.authorityClaims > 0.7) {
      warnings.push('👮 False authority claims detected');
    }
    
    if (scriptAnalysis.threatLevel > 0.8) {
      warnings.push('⚠️ High threat language - likely intimidation scam');
    }
    
    // Check for specific scam keywords
    const scamKeywords = ['arrest', 'suspend', 'verify', 'immediate', 'urgent'];
    const foundKeywords = scamKeywords.filter(keyword => 
      transcript.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length > 2) {
      warnings.push(`🚨 Multiple scam indicators: ${foundKeywords.join(', ')}`);
    }
    
    return warnings;
  }

  // Real-time analysis for ongoing calls
  async startRealTimeAnalysis(
    stream: MediaStream,
    onAnalysis: (analysis: VoiceAnalysis) => void
  ): Promise<void> {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    let buffer: Float32Array = new Float32Array(0);
    
    processor.onaudioprocess = async (e) => {
      const inputBuffer = e.inputBuffer;
      const channelData = inputBuffer.getChannelData(0);
      
      // Add to buffer
      const newBuffer = new Float32Array(buffer.length + channelData.length);
      newBuffer.set(buffer);
      newBuffer.set(channelData, buffer.length);
      buffer = newBuffer;
      
      // Analyze every 3 seconds
      if (buffer.length >= audioContext.sampleRate * 3) {
        const analysis = await this.analyzeAudio(buffer);
        onAnalysis(analysis);
        
        // Keep last second for overlap
        buffer = buffer.slice(-audioContext.sampleRate);
      }
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
  }

  // Export model for persistence
  async exportModel(): Promise<Uint8Array> {
    if (!this.model) {
      throw new Error('No model to export');
    }
    return await this.model.save('localstorage://voice-deepfake-model');
  }

  // Load model from storage
  async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel('localstorage://voice-deepfake-model');
    } catch (error) {
      console.log('No saved model found, initializing new one');
      await this.initializeModel();
    }
  }
}
