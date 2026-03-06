// Simple API Test - Get Output Immediately
const API_ENDPOINT = 'https://rahul8073-openai-gpt-oss-20b.hf.space/gradio_api/call/respond';

async function getBotResponse(message) {
  console.log('🚀 Testing Chatbot API...\n');
  console.log('📤 Sending message:', message);
  
  const requestData = {
    data: [
      message,
      "You are a friendly Chatbot.",
      512,
      0.7,
      0.95
    ]
  };

  try {
    // Step 1: Get event ID
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('\n✅ Initial Response:', JSON.stringify(data, null, 2));

    // Check if we got direct response
    if (data.data && data.data[0]) {
      console.log('\n🤖 BOT ANSWER:', data.data[0]);
      return data.data[0];
    }

    // If we have event_id, try to stream
    if (data.event_id) {
      console.log('\n⏳ Streaming from event:', data.event_id);
      
      const streamUrl = `${API_ENDPOINT}/${data.event_id}`;
      const streamResp = await fetch(streamUrl);
      const streamText = await streamResp.text();
      
      console.log('\n📥 Stream Data:', streamText);
      
      // Try to parse SSE events
      const lines = streamText.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: null') {
          try {
            const sseData = JSON.parse(line.slice(6));
            if (sseData.data && sseData.data[0]) {
              console.log('\n🤖 BOT ANSWER:', sseData.data[0]);
              return sseData.data[0];
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return "No response data found";
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

// Run the test
getBotResponse("Hello! What is JavaScript?")
  .then(() => console.log('\n✅ Test complete!'))
  .catch(err => console.error('Test failed:', err));
