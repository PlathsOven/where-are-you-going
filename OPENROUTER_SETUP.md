# OpenRouter Failover Setup

This project now supports **automatic failover** across multiple OpenRouter API keys and models. If one model fails, the system will automatically try the next model, and if all models fail for one API key, it will try the next API key.

## Environment Variables

### Required Configuration

Set up your environment variables in `.env.local`:

```bash
# Multiple API Keys (comma-separated)
OPENROUTER_API_KEYS=sk-or-v1-your-first-key,sk-or-v1-your-second-key,sk-or-v1-your-third-key

# Multiple Models (comma-separated) 
OPENROUTER_MODELS=google/gemini-2.0-flash-exp:free,anthropic/claude-3.5-sonnet,openai/gpt-4o-mini,meta-llama/llama-3.2-3b-instruct:free
```

### Alternative JSON Format

You can also use JSON arrays:

```bash
OPENROUTER_API_KEYS=["sk-or-v1-key1","sk-or-v1-key2","sk-or-v1-key3"]
OPENROUTER_MODELS=["google/gemini-2.0-flash-exp:free","anthropic/claude-3.5-sonnet"]
```

### Optional Configuration

```bash
# Default temperature (0.0 to 2.0)
OPENROUTER_TEMPERATURE=0.7

# Default max tokens
OPENROUTER_MAX_TOKENS=2000

# Retry delay between attempts (milliseconds)
OPENROUTER_RETRY_DELAY=1000
```

### Legacy Support

For backward compatibility, single API key is still supported:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-single-key
```

## How Failover Works

1. **Model Cycling**: If a model fails, the system tries the next model in the list
2. **API Key Cycling**: If all models fail for one API key, it tries the next API key
3. **Complete Coverage**: With 3 API keys and 4 models, you get 12 total attempts before failure
4. **Intelligent Logging**: Console shows which model/key combination is being tried

## Example Failover Sequence

With 2 API keys and 3 models:

```
Attempt 1: API Key 1 + Model A
Attempt 2: API Key 1 + Model B  
Attempt 3: API Key 1 + Model C
Attempt 4: API Key 2 + Model A
Attempt 5: API Key 2 + Model B
Attempt 6: API Key 2 + Model C
```

## Recommended Models

Free tier models that work well:
- `google/gemini-2.0-flash-exp:free`
- `meta-llama/llama-3.2-3b-instruct:free`
- `google/gemini-flash-1.5:free`

Paid models for better quality:
- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4o-mini`
- `openai/gpt-4o`

## Testing

Test your configuration:

```bash
node test-openrouter.js
```

This will verify your environment variables are set correctly and test a simple completion.

## Benefits

✅ **Reliability**: No single point of failure  
✅ **Rate Limiting**: Automatic handling of rate limits across keys  
✅ **Cost Optimization**: Mix free and paid models  
✅ **Performance**: Try fastest models first  
✅ **Monitoring**: Detailed logging of attempts and failures
