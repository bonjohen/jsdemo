/**
 * Storage utility for saving and loading game data
 */

const STORAGE_KEYS = {
  HIGH_SCORES: 'neuromatch_high_scores',
  SETTINGS: 'neuromatch_settings',
  PLAYER_PROFILE: 'neuromatch_player',
  GAME_PROGRESS: 'neuromatch_progress'
};

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const saveToStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Load data from local storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Parsed data or default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Save high score to local storage
 * @param {Object} scoreData - Score data object
 * @param {number} scoreData.score - Score value
 * @param {string} scoreData.playerName - Player name
 * @param {number} scoreData.level - Level reached
 * @param {number} scoreData.gridSize - Grid size
 * @param {Date} scoreData.date - Date achieved
 */
export const saveHighScore = (scoreData) => {
  const highScores = loadFromStorage(STORAGE_KEYS.HIGH_SCORES, []);
  
  // Add new score with date if not provided
  const newScore = {
    ...scoreData,
    date: scoreData.date || new Date().toISOString()
  };
  
  // Add to high scores and sort by score (descending)
  highScores.push(newScore);
  highScores.sort((a, b) => b.score - a.score);
  
  // Keep only top 10 scores
  const topScores = highScores.slice(0, 10);
  
  saveToStorage(STORAGE_KEYS.HIGH_SCORES, topScores);
  return topScores;
};

/**
 * Get high scores from local storage
 * @returns {Array} - Array of high score objects
 */
export const getHighScores = () => {
  return loadFromStorage(STORAGE_KEYS.HIGH_SCORES, []);
};

/**
 * Save player profile to local storage
 * @param {Object} profileData - Player profile data
 */
export const savePlayerProfile = (profileData) => {
  saveToStorage(STORAGE_KEYS.PLAYER_PROFILE, profileData);
};

/**
 * Get player profile from local storage
 * @returns {Object|null} - Player profile or null if not found
 */
export const getPlayerProfile = () => {
  return loadFromStorage(STORAGE_KEYS.PLAYER_PROFILE, null);
};

/**
 * Save game settings to local storage
 * @param {Object} settings - Game settings object
 */
export const saveGameSettings = (settings) => {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};

/**
 * Get game settings from local storage
 * @returns {Object} - Game settings or default settings
 */
export const getGameSettings = () => {
  const defaultSettings = {
    volume: 0.7,
    musicEnabled: true,
    soundEffectsEnabled: true,
    difficulty: 'normal',
    theme: 'default'
  };
  
  return loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
};

/**
 * Save game progress to local storage
 * @param {Object} progressData - Game progress data
 */
export const saveGameProgress = (progressData) => {
  saveToStorage(STORAGE_KEYS.GAME_PROGRESS, progressData);
};

/**
 * Get game progress from local storage
 * @returns {Object|null} - Game progress or null if not found
 */
export const getGameProgress = () => {
  return loadFromStorage(STORAGE_KEYS.GAME_PROGRESS, null);
};
