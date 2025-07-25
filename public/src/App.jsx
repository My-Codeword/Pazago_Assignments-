import React from 'react';
import ChatInterface from './components/Chat/ChatInterface';
import ThemeProvider from './hooks/useTheme';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <ChatInterface />
      </div>
    </ThemeProvider>
  );
}

export default App;