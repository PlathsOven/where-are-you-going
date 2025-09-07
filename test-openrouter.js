// Test script to verify OpenRouter failover functionality
// Run with: node test-openrouter.js

const { createOpenRouterService } = require('./lib/openrouter.ts');

async function testOpenRouterService() {
  console.log('🧪 Testing OpenRouter Service with Failover...\n');

  try {
    // This will test reading environment variables
    const service = createOpenRouterService();
    console.log('✅ OpenRouter service created successfully');
    
    const configInfo = service.getConfigInfo();
    console.log(`📊 Configuration: ${configInfo.apiKeyCount} API keys × ${configInfo.modelCount} models = ${configInfo.totalCombinations} total combinations\n`);

    // Test a simple completion
    console.log('🔄 Testing completion generation...');
    const response = await service.generateCompletion({
      messages: [
        { role: 'user', content: 'Say "Hello, world!" and nothing else.' }
      ],
      temperature: 0.1,
      max_tokens: 50
    });

    console.log('✅ Completion generated successfully:');
    console.log('Response:', response.substring(0, 100) + (response.length > 100 ? '...' : ''));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n💡 Make sure you have set up your environment variables:');
    console.error('   OPENROUTER_API_KEYS=key1,key2,key3');
    console.error('   OPENROUTER_MODELS=model1,model2,model3');
    process.exit(1);
  }
}

testOpenRouterService();
