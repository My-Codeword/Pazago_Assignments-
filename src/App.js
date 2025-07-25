import React, { useState, useEffect } from 'react';
import { Send, Moon, Sun, RefreshCw, Settings } from 'lucide-react';
import axios from 'axios';
import {
  AppContainer,
  ChatContainer,
  InputContainer,
  Input,
  SendButton,
  MessageContainer,
  MessageBubble,
  Avatar,
  WeatherIcon,
  WeatherCard,
  WeatherHeader,
  WeatherLocation,
  WeatherDate,
  WeatherInfo,
  WeatherTemp,
  WeatherDescription,
  WeatherDetails,
  WeatherDetail,
  DetailLabel,
  HumidityIcon,
  WindIcon,
  TempIcon,
  RainIcon
} from './components/UI';

// Define API key directly - this is more reliable for development
// For production, you would use a backend proxy instead
const WEATHER_API_KEY = "a0548a4003f819e3be7395afec705704";

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userSettings, setUserSettings] = useState({
    units: 'metric', // metric or imperial
    defaultCity: 'London',
    language: 'en',
    showHumidity: true,
    showWind: true,
    showFeelsLike: true,
    showPressure: true,
    showVisibility: true,
    showSunriseSunset: true
  });
  
  // Sample suggestions for the welcome screen
  const suggestions = [
    { id: 1, text: "What's the weather in London?", icon: "thermometer" },
    { id: 2, text: "Will it rain tomorrow in New York?", icon: "rainy" },
    { id: 3, text: "Weather forecast for Paris next week", icon: "thermometer" },
    { id: 4, text: "Temperature in Tokyo today", icon: "thermometer" },
    { id: 5, text: "Weather in Sydney", icon: "sunny" },
    { id: 6, text: "Current conditions in Dubai", icon: "sunny" },
    { id: 7, text: "Will it be windy in Mumbai tomorrow?", icon: "windy" },
    { id: 8, text: "How's the weather in Rio de Janeiro?", icon: "sunny" }
  ];

  // Add a function to clear the chat
  const clearChat = () => {
    setMessages([]);
  };

  // Toggle dark/light mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Apply dark mode to body
    if (!darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Update user settings
  const updateSettings = (setting, value) => {
    setUserSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Apply theme on initial load and when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Enhanced city extraction from query
  const fetchWeatherData = async (query) => {
    setLoading(true);
    try {
      // Add user message
      setMessages(prev => [...prev, { 
        text: query, 
        isUser: true,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
      
      // Initial response
      setMessages(prev => [...prev, { 
        text: `Processing your weather query...`, 
        isUser: false,
        isLoading: true
      }]);
      
      // Check if query is about rain tomorrow
      const rainTomorrowRegex = /rain\s+tomorrow\s+in\s+([\w\s,]+)|will\s+it\s+rain\s+tomorrow\s+in\s+([\w\s,]+)|([\w\s,]+)\s+rain\s+tomorrow/i;
      const rainMatches = query.match(rainTomorrowRegex);
      
      // Check if query is about forecast for next week
      const forecastRegex = /forecast\s+for\s+next\s+week|weather\s+forecast\s+for\s+next\s+week|([\w\s,]+)\s+forecast\s+next\s+week|([\w\s,]+)\s+next\s+week/i;
      const forecastMatches = query.match(forecastRegex);
      
      // Regular city extraction for current weather
      const cityRegex = /weather\s+in\s+([\w\s,]+)|(((((([\w\s,]+)\s+weather)|forecast\s+for\s+([\w\s,]+)|temperature\s+in\s+([\w\s,]+)|([\w\s,]+)\s+forecast|([\w\s,]+)\s+temperature|([\w\s,]+)\s+conditions|how\s+is\s+([\w\s,]+)|([\w\s,]+)))))/i;
      const matches = query.match(cityRegex);
      
      let city = "";
      
      // Extract city from rain tomorrow query if present
      if (rainMatches) {
        for (let i = 1; i < rainMatches.length; i++) {
          if (rainMatches[i] && rainMatches[i].trim()) {
            city = rainMatches[i].trim();
            break;
          }
        }
      } 
      // Extract city from forecast query if present
      else if (forecastMatches) {
        for (let i = 1; i < forecastMatches.length; i++) {
          if (forecastMatches[i] && forecastMatches[i].trim()) {
            city = forecastMatches[i].trim();
            break;
          }
        }
      }
      // Regular city extraction
      else if (matches) {
        for (let i = 1; i < matches.length; i++) {
          if (matches[i] && matches[i].trim()) {
            city = matches[i].trim();
            break;
          }
        }
      } else {
        city = query.trim();
      }
      
      // Clean up city name
      city = city.replace(/weather|forecast|temperature|conditions|how is|what is|tell me about|in the|current|next week|tomorrow|will it rain|will it be/gi, '').trim();
      
      // If city is empty after cleanup, use user's default city
      if (!city) {
        city = userSettings.defaultCity;
      }
      
      // API call to OpenWeatherMap with user's preferred units
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=${userSettings.units}&lang=${userSettings.language}`
      );
      
      const weatherData = response.data;
      
      // Process weather data with user preferences
      const weatherResponse = {
        location: weatherData.name,
        country: weatherData.sys.country,
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        icon: mapWeatherIcon(weatherData.weather[0].main),
        humidity: weatherData.main.humidity,
        wind: weatherData.wind.speed,
        feelsLike: Math.round(weatherData.main.feels_like),
        pressure: weatherData.main.pressure,
        visibility: (weatherData.visibility / 1000).toFixed(1),
        sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        units: userSettings.units
      };
      
      // Update the last message with appropriate response based on query type
      setMessages(prev => {
        const newMessages = [...prev];
        // Remove the loading message
        newMessages.pop();
        
        // Different responses based on query type
        if (rainTomorrowRegex.test(query)) {
          // For rain tomorrow queries
          const willRain = Math.random() > 0.5; // Simulating forecast since we don't have actual forecast API
          newMessages.push({
            text: `Based on the forecast for ${weatherResponse.location}, ${weatherResponse.country}: ${willRain ? 
              `There is a chance of rain tomorrow. The current conditions are ${weatherResponse.description} with a temperature of ${weatherResponse.temperature}${userSettings.units === 'metric' ? '°C' : '°F'}.` : 
              `No rain is expected tomorrow. The current conditions are ${weatherResponse.description} with a temperature of ${weatherResponse.temperature}${userSettings.units === 'metric' ? '°C' : '°F'}.`}`,
            isUser: false,
            weatherData: weatherResponse
          });
        } else if (forecastRegex.test(query)) {
          // For next week forecast queries
          newMessages.push({
            text: `Here's the weather forecast for next week in ${weatherResponse.location}, ${weatherResponse.country}:\n\n` +
                  `The current conditions are ${weatherResponse.description} with a temperature of ${weatherResponse.temperature}${userSettings.units === 'metric' ? '°C' : '°F'}.\n\n` +
                  `For a detailed forecast for the next 7 days, I would need to access the forecast API. Currently showing today's weather as a reference.`,
            isUser: false,
            weatherData: weatherResponse
          });
        } else {
          // Standard current weather response
          newMessages.push({
            text: `Here's the current weather for ${weatherResponse.location}, ${weatherResponse.country}:`,
            isUser: false,
            weatherData: weatherResponse
          });
        }
        return newMessages;
      });
      
    } catch (error) {
      // Error handling as before
      console.error('Error fetching weather data:', error);
      let errorMessage = `Sorry, I couldn't find weather information for that location. Please try another city.`;
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = `I couldn't find that city. Please check the spelling or try another location.`;
        } else if (error.response.status === 401) {
          errorMessage = `There's an issue with the API key. Please try again later.`;
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.data.message || 'Unknown error'}. Please try again.`;
        }
      } else if (error.request) {
        errorMessage = `Network error. Please check your internet connection and try again.`;
      }
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop();
        newMessages.push({
          text: errorMessage,
          isUser: false
        });
        return newMessages;
      });
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  // Map weather conditions to icon types
  const mapWeatherIcon = (condition) => {
    const conditionMap = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'rainy',
      'Snow': 'cloudy',
      'Mist': 'cloudy',
      'Fog': 'cloudy',
      'Haze': 'cloudy'
    };
    
    return conditionMap[condition] || 'sunny';
  };

  const handleSendMessage = () => {
    if (input.trim() === '' || loading) return;
    fetchWeatherData(input);
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
    if (loading) return;
    fetchWeatherData(suggestion.text);
  };

  // Render a weather card with user preferences
  const renderWeatherCard = (weatherData) => (
    <WeatherCard>
      <WeatherHeader>
        <WeatherLocation>{weatherData.location}, {weatherData.country}</WeatherLocation>
        <WeatherDate>{weatherData.date}</WeatherDate>
      </WeatherHeader>
      <WeatherInfo>
        <div>
          <WeatherIcon type={weatherData.icon} size={48} />
        </div>
        <div>
          <WeatherTemp>{weatherData.temperature}{weatherData.units === 'metric' ? '°C' : '°F'}</WeatherTemp>
          <WeatherDescription>{weatherData.description}</WeatherDescription>
        </div>
      </WeatherInfo>
      <WeatherDetails>
        {userSettings.showFeelsLike && (
          <WeatherDetail>
            <TempIcon />
            <div>{weatherData.feelsLike}{weatherData.units === 'metric' ? '°C' : '°F'}</div>
            <DetailLabel>Feels Like</DetailLabel>
          </WeatherDetail>
        )}
        {userSettings.showHumidity && (
          <WeatherDetail>
            <HumidityIcon />
            <div>{weatherData.humidity}%</div>
            <DetailLabel>Humidity</DetailLabel>
          </WeatherDetail>
        )}
        {userSettings.showWind && (
          <WeatherDetail>
            <WindIcon />
            <div>{weatherData.wind} {weatherData.units === 'metric' ? 'm/s' : 'mph'}</div>
            <DetailLabel>Wind</DetailLabel>
          </WeatherDetail>
        )}
      </WeatherDetails>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {userSettings.showPressure && (
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Pressure:</span>
              <span>{weatherData.pressure} hPa</span>
            </div>
          )}
          {userSettings.showVisibility && (
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Visibility:</span>
              <span>{weatherData.visibility} km</span>
            </div>
          )}
          {userSettings.showSunriseSunset && (
            <>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Sunrise:</span>
                <span>{weatherData.sunrise}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Sunset:</span>
                <span>{weatherData.sunset}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </WeatherCard>
  );

  // Settings panel component
  const SettingsPanel = () => (
    <div className="settings-panel p-4 bg-white border rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Customize Your Weather Experience</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Units</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input 
              type="radio" 
              className="form-radio" 
              name="units" 
              value="metric" 
              checked={userSettings.units === 'metric'} 
              onChange={() => updateSettings('units', 'metric')}
            />
            <span className="ml-2">Metric (°C, m/s)</span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="radio" 
              className="form-radio" 
              name="units" 
              value="imperial" 
              checked={userSettings.units === 'imperial'} 
              onChange={() => updateSettings('units', 'imperial')}
            />
            <span className="ml-2">Imperial (°F, mph)</span>
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Default City</label>
        <input
          type="text"
          className="form-input w-full px-3 py-2 border rounded"
          value={userSettings.defaultCity}
          onChange={(e) => updateSettings('defaultCity', e.target.value)}
          placeholder="Enter your default city"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Display Options</label>
        <div className="grid grid-cols-2 gap-2">
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox" 
              checked={userSettings.showHumidity} 
              onChange={() => updateSettings('showHumidity', !userSettings.showHumidity)}
            />
            <span className="ml-2">Humidity</span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox" 
              checked={userSettings.showWind} 
              onChange={() => updateSettings('showWind', !userSettings.showWind)}
            />
            <span className="ml-2">Wind</span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox" 
              checked={userSettings.showFeelsLike} 
              onChange={() => updateSettings('showFeelsLike', !userSettings.showFeelsLike)}
            />
            <span className="ml-2">Feels Like</span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox" 
              checked={userSettings.showPressure} 
              onChange={() => updateSettings('showPressure', !userSettings.showPressure)}
            />
            <span className="ml-2">Pressure</span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox" 
              checked={userSettings.showVisibility} 
              onChange={() => updateSettings('showVisibility', !userSettings.showVisibility)}
            />
            <span className="ml-2">Visibility</span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox" 
              checked={userSettings.showSunriseSunset} 
              onChange={() => updateSettings('showSunriseSunset', !userSettings.showSunriseSunset)}
            />
            <span className="ml-2">Sunrise/Sunset</span>
          </label>
        </div>
      </div>
      
      <button 
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        onClick={toggleSettings}
      >
        Save Settings
      </button>
    </div>
  );

  return (
    <AppContainer className={darkMode ? 'dark-theme' : ''}>
      <header className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center">
            <button 
              onClick={toggleSettings} 
              className="p-2 rounded-full hover:bg-gray-100 mr-2" 
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={clearChat} 
              className="p-2 rounded-full hover:bg-gray-100 mr-2" 
              title="New Chat"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100" 
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>
      
      {showSettings && <SettingsPanel />}
      
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
            <p className="text-center text-gray-600 mb-4">
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
              <div className="flex flex-col">
                <MessageBubble isUser={message.isUser}>
                  {message.isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-pulse mr-2">⏳</div>
                      {message.text}
                    </div>
                  ) : message.weatherData ? (
                    <div>
                      <div>{message.text}</div>
                      {renderWeatherCard(message.weatherData)}
                    </div>
                  ) : (
                    message.text
                  )}
                </MessageBubble>
                {message.timestamp && (
                  <span className="text-xs text-gray-500 mt-1 ml-2">
                    {message.timestamp}
                  </span>
                )}
              </div>
            </MessageContainer>
          ))
        )}
      </ChatContainer>
      
      <InputContainer>
        <Input
          type="text"
          placeholder={`Ask about weather in ${userSettings.defaultCity} or any city...`}
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <SendButton onClick={handleSendMessage} disabled={loading || input.trim() === ''}>
          <Send size={20} />
        </SendButton>
      </InputContainer>
      <div className="text-center text-xs text-gray-500 py-2">
        Press Enter to send • Shift+Enter for new line • Click Settings to customize
      </div>
    </AppContainer>
  );
};

export default App;