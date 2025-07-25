import React, { useState } from 'react';
import { Send } from 'lucide-react';
import {
  AppContainer,
  ChatContainer,
  InputContainer,
  Input,
  SendButton,
  MessageContainer,
  MessageBubble,
  Avatar,
  WeatherIcon
} from './components/UI';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  
  // Sample suggestions for the welcome screen
  const suggestions = [
    { id: 1, text: "What's the weather in London?", icon: "thermometer" },
    { id: 2, text: "Will it rain tomorrow in New York?", icon: "rainy" },
    { id: 3, text: "Weather forecast for Paris", icon: "thermometer" },
    { id: 4, text: "Temperature in Tokyo today", icon: "thermometer" }
  ];

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    setMessages([...messages, { text: input, isUser: true }]);
    
    // Clear input
    setInput('');
    
    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `I'll check the weather information for "${input}" and get back to you shortly.`, 
        isUser: false 
      }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow line breaks with Shift+Enter
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.text);
    setMessages([...messages, { text: suggestion.text, isUser: true }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `I'll check the weather information for "${suggestion.text}" and get back to you shortly.`, 
        isUser: false 
      }]);
    }, 1000);
  };

  return (
    <AppContainer>
      <header className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold">Weather Chat</h1>
            <p className="text-sm text-gray-500">Ask me anything about weather worldwide</p>
          </div>
        </div>
      </header>
      
      <ChatContainer>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-indigo-500 rounded-full p-6 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Weather AI</h2>
            <p className="text-center text-gray-600 mb-8">
              Get instant weather information for any location worldwide.<br />
              Ask about current conditions, forecasts, or weather patterns.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 text-left"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-blue-500 mr-3">
                    <WeatherIcon type={suggestion.icon} />
                  </div>
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageContainer key={index} isUser={message.isUser}>
              <Avatar isUser={message.isUser}>
                {message.isUser ? 'U' : 'AI'}
              </Avatar>
              <MessageBubble isUser={message.isUser}>
                {message.text}
              </MessageBubble>
            </MessageContainer>
          ))
        )}
      </ChatContainer>
      
      <InputContainer>
        <Input
          type="text"
          placeholder="Ask about weather in any city..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <SendButton onClick={handleSendMessage}>
          <Send size={20} />
        </SendButton>
      </InputContainer>
      <div className="text-center text-xs text-gray-500 py-2">
        Press Enter to send • Shift+Enter for new line
      </div>
    </AppContainer>
  );
};

export default App;