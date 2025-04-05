/**
 * Feature flags to enable/disable specific features
 */

const FEATURE_FLAGS = {
  // AI Framework features
  AI_FRAMEWORK_ENABLED: false,
  
  // TensorFlow.js features
  TENSORFLOW_ENABLED: false,
  
  // Performance monitoring features
  PERFORMANCE_MONITORING_ENABLED: true,
  
  // Audio features
  AUDIO_ENABLED: true,
  
  // Visual effects features
  VISUAL_EFFECTS_ENABLED: true
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} - Whether the feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  return FEATURE_FLAGS[featureName] === true;
};

/**
 * Get all feature flags
 * @returns {Object} - All feature flags
 */
export const getAllFeatureFlags = () => {
  return { ...FEATURE_FLAGS };
};

export default FEATURE_FLAGS;
