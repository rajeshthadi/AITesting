/**
 * Test Ollama Connection - Phase 2: Link
 * Verifies that Ollama API is accessible and codellama model responds correctly
 */

const OLLAMA_API_URL = 'http://localhost:11434';
const MODEL_NAME = 'codellama:7b';

async function testOllamaConnection() {
    console.log('🔗 Testing Ollama Connection...\n');

    try {
        // Test 1: Check if Ollama is running
        console.log('Test 1: Checking Ollama API availability...');
        const healthResponse = await fetch(`${OLLAMA_API_URL}/api/tags`);

        if (!healthResponse.ok) {
            throw new Error(`Ollama API not responding: ${healthResponse.status}`);
        }

        const models = await healthResponse.json();
        console.log('✅ Ollama API is running');
        console.log(`   Available models: ${models.models.map(m => m.name).join(', ')}\n`);

        // Test 2: Verify codellama model exists
        console.log('Test 2: Verifying codellama model...');
        const hasCodellama = models.models.some(m => m.name.includes('codellama'));

        if (!hasCodellama) {
            throw new Error('codellama model not found. Please run: ollama pull codellama:7b');
        }

        console.log(`✅ codellama model found\n`);

        // Test 3: Test simple code generation
        console.log('Test 3: Testing code generation with codellama...');
        const testPrompt = 'Convert this Selenium code to Playwright: driver.get("https://example.com");';

        const generateResponse = await fetch(`${OLLAMA_API_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: testPrompt,
                stream: false,
                options: {
                    temperature: 0.2,
                    num_predict: 100
                }
            })
        });

        if (!generateResponse.ok) {
            throw new Error(`Code generation failed: ${generateResponse.status}`);
        }

        const result = await generateResponse.json();
        console.log('✅ Code generation successful');
        console.log(`   Prompt: "${testPrompt}"`);
        console.log(`   Response: "${result.response.substring(0, 100)}..."\n`);

        // Summary
        console.log('═══════════════════════════════════════');
        console.log('✅ ALL TESTS PASSED');
        console.log('═══════════════════════════════════════');
        console.log('Ollama Configuration:');
        console.log(`  • API URL: ${OLLAMA_API_URL}`);
        console.log(`  • Model: ${MODEL_NAME}`);
        console.log(`  • Status: READY ✓`);
        console.log('═══════════════════════════════════════\n');

        return true;

    } catch (error) {
        console.error('❌ CONNECTION TEST FAILED');
        console.error(`   Error: ${error.message}\n`);

        console.log('Troubleshooting:');
        console.log('  1. Ensure Ollama is running: ollama serve');
        console.log('  2. Verify codellama is installed: ollama list');
        console.log('  3. Pull codellama if needed: ollama pull codellama:7b\n');

        return false;
    }
}

// Run the test
testOllamaConnection()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
