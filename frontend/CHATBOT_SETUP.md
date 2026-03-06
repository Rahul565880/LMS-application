# Chatbot Integration Guide

## Overview
The chatbot is a floating assistant widget positioned at the bottom-right corner of every page. It provides real-time assistance to students using **Hugging Face Spaces AI**.

## ✨ Features
- 💬 Real-time chat interface with AI
- 🤖 Powered by OpenAI GPT model (20B)
- 🎨 Beautiful, modern UI with animations
- 💾 Chat history saved to localStorage
- 📱 Fully responsive design
- ⚙️ Gradio API integration
- 🔌 Support for conversation context

## 🚀 Current Setup

### ✅ API Already Configured!

Your chatbot is pre-configured with:
- **API Endpoint**: `https://rahul8073-openai-gpt-oss-20b.hf.space/gradio_api/call/respond`
- **Model**: OpenAI GPT-OSS-20B
- **System Prompt**: "You are a friendly Chatbot."
- **Parameters**:
  - Max Tokens: 512
  - Temperature: 0.7
  - Top-p: 0.95

### Configuration File
Location: `frontend/src/config/chatbotConfig.js`

```javascript
export const CHATBOT_CONFIG = {
  API_ENDPOINT: 'https://rahul8073-openai-gpt-oss-20b.hf.space/gradio_api/call/respond',
  SYSTEM_PROMPT: "You are a friendly Chatbot.",
  MAX_TOKENS: 512,
  TEMPERATURE: 0.7,
  TOP_P: 0.95,
  // ... more settings
};
```

## 📡 API Format

### Request Structure
The chatbot sends requests in Gradio format:

```json
POST /gradio_api/call/respond
{
  "data": [
    "User's message",           // Message text
    "You are a friendly Chatbot.", // System prompt
    512,                        // Max tokens
    0.7,                        // Temperature
    0.95                        // Top-p
  ]
}
```

### Response Structure
```json
{
  "data": [
    "Bot's response text"
  ],
  "event_id": "unique-event-id"
}
```

## 🧪 Testing Your Chatbot

### Step 1: Start Development Server
```bash
cd frontend
npm run dev
```

### Step 2: Open Your Application
Navigate to: `http://localhost:5173` (or your configured port)

### Step 3: Test the Chatbot
1. Click the chat icon in the bottom-right corner
2. Type a message like "Hello!" or "What can you do?"
3. Watch the AI respond in real-time!

## 🛠️ Customization Options

### Change Bot Personality
Edit the system prompt in `chatbotConfig.js`:

```javascript
SYSTEM_PROMPT: "You are a helpful learning assistant specialized in education.",
```

Other ideas:
- `"You are an expert programmer who loves teaching."`
- `"You are a friendly tutor who helps students learn."`
- `"You are a knowledgeable guide for online courses."`

### Adjust Response Parameters

**For longer responses:**
```javascript
MAX_TOKENS: 1024,  // Increase from 512
```

**For more creative responses:**
```javascript
TEMPERATURE: 0.9,  // Higher = more creative
```

**For more focused responses:**
```javascript
TEMPERATURE: 0.3,  // Lower = more focused
TOP_P: 0.8,        // Lower = more conservative
```

### Change Colors
Edit `frontend/src/components/Chatbot.css`:

```css
.chat-toggle {
  background: linear-gradient(135deg, #your-color 0%, #your-color-dark 100%);
}

.chat-header {
  background: linear-gradient(135deg, #your-color 0%, #your-color-dark 100%);
}
```

### Adjust Position & Size

```css
/* Toggle button position */
.chat-toggle {
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
}

/* Chat window position and size */
.chat-container {
  bottom: 100px;
  right: 24px;
  width: 380px;  /* Adjust width */
  height: 550px; /* Adjust height */
}
```

## 🎯 Current Features

### User Features:
- ✅ Open/close chat window
- ✅ Minimize/maximize chat
- ✅ Send messages with Enter key
- ✅ View message timestamps
- ✅ Clear chat history
- ✅ Persistent chat history (localStorage)
- ✅ Typing indicator animation

### Bot Features:
- ✅ AI-powered responses
- ✅ Context-aware conversations
- ✅ Error handling
- ✅ Loading states
- ✅ Timeout protection (60 seconds)
- ✅ Fallback messages on errors

## 🔧 Troubleshooting

### Chatbot not appearing?
1. Check that `ENABLED: true` in config
2. Verify App.jsx includes `<Chatbot />` component
3. Check browser console for errors
4. Make sure the development server is running

### API calls failing?
1. Check network tab in DevTools
2. Verify the Hugging Face space is accessible
3. Check for CORS errors
4. Test the API directly using curl:

```bash
curl -X POST https://rahul8073-openai-gpt-oss-20b.hf.space/gradio_api/call/respond \
  -H "Content-Type: application/json" \
  -d '{"data": ["Hello!", "You are a friendly Chatbot.", 512, 0.7, 0.95]}'
```

### Responses too slow?
- Reduce `MAX_TOKENS` to 256
- Decrease timeout if needed
- Check your internet connection

### Responses cut off?
- Increase `MAX_TOKENS` to 1024 or higher
- The bot might be hitting token limits

## 📊 Performance Tips

1. **Optimize Context**: The bot keeps last 10 messages for context
   - Reduce to 5 for faster responses
   - Increase to 20 for better continuity

2. **Balance Quality vs Speed**:
   - Lower temperature (0.3-0.5) = faster, more predictable
   - Higher temperature (0.7-0.9) = slower, more creative

3. **Token Management**:
   - Each message costs tokens
   - Shorter responses = lower latency

## 🔐 Security Notes

⚠️ **Important:**

1. This is a public Hugging Face Space - avoid sharing sensitive information
2. Rate limiting may apply based on HF Space policies
3. Consider deploying your own HF Space for production use
4. Monitor usage and implement user authentication if needed

## 🎓 Example Use Cases

### Student Support:
- Answer course-related questions
- Provide learning tips
- Explain complex concepts
- Suggest study resources

### Technical Help:
- Debug code issues
- Explain programming concepts
- Recommend best practices
- Guide through exercises

### General Assistance:
- Navigate the platform
- Find relevant courses
- Track progress tips
- Motivation and encouragement

## 📈 Next Steps

1. ✅ **Test the chatbot** - Try different questions
2. 🎨 **Customize appearance** - Match your brand colors
3. 🤖 **Fine-tune personality** - Adjust system prompt
4. ⚙️ **Optimize parameters** - Balance speed vs quality
5. 📊 **Monitor usage** - Check how students use it
6. 🔄 **Gather feedback** - Improve based on user input

## 🆘 Need Help?

### Check These Resources:
- **Browser Console**: For JavaScript errors
- **Network Tab**: For API call details
- **HF Space Status**: Check if the space is online
- **Gradio Docs**: https://www.gradio.app/docs/

### Common Issues:

**Issue**: "Request timed out"
- **Solution**: Increase TIMEOUT in config or reduce MAX_TOKENS

**Issue**: "No response from bot"
- **Solution**: Check HF Space status, verify API endpoint

**Issue**: "Weird responses"
- **Solution**: Adjust TEMPERATURE and SYSTEM_PROMPT

## 🎉 You're All Set!

Your AI chatbot is ready to help students! Just start your development server and click the chat icon in the bottom-right corner.

Happy chatting! 🚀
