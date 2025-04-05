import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { THEMES, applyTheme } from '../utils/themes';
import { getGameSettings, saveGameSettings } from '../utils/storage';

// Create context
export const ThemeContext = createContext();

/**
 * ThemeProvider component for managing theme state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  
  // Load theme from settings on mount
  useEffect(() => {
    const settings = getGameSettings();
    if (settings && settings.theme && THEMES[settings.theme]) {
      setCurrentTheme(settings.theme);
    }
  }, []);
  
  // Apply theme when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);
  
  // Change theme and save to settings
  const changeTheme = (themeName) => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName);
      
      // Save to settings
      const settings = getGameSettings();
      saveGameSettings({
        ...settings,
        theme: themeName
      });
    }
  };
  
  // Context value
  const value = {
    currentTheme,
    changeTheme,
    themes: Object.keys(THEMES).map(key => ({
      id: key,
      name: THEMES[key].name
    }))
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Custom hook for using theme context
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
