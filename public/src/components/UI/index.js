import React from 'react';
import styled from 'styled-components';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Umbrella } from 'lucide-react';

// Container components
export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f8fafc;
`;

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  gap: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Message components
export const MessageContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  align-items: flex-start;
  gap: 0.75rem;
`;

export const MessageBubble = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  max-width: 70%;
  background-color: ${props => props.isUser ? '#0ea5e9' : '#e2e8f0'};
  color: ${props => props.isUser ? 'white' : 'black'};
`;

export const Avatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: ${props => props.isUser ? '#0284c7' : '#94a3b8'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

// Input components
export const InputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
`;

export const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 1.5rem;
  border: 1px solid #cbd5e1;
  outline: none;
  font-size: 1rem;
  
  &:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
  }
`;

export const SendButton = styled.button`
  padding: 0.75rem;
  border-radius: 50%;
  background-color: #0ea5e9;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #0284c7;
  }
`;

// Weather card components
export const WeatherCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

export const WeatherHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const WeatherLocation = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
`;

export const WeatherDate = styled.span`
  font-size: 0.875rem;
  color: #64748b;
`;

export const WeatherInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const WeatherTemp = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
`;

export const WeatherDescription = styled.div`
  font-size: 1rem;
  color: #64748b;
`;

export const WeatherDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

export const WeatherDetail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
`;

// Weather icon components
export const WeatherIcon = ({ type, size = 24 }) => {
  const iconProps = { size, strokeWidth: 2 };
  
  switch (type.toLowerCase()) {
    case 'sunny':
      return <Sun {...iconProps} color="#f59e0b" />;
    case 'cloudy':
      return <Cloud {...iconProps} color="#64748b" />;
    case 'rainy':
      return <CloudRain {...iconProps} color="#0ea5e9" />;
    case 'windy':
      return <Wind {...iconProps} color="#64748b" />;
    default:
      return <Sun {...iconProps} color="#f59e0b" />;
  }
};

export const HumidityIcon = ({ size = 18 }) => <Droplets size={size} color="#0ea5e9" />;
export const WindIcon = ({ size = 18 }) => <Wind size={size} color="#64748b" />;
export const TempIcon = ({ size = 18 }) => <Thermometer size={size} color="#ef4444" />;
export const RainIcon = ({ size = 18 }) => <Umbrella size={size} color="#0ea5e9" />;