/**
 * Performance Optimizer utility for monitoring and optimizing game performance
 */

// Performance metrics
let metrics = {
  fps: 0,
  frameTime: 0,
  memoryUsage: 0,
  lastUpdate: 0,
  frameCount: 0,
  startTime: 0
};

// Performance mode settings
let performanceMode = 'auto'; // 'high', 'medium', 'low', 'auto'

// Animation frame request ID
let animationFrameId = null;

// Callbacks for performance mode changes
const modeChangeCallbacks = [];

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  metrics.startTime = performance.now();
  metrics.lastUpdate = metrics.startTime;
  metrics.frameCount = 0;
  
  // Start monitoring FPS
  monitorPerformance();
  
  // Detect device capabilities and set initial performance mode
  detectDeviceCapabilities();
  
  // Add event listeners for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Add event listener for online/offline status
  window.addEventListener('online', handleOnlineStatusChange);
  window.addEventListener('offline', handleOnlineStatusChange);
};

/**
 * Monitor performance metrics
 * @private
 */
const monitorPerformance = () => {
  const now = performance.now();
  metrics.frameCount++;
  
  // Update metrics every second
  if (now - metrics.lastUpdate >= 1000) {
    // Calculate FPS
    metrics.fps = Math.round((metrics.frameCount * 1000) / (now - metrics.lastUpdate));
    
    // Calculate average frame time
    metrics.frameTime = (now - metrics.lastUpdate) / metrics.frameCount;
    
    // Get memory usage if available
    if (performance.memory) {
      metrics.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    
    // Reset counters
    metrics.lastUpdate = now;
    metrics.frameCount = 0;
    
    // Adjust performance mode if in auto mode
    if (performanceMode === 'auto') {
      adjustPerformanceMode();
    }
  }
  
  // Continue monitoring
  animationFrameId = requestAnimationFrame(monitorPerformance);
};

/**
 * Detect device capabilities and set initial performance mode
 * @private
 */
const detectDeviceCapabilities = () => {
  // Check if running on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check for low-end devices
  const isLowEnd = isMobile && (
    // Check for low memory (if available)
    (performance.memory && performance.memory.jsHeapSizeLimit < 200 * 1024 * 1024) ||
    // Check for older iOS devices
    /iPhone OS [5-9]_/i.test(navigator.userAgent) ||
    // Check for older Android devices
    /Android [2-5]\./i.test(navigator.userAgent)
  );
  
  // Set initial performance mode based on device capabilities
  if (isLowEnd) {
    setPerformanceMode('low');
  } else if (isMobile) {
    setPerformanceMode('medium');
  } else {
    setPerformanceMode('high');
  }
};

/**
 * Adjust performance mode based on current metrics
 * @private
 */
const adjustPerformanceMode = () => {
  // If FPS is consistently low, reduce quality
  if (metrics.fps < 30) {
    if (performanceMode === 'high') {
      setPerformanceMode('medium');
    } else if (performanceMode === 'medium') {
      setPerformanceMode('low');
    }
  }
  // If FPS is consistently high and memory usage is reasonable, increase quality
  else if (metrics.fps > 55 && (!performance.memory || metrics.memoryUsage < 100)) {
    if (performanceMode === 'low') {
      setPerformanceMode('medium');
    } else if (performanceMode === 'medium') {
      setPerformanceMode('high');
    }
  }
};

/**
 * Handle visibility change events
 * @private
 */
const handleVisibilityChange = () => {
  if (document.hidden) {
    // Page is hidden, pause non-essential operations
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  } else {
    // Page is visible again, resume operations
    if (!animationFrameId) {
      monitorPerformance();
    }
  }
};

/**
 * Handle online/offline status changes
 * @private
 */
const handleOnlineStatusChange = () => {
  // Adjust performance based on network status
  if (navigator.onLine) {
    // Online - can use more resources if needed
    if (performanceMode === 'low') {
      setPerformanceMode('medium');
    }
  } else {
    // Offline - conserve resources
    if (performanceMode !== 'low') {
      setPerformanceMode('low');
    }
  }
};

/**
 * Set the performance mode
 * @param {string} mode - Performance mode ('high', 'medium', 'low', 'auto')
 */
export const setPerformanceMode = (mode) => {
  if (['high', 'medium', 'low', 'auto'].includes(mode) && mode !== performanceMode) {
    performanceMode = mode;
    
    // Notify callbacks about the mode change
    modeChangeCallbacks.forEach(callback => callback(mode));
  }
};

/**
 * Get the current performance mode
 * @returns {string} - Current performance mode
 */
export const getPerformanceMode = () => {
  return performanceMode;
};

/**
 * Get current performance metrics
 * @returns {Object} - Performance metrics
 */
export const getPerformanceMetrics = () => {
  return { ...metrics };
};

/**
 * Register a callback for performance mode changes
 * @param {Function} callback - Callback function
 */
export const onPerformanceModeChange = (callback) => {
  if (typeof callback === 'function' && !modeChangeCallbacks.includes(callback)) {
    modeChangeCallbacks.push(callback);
  }
};

/**
 * Unregister a callback for performance mode changes
 * @param {Function} callback - Callback function to remove
 */
export const offPerformanceModeChange = (callback) => {
  const index = modeChangeCallbacks.indexOf(callback);
  if (index !== -1) {
    modeChangeCallbacks.splice(index, 1);
  }
};

/**
 * Optimize an image for the current performance mode
 * @param {string} url - Image URL
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url) => {
  if (!url) return url;
  
  // Add quality parameter based on performance mode
  if (performanceMode === 'low') {
    return url.includes('?') ? `${url}&quality=low` : `${url}?quality=low`;
  } else if (performanceMode === 'medium') {
    return url.includes('?') ? `${url}&quality=medium` : `${url}?quality=medium`;
  }
  
  return url;
};

/**
 * Get animation settings optimized for current performance
 * @param {Object} defaultSettings - Default animation settings
 * @returns {Object} - Optimized animation settings
 */
export const getOptimizedAnimationSettings = (defaultSettings = {}) => {
  const settings = { ...defaultSettings };
  
  // Adjust settings based on performance mode
  switch (performanceMode) {
    case 'low':
      // Reduce particle count, duration, and complexity
      settings.particleCount = Math.floor((settings.particleCount || 20) * 0.3);
      settings.duration = Math.floor((settings.duration || 1000) * 0.7);
      settings.complexity = 'low';
      settings.enableBlur = false;
      settings.enableShadows = false;
      break;
    case 'medium':
      // Slightly reduce effects
      settings.particleCount = Math.floor((settings.particleCount || 20) * 0.7);
      settings.complexity = 'medium';
      settings.enableBlur = false;
      break;
    case 'high':
    default:
      // Use full effects
      settings.complexity = 'high';
      break;
  }
  
  return settings;
};

/**
 * Clean up performance monitoring
 */
export const cleanupPerformanceMonitoring = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('online', handleOnlineStatusChange);
  window.removeEventListener('offline', handleOnlineStatusChange);
  
  modeChangeCallbacks.length = 0;
};
