/**
 * Mock for next-themes — provides useTheme with controllable state.
 */
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light' as string | undefined,
  setTheme: (_theme: string) => {},
  resolvedTheme: 'light' as string | undefined,
  themes: ['light', 'dark'],
  systemTheme: 'light' as string | undefined,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme: theme,
        themes: ['light', 'dark'],
        systemTheme: 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
