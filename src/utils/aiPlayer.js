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
 * AI personality types that affect learning and behavior
 */
export const AI_PERSONALITY = {
  BALANCED: 'balanced',    // Learns evenly across all aspects
  ANALYTICAL: 'analytical', // Focuses on pattern recognition
  REACTIVE: 'reactive',    // Adapts quickly to player mistakes
  CONSISTENT: 'consistent', // Maintains steady performance
  AGGRESSIVE: 'aggressive'  // Takes more risks, higher variance
};

/**
 * AI Player class that simulates an opponent
 */
export class AIPlayer {
  constructor(difficulty = AI_DIFFICULTY.MEDIUM, personality = AI_PERSONALITY.BALANCED) {
    this.difficulty = difficulty;
    this.personality = personality;
    this.memoryAccuracy = this._getBaseAccuracyForDifficulty(difficulty);
    this.learningRate = this._getLearningRateForDifficulty(difficulty);
    this.patternHistory = [];
    this.playerMistakePatterns = {};
    this.playerSuccessPatterns = {};
    this.consecutiveCorrect = 0;
    this.totalAttempts = 0;
    this.correctAttempts = 0;
    this.responseTimeHistory = [];
    this.patternComplexityHistory = [];
    this.playerPerformanceByGridSize = {};
    this.playerPerformanceByPatternLength = {};
    this.personalityTraits = this._getPersonalityTraits(personality);
    this.adaptiveFactors = {
      patternRecognition: 1.0,
      spatialMemory: 1.0,
      sequenceMemory: 1.0,
      reactionSpeed: 1.0,
      errorRecovery: 1.0
    };
    this.learningProgress = 0;
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
   * Get personality traits for the given personality type
   * @param {string} personality - Personality type
   * @returns {Object} - Personality traits
   * @private
   */
  _getPersonalityTraits(personality) {
    // Base traits with balanced values
    const baseTraits = {
      patternRecognitionBonus: 0,    // Bonus for recognizing patterns
      riskTaking: 0,                // Willingness to take risks
      adaptationSpeed: 0,           // How quickly the AI adapts
      consistencyFactor: 0,         // How consistent the AI performs
      specialization: 0             // How specialized the AI becomes
    };

    // Adjust traits based on personality
    switch (personality) {
      case AI_PERSONALITY.ANALYTICAL:
        return {
          ...baseTraits,
          patternRecognitionBonus: 0.2,  // Better at recognizing patterns
          adaptationSpeed: -0.1,         // Slower to adapt
          specialization: 0.3            // Highly specialized
        };
      case AI_PERSONALITY.REACTIVE:
        return {
          ...baseTraits,
          adaptationSpeed: 0.3,          // Very quick to adapt
          consistencyFactor: -0.2,       // Less consistent
          riskTaking: 0.1                // Takes some risks
        };
      case AI_PERSONALITY.CONSISTENT:
        return {
          ...baseTraits,
          consistencyFactor: 0.3,        // Very consistent
          adaptationSpeed: -0.2,         // Slow to adapt
          riskTaking: -0.2               // Avoids risks
        };
      case AI_PERSONALITY.AGGRESSIVE:
        return {
          ...baseTraits,
          riskTaking: 0.3,               // Takes many risks
          consistencyFactor: -0.3,       // Very inconsistent
          adaptationSpeed: 0.2           // Quick to adapt
        };
      case AI_PERSONALITY.BALANCED:
      default:
        return baseTraits;              // Balanced across all traits
    }
  }

  /**
   * Attempt to memorize a pattern
   * @param {Array} pattern - Array of tile indices representing the pattern
   * @param {number} gridSize - Size of the grid
   * @param {number} level - Current game level
   * @param {number} responseTime - Player's response time in ms (optional)
   * @returns {Array} - Array of tile indices representing the AI's attempt
   */
  memorizePattern(pattern, gridSize, level, responseTime = null) {
    // Store the pattern in history
    this.patternHistory.push(pattern);

    // Store pattern complexity data
    this.patternComplexityHistory.push({
      length: pattern.length,
      gridSize,
      level
    });

    // Store response time if provided
    if (responseTime !== null) {
      this.responseTimeHistory.push(responseTime);
    }

    // Calculate effective accuracy based on multiple factors
    let effectiveAccuracy = this.memoryAccuracy;

    // 1. Adjust for level difficulty (higher levels are harder)
    effectiveAccuracy -= Math.min(0.3, (level - 1) * 0.02);

    // 2. Adjust for learning from repeated exposure
    const patternLength = pattern.length;
    const similarPatterns = this._countSimilarPatterns(pattern);
    const learningBonus = Math.min(0.2, similarPatterns * this.learningRate);
    effectiveAccuracy += learningBonus;

    // 3. Apply personality traits
    // Pattern recognition bonus
    effectiveAccuracy += this.personalityTraits.patternRecognitionBonus *
                        this.adaptiveFactors.patternRecognition;

    // Consistency factor - reduces variance in performance
    const consistencyEffect = this.personalityTraits.consistencyFactor * 0.1;
    if (consistencyEffect > 0) {
      // More consistent - closer to base accuracy
      effectiveAccuracy = this.memoryAccuracy +
                         (effectiveAccuracy - this.memoryAccuracy) * (1 - consistencyEffect);
    }

    // 4. Apply adaptive learning based on player performance
    // If we have data on this grid size, adjust accordingly
    if (this.playerPerformanceByGridSize[gridSize]) {
      const gridPerformance = this.playerPerformanceByGridSize[gridSize];
      // If player is good at this grid size, make AI better too
      if (gridPerformance > 0.7) {
        effectiveAccuracy += 0.05 * this.adaptiveFactors.spatialMemory;
      }
    }

    // If we have data on this pattern length, adjust accordingly
    if (this.playerPerformanceByPatternLength[patternLength]) {
      const lengthPerformance = this.playerPerformanceByPatternLength[patternLength];
      // If player is good at this pattern length, make AI better too
      if (lengthPerformance > 0.7) {
        effectiveAccuracy += 0.05 * this.adaptiveFactors.sequenceMemory;
      }
    }

    // 5. Risk-taking factor - can increase or decrease accuracy
    const riskEffect = this.personalityTraits.riskTaking * 0.2;
    if (riskEffect !== 0) {
      // Add some randomness based on risk-taking
      const riskFactor = (Math.random() - 0.5) * riskEffect;
      effectiveAccuracy += riskFactor;
    }

    // Ensure accuracy stays within bounds
    effectiveAccuracy = Math.max(0.1, Math.min(0.95, effectiveAccuracy));

    // Update learning progress
    this.learningProgress += learningBonus;

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
   * @param {Object} metadata - Additional metadata about the attempt
   * @param {number} metadata.gridSize - Size of the grid
   * @param {number} metadata.responseTime - Player's response time in ms
   * @param {number} metadata.level - Current game level
   */
  recordResult(isCorrect, pattern, playerAttempt, metadata = {}) {
    this.totalAttempts++;

    // Extract metadata
    const { gridSize, responseTime, level } = metadata;

    if (isCorrect) {
      this.correctAttempts++;
      this.consecutiveCorrect++;

      // Record player success patterns for learning
      if (pattern) {
        this._recordPlayerSuccess(pattern, responseTime);
      }

      // Update performance by grid size
      if (gridSize) {
        if (!this.playerPerformanceByGridSize[gridSize]) {
          this.playerPerformanceByGridSize[gridSize] = {
            correct: 0,
            total: 0,
            rate: 0
          };
        }

        this.playerPerformanceByGridSize[gridSize].correct++;
        this.playerPerformanceByGridSize[gridSize].total++;
        this.playerPerformanceByGridSize[gridSize].rate =
          this.playerPerformanceByGridSize[gridSize].correct /
          this.playerPerformanceByGridSize[gridSize].total;
      }

      // Update performance by pattern length
      if (pattern) {
        const patternLength = pattern.length;
        if (!this.playerPerformanceByPatternLength[patternLength]) {
          this.playerPerformanceByPatternLength[patternLength] = {
            correct: 0,
            total: 0,
            rate: 0
          };
        }

        this.playerPerformanceByPatternLength[patternLength].correct++;
        this.playerPerformanceByPatternLength[patternLength].total++;
        this.playerPerformanceByPatternLength[patternLength].rate =
          this.playerPerformanceByPatternLength[patternLength].correct /
          this.playerPerformanceByPatternLength[patternLength].total;
      }

      // Increase memory accuracy based on consecutive correct attempts and personality
      if (this.difficulty === AI_DIFFICULTY.ADAPTIVE) {
        // Apply adaptation speed from personality
        const adaptationMultiplier = 1 + this.personalityTraits.adaptationSpeed;

        this.memoryAccuracy = Math.min(
          0.95,
          this.memoryAccuracy + (0.01 * this.consecutiveCorrect * adaptationMultiplier)
        );

        // Update adaptive factors based on success
        this._updateAdaptiveFactors(true, pattern, responseTime);
      }
    } else {
      this.consecutiveCorrect = 0;

      // Record player mistakes for learning
      if (playerAttempt && pattern) {
        this._recordPlayerMistake(pattern, playerAttempt, responseTime);
      }

      // Update performance by grid size
      if (gridSize) {
        if (!this.playerPerformanceByGridSize[gridSize]) {
          this.playerPerformanceByGridSize[gridSize] = {
            correct: 0,
            total: 0,
            rate: 0
          };
        }

        this.playerPerformanceByGridSize[gridSize].total++;
        this.playerPerformanceByGridSize[gridSize].rate =
          this.playerPerformanceByGridSize[gridSize].correct /
          this.playerPerformanceByGridSize[gridSize].total;
      }

      // Update performance by pattern length
      if (pattern) {
        const patternLength = pattern.length;
        if (!this.playerPerformanceByPatternLength[patternLength]) {
          this.playerPerformanceByPatternLength[patternLength] = {
            correct: 0,
            total: 0,
            rate: 0
          };
        }

        this.playerPerformanceByPatternLength[patternLength].total++;
        this.playerPerformanceByPatternLength[patternLength].rate =
          this.playerPerformanceByPatternLength[patternLength].correct /
          this.playerPerformanceByPatternLength[patternLength].total;
      }

      // Decrease memory accuracy for adaptive difficulty
      if (this.difficulty === AI_DIFFICULTY.ADAPTIVE) {
        // Apply adaptation speed from personality
        const adaptationMultiplier = 1 + this.personalityTraits.adaptationSpeed;

        this.memoryAccuracy = Math.max(
          0.3,
          this.memoryAccuracy - (0.02 * adaptationMultiplier)
        );

        // Update adaptive factors based on failure
        this._updateAdaptiveFactors(false, pattern, responseTime);
      }
    }
  }

  /**
   * Record player mistakes for learning
   * @param {Array} pattern - The correct pattern
   * @param {Array} playerAttempt - The player's attempt
   * @param {number} responseTime - Player's response time in ms (optional)
   * @private
   */
  _recordPlayerMistake(pattern, playerAttempt, responseTime = null) {
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

    // Record pattern structure mistakes
    // This helps the AI learn about pattern types the player struggles with
    if (pattern.length > 2) {
      // Check for sequential vs. random patterns
      const isSequential = this._isSequentialPattern(pattern);
      if (isSequential) {
        this.adaptiveFactors.sequenceMemory = Math.min(
          1.5,
          this.adaptiveFactors.sequenceMemory + 0.05
        );
      }

      // Check for spatial patterns (clusters vs. spread out)
      const isClustered = this._isClusteredPattern(pattern);
      if (isClustered) {
        this.adaptiveFactors.spatialMemory = Math.min(
          1.5,
          this.adaptiveFactors.spatialMemory + 0.05
        );
      }
    }
  }

  /**
   * Record player successful patterns for learning
   * @param {Array} pattern - The correct pattern
   * @param {number} responseTime - Player's response time in ms (optional)
   * @private
   */
  _recordPlayerSuccess(pattern, responseTime = null) {
    // Record successful tiles
    pattern.forEach(tile => {
      this.playerSuccessPatterns[tile] = (this.playerSuccessPatterns[tile] || 0) + 1;
    });

    // Record response time if provided
    if (responseTime !== null) {
      // If the player is fast, improve AI's reaction speed
      const avgResponseTime = this._calculateAverageResponseTime();
      if (responseTime < avgResponseTime * 0.8) {
        this.adaptiveFactors.reactionSpeed = Math.min(
          1.5,
          this.adaptiveFactors.reactionSpeed + 0.05
        );
      }
    }
  }

  /**
   * Update adaptive factors based on game results
   * @param {boolean} success - Whether the attempt was successful
   * @param {Array} pattern - The pattern that was attempted
   * @param {number} responseTime - Response time in ms (optional)
   * @private
   */
  _updateAdaptiveFactors(success, pattern, responseTime = null) {
    // Apply specialization from personality traits
    const specializationFactor = this.personalityTraits.specialization;

    if (success) {
      // On success, increase factors that contributed to success
      if (pattern && this._isSequentialPattern(pattern)) {
        // Improve sequence memory more if the AI is specialized in it
        this.adaptiveFactors.sequenceMemory = Math.min(
          2.0,
          this.adaptiveFactors.sequenceMemory + (0.02 * (1 + specializationFactor))
        );
      }

      if (pattern && this._isClusteredPattern(pattern)) {
        // Improve spatial memory more if the AI is specialized in it
        this.adaptiveFactors.spatialMemory = Math.min(
          2.0,
          this.adaptiveFactors.spatialMemory + (0.02 * (1 + specializationFactor))
        );
      }

      // General pattern recognition improvement
      this.adaptiveFactors.patternRecognition = Math.min(
        2.0,
        this.adaptiveFactors.patternRecognition + 0.01
      );
    } else {
      // On failure, improve error recovery
      this.adaptiveFactors.errorRecovery = Math.min(
        2.0,
        this.adaptiveFactors.errorRecovery + 0.05
      );

      // Slightly decrease other factors to simulate focusing on weaknesses
      Object.keys(this.adaptiveFactors).forEach(factor => {
        if (factor !== 'errorRecovery') {
          this.adaptiveFactors[factor] = Math.max(
            0.5,
            this.adaptiveFactors[factor] - 0.01
          );
        }
      });
    }
  }

  /**
   * Check if a pattern is sequential (tiles in order)
   * @param {Array} pattern - Pattern to check
   * @returns {boolean} - Whether the pattern is sequential
   * @private
   */
  _isSequentialPattern(pattern) {
    // Check if the pattern has sequential elements
    let sequentialCount = 0;

    for (let i = 0; i < pattern.length - 1; i++) {
      // Check if current and next tiles are adjacent
      if (pattern[i] + 1 === pattern[i + 1] || pattern[i] - 1 === pattern[i + 1]) {
        sequentialCount++;
      }
    }

    // If more than half the transitions are sequential, consider it a sequential pattern
    return sequentialCount >= (pattern.length - 1) / 2;
  }

  /**
   * Check if a pattern is clustered (tiles close together)
   * @param {Array} pattern - Pattern to check
   * @returns {boolean} - Whether the pattern is clustered
   * @private
   */
  _isClusteredPattern(pattern) {
    // This is a simplified check that would need to be improved with actual grid coordinates
    // For now, we'll just check if the tile indices are close to each other
    let totalDistance = 0;
    let comparisons = 0;

    for (let i = 0; i < pattern.length; i++) {
      for (let j = i + 1; j < pattern.length; j++) {
        totalDistance += Math.abs(pattern[i] - pattern[j]);
        comparisons++;
      }
    }

    // Calculate average distance between tiles
    const avgDistance = totalDistance / comparisons;

    // If average distance is small, consider it clustered
    return avgDistance < 5; // This threshold would need to be adjusted based on grid size
  }

  /**
   * Calculate average response time from history
   * @returns {number} - Average response time in ms
   * @private
   */
  _calculateAverageResponseTime() {
    if (this.responseTimeHistory.length === 0) {
      return 2000; // Default if no history
    }

    const sum = this.responseTimeHistory.reduce((acc, time) => acc + time, 0);
    return sum / this.responseTimeHistory.length;
  }

  /**
   * Get the AI's current performance stats
   * @param {boolean} detailed - Whether to include detailed stats
   * @returns {Object} - Performance stats
   */
  getStats(detailed = false) {
    const baseStats = {
      difficulty: this.difficulty,
      personality: this.personality,
      memoryAccuracy: this.memoryAccuracy,
      learningRate: this.learningRate,
      totalAttempts: this.totalAttempts,
      correctAttempts: this.correctAttempts,
      successRate: this.totalAttempts > 0
        ? (this.correctAttempts / this.totalAttempts)
        : 0,
      learningProgress: this.learningProgress
    };

    if (!detailed) {
      return baseStats;
    }

    // Include detailed stats for advanced analysis
    return {
      ...baseStats,
      adaptiveFactors: { ...this.adaptiveFactors },
      personalityTraits: { ...this.personalityTraits },
      patternHistory: this.patternHistory.length,
      responseTimeHistory: this.responseTimeHistory.length > 0
        ? {
            average: this._calculateAverageResponseTime(),
            count: this.responseTimeHistory.length
          }
        : null,
      playerPerformance: {
        byGridSize: { ...this.playerPerformanceByGridSize },
        byPatternLength: { ...this.playerPerformanceByPatternLength }
      },
      mistakeAnalysis: {
        commonMistakes: this._getTopMistakes(5),
        mistakeCount: Object.keys(this.playerMistakePatterns).length
      },
      successAnalysis: {
        commonSuccesses: this._getTopSuccesses(5),
        successCount: Object.keys(this.playerSuccessPatterns).length
      }
    };
  }

  /**
   * Get the top N most common player mistakes
   * @param {number} count - Number of mistakes to return
   * @returns {Array} - Array of [tile, count] pairs
   * @private
   */
  _getTopMistakes(count = 5) {
    return Object.entries(this.playerMistakePatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([tile, count]) => ({ tile: parseInt(tile), count }));
  }

  /**
   * Get the top N most common player successes
   * @param {number} count - Number of successes to return
   * @returns {Array} - Array of [tile, count] pairs
   * @private
   */
  _getTopSuccesses(count = 5) {
    return Object.entries(this.playerSuccessPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([tile, count]) => ({ tile: parseInt(tile), count }));
  }

  /**
   * Adjust AI difficulty based on player performance
   * @param {number} playerSuccessRate - Player's success rate (0-1)
   * @param {Object} playerStats - Additional player statistics
   * @param {number} playerStats.averageResponseTime - Player's average response time
   * @param {number} playerStats.level - Player's current level
   * @param {number} playerStats.consecutiveCorrect - Player's consecutive correct answers
   */
  adjustDifficulty(playerSuccessRate, playerStats = {}) {
    if (this.difficulty !== AI_DIFFICULTY.ADAPTIVE) return;

    // Extract player stats with defaults
    const {
      averageResponseTime = 2000,
      level = 1,
      consecutiveCorrect = 0
    } = playerStats;

    // Apply adaptation speed from personality
    const adaptationMultiplier = 1 + this.personalityTraits.adaptationSpeed;

    // Base adjustment factors
    let accuracyAdjustment = 0;
    let learningRateAdjustment = 0;

    // 1. Adjust based on player success rate
    if (playerSuccessRate > 0.8) {
      // Player is doing very well, make AI more challenging
      accuracyAdjustment += 0.05;
      learningRateAdjustment += 0.01;
    } else if (playerSuccessRate < 0.4) {
      // Player is struggling, make AI easier
      accuracyAdjustment -= 0.05;
      learningRateAdjustment -= 0.01;
    }

    // 2. Adjust based on player response time
    const aiResponseTime = this._calculateAverageResponseTime();
    if (averageResponseTime < aiResponseTime * 0.7) {
      // Player is much faster than AI, make AI more challenging
      accuracyAdjustment += 0.03;
      this.adaptiveFactors.reactionSpeed = Math.min(
        2.0,
        this.adaptiveFactors.reactionSpeed + 0.05
      );
    } else if (averageResponseTime > aiResponseTime * 1.3) {
      // Player is much slower than AI, make AI easier
      accuracyAdjustment -= 0.02;
    }

    // 3. Adjust based on player level
    if (level > 5) {
      // Experienced player, make AI more challenging
      accuracyAdjustment += 0.01 * Math.min(10, level - 5);
      learningRateAdjustment += 0.002 * Math.min(10, level - 5);
    }

    // 4. Adjust based on player consecutive correct answers
    if (consecutiveCorrect > 3) {
      // Player is on a streak, make AI more challenging
      accuracyAdjustment += 0.01 * Math.min(5, consecutiveCorrect - 3);
    }

    // Apply personality-based adaptation multiplier
    accuracyAdjustment *= adaptationMultiplier;
    learningRateAdjustment *= adaptationMultiplier;

    // Apply adjustments with bounds
    this.memoryAccuracy = Math.max(0.3, Math.min(0.95, this.memoryAccuracy + accuracyAdjustment));
    this.learningRate = Math.max(0.01, Math.min(0.2, this.learningRate + learningRateAdjustment));

    // Update adaptive factors based on player performance trends
    this._updateAdaptiveFactorsFromTrends();
  }

  /**
   * Update adaptive factors based on player performance trends
   * @private
   */
  _updateAdaptiveFactorsFromTrends() {
    // Analyze grid size performance
    const gridSizes = Object.keys(this.playerPerformanceByGridSize).map(Number);
    if (gridSizes.length >= 2) {
      // Find grid sizes with highest and lowest performance
      gridSizes.sort((a, b) =>
        this.playerPerformanceByGridSize[b].rate -
        this.playerPerformanceByGridSize[a].rate
      );

      const bestGridSize = gridSizes[0];
      const worstGridSize = gridSizes[gridSizes.length - 1];

      // If there's a significant difference, adjust spatial memory factor
      const performanceDiff =
        this.playerPerformanceByGridSize[bestGridSize].rate -
        this.playerPerformanceByGridSize[worstGridSize].rate;

      if (performanceDiff > 0.3) {
        // Player is much better at certain grid sizes
        // Focus AI learning on the grid sizes player struggles with
        if (worstGridSize > bestGridSize) {
          // Player struggles with larger grids
          this.adaptiveFactors.spatialMemory = Math.min(
            2.0,
            this.adaptiveFactors.spatialMemory + 0.05
          );
        }
      }
    }

    // Analyze pattern length performance
    const patternLengths = Object.keys(this.playerPerformanceByPatternLength).map(Number);
    if (patternLengths.length >= 2) {
      // Find pattern lengths with highest and lowest performance
      patternLengths.sort((a, b) =>
        this.playerPerformanceByPatternLength[b].rate -
        this.playerPerformanceByPatternLength[a].rate
      );

      const bestLength = patternLengths[0];
      const worstLength = patternLengths[patternLengths.length - 1];

      // If there's a significant difference, adjust sequence memory factor
      const performanceDiff =
        this.playerPerformanceByPatternLength[bestLength].rate -
        this.playerPerformanceByPatternLength[worstLength].rate;

      if (performanceDiff > 0.3) {
        // Player is much better at certain pattern lengths
        // Focus AI learning on the pattern lengths player struggles with
        if (worstLength > bestLength) {
          // Player struggles with longer patterns
          this.adaptiveFactors.sequenceMemory = Math.min(
            2.0,
            this.adaptiveFactors.sequenceMemory + 0.05
          );
        }
      }
    }
  }

  /**
   * Generate a challenge pattern based on player's mistake patterns
   * @param {number} patternLength - Length of the pattern to generate
   * @param {number} gridSize - Size of the grid
   * @param {Object} options - Additional options
   * @param {string} options.patternType - Type of pattern to generate ('random', 'sequential', 'shape', 'adaptive')
   * @param {number} options.difficulty - Difficulty level (0-1)
   * @returns {Array} - Challenge pattern
   */
  generateChallengePattern(patternLength, gridSize, options = {}) {
    const totalTiles = gridSize * gridSize;
    const pattern = [];

    // Default options
    const {
      patternType = 'adaptive',
      difficulty = 0.5
    } = options;

    // Apply personality traits to pattern generation
    const riskFactor = this.personalityTraits.riskTaking;
    const usePlayerMistakes = Math.random() < (0.7 + riskFactor);

    // Determine pattern generation strategy based on type and personality
    if (patternType === 'adaptive' && usePlayerMistakes) {
      // Use adaptive pattern generation based on player performance

      // 1. Start with player mistake patterns if available
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

      // 2. If we still need more tiles, use player's weak pattern types
      if (pattern.length < patternLength) {
        // Check if player struggles more with sequential or clustered patterns
        const useSequential = this.adaptiveFactors.sequenceMemory > this.adaptiveFactors.spatialMemory;

        // Generate remaining tiles based on player's weakness
        const remainingLength = patternLength - pattern.length;
        let additionalTiles = [];

        if (useSequential) {
          // Generate sequential pattern
          const start = Math.floor(Math.random() * (totalTiles - remainingLength));
          additionalTiles = Array.from({ length: remainingLength }, (_, i) => start + i);
        } else {
          // Generate clustered pattern around a center point
          const centerRow = Math.floor(Math.random() * gridSize);
          const centerCol = Math.floor(Math.random() * gridSize);
          const center = centerRow * gridSize + centerCol;

          // Generate tiles around the center
          additionalTiles.push(center);

          // Add adjacent tiles
          const directions = [
            -gridSize,      // up
            -gridSize + 1,  // up-right
            1,             // right
            gridSize + 1,   // down-right
            gridSize,      // down
            gridSize - 1,   // down-left
            -1,            // left
            -gridSize - 1   // up-left
          ];

          // Shuffle directions for randomness
          this._shuffleArray(directions);

          // Add tiles in random directions until we have enough
          for (const dir of directions) {
            const newTile = center + dir;
            if (newTile >= 0 && newTile < totalTiles && !additionalTiles.includes(newTile)) {
              additionalTiles.push(newTile);
              if (additionalTiles.length >= remainingLength) break;
            }
          }
        }

        // Add the additional tiles to the pattern, avoiding duplicates
        for (const tile of additionalTiles) {
          if (!pattern.includes(tile) && tile < totalTiles) {
            pattern.push(tile);
            if (pattern.length >= patternLength) break;
          }
        }
      }
    } else if (patternType === 'sequential' || (patternType === 'adaptive' && this.adaptiveFactors.sequenceMemory > 1.2)) {
      // Generate sequential pattern
      const start = Math.floor(Math.random() * (totalTiles - patternLength));
      for (let i = 0; i < patternLength; i++) {
        pattern.push(start + i);
      }
    } else if (patternType === 'shape' || (patternType === 'adaptive' && this.adaptiveFactors.spatialMemory > 1.2)) {
      // Generate shape pattern (simplified as a cluster)
      const centerRow = Math.floor(Math.random() * gridSize);
      const centerCol = Math.floor(Math.random() * gridSize);
      const center = centerRow * gridSize + centerCol;

      // Start with the center tile
      pattern.push(center);

      // Add adjacent tiles in a shape-like pattern
      const directions = [
        -gridSize,      // up
        -gridSize + 1,  // up-right
        1,             // right
        gridSize + 1,   // down-right
        gridSize,      // down
        gridSize - 1,   // down-left
        -1,            // left
        -gridSize - 1   // up-left
      ];

      // Shuffle directions for randomness
      this._shuffleArray(directions);

      // Add tiles in random directions until we have enough
      for (const dir of directions) {
        const newTile = center + dir;
        if (newTile >= 0 && newTile < totalTiles && !pattern.includes(newTile)) {
          pattern.push(newTile);
          if (pattern.length >= patternLength) break;
        }
      }
    }

    // If we still don't have enough tiles, add random ones
    while (pattern.length < patternLength) {
      const randomTile = Math.floor(Math.random() * totalTiles);
      if (!pattern.includes(randomTile)) {
        pattern.push(randomTile);
      }
    }

    // Apply difficulty - potentially shuffle some tiles to make it harder
    if (difficulty > 0.5 && patternLength > 3) {
      const shuffleCount = Math.floor((difficulty - 0.5) * 4); // 0-2 shuffles based on difficulty
      for (let i = 0; i < shuffleCount; i++) {
        const idx1 = Math.floor(Math.random() * patternLength);
        const idx2 = Math.floor(Math.random() * patternLength);
        if (idx1 !== idx2) {
          [pattern[idx1], pattern[idx2]] = [pattern[idx2], pattern[idx1]];
        }
      }
    }

    return pattern;
  }
}
