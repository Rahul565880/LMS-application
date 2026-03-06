import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { CHATBOT_CONFIG, callChatbotAPISimple } from '../config/chatbotConfig';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: CHATBOT_CONFIG.WELCOME_MESSAGE, 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    console.log('💬 User typed:', inputValue);

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('📡 Calling API...');
      // Call the Hugging Face Spaces API
      const botResponse = await callChatbotAPISimple(inputValue, messages);
      
      console.log('🤖 Raw bot response:', botResponse);
      console.log('🤖 Response type:', typeof botResponse);
      console.log('🤖 Response length:', botResponse ? botResponse.length : 0);
      
      // Ensure we have a valid response
      const finalResponse = botResponse || "I apologize, but I couldn't generate a response. Please try again.";
      
      const botMessage = {
        id: messages.length + 2,
        text: finalResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      console.log('📝 Adding message to chat:', botMessage);
      setMessages(prev => [...prev, botMessage]);
      console.log('✅ Message added successfully!');
    } catch (error) {
      console.error('❌ Chatbot error:', error);
      console.error('❌ Error stack:', error.stack);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error: " + error.message + ". Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Request completed');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        { 
          id: 1, 
          text: "Chat cleared! How can I help you?", 
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
      localStorage.removeItem('chatHistory');
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-container ${isMinimized ? 'minimized' : ''}`}>
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <MessageCircle size={24} className="chat-icon" />
              <div>
                <h3>LearnFlow Assistant</h3>
                <span className="chat-status">
                  {isLoading ? 'Typing...' : 'Online'}
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button onClick={toggleMinimize} className="chat-btn-icon" title={isMinimized ? 'Maximize' : 'Minimize'}>
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button onClick={clearChat} className="chat-btn-icon" title="Clear chat">
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Messages */}
              <div className="chat-messages">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
                  >
                    <div className="message-avatar">
                      {message.sender === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="chat-message bot">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="chat-input-container">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="1"
                  className="chat-input"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="chat-send-btn"
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
