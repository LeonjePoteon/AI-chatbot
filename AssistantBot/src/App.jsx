import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, RefreshCw, Settings, X } from 'lucide-react';

export default function ChatBot() {
  const nextIdRef = useRef(1);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: nextIdRef.current++,
      text: "Hello, I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! It's great to chat with you. What would you like to know?";
    } else if (lowerMessage.includes('how are you')) {
      return "I'm functioning well, thank you for asking! How can I assist you today?";
    } else if (lowerMessage.includes('name') || lowerMessage.includes('who are you')) {
      return "I'm an AI assistant created to help answer your questions and have conversations with you.";
    } else if (lowerMessage.includes('help')) {
      return "I'm here to help! You can ask me questions, have a conversation, or just chat. What do you need assistance with?";
    } else if (lowerMessage.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    } else if (lowerMessage.includes('date') || lowerMessage.includes('today')) {
      return `Today's date is ${new Date().toLocaleDateString()}.`;
    } else if (lowerMessage.includes('weather')) {
      return "I don't have access to real-time weather data, but you can check your local weather service!";
    } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Goodbye! Feel free to come back anytime you need assistance!";
    } else {
      const responses = [
        "That's an interesting question! Let me help you with that.",
        "I understand what you're asking. Here's what I think...",
        "Great question! Based on what you're asking, I'd say...",
        "I'm here to help with that. Let me provide some information.",
        "That's a good point. From my perspective...",
        "Interesting topic! I'd be happy to discuss that with you.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const generateRealAIResponse = async (userMessage) => {
    try {
      // Build conversation history
      const conversationHistory = messages
        .filter(msg => msg.sender !== 'system')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "AI Chatbot",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1-0528:free",
          "messages": conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('API Error:', error);
      return `⚠️ Error connecting to AI: ${error.message}`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const userMessageObj = {
      id: nextIdRef.current++,
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setInput('');
    setIsTyping(true);

    try {
      let responseText;
      if (apiKey) {
        responseText = await generateRealAIResponse(userMessage);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        responseText = generateResponse(userMessage);
      }
      
      const botMessageObj = {
        id: nextIdRef.current++,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessageObj]);
    } catch (error) {
      const errorMessageObj = {
        id: nextIdRef.current++,
        text: 'Sorry, something went wrong. Please try again',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    nextIdRef.current = 1;
    setMessages([
      {
        id: nextIdRef.current++,
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const resetChat = () => {
    nextIdRef.current = 1;
    setMessages([
      {
        id: nextIdRef.current++,
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    setInput('');
    setIsTyping(false);
  };

  const handleSaveApiKey = () => {
    setShowSettings(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
            <p className="text-sm text-gray-500">
              {apiKey ? '🟢 Connected to OpenRouter' : '🔵 Using built-in responses'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={resetChat}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset chat"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenRouter API Key (Optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Add your OpenRouter API key to use DeepSeek R1. Leave empty to use built-in responses.
                </p>
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                >
                  Get API key from OpenRouter →
                </a>
              </div>
              <button
                onClick={handleSaveApiKey}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'bot' ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              {msg.sender === 'bot' ? (
                <Bot className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`flex flex-col max-w-xs lg:max-w-md ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 ${
                  msg.sender === 'bot'
                    ? 'bg-white text-gray-800 shadow-md'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1 px-2">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}