/**
 * Browser Compatibility utility for detecting and handling browser-specific features
 */

// Browser detection results
let browserInfo = {
  name: '',
  version: '',
  os: '',
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  supportsTouch: false,
  supportsWebAudio: false,
  supportsWebGL: false,
  supportsLocalStorage: false,
  supportsOfflineMode: false
};

/**
 * Detect browser capabilities
 * @returns {Object} - Browser information and capabilities
 */
export const detectBrowserCapabilities = () => {
  // Detect browser and version
  const userAgent = navigator.userAgent;
  
  // Detect browser name and version
  if (userAgent.indexOf('Firefox') > -1) {
    browserInfo.name = 'Firefox';
    browserInfo.version = userAgent.match(/Firefox\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg/') > -1) {
    browserInfo.name = 'Edge';
    const match = userAgent.match(/Edge\/([0-9.]+)/) || userAgent.match(/Edg\/([0-9.]+)/);
    browserInfo.version = match ? match[1] : '';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browserInfo.name = 'Chrome';
    browserInfo.version = userAgent.match(/Chrome\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf('Safari') > -1) {
    browserInfo.name = 'Safari';
    browserInfo.version = userAgent.match(/Version\/([0-9.]+)/)[1];
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    browserInfo.name = 'Internet Explorer';
    const match = userAgent.match(/MSIE ([0-9.]+)/) || userAgent.match(/rv:([0-9.]+)/);
    browserInfo.version = match ? match[1] : '';
  } else {
    browserInfo.name = 'Unknown';
    browserInfo.version = '';
  }
  
  // Detect operating system
  if (userAgent.indexOf('Windows') > -1) {
    browserInfo.os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    browserInfo.os = 'MacOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    browserInfo.os = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    browserInfo.os = 'Android';
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    browserInfo.os = 'iOS';
  } else {
    browserInfo.os = 'Unknown';
  }
  
  // Detect device type
  browserInfo.isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  browserInfo.isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  browserInfo.isDesktop = !browserInfo.isMobile && !browserInfo.isTablet;
  
  // Detect touch support
  browserInfo.supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Detect Web Audio API support
  browserInfo.supportsWebAudio = !!(window.AudioContext || window.webkitAudioContext);
  
  // Detect WebGL support
  try {
    const canvas = document.createElement('canvas');
    browserInfo.supportsWebGL = !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    browserInfo.supportsWebGL = false;
  }
  
  // Detect localStorage support
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    browserInfo.supportsLocalStorage = true;
  } catch (e) {
    browserInfo.supportsLocalStorage = false;
  }
  
  // Detect offline mode support
  browserInfo.supportsOfflineMode = 'serviceWorker' in navigator;
  
  return { ...browserInfo };
};

/**
 * Check if the browser is supported
 * @returns {boolean} - Whether the browser is supported
 */
export const isBrowserSupported = () => {
  // Ensure browser detection has run
  if (!browserInfo.name) {
    detectBrowserCapabilities();
  }
  
  // Define minimum supported versions
  const minVersions = {
    'Chrome': 60,
    'Firefox': 60,
    'Safari': 11,
    'Edge': 16,
    'Internet Explorer': 11
  };
  
  // Check browser version
  if (browserInfo.name in minVersions) {
    const currentVersion = parseFloat(browserInfo.version);
    return currentVersion >= minVersions[browserInfo.name];
  }
  
  // Unknown browser, assume not supported
  return false;
};

/**
 * Get browser-specific CSS properties
 * @param {string} property - CSS property name
 * @returns {string} - Browser-specific CSS property
 */
export const getBrowserSpecificCSSProperty = (property) => {
  const prefix = getBrowserPrefix();
  
  if (prefix) {
    return `${prefix}${property.charAt(0).toUpperCase() + property.slice(1)}`;
  }
  
  return property;
};

/**
 * Get browser vendor prefix
 * @returns {string} - Browser vendor prefix
 * @private
 */
const getBrowserPrefix = () => {
  if (browserInfo.name === 'Firefox') {
    return 'moz';
  } else if (browserInfo.name === 'Safari' || browserInfo.name === 'Chrome') {
    return 'webkit';
  } else if (browserInfo.name === 'Internet Explorer' || browserInfo.name === 'Edge') {
    return 'ms';
  }
  
  return '';
};

/**
 * Apply browser-specific fixes to the application
 */
export const applyBrowserFixes = () => {
  // Ensure browser detection has run
  if (!browserInfo.name) {
    detectBrowserCapabilities();
  }
  
  // Add browser-specific classes to the body
  document.body.classList.add(`browser-${browserInfo.name.toLowerCase()}`);
  document.body.classList.add(`os-${browserInfo.os.toLowerCase()}`);
  
  if (browserInfo.isMobile) {
    document.body.classList.add('device-mobile');
  } else if (browserInfo.isTablet) {
    document.body.classList.add('device-tablet');
  } else {
    document.body.classList.add('device-desktop');
  }
  
  // Fix for Safari flexbox issues
  if (browserInfo.name === 'Safari') {
    const style = document.createElement('style');
    style.textContent = `
      .safari-flex-fix {
        display: -webkit-box;
        display: -webkit-flex;
        display: flex;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Fix for Internet Explorer grid issues
  if (browserInfo.name === 'Internet Explorer') {
    const style = document.createElement('style');
    style.textContent = `
      .grid-container {
        display: -ms-grid;
        -ms-grid-columns: repeat(var(--grid-size), 1fr);
        -ms-grid-rows: repeat(var(--grid-size), 1fr);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Fix for iOS audio issues
  if (browserInfo.os === 'iOS') {
    // iOS requires user interaction to play audio
    document.addEventListener('touchstart', function enableAudio() {
      // Create and play a silent audio element
      const audio = document.createElement('audio');
      audio.src = 'data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
      audio.play().catch(() => {
        // Ignore errors
      });
      document.removeEventListener('touchstart', enableAudio);
    });
  }
};

/**
 * Register a service worker for offline support
 * @param {string} swPath - Path to the service worker file
 * @returns {Promise} - Promise that resolves when the service worker is registered
 */
export const registerServiceWorker = (swPath) => {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        return registration;
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
        throw error;
      });
  }
  
  return Promise.reject(new Error('Service Worker not supported'));
};

/**
 * Check if the app is running in offline mode
 * @returns {boolean} - Whether the app is offline
 */
export const isOffline = () => {
  return !navigator.onLine;
};

/**
 * Add an offline mode indicator to the page
 */
export const addOfflineIndicator = () => {
  // Create offline indicator element if it doesn't exist
  if (!document.getElementById('offline-indicator')) {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.textContent = 'Offline Mode';
    indicator.style.display = 'none';
    indicator.style.position = 'fixed';
    indicator.style.top = '0';
    indicator.style.left = '50%';
    indicator.style.transform = 'translateX(-50%)';
    indicator.style.backgroundColor = '#f44336';
    indicator.style.color = 'white';
    indicator.style.padding = '5px 10px';
    indicator.style.borderRadius = '0 0 5px 5px';
    indicator.style.zIndex = '9999';
    indicator.style.fontWeight = 'bold';
    indicator.style.fontSize = '14px';
    
    document.body.appendChild(indicator);
    
    // Update indicator visibility based on online status
    const updateIndicator = () => {
      indicator.style.display = navigator.onLine ? 'none' : 'block';
    };
    
    // Set initial state
    updateIndicator();
    
    // Add event listeners for online/offline events
    window.addEventListener('online', updateIndicator);
    window.addEventListener('offline', updateIndicator);
  }
};
