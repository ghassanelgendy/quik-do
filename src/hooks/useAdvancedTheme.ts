import { useState, useEffect } from 'react';
import { ThemeConfig, AccentTheme } from '@/types/theme';

export const useAdvancedTheme = () => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem('theme-config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing theme config:', error);
      }
    }
    
    // Default theme configuration
    return {
      mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      accent: 'default' as AccentTheme,
    };
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all existing theme classes
    root.classList.remove('light', 'dark');
    root.classList.remove('theme-default', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-rose');
    
    // Add current theme classes
    root.classList.add(theme.mode);
    if (theme.accent !== 'default') {
      root.classList.add(`theme-${theme.accent}`);
    }
    
    // Save to localStorage
    localStorage.setItem('theme-config', JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const toggleMode = () => {
    updateTheme({ mode: theme.mode === 'light' ? 'dark' : 'light' });
  };

  const setAccent = (accent: AccentTheme) => {
    updateTheme({ accent });
  };

  return {
    theme,
    updateTheme,
    toggleMode,
    setAccent,
  };
};