import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Bot, User, Loader2, AlertCircle, Sun, Cloud, CloudRain, RotateCcw, Moon, Menu, X, Thermometer, Droplets, Wind, Eye, Zap } from 'lucide-react';

const WeatherChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Replace with your actual college roll number
  const COLLEGE_ROLL_NUMBER = "YOUR_COLLEGE_ROLL_NUMBER";
  
  const API_ENDPOINT = "https://brief-thousands-sunset-9fcb1c78-485f-4967-ac04-2759a8fa1462.mastra.cloud/api/agents/weatherAgent/stream";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getWeatherIcon = (content) => {
    const text = content.toLowerCase();
    if (text.includes('rain') || text.includes('shower')) return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (text.includes('cloud') || text.includes('overcast')) return <Cloud className="w-5 h-5 text-gray-500" />;
    if (text.includes('sun') || text.includes('clear')) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (text.includes('storm')) return <Zap className="w-5 h-5 text-purple-500" />;
    return <Thermometer className="w-5 h-5 text-blue-500" />;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const requestBody = {
        messages: [{ role: "user", content: userMessage.content }],
        runId: "weatherAgent",
        maxRetries: 2,
        maxSteps: 5,
        temperature: 0.5,
        topP: 1,
        runtimeContext: {},
        threadId: COLLEGE_ROLL_NUMBER,
        resourceId: "weatherAgent"
      };

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'x-mastra-dev-playground': 'true'
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const agentMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, agentMessage]);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setMessages(prev => prev.map(msg => 
                  msg.id === agentMessage.id ? { ...msg, isStreaming: false } : msg
                ));
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  const content = parsed.choices[0].delta.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === agentMessage.id ? { ...msg, content: msg.content + content } : msg
                  ));
                }
              } catch (parseError) {
                if (data.trim() && !data.startsWith('{')) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === agentMessage.id ? { ...msg, content: msg.content + data } : msg
                  ));
                }
              }
            }
          }
        }
      } catch (streamError) {
        if (streamError.name !== 'AbortError') {
          setMessages(prev => prev.map(msg => 
            msg.id === agentMessage.id 
              ? { ...msg, content: msg.content || 'Sorry, I encountered an error.', isStreaming: false }
              : msg
          ));
        }
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        setError('Failed to send message. Please try again.');
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting. Please try again.',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  const suggestedQueries = [
    "What's the weather in London?",
    "Will it rain tomorrow in New York?",
    "Weather forecast for Paris",
    "Temperature in Tokyo today",
    "Is it sunny in Mumbai?",
    "Weather conditions in Sydney"
  ];

  const weatherStats = [
    { icon: <Thermometer className="w-4 h-4" />, label: "Temperature", value: "22°C" },
    { icon: <Droplets className="w-4 h-4" />, label: "Humidity", value: "65%" },
    { icon: <Wind className="w-4 h-4" />, label: "Wind", value: "12 km/h" },
    { icon: <Eye className="w-4 h-4" />, label: "Visibility", value: "10 km" }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className={`h-full ${
          isDarkMode ? 'bg-slate-800/95 backdrop-blur-xl border-r border-slate-700' : 'bg-white/95 backdrop-blur-xl border-r border-gray-200'
        } shadow-2xl`}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Weather AI
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Intelligent Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weather Stats */}
          <div className="p-6">
            <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Current Conditions
            </h3>
            <div className="space-y-3">
              {weatherStats.map((stat, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-600' : 'bg-white'}`}>
                      {React.cloneElement(stat.icon, { 
                        className: `w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}` 
                      })}
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      {stat.label}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6">
            <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={clearChat}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-slate-700/50 text-slate-300' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">Clear Conversation</span>
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-slate-700/50 text-slate-300' 
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="text-sm">
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-80 flex flex-col h-screen">
        {/* Header */}
        <header className={`${
          isDarkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-gray-200'
        } backdrop-blur-xl border-b px-4 py-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Weather Chat
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Ask me anything about weather worldwide
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Online
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className={`mx-auto w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg`}>
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome to Weather AI
                </h2>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'} mb-8 max-w-md mx-auto`}>
                  Get instant weather information for any location worldwide. Ask about current conditions, forecasts, or weather patterns.
                </p>
                
                {/* Suggested Queries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                  {suggestedQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(query)}
                      className={`p-4 rounded-xl text-left transition-all hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-700' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-slate-700' : 'bg-blue-50'
                        }`}>
                          {getWeatherIcon(query)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {query}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-start space-x-3">
                    {message.role === 'assistant' && (
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        message.isError 
                          ? 'bg-red-100 dark:bg-red-900/20' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}>
                        {message.isError ? (
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
                            : message.isError
                            ? `${isDarkMode ? 'bg-red-900/20 text-red-400 border border-red-800' : 'bg-red-50 text-red-800 border border-red-200'}`
                            : `${isDarkMode ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'bg-white text-gray-900 border border-gray-200'}`
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block ml-1 animate-pulse">▊</span>
                          )}
                        </div>
                      </div>
                      <div className={`text-xs mt-2 ${
                        isDarkMode ? 'text-slate-500' : 'text-gray-500'
                      } ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
                  } shadow-sm`}>
                    <div className="flex items-center space-x-2">
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
                        Weather AI is thinking
                      </span>
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 lg:px-6 pb-4">
            <div className="max-w-4xl mx-auto">
              <div className={`p-4 rounded-xl flex items-center space-x-3 ${
                isDarkMode ? 'bg-red-900/20 text-red-400 border border-red-800' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-sm underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`${
          isDarkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-gray-200'
        } backdrop-blur-xl border-t px-4 lg:px-6 py-4`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about weather in any city..."
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-2xl border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all max-h-32 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${isLoading ? 'opacity-50' : ''}`}
                  rows="1"
                  style={{
                    minHeight: '48px',
                    height: 'auto'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                title="Send message (Enter)"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className={`text-xs mt-2 text-center ${
              isDarkMode ? 'text-slate-500' : 'text-gray-500'
            }`}>
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherChatInterface;