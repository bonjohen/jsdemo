/**
 * Theme definitions for the application
 */

export const THEMES = {
  default: {
    name: 'Default',
    colors: {
      primary: '#4a6fa5',
      secondary: '#166088',
      accent: '#4fc3f7',
      background: '#f5f5f5',
      text: '#333333',
      success: '#4caf50',
      error: '#f44336',
      gridTile: '#e0e0e0',
      gridTileActive: '#4fc3f7',
      gridTileSelected: '#2196f3',
      gridTileError: '#f44336'
    },
    fonts: {
      main: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      heading: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      monospace: "monospace"
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#1e3a5f',
      secondary: '#0d3b54',
      accent: '#0288d1',
      background: '#121212',
      text: '#e0e0e0',
      success: '#388e3c',
      error: '#d32f2f',
      gridTile: '#333333',
      gridTileActive: '#0288d1',
      gridTileSelected: '#1976d2',
      gridTileError: '#d32f2f'
    },
    fonts: {
      main: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      heading: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      monospace: "monospace"
    }
  },
  light: {
    name: 'Light',
    colors: {
      primary: '#5b8bd0',
      secondary: '#64b5f6',
      accent: '#82b1ff',
      background: '#ffffff',
      text: '#212121',
      success: '#66bb6a',
      error: '#ef5350',
      gridTile: '#f5f5f5',
      gridTileActive: '#82b1ff',
      gridTileSelected: '#64b5f6',
      gridTileError: '#ef5350'
    },
    fonts: {
      main: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      heading: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      monospace: "monospace"
    }
  },
  colorful: {
    name: 'Colorful',
    colors: {
      primary: '#673ab7',
      secondary: '#3f51b5',
      accent: '#00bcd4',
      background: '#f0f7ff',
      text: '#333333',
      success: '#8bc34a',
      error: '#ff5722',
      gridTile: '#e1f5fe',
      gridTileActive: '#00bcd4',
      gridTileSelected: '#009688',
      gridTileError: '#ff5722'
    },
    fonts: {
      main: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      heading: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      monospace: "monospace"
    }
  }
};

/**
 * Apply theme to document root
 * @param {string} themeName - Name of the theme to apply
 */
export const applyTheme = (themeName = 'default') => {
  const theme = THEMES[themeName] || THEMES.default;
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssKey}`, value);
  });
  
  // Apply fonts
  Object.entries(theme.fonts).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--font-${cssKey}`, value);
  });
  
  // Set theme name as data attribute for potential CSS selectors
  root.setAttribute('data-theme', themeName);
  
  return theme;
};
