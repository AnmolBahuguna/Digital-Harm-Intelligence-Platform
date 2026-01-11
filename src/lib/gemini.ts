export class GeminiAPI {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.VITE_APIKEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found in environment variables');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `${this.baseUrl}/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No content received from Gemini API');
      }

      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async generateContentWithImage(prompt: string, imageBase64: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `${this.baseUrl}/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: imageBase64.split(',')[1] // Remove data:image/png;base64, prefix
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No content received from Gemini API');
      }

      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async generateContentWithSearch(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `${this.baseUrl}/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          tools: [{
            google_search: {}
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No content received from Gemini API');
      }

      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async generateJsonResponse<T>(prompt: string): Promise<T> {
    const response = await this.generateContent(prompt);
    
    try {
      // Clean up the response to extract JSON
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json/g, '').replace(/```/g, '');
      
      // Find JSON object in the response
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      return JSON.parse(cleanedResponse) as T;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse JSON response from Gemini API');
    }
  }

  async generateJsonResponseWithSearch<T>(prompt: string): Promise<T> {
    const response = await this.generateContentWithSearch(prompt);
    
    try {
      // Clean up the response to extract JSON
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json/g, '').replace(/```/g, '');
      
      // Find JSON object in the response
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      return JSON.parse(cleanedResponse) as T;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse JSON response from Gemini API');
    }
  }

  // Retry mechanism for failed requests
  async generateContentWithRetry(prompt: string, maxRetries: number = 3): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateContent(prompt);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Gemini API attempt ${attempt} failed:`, error);
        
        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  // Batch processing for multiple prompts
  async generateBatchContent(prompts: string[]): Promise<string[]> {
    const results: string[] = [];
    
    // Process in parallel with concurrency limit
    const concurrencyLimit = 5;
    for (let i = 0; i < prompts.length; i += concurrencyLimit) {
      const batch = prompts.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.allSettled(
        batch.map(prompt => this.generateContent(prompt))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Batch item ${i + index} failed:`, result.reason);
          results.push(''); // Empty string for failed items
        }
      });
    }
    
    return results;
  }

  // Stream response for long content
  async *generateContentStream(prompt: string): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `${this.baseUrl}/models/gemini-2.5-flash-preview-09-2025:streamGenerateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const data = line.trim().slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                yield text;
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Gemini API Streaming Error:', error);
      throw error;
    }
  }
}
