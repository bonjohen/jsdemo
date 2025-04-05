/**
 * Score Manager utility for calculating and tracking scores
 */

/**
 * Calculate score for a successful pattern match
 * @param {number} gridSize - Size of the grid (e.g., 3 for 3x3)
 * @param {number} patternLength - Number of tiles in the pattern
 * @param {number} timeBonus - Time bonus (0-1, where 1 is fastest)
 * @param {number} comboMultiplier - Combo multiplier for consecutive correct patterns
 * @returns {number} - Calculated score
 */
export const calculateScore = (gridSize, patternLength, timeBonus = 0, comboMultiplier = 1) => {
  // Base score: grid size squared × pattern length × 10
  const baseScore = Math.pow(gridSize, 2) * patternLength * 10;
  
  // Time bonus: up to 50% extra points for quick responses
  const timeBonusScore = baseScore * (timeBonus * 0.5);
  
  // Combo multiplier: increases score for consecutive correct patterns
  const comboScore = (baseScore + timeBonusScore) * comboMultiplier;
  
  return Math.round(comboScore);
};

/**
 * Calculate time bonus based on response time
 * @param {number} responseTime - Time taken to respond in milliseconds
 * @param {number} maxTime - Maximum allowed time in milliseconds
 * @returns {number} - Time bonus factor (0-1)
 */
export const calculateTimeBonus = (responseTime, maxTime) => {
  if (responseTime >= maxTime) return 0;
  
  // Inverse linear relationship: faster response = higher bonus
  const bonus = 1 - (responseTime / maxTime);
  return Math.max(0, Math.min(1, bonus));
};

/**
 * Calculate combo multiplier based on consecutive correct patterns
 * @param {number} consecutiveCorrect - Number of consecutive correct patterns
 * @returns {number} - Combo multiplier
 */
export const calculateComboMultiplier = (consecutiveCorrect) => {
  // Start at 1.0, add 0.1 for each consecutive correct pattern, max 2.0
  const multiplier = 1 + (Math.min(consecutiveCorrect, 10) * 0.1);
  return multiplier;
};

/**
 * Calculate penalty for incorrect pattern
 * @param {number} currentScore - Current score
 * @returns {number} - Score after penalty
 */
export const calculatePenalty = (currentScore) => {
  // Penalty: 10% of current score, minimum 50 points
  const penalty = Math.max(Math.round(currentScore * 0.1), 50);
  return Math.max(0, currentScore - penalty);
};

/**
 * Calculate level threshold for advancing to next level
 * @param {number} level - Current level
 * @returns {number} - Score threshold for next level
 */
export const calculateLevelThreshold = (level) => {
  // Base threshold is 1000, increases exponentially with level
  return Math.round(1000 * Math.pow(1.5, level - 1));
};

/**
 * Check if score qualifies for level up
 * @param {number} score - Current score
 * @param {number} level - Current level
 * @returns {boolean} - Whether score qualifies for level up
 */
export const checkLevelUp = (score, level) => {
  const threshold = calculateLevelThreshold(level);
  return score >= threshold;
};

/**
 * Calculate appropriate grid size based on level
 * @param {number} level - Current level
 * @returns {number} - Appropriate grid size
 */
export const calculateGridSize = (level) => {
  // Start with 3x3, increase every 3 levels, max 6x6
  const size = 3 + Math.floor((level - 1) / 3);
  return Math.min(size, 6);
};

/**
 * Calculate appropriate pattern length based on level
 * @param {number} level - Current level
 * @param {number} gridSize - Current grid size
 * @returns {number} - Appropriate pattern length
 */
export const calculatePatternLength = (level, gridSize) => {
  // Start with 3, increase by 1 every level, cap at 75% of total tiles
  const length = 2 + level;
  const maxLength = Math.floor(Math.pow(gridSize, 2) * 0.75);
  return Math.min(length, maxLength);
};

/**
 * Calculate appropriate pattern display time based on level
 * @param {number} level - Current level
 * @returns {number} - Pattern display time in milliseconds
 */
export const calculatePatternDisplayTime = (level) => {
  // Start with 1000ms, decrease by 50ms per level, minimum 300ms
  const time = 1000 - ((level - 1) * 50);
  return Math.max(time, 300);
};
