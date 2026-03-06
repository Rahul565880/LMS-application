// Test API Script
// Run this in your terminal to test the Hugging Face API directly

const API_ENDPOINT = 'https://rahul8073-openai-gpt-oss-20b.hf.space/gradio_api/call/respond';

async function testAPI() {
  console.log('🧪 Testing Hugging Face Spaces API...\n');
  
  const testData = {
    data: [
      "Hello! Can you help me with my studies?",  // User message
      "You are a friendly Chatbot.",              // System prompt
      512,                                         // Max tokens
      0.7,                                         // Temperature
      0.95                                         // Top-p
    ]
  };

  try {
    console.log('📤 Sending request...');
    console.log('Request:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('\n✅ Response received!\n');
    const data = await response.json();
    
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    // Extract the bot's reply
    if (data.data && data.data[0]) {
      console.log('\n🤖 Bot says:', data.data[0]);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Alternative curl command for terminal testing
const curlExample = `
# Test using curl:
curl -X POST https://rahul8073-openai-gpt-oss-20b.hf.space/gradio_api/call/respond \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": [
      "Hello! Can you help me with my studies?",
      "You are a friendly Chatbot.",
      512,
      0.7,
      0.95
    ]
  }'
`;

console.log(curlExample);

// Run the test
testAPI().catch(console.error);
