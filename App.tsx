
import React, { useState, useEffect, useMemo } from 'react';
import ChatLayout from './components/ChatLayout';
import { ThemeContext, Theme } from './contexts/ThemeContext';

function App() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('chatzone-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('chatzone-theme', theme);
  }, [theme]);
  
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="antialiased text-light-text dark:text-dark-text">
        <ChatLayout />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
