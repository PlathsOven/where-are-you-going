interface OpenRouterConfig {
  apiKeys: string[];
  models: string[];
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  retryDelay?: number;
}

interface OpenRouterRequest {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenRouterService {
  private config: OpenRouterConfig;
  private currentApiKeyIndex = 0;
  private currentModelIndex = 0;

  constructor(config: OpenRouterConfig) {
    this.config = {
      defaultTemperature: 0.7,
      defaultMaxTokens: 1000,
      retryDelay: 1000,
      ...config
    };

    if (!this.config.apiKeys.length) {
      throw new Error('At least one API key must be provided');
    }
    if (!this.config.models.length) {
      throw new Error('At least one model must be provided');
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getNextApiKey(): string {
    const apiKey = this.config.apiKeys[this.currentApiKeyIndex];
    this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.config.apiKeys.length;
    return apiKey;
  }

  private getNextModel(): string {
    const model = this.config.models[this.currentModelIndex];
    this.currentModelIndex = (this.currentModelIndex + 1) % this.config.models.length;
    return model;
  }

  private resetModelIndex(): void {
    this.currentModelIndex = 0;
  }

  async generateCompletion(request: OpenRouterRequest): Promise<string> {
    const totalAttempts = this.config.apiKeys.length * this.config.models.length;
    let lastError: Error | null = null;
    
    console.log(`🤖 Starting OpenRouter generation with ${this.config.apiKeys.length} API keys and ${this.config.models.length} models`);

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      const apiKey = this.getNextApiKey();
      const model = this.getNextModel();
      
      // Reset model index when we start a new API key cycle
      if (attempt > 0 && attempt % this.config.models.length === 0) {
        this.resetModelIndex();
      }

      console.log(`🔄 Attempt ${attempt + 1}/${totalAttempts}: Using model ${model} with API key ending in ...${apiKey.slice(-8)}`);

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: request.messages,
            temperature: request.temperature ?? this.config.defaultTemperature,
            max_tokens: request.max_tokens ?? this.config.defaultMaxTokens
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = `API error ${response.status}: ${JSON.stringify(errorData)}`;
          console.warn(`⚠️  Model ${model} failed: ${errorMessage}`);
          lastError = new Error(errorMessage);
          
          // Add delay before next attempt
          if (attempt < totalAttempts - 1) {
            await this.sleep(this.config.retryDelay!);
          }
          continue;
        }

        const data: OpenRouterResponse = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          const errorMessage = 'No content received from AI';
          console.warn(`⚠️  Model ${model} returned empty content`);
          lastError = new Error(errorMessage);
          continue;
        }

        console.log(`✅ Success with model ${model}!`);
        return content;

      } catch (error) {
        console.warn(`⚠️  Model ${model} threw error:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Add delay before next attempt
        if (attempt < totalAttempts - 1) {
          await this.sleep(this.config.retryDelay!);
        }
      }
    }

    // All attempts failed
    console.error('🚨 All OpenRouter attempts failed!');
    throw new Error(`All ${totalAttempts} attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  // Convenience method for extracting JSON from LLM responses
  static extractJSON(text: string): string {
    const start = text.indexOf('{');
    if (start === -1) throw new Error('No JSON found in response');
    
    let braceCount = 0, end = start;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      else if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          end = i;
          break;
        }
      }
    }
    return text.substring(start, end + 1);
  }

  // Get current configuration info
  getConfigInfo(): { apiKeyCount: number; modelCount: number; totalCombinations: number } {
    return {
      apiKeyCount: this.config.apiKeys.length,
      modelCount: this.config.models.length,
      totalCombinations: this.config.apiKeys.length * this.config.models.length
    };
  }
}

// Factory function to create OpenRouter service from environment variables
export function createOpenRouterService(): OpenRouterService {
  // Parse API keys - support both comma-separated and JSON array formats
  const apiKeysEnv = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
  let apiKeys: string[] = [];
  
  if (apiKeysEnv.startsWith('[')) {
    // JSON array format
    try {
      apiKeys = JSON.parse(apiKeysEnv);
    } catch (error) {
      throw new Error('Invalid JSON format for OPENROUTER_API_KEYS');
    }
  } else {
    // Comma-separated format
    apiKeys = apiKeysEnv.split(',').map(key => key.trim()).filter(key => key.length > 0);
  }

  // Parse models - support both comma-separated and JSON array formats
  const modelsEnv = process.env.OPENROUTER_MODELS || 'google/gemini-2.0-flash-exp:free';
  let models: string[] = [];
  
  if (modelsEnv.startsWith('[')) {
    // JSON array format
    try {
      models = JSON.parse(modelsEnv);
    } catch (error) {
      throw new Error('Invalid JSON format for OPENROUTER_MODELS');
    }
  } else {
    // Comma-separated format
    models = modelsEnv.split(',').map(model => model.trim()).filter(model => model.length > 0);
  }

  if (apiKeys.length === 0) {
    throw new Error('No OpenRouter API keys found. Please set OPENROUTER_API_KEYS or OPENROUTER_API_KEY environment variable');
  }

  return new OpenRouterService({
    apiKeys,
    models,
    defaultTemperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.7'),
    defaultMaxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '1000'),
    retryDelay: parseInt(process.env.OPENROUTER_RETRY_DELAY || '1000')
  });
}

export { OpenRouterService };
export type { OpenRouterConfig, OpenRouterRequest };
