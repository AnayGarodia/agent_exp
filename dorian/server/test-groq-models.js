// Test script to verify Groq SDK models endpoint
require('dotenv').config();
const Groq = require('groq-sdk');

async function testGroqModels() {
  console.log(' Testing Groq SDK models.list()...\n');

  if (!process.env.GROQ_API_KEY) {
    console.error(' GROQ_API_KEY not found in environment');
    console.log(' Make sure .env file has GROQ_API_KEY set');
    process.exit(1);
  }

  console.log(' GROQ_API_KEY found');
  console.log(' Key:', process.env.GROQ_API_KEY.substring(0, 10) + '...\n');

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log(' Calling groq.models.list()...\n');

    const response = await groq.models.list();

    if (!response || !response.data) {
      console.error(' Invalid response from Groq API');
      console.log('Response:', response);
      process.exit(1);
    }

    console.log(` Success! Received ${response.data.length} models\n`);
    console.log(' Available Models:\n');

    const activeModels = response.data.filter(m => m.active !== false);
    const inactiveModels = response.data.filter(m => m.active === false);

    console.log(` ACTIVE MODELS (${activeModels.length}):`);
    activeModels.forEach(model => {
      console.log(`  ✓ ${model.id}`);
      console.log(`    - Context: ${model.context_window || 'unknown'}`);
      console.log(`    - Owner: ${model.owned_by || 'unknown'}\n`);
    });

    if (inactiveModels.length > 0) {
      console.log(` INACTIVE/DECOMMISSIONED MODELS (${inactiveModels.length}):`);
      inactiveModels.forEach(model => {
        console.log(`  ✗ ${model.id}`);
      });
    }

    console.log('\n Test completed successfully!');
    console.log(' The endpoint should return these active models to your frontend\n');

  } catch (error) {
    console.error('\n Error calling Groq SDK:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testGroqModels();
