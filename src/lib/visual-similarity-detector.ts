import { GeminiAPI } from './gemini';

export interface VisualAnalysis {
  isPhishing: boolean;
  similarityScore: number;
  riskScore: number;
  legitimateSite?: {
    name: string;
    url: string;
    confidence: number;
  };
  detectedIssues: {
    logoMismatch: boolean;
    layoutDifferences: boolean;
    colorSchemeDiff: boolean;
    suspiciousElements: string[];
  };
  screenshot?: string;
  comparison?: {
    original: string;
    fake: string;
    differences: string[];
  };
}

export interface SiteFingerprint {
  url: string;
  features: {
    colorHistogram: number[];
    layoutStructure: string;
    logoHash: string;
    textPatterns: string[];
    elementCounts: Record<string, number>;
  };
  timestamp: number;
}

export class VisualSimilarityDetector {
  private geminiAPI: GeminiAPI;
  private legitimateSitesDB: Map<string, SiteFingerprint> = new Map();
  
  constructor() {
    this.geminiAPI = new GeminiAPI();
    this.initializeLegitimateSitesDB();
  }

  private async initializeLegitimateSitesDB(): Promise<void> {
    // Pre-populate with major Indian websites
    const majorSites = [
      'https://www.hdfcbank.com',
      'https://www.icicibank.com',
      'https://www.sbi.co.in',
      'https://www.onlinesbi.com',
      'https://www.google.com',
      'https://www.facebook.com',
      'https://www.amazon.in',
      'https://www.flipkart.com',
      'https://www.paytm.com',
      'https://www.phonepe.com',
      'https://www.irctc.co.in',
      'https://www.incometaxindia.gov.in',
      'https://www.uidai.gov.in'
    ];

    for (const site of majorSites) {
      try {
        const fingerprint = await this.generateFingerprint(site);
        this.legitimateSitesDB.set(site, fingerprint);
      } catch (error) {
        console.warn(`Failed to fingerprint ${site}:`, error);
      }
    }
  }

  // Analyze a URL for visual phishing
  async analyzeUrl(url: string): Promise<VisualAnalysis> {
    try {
      // Take screenshot of the site
      const screenshot = await this.takeScreenshot(url);
      
      // Generate fingerprint
      const fingerprint = await this.generateFingerprintFromScreenshot(screenshot);
      
      // Compare with legitimate sites
      const comparison = await this.compareWithLegitimateSites(fingerprint);
      
      // Detect visual issues
      const detectedIssues = await this.detectVisualIssues(screenshot);
      
      // Calculate risk scores
      const analysis = this.calculateVisualAnalysis(comparison, detectedIssues);
      
      return {
        ...analysis,
        screenshot,
        comparison: comparison.bestMatch ? {
          original: comparison.bestMatch.url,
          fake: url,
          differences: comparison.differences
        } : undefined
      };
    } catch (error) {
      console.error('Error analyzing URL:', error);
      return {
        isPhishing: false,
        similarityScore: 0,
        riskScore: 5,
        detectedIssues: {
          logoMismatch: false,
          layoutDifferences: false,
          colorSchemeDiff: false,
          suspiciousElements: ['Analysis failed']
        }
      };
    }
  }

  private async takeScreenshot(url: string): Promise<string> {
    // In a real implementation, this would use Puppeteer or similar
    // For now, simulate with a placeholder
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }

  private async generateFingerprint(url: string): Promise<SiteFingerprint> {
    const screenshot = await this.takeScreenshot(url);
    return await this.generateFingerprintFromScreenshot(screenshot, url);
  }

  private async generateFingerprintFromScreenshot(
    screenshot: string, 
    url?: string
  ): Promise<SiteFingerprint> {
    // Use Gemini API to analyze the screenshot
    const prompt = `
      Analyze this website screenshot and extract visual features:
      
      1. Color distribution (dominant colors)
      2. Layout structure (header, navigation, content, footer)
      3. Logo/text elements
      4. Common web elements (forms, buttons, links)
      
      Return a JSON object with:
      {
        "colorHistogram": [array of 10 color values],
        "layoutStructure": "description of layout",
        "logoHash": "hash of logo appearance",
        "textPatterns": ["common text patterns"],
        "elementCounts": {"buttons": number, "forms": number, "links": number}
      }
    `;
    
    try {
      const response = await this.geminiAPI.generateContentWithImage(prompt, screenshot);
      const features = JSON.parse(response);
      
      return {
        url: url || '',
        features,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error generating fingerprint:', error);
      // Return default fingerprint
      return {
        url: url || '',
        features: {
          colorHistogram: new Array(10).fill(0),
          layoutStructure: 'unknown',
          logoHash: 'unknown',
          textPatterns: [],
          elementCounts: {}
        },
        timestamp: Date.now()
      };
    }
  }

  private async compareWithLegitimateSites(
    fingerprint: SiteFingerprint
  ): Promise<{
    bestMatch: { url: string; score: number; site: SiteFingerprint } | null;
    differences: string[];
    allMatches: Array<{ url: string; score: number }>
  }> {
    const matches: Array<{ url: string; score: number; site: SiteFingerprint }> = [];
    
    for (const [url, legitimateFingerprint] of this.legitimateSitesDB.entries()) {
      const similarity = await this.calculateSimilarity(fingerprint, legitimateFingerprint);
      matches.push({ url, score: similarity, site: legitimateFingerprint });
    }
    
    // Sort by similarity score
    matches.sort((a, b) => b.score - a.score);
    
    const bestMatch = matches.length > 0 && matches[0].score > 0.7 ? matches[0] : null;
    const differences = bestMatch ? await this.findDifferences(fingerprint, bestMatch.site) : [];
    
    return {
      bestMatch,
      differences,
      allMatches: matches.map(m => ({ url: m.url, score: m.score }))
    };
  }

  private async calculateSimilarity(
    fingerprint1: SiteFingerprint, 
    fingerprint2: SiteFingerprint
  ): Promise<number> {
    let similarity = 0;
    let factors = 0;
    
    // Compare color histograms
    const colorSimilarity = this.compareArrays(
      fingerprint1.features.colorHistogram,
      fingerprint2.features.colorHistogram
    );
    similarity += colorSimilarity;
    factors++;
    
    // Compare layout structure (simplified text similarity)
    const layoutSimilarity = this.calculateTextSimilarity(
      fingerprint1.features.layoutStructure,
      fingerprint2.features.layoutStructure
    );
    similarity += layoutSimilarity;
    factors++;
    
    // Compare logo hashes
    const logoSimilarity = fingerprint1.features.logoHash === fingerprint2.features.logoHash ? 1 : 0;
    similarity += logoSimilarity;
    factors++;
    
    // Compare text patterns
    const patternSimilarity = this.compareTextPatterns(
      fingerprint1.features.textPatterns,
      fingerprint2.features.textPatterns
    );
    similarity += patternSimilarity;
    factors++;
    
    // Compare element counts
    const elementSimilarity = this.compareElementCounts(
      fingerprint1.features.elementCounts,
      fingerprint2.features.elementCounts
    );
    similarity += elementSimilarity;
    factors++;
    
    return similarity / factors;
  }

  private compareArrays(arr1: number[], arr2: number[]): number {
    if (arr1.length !== arr2.length) return 0;
    
    const dotProduct = arr1.reduce((sum, val, i) => sum + val * arr2[i], 0);
    const magnitude1 = Math.sqrt(arr1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(arr2.reduce((sum, val) => sum + val * val, 0));
    
    return magnitude1 * magnitude2 > 0 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  private compareTextPatterns(patterns1: string[], patterns2: string[]): number {
    const intersection = patterns1.filter(pattern => patterns2.includes(pattern));
    const union = [...new Set([...patterns1, ...patterns2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  private compareElementCounts(counts1: Record<string, number>, counts2: Record<string, number>): number {
    const allKeys = [...new Set([...Object.keys(counts1), ...Object.keys(counts2)])];
    
    if (allKeys.length === 0) return 1;
    
    let similarity = 0;
    for (const key of allKeys) {
      const count1 = counts1[key] || 0;
      const count2 = counts2[key] || 0;
      const max = Math.max(count1, count2);
      const min = Math.min(count1, count2);
      
      similarity += max > 0 ? min / max : 1;
    }
    
    return similarity / allKeys.length;
  }

  private async findDifferences(
    fingerprint1: SiteFingerprint, 
    fingerprint2: SiteFingerprint
  ): Promise<string[]> {
    const differences: string[] = [];
    
    // Color differences
    const colorDiff = Math.abs(
      fingerprint1.features.colorHistogram[0] - fingerprint2.features.colorHistogram[0]
    );
    if (colorDiff > 0.3) {
      differences.push('Different color scheme');
    }
    
    // Layout differences
    const layoutSimilarity = this.calculateTextSimilarity(
      fingerprint1.features.layoutStructure,
      fingerprint2.features.layoutStructure
    );
    if (layoutSimilarity < 0.7) {
      differences.push('Different page layout');
    }
    
    // Logo differences
    if (fingerprint1.features.logoHash !== fingerprint2.features.logoHash) {
      differences.push('Different or missing logo');
    }
    
    // Element count differences
    for (const [key, count1] of Object.entries(fingerprint1.features.elementCounts)) {
      const count2 = fingerprint2.features.elementCounts[key] || 0;
      const diff = Math.abs(count1 - count2);
      const max = Math.max(count1, count2);
      
      if (max > 0 && diff / max > 0.5) {
        differences.push(`Different number of ${key} elements`);
      }
    }
    
    return differences;
  }

  private async detectVisualIssues(screenshot: string): Promise<{
    logoMismatch: boolean;
    layoutDifferences: boolean;
    colorSchemeDiff: boolean;
    suspiciousElements: string[];
  }> {
    const prompt = `
      Analyze this website screenshot for suspicious elements that indicate phishing:
      
      Look for:
      1. Poor image quality or compressed logos
      2. Misaligned elements or broken layouts
      3. Inconsistent color schemes
      4. Spelling mistakes in logos or text
      5. Suspicious pop-ups or warnings
      6. Missing security indicators (HTTPS, lock icons)
      7. Unusual forms asking for sensitive information
      
      Return JSON:
      {
        "logoMismatch": boolean,
        "layoutDifferences": boolean, 
        "colorSchemeDiff": boolean,
        "suspiciousElements": ["list of suspicious findings"]
      }
    `;
    
    try {
      const response = await this.geminiAPI.generateContentWithImage(prompt, screenshot);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error detecting visual issues:', error);
      return {
        logoMismatch: false,
        layoutDifferences: false,
        colorSchemeDiff: false,
        suspiciousElements: ['Analysis failed']
      };
    }
  }

  private calculateVisualAnalysis(
    comparison: any,
    detectedIssues: any
  ): VisualAnalysis {
    const similarityScore = comparison.bestMatch ? comparison.bestMatch.score : 0;
    const isPhishing = similarityScore > 0.8 && detectedIssues.suspiciousElements.length > 0;
    
    // Calculate risk score based on multiple factors
    let riskScore = 0;
    
    // High similarity with differences = likely phishing
    if (similarityScore > 0.8) {
      riskScore += 4;
    }
    
    // Suspicious elements increase risk
    riskScore += detectedIssues.suspiciousElements.length * 1.5;
    
    // Visual issues increase risk
    if (detectedIssues.logoMismatch) riskScore += 2;
    if (detectedIssues.layoutDifferences) riskScore += 1.5;
    if (detectedIssues.colorSchemeDiff) riskScore += 1;
    
    riskScore = Math.min(10, riskScore);
    
    return {
      isPhishing,
      similarityScore,
      riskScore,
      legitimateSite: comparison.bestMatch ? {
        name: new URL(comparison.bestMatch.url).hostname,
        url: comparison.bestMatch.url,
        confidence: comparison.bestMatch.score
      } : undefined,
      detectedIssues
    };
  }

  // Add new legitimate site to database
  async addLegitimateSite(url: string): Promise<void> {
    try {
      const fingerprint = await this.generateFingerprint(url);
      this.legitimateSitesDB.set(url, fingerprint);
    } catch (error) {
      console.error('Error adding legitimate site:', error);
    }
  }

  // Get all legitimate sites
  getLegitimateSites(): string[] {
    return Array.from(this.legitimateSitesDB.keys());
  }

  // Export database for persistence
  exportDatabase(): string {
    const db = Object.fromEntries(this.legitimateSitesDB.entries());
    return JSON.stringify(db);
  }

  // Import database from storage
  importDatabase(jsonData: string): void {
    try {
      const db = JSON.parse(jsonData);
      this.legitimateSitesDB = new Map(Object.entries(db));
    } catch (error) {
      console.error('Error importing database:', error);
    }
  }

  // Batch analyze multiple URLs
  async analyzeBatch(urls: string[]): Promise<VisualAnalysis[]> {
    const analyses: VisualAnalysis[] = [];
    
    for (const url of urls) {
      try {
        const analysis = await this.analyzeUrl(url);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Error analyzing ${url}:`, error);
        analyses.push({
          isPhishing: false,
          similarityScore: 0,
          riskScore: 5,
          detectedIssues: {
            logoMismatch: false,
            layoutDifferences: false,
            colorSchemeDiff: false,
            suspiciousElements: ['Analysis failed']
          }
        });
      }
    }
    
    return analyses;
  }
}
