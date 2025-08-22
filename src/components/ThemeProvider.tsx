import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAdvancedTheme } from '@/hooks/useAdvancedTheme';
import { ThemeConfig, AccentTheme } from '@/types/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
  setAccent: (accent: AccentTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeHook = useAdvancedTheme();

  // Ensure theme is applied immediately on mount
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all existing theme classes
    root.classList.remove('light', 'dark');
    root.classList.remove('theme-default', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-rose');
    
    // Add current theme classes
    root.classList.add(themeHook.theme.mode);
    if (themeHook.theme.accent !== 'default') {
      root.classList.add(`theme-${themeHook.theme.accent}`);
    }
  }, [themeHook.theme]);

  return (
    <ThemeContext.Provider value={themeHook}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
