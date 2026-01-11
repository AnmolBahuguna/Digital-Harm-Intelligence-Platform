import { GeminiAPI } from './gemini';

export interface SMSRequest {
  phoneNumber: string;
  message: string;
  timestamp: number;
  requestId: string;
}

export interface SMSResponse {
  success: boolean;
  message: string;
  riskScore?: number;
  warnings?: string[];
  recommendations?: string[];
  requestId: string;
}

export interface ThreatAnalysis {
  entityType: 'phone' | 'url' | 'upi' | 'email';
  entityValue: string;
  riskScore: number;
  category: string;
  threats: string[];
  recommendations: string[];
  confidence: number;
}

export class SMSService {
  private geminiAPI: GeminiAPI;
  private twilioClient: any; // Twilio client
  private phoneNumber: string;
  private requestCache: Map<string, SMSRequest> = new Map();
  
  constructor() {
    this.geminiAPI = new GeminiAPI();
    this.phoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';
    
    // Initialize Twilio client (server-side only)
    if (typeof window === 'undefined') {
      this.initializeTwilio();
    }
  }

  private initializeTwilio(): void {
    try {
      const twilio = require('twilio');
      const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
      const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
      
      if (accountSid && authToken) {
        this.twilioClient = twilio(accountSid, authToken);
      }
    } catch (error) {
      console.error('Failed to initialize Twilio:', error);
    }
  }

  // Process incoming SMS message
  async processIncomingSMS(fromNumber: string, message: string): Promise<SMSResponse> {
    const requestId = crypto.randomUUID();
    const timestamp = Date.now();
    
    // Cache the request
    const request: SMSRequest = {
      phoneNumber: fromNumber,
      message: message.trim(),
      timestamp,
      requestId
    };
    this.requestCache.set(requestId, request);

    try {
      // Parse the message to determine intent
      const intent = await this.parseMessageIntent(message);
      
      switch (intent.type) {
        case 'CHECK':
          return await this.handleCheckCommand(fromNumber, intent.entity, requestId);
        
        case 'REPORT':
          return await this.handleReportCommand(fromNumber, intent.details, requestId);
        
        case 'ALERT':
          return await this.handleAlertCommand(fromNumber, intent.location, requestId);
        
        case 'HELP':
          return await this.handleHelpCommand(fromNumber, requestId);
        
        default:
          return await this.handleUnknownCommand(fromNumber, requestId);
      }
    } catch (error) {
      console.error('Error processing SMS:', error);
      return {
        success: false,
        message: 'Sorry, we encountered an error. Please try again later.',
        requestId
      };
    }
  }

  private async parseMessageIntent(message: string): Promise<{
    type: 'CHECK' | 'REPORT' | 'ALERT' | 'HELP' | 'UNKNOWN';
    entity?: string;
    details?: string;
    location?: string;
  }> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Check command patterns
    if (normalizedMessage.startsWith('check ') || normalizedMessage.startsWith('verify ')) {
      const entity = message.substring(message.indexOf(' ') + 1).trim();
      return { type: 'CHECK', entity };
    }
    
    if (normalizedMessage.startsWith('report ')) {
      const details = message.substring(message.indexOf(' ') + 1).trim();
      return { type: 'REPORT', details };
    }
    
    if (normalizedMessage.startsWith('alert ')) {
      const location = message.substring(message.indexOf(' ') + 1).trim();
      return { type: 'ALERT', location };
    }
    
    if (normalizedMessage === 'help' || normalizedMessage === 'info') {
      return { type: 'HELP' };
    }
    
    // Try to detect if it's a check command without explicit keyword
    if (this.isPhoneNumber(normalizedMessage) || 
        this.isUPI(normalizedMessage) || 
        this.isURL(normalizedMessage) ||
        this.isEmail(normalizedMessage)) {
      return { type: 'CHECK', entity: message.trim() };
    }
    
    return { type: 'UNKNOWN' };
  }

  private isPhoneNumber(text: string): boolean {
    const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return phoneRegex.test(text);
  }

  private isUPI(text: string): boolean {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
    return upiRegex.test(text);
  }

  private isURL(text: string): boolean {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  }

  private isEmail(text: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  }

  private async handleCheckCommand(
    fromNumber: string, 
    entity: string, 
    requestId: string
  ): Promise<SMSResponse> {
    try {
      // Analyze the entity using Gemini API
      const analysis = await this.analyzeEntity(entity);
      
      // Format response for SMS (160 character limit)
      const response = this.formatSMSResponse(analysis);
      
      // Send SMS response
      await this.sendSMS(fromNumber, response);
      
      return {
        success: true,
        message: response,
        riskScore: analysis.riskScore,
        warnings: analysis.threats,
        recommendations: analysis.recommendations,
        requestId
      };
    } catch (error) {
      console.error('Error in check command:', error);
      const errorMessage = 'Analysis failed. Please try again later.';
      await this.sendSMS(fromNumber, errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        requestId
      };
    }
  }

  private async analyzeEntity(entity: string): Promise<ThreatAnalysis> {
    const prompt = `
      Analyze this entity for cybersecurity threats: "${entity}"
      
      Determine:
      1. Entity type (phone, URL, UPI, email)
      2. Risk score (0-10)
      3. Threat category
      4. Specific threats
      5. Safety recommendations
      
      Return JSON:
      {
        "entityType": "phone|url|upi|email",
        "entityValue": "${entity}",
        "riskScore": number,
        "category": "string",
        "threats": ["threat1", "threat2"],
        "recommendations": ["rec1", "rec2"],
        "confidence": number
      }
    `;

    try {
      const response = await this.geminiAPI.generateContentWithSearch(prompt);
      return JSON.parse(response) as ThreatAnalysis;
    } catch (error) {
      console.error('Analysis error:', error);
      // Return default analysis
      return {
        entityType: this.detectEntityType(entity),
        entityValue: entity,
        riskScore: 5,
        category: 'Unknown',
        threats: ['Analysis failed'],
        recommendations: ['Please verify independently'],
        confidence: 0
      };
    }
  }

  private detectEntityType(entity: string): 'phone' | 'url' | 'upi' | 'email' {
    if (this.isPhoneNumber(entity)) return 'phone';
    if (this.isURL(entity)) return 'url';
    if (this.isUPI(entity)) return 'upi';
    if (this.isEmail(entity)) return 'email';
    return 'phone'; // Default
  }

  private formatSMSResponse(analysis: ThreatAnalysis): string {
    const riskEmoji = analysis.riskScore >= 7 ? '🚨' : 
                      analysis.riskScore >= 4 ? '⚠️' : '✅';
    
    let response = `${riskEmoji} RISK: ${analysis.riskScore.toFixed(1)}/10\n`;
    response += `Type: ${analysis.entityType.toUpperCase()}\n`;
    
    if (analysis.riskScore >= 7) {
      response += `DANGER! ${analysis.category}\n`;
      response += `DO NOT engage!\n`;
    } else if (analysis.riskScore >= 4) {
      response += `CAUTION: ${analysis.category}\n`;
    } else {
      response += `Appears safe\n`;
    }
    
    // Add main recommendation
    if (analysis.recommendations.length > 0) {
      response += `Tip: ${analysis.recommendations[0]}`;
    }
    
    // Add help info
    response += `\nHelp: 1930 (Cyber Cell)`;
    
    // Ensure within 160 characters
    if (response.length > 160) {
      response = response.substring(0, 157) + '...';
    }
    
    return response;
  }

  private async handleReportCommand(
    fromNumber: string, 
    details: string, 
    requestId: string
  ): Promise<SMSResponse> {
    try {
      // Log the report (in real implementation, save to database)
      console.log(`Report from ${fromNumber}: ${details}`);
      
      const response = 'Thank you! Your report has been recorded. Our team will investigate.';
      await this.sendSMS(fromNumber, response);
      
      return {
        success: true,
        message: response,
        requestId
      };
    } catch (error) {
      console.error('Error in report command:', error);
      const errorMessage = 'Failed to record report. Please try again.';
      await this.sendSMS(fromNumber, errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        requestId
      };
    }
  }

  private async handleAlertCommand(
    fromNumber: string, 
    location: string, 
    requestId: string
  ): Promise<SMSResponse> {
    try {
      // Get regional threats (mock implementation)
      const regionalThreats = await this.getRegionalThreats(location);
      
      let response = `🚨 ALERTS for ${location}:\n`;
      response += `${regionalThreats.activeThreats} active threats\n`;
      response += `${regionalThreats.reportsToday} reports today\n`;
      response += `Stay vigilant!`;
      
      await this.sendSMS(fromNumber, response);
      
      return {
        success: true,
        message: response,
        requestId
      };
    } catch (error) {
      console.error('Error in alert command:', error);
      const errorMessage = 'Failed to get alerts. Please try again.';
      await this.sendSMS(fromNumber, errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        requestId
      };
    }
  }

  private async getRegionalThreats(location: string): Promise<{
    activeThreats: number;
    reportsToday: number;
    topThreat: string;
  }> {
    // Mock implementation - replace with real data
    return {
      activeThreats: Math.floor(Math.random() * 10) + 1,
      reportsToday: Math.floor(Math.random() * 50) + 5,
      topThreat: 'Digital Arrest Scam'
    };
  }

  private async handleHelpCommand(fromNumber: string, requestId: string): Promise<SMSResponse> {
    const helpMessage = `DHIP HELP:
• CHECK <number/URL/UPI> - Verify safety
• REPORT <details> - Report scam
• ALERT <location> - Get regional alerts
• HELP - Show this message

Example: CHECK 9876543210
Cyber Helpline: 1930`;

    try {
      await this.sendSMS(fromNumber, helpMessage);
      
      return {
        success: true,
        message: helpMessage,
        requestId
      };
    } catch (error) {
      console.error('Error sending help:', error);
      return {
        success: false,
        message: 'Failed to send help message',
        requestId
      };
    }
  }

  private async handleUnknownCommand(fromNumber: string, requestId: string): Promise<SMSResponse> {
    const response = 'Command not recognized. Send HELP for usage instructions.';
    
    try {
      await this.sendSMS(fromNumber, response);
      
      return {
        success: true,
        message: response,
        requestId
      };
    } catch (error) {
      console.error('Error handling unknown command:', error);
      return {
        success: false,
        message: 'Failed to process command',
        requestId
      };
    }
  }

  private async sendSMS(toNumber: string, message: string): Promise<void> {
    if (!this.twilioClient) {
      console.log('Mock SMS sent:', { to: toNumber, message });
      return;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.phoneNumber,
        to: toNumber
      });
      
      console.log('SMS sent successfully to:', toNumber);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  // Send bulk alerts to multiple numbers
  async sendBulkAlert(phoneNumbers: string[], alertMessage: string): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        await this.sendSMS(phoneNumber, alertMessage);
        success++;
      } catch (error) {
        failed++;
        errors.push(`${phoneNumber}: ${error}`);
      }
    }

    return { success, failed, errors };
  }

  // Get request history
  getRequestHistory(): SMSRequest[] {
    return Array.from(this.requestCache.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Clear old requests (cleanup)
  clearOldRequests(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    
    for (const [requestId, request] of this.requestCache.entries()) {
      if (request.timestamp < cutoff) {
        this.requestCache.delete(requestId);
      }
    }
  }

  // Get service statistics
  getStatistics(): {
    totalRequests: number;
    requestsByType: Record<string, number>;
    averageResponseTime: number;
  } {
    const requests = this.getRequestHistory();
    const requestsByType: Record<string, number> = {};
    
    requests.forEach(request => {
      const intent = this.parseMessageIntentSync(request.message);
      requestsByType[intent.type] = (requestsByType[intent.type] || 0) + 1;
    });

    return {
      totalRequests: requests.length,
      requestsByType,
      averageResponseTime: 0 // Would need to track response times
    };
  }

  private parseMessageIntentSync(message: string): {
    type: 'CHECK' | 'REPORT' | 'ALERT' | 'HELP' | 'UNKNOWN';
  } {
    const normalizedMessage = message.toLowerCase().trim();
    
    if (normalizedMessage.startsWith('check ') || normalizedMessage.startsWith('verify ')) {
      return { type: 'CHECK' };
    }
    
    if (normalizedMessage.startsWith('report ')) {
      return { type: 'REPORT' };
    }
    
    if (normalizedMessage.startsWith('alert ')) {
      return { type: 'ALERT' };
    }
    
    if (normalizedMessage === 'help' || normalizedMessage === 'info') {
      return { type: 'HELP' };
    }
    
    if (this.isPhoneNumber(normalizedMessage) || 
        this.isUPI(normalizedMessage) || 
        this.isURL(normalizedMessage) ||
        this.isEmail(normalizedMessage)) {
      return { type: 'CHECK' };
    }
    
    return { type: 'UNKNOWN' };
  }
}
