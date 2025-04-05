/**
 * AI Player utility for simulating an opponent in the memory game
 */

/**
 * Difficulty levels for the AI
 */
export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  ADAPTIVE: 'adaptive'
};

/**
 * AI Player class that simulates an opponent
 */
export class AIPlayer {
  constructor(difficulty = AI_DIFFICULTY.MEDIUM) {
    this.difficulty = difficulty;
    this.memoryAccuracy = this._getBaseAccuracyForDifficulty(difficulty);
    this.learningRate = this._getLearningRateForDifficulty(difficulty);
    this.patternHistory = [];
    this.playerMistakePatterns = {};
    this.consecutiveCorrect = 0;
    this.totalAttempts = 0;
    this.correctAttempts = 0;
  }

  /**
   * Get base memory accuracy for the given difficulty
   * @param {string} difficulty - Difficulty level
   * @returns {number} - Base memory accuracy (0-1)
   * @private
   */
  _getBaseAccuracyForDifficulty(difficulty) {
    switch (difficulty) {
      case AI_DIFFICULTY.EASY:
        return 0.5; // 50% accuracy
      case AI_DIFFICULTY.MEDIUM:
        return 0.7; // 70% accuracy
      case AI_DIFFICULTY.HARD:
        return 0.9; // 90% accuracy
      case AI_DIFFICULTY.ADAPTIVE:
        return 0.6; // Starts at 60%, will adapt based on player performance
      default:
        return 0.7;
    }
  }

  /**
   * Get learning rate for the given difficulty
   * @param {string} difficulty - Difficulty level
   * @returns {number} - Learning rate (0-1)
   * @private
   */
  _getLearningRateForDifficulty(difficulty) {
    switch (difficulty) {
      case AI_DIFFICULTY.EASY:
        return 0.01; // Very slow learning
      case AI_DIFFICULTY.MEDIUM:
        return 0.05; // Moderate learning
      case AI_DIFFICULTY.HARD:
        return 0.1; // Fast learning
      case AI_DIFFICULTY.ADAPTIVE:
        return 0.08; // Adaptive learning
      default:
        return 0.05;
    }
  }

  /**
   * Attempt to memorize a pattern
   * @param {Array} pattern - Array of tile indices representing the pattern
   * @param {number} gridSize - Size of the grid
   * @param {number} level - Current game level
   * @returns {Array} - Array of tile indices representing the AI's attempt
   */
  memorizePattern(pattern, gridSize, level) {
    // Store the pattern in history
    this.patternHistory.push(pattern);
    
    // Calculate effective accuracy based on difficulty, level, and learning
    let effectiveAccuracy = this.memoryAccuracy;
    
    // Adjust for level difficulty (higher levels are harder)
    effectiveAccuracy -= Math.min(0.3, (level - 1) * 0.02);
    
    // Adjust for learning from repeated exposure
    const patternLength = pattern.length;
    const similarPatterns = this._countSimilarPatterns(pattern);
    effectiveAccuracy += Math.min(0.2, similarPatterns * this.learningRate);
    
    // Ensure accuracy stays within bounds
    effectiveAccuracy = Math.max(0.1, Math.min(0.95, effectiveAccuracy));
    
    // Generate AI's attempt based on effective accuracy
    return this._generateAttempt(pattern, gridSize, effectiveAccuracy);
  }

  /**
   * Count similar patterns in history
   * @param {Array} pattern - Current pattern
   * @returns {number} - Number of similar patterns found
   * @private
   */
  _countSimilarPatterns(pattern) {
    let count = 0;
    
    for (const historicPattern of this.patternHistory) {
      // Skip the current pattern
      if (historicPattern === pattern) continue;
      
      // Count common tiles
      const commonTiles = historicPattern.filter(tile => pattern.includes(tile));
      
      // If more than half the tiles are common, consider it similar
      if (commonTiles.length >= pattern.length / 2) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Generate an attempt based on the pattern and accuracy
   * @param {Array} pattern - Target pattern
   * @param {number} gridSize - Size of the grid
   * @param {number} accuracy - Accuracy of the AI (0-1)
   * @returns {Array} - AI's attempt
   * @private
   */
  _generateAttempt(pattern, gridSize, accuracy) {
    const attempt = [];
    const totalTiles = gridSize * gridSize;
    
    // For each tile in the pattern, decide whether to remember it correctly
    for (const tile of pattern) {
      if (Math.random() < accuracy) {
        // Correctly remember this tile
        attempt.push(tile);
      }
    }
    
    // If the AI didn't remember all tiles, add some random incorrect ones
    // to match the pattern length
    while (attempt.length < pattern.length) {
      // Generate a random tile that's not already in the attempt
      // and preferably not in the pattern (to simulate mistakes)
      let randomTile;
      do {
        randomTile = Math.floor(Math.random() * totalTiles);
      } while (
        attempt.includes(randomTile) || 
        (Math.random() < 0.7 && pattern.includes(randomTile))
      );
      
      attempt.push(randomTile);
    }
    
    // Shuffle the attempt to make it more realistic
    return this._shuffleArray([...attempt]);
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param {Array} array - Array to shuffle
   * @returns {Array} - Shuffled array
   * @private
   */
  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Record the result of an attempt
   * @param {boolean} isCorrect - Whether the attempt was correct
   * @param {Array} pattern - The pattern that was attempted
   * @param {Array} playerAttempt - The player's attempt
   */
  recordResult(isCorrect, pattern, playerAttempt) {
    this.totalAttempts++;
    
    if (isCorrect) {
      this.correctAttempts++;
      this.consecutiveCorrect++;
      
      // Increase memory accuracy slightly for consecutive correct attempts
      if (this.difficulty === AI_DIFFICULTY.ADAPTIVE) {
        this.memoryAccuracy = Math.min(
          0.95,
          this.memoryAccuracy + (0.01 * this.consecutiveCorrect)
        );
      }
    } else {
      this.consecutiveCorrect = 0;
      
      // Record player mistakes for learning
      if (playerAttempt && pattern) {
        this._recordPlayerMistake(pattern, playerAttempt);
      }
      
      // Decrease memory accuracy slightly for adaptive difficulty
      if (this.difficulty === AI_DIFFICULTY.ADAPTIVE) {
        this.memoryAccuracy = Math.max(
          0.3,
          this.memoryAccuracy - 0.02
        );
      }
    }
  }

  /**
   * Record player mistakes for learning
   * @param {Array} pattern - The correct pattern
   * @param {Array} playerAttempt - The player's attempt
   * @private
   */
  _recordPlayerMistake(pattern, playerAttempt) {
    // Find tiles that the player missed
    const missedTiles = pattern.filter(tile => !playerAttempt.includes(tile));
    
    // Find tiles that the player incorrectly selected
    const incorrectTiles = playerAttempt.filter(tile => !pattern.includes(tile));
    
    // Record these mistakes
    missedTiles.forEach(tile => {
      this.playerMistakePatterns[tile] = (this.playerMistakePatterns[tile] || 0) + 1;
    });
    
    incorrectTiles.forEach(tile => {
      this.playerMistakePatterns[tile] = (this.playerMistakePatterns[tile] || 0) + 1;
    });
  }

  /**
   * Get the AI's current performance stats
   * @returns {Object} - Performance stats
   */
  getStats() {
    return {
      difficulty: this.difficulty,
      memoryAccuracy: this.memoryAccuracy,
      learningRate: this.learningRate,
      totalAttempts: this.totalAttempts,
      correctAttempts: this.correctAttempts,
      successRate: this.totalAttempts > 0 
        ? (this.correctAttempts / this.totalAttempts) 
        : 0
    };
  }

  /**
   * Adjust AI difficulty based on player performance
   * @param {number} playerSuccessRate - Player's success rate (0-1)
   */
  adjustDifficulty(playerSuccessRate) {
    if (this.difficulty !== AI_DIFFICULTY.ADAPTIVE) return;
    
    // If player is doing very well, make AI more challenging
    if (playerSuccessRate > 0.8) {
      this.memoryAccuracy = Math.min(0.95, this.memoryAccuracy + 0.05);
      this.learningRate = Math.min(0.15, this.learningRate + 0.01);
    }
    // If player is struggling, make AI easier
    else if (playerSuccessRate < 0.4) {
      this.memoryAccuracy = Math.max(0.3, this.memoryAccuracy - 0.05);
      this.learningRate = Math.max(0.01, this.learningRate - 0.01);
    }
  }

  /**
   * Generate a challenge pattern based on player's mistake patterns
   * @param {number} patternLength - Length of the pattern to generate
   * @param {number} gridSize - Size of the grid
   * @returns {Array} - Challenge pattern
   */
  generateChallengePattern(patternLength, gridSize) {
    const totalTiles = gridSize * gridSize;
    const pattern = [];
    
    // If we have recorded player mistakes, use them to create a challenging pattern
    if (Object.keys(this.playerMistakePatterns).length > 0) {
      // Sort tiles by mistake frequency (descending)
      const sortedTiles = Object.entries(this.playerMistakePatterns)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]));
      
      // Use the most frequently mistaken tiles first
      for (const tile of sortedTiles) {
        if (pattern.length < patternLength && tile < totalTiles) {
          pattern.push(tile);
        }
        
        if (pattern.length >= patternLength) break;
      }
    }
    
    // If we don't have enough tiles from mistakes, add random ones
    while (pattern.length < patternLength) {
      const randomTile = Math.floor(Math.random() * totalTiles);
      if (!pattern.includes(randomTile)) {
        pattern.push(randomTile);
      }
    }
    
    return pattern;
  }
}
