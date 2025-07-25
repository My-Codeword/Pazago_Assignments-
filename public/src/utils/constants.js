// API Configuration
export const API_CONFIG = {
  ENDPOINT: "https://brief-thousands-sunset-9fcb1c78-485f-4967-ac04-2759a8fa1462.mastra.cloud/api/agents/weatherAgent/stream",
  HEADERS: {
    'Accept': '*/*',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'x-mastra-dev-playground': 'true'
  },
  DEFAULT_PARAMS: {
    runId: "weatherAgent",
    maxRetries: 2,
    maxSteps: 5,
    temperature: 0.5,
    topP: 1,
    runtimeContext: {},
    resourceId: "weatherAgent"
  }
};

// Replace with your actual college roll number
export const COLLEGE_ROLL_NUMBER = "YOUR_COLLEGE_ROLL_NUMBER";

// UI Constants
export const THEME = {
  DARK: 'dark',
  LIGHT: 'light'
};

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant'
};

export const SUGGESTED_MESSAGES = [
  "What's the weather in London?",
  "Will it rain tomorrow in New York?",
  "Weather forecast for Paris this week",
  "Temperature in Tokyo today",
  "Is it sunny in Los Angeles?",
  "Weather conditions in Mumbai"
];

export const WEATHER_STATS = [
  { 
    id: 'temperature',
    label: 'Temperature', 
    value: '22°C', 
    icon: 'thermometer',
    color: 'text-orange-500'
  },
  { 
    id: 'humidity',
    label: 'Humidity', 
    value: '65%', 
    icon: 'droplets',
    color: 'text-blue-500'
  },
  { 
    id: 'wind',
    label: 'Wind', 
    value: '12 km/h', 
    icon: 'wind',
    color: 'text-gray-500'
  },
  { 
    id: 'visibility',
    