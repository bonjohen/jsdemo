import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import PropTypes from 'prop-types';
import Grid from './Grid';
import { generatePattern } from '../utils/patternGenerator';
import {
  calculateComboMultiplier,
  calculatePenalty,
  calculateGridSize,
  calculatePatternLength,
  calculatePatternDisplayTime
} from '../utils/scoreManager';
import { saveHighScore, saveGameProgress } from '../utils/storage';
import { isFeatureEnabled } from '../utils/featureFlags';
import { playSound } from '../utils/audioManager';
import { createParticleEffect } from '../utils/visualEffects';
import '../styles/GameController.css';

// Lazy load the ModelTraining component
const ModelTraining = React.lazy(() => {
  if (isFeatureEnabled('TENSORFLOW_ENABLED')) {
    return import('./ModelTraining').catch(() => {
      console.warn('ModelTraining component could not be loaded');
      return { default: () => null };
    });
  } else {
    return Promise.resolve({ default: () => null });
  }
});

// Create a safe version of addTrainingData that won't crash if TensorFlow.js isn't available
const addTrainingData = (data) => {
  // Only import and use TensorFlow.js if it's actually needed and enabled
  if (isFeatureEnabled('TENSORFLOW_ENABLED')) {
    import('../utils/tfModel')
      .then(module => {
        module.addTrainingData(data);
      })
      .catch(error => {
        console.warn('TensorFlow.js module could not be loaded:', error);
      });
  }
};

/**
 * GameController component that manages the game state and logic
 * @param {Object} props - Component props
 * @param {number} props.initialGridSize - Initial grid size (e.g., 3 for a 3x3 grid)
 * @param {number} props.initialPatternLength - Initial number of tiles in the pattern
 * @param {number} props.patternDisplayTime - Time in ms to display the pattern
 * @param {Function} props.onGameComplete - Callback when game is completed
 * @param {Function} props.onScoreChange - Callback when score changes
 * @param {string} props.playerName - Player name for high score
 * @param {number} props.timeLimit - Time limit in ms (null for no limit)
 * @param {number} props.lives - Number of lives (Infinity for unlimited)
 * @param {string} props.gameMode - Current game mode
 * @param {boolean} props.highContrast - Whether to use high contrast mode
 */
const GameController = ({
  initialGridSize = 3,
  initialPatternLength = 3,
  patternDisplayTime = 1000,
  onGameComplete = () => {},
  onScoreChange = () => {},
  playerName = 'Player',
  timeLimit = null,
  lives = 3,
  gameMode = 'standard',
  highContrast = false
}) => {
  // Game configuration
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [patternLength, setPatternLength] = useState(initialPatternLength);
  const [displayTime, setDisplayTime] = useState(patternDisplayTime);

  // Game state
  const [gameState, setGameState] = useState('idle'); // idle, countdown, pattern, input, success, failure, gameover
  const [currentPattern, setCurrentPattern] = useState([]);
  const [playerSelections, setPlayerSelections] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [remainingLives, setRemainingLives] = useState(lives);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [timeBonus, setTimeBonus] = useState(0);
  const [remainingTime, setRemainingTime] = useState(timeLimit);
  const [achievements, setAchievements] = useState([]);
  const [showModelTraining, setShowModelTraining] = useState(false);
  const [turnTimer, setTurnTimer] = useState(5); // 5-second timer for each turn

  // Refs for timing
  const patternStartTime = useRef(null);
  const inputStartTime = useRef(null);
  const gameTimer = useRef(null);

  // Generate a new pattern
  const generateNewPattern = useCallback(() => {
    // Use the pattern type based on level
    const patternType = level < 3 ? 'random' :
                        level < 6 ? 'sequential' : 'shape';

    const pattern = generatePattern(gridSize, patternLength, patternType);
    setCurrentPattern(pattern);
  }, [gridSize, patternLength, level]);

  // Start a new game
  const startGame = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
    setPlayerSelections([]);
    setRemainingLives(lives);
    setScore(0);
    setLevel(1);
    setGridSize(initialGridSize);
    setPatternLength(initialPatternLength);
    setDisplayTime(patternDisplayTime);
    setConsecutiveCorrect(0);
    setComboMultiplier(1);
    setTimeBonus(0);
    setRemainingTime(timeLimit);
    setAchievements([]);
    generateNewPattern();

    // Start game timer if there's a time limit
    if (timeLimit) {
      startGameTimer();
    }
  }, [generateNewPattern, initialGridSize, initialPatternLength, patternDisplayTime, lives, timeLimit]);

  // Start a new level
  const startNextLevel = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
    setPlayerSelections([]);
    generateNewPattern();
  }, [generateNewPattern]);

  // Start game timer for time-limited modes
  const startGameTimer = useCallback(() => {
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
    }

    gameTimer.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1000) {
          clearInterval(gameTimer.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  }, []);

  // Handle time up in time-limited modes
  const handleTimeUp = () => {
    setGameState('gameover');

    // Save high score
    saveHighScore({
      score,
      playerName,
      level,
      gridSize,
      gameMode
    });

    // Notify parent component
    onGameComplete(score);
  };

  // Handle countdown and show pattern simultaneously
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      // Generate pattern when countdown starts if not already generated
      if (countdown === 3 && currentPattern.length === 0) {
        generateNewPattern();
      }

      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      // Move directly to input phase since pattern is already shown during countdown
      setGameState('input');
      setTurnTimer(5); // Reset turn timer to 5 seconds
      setPlayerSelections([]); // Clear any previous selections
      inputStartTime.current = Date.now();
      patternStartTime.current = Date.now();

      // Start turn timer countdown
      const turnTimerInterval = setInterval(() => {
        setTurnTimer(prevTime => {
          if (prevTime <= 1) {
            clearInterval(turnTimerInterval);
            // Time's up - handle as failure
            handleFailure();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(turnTimerInterval);
    }
  }, [gameState, countdown, currentPattern.length, generateNewPattern]);

  // We no longer need this effect since we're showing the pattern during countdown
  // and moving directly to input phase

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (gameTimer.current) {
        clearInterval(gameTimer.current);
      }
    };
  }, []);

  // Save game progress when level changes
  useEffect(() => {
    if (level > 1) {
      saveGameProgress({
        score,
        level,
        gridSize,
        patternLength,
        remainingLives,
        gameMode
      });
    }
  }, [level, score, gridSize, patternLength, remainingLives, gameMode]);

  // Handle tile click during input phase
  const handleTileClick = (_, selections) => {
    if (gameState !== 'input') return;

    // Update player selections
    setPlayerSelections(selections);

    // Check if all correct tiles are selected (and no incorrect ones)
    const correctSelections = selections.filter(idx => currentPattern.includes(idx));
    const incorrectSelections = selections.filter(idx => !currentPattern.includes(idx));

    // If player has selected all correct tiles and no incorrect ones, proceed automatically
    if (correctSelections.length === currentPattern.length && incorrectSelections.length === 0) {
      handleSuccess();
    }
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (gameState !== 'input') return;

    // Check if the selections match the pattern
    const correctSelections = playerSelections.filter(idx => currentPattern.includes(idx));
    const incorrectSelections = playerSelections.filter(idx => !currentPattern.includes(idx));

    // If all correct and no incorrect, handle as success
    if (correctSelections.length === currentPattern.length && incorrectSelections.length === 0) {
      handleSuccess();
    } else {
      // Handle as failure
      handleFailure();
    }
  };

  // Handle successful pattern match
  const handleSuccess = () => {
    setGameState('success');

    // Calculate response time and time bonus
    const currentResponseTime = Date.now() - inputStartTime.current;

    // Calculate time bonus based on remaining turn timer (0-5 seconds)
    // Higher remaining time = higher bonus
    const newTimeBonus = turnTimer / 5; // 0-1 range based on remaining time
    setTimeBonus(newTimeBonus);

    // Play success sound
    playSound('correct');

    // Create particle effect
    const gridElement = document.querySelector('.grid-container');
    if (gridElement) {
      const rect = gridElement.getBoundingClientRect();
      createParticleEffect(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        { color: '#4caf50', count: 30, duration: 1000 }
      );
    }

    // Update consecutive correct count and combo multiplier
    const newConsecutiveCorrect = consecutiveCorrect + 1;
    setConsecutiveCorrect(newConsecutiveCorrect);
    const newComboMultiplier = calculateComboMultiplier(newConsecutiveCorrect);
    setComboMultiplier(newComboMultiplier);

    // Calculate score based on grid size, pattern length, time bonus, and combo
    // Enhanced scoring formula: (grid size^2 * pattern length * time bonus * combo multiplier)
    const baseScore = gridSize * gridSize * patternLength; // Base score from grid size and pattern length
    const timeMultiplier = 1 + newTimeBonus; // Time bonus (1.0 - 2.0 multiplier)
    const roundScore = Math.round(baseScore * timeMultiplier * newComboMultiplier);

    const newScore = score + roundScore;
    setScore(newScore);
    onScoreChange(newScore);

    // Add data to TensorFlow model if enabled
    if (isFeatureEnabled('TENSORFLOW_ENABLED')) {
      addTrainingData({
        gridSize,
        patternLength,
        responseTime: currentResponseTime,
        level,
        success: true
      });
    }

    // Check for achievements
    checkAchievements(newScore, newConsecutiveCorrect);

    // Increase difficulty for next level
    const newLevel = level + 1;
    setLevel(newLevel);

    // Update grid size based on level
    const newGridSize = calculateGridSize(newLevel);
    if (newGridSize !== gridSize) {
      setGridSize(newGridSize);
    }

    // Update pattern length based on level and grid size
    const newPatternLength = calculatePatternLength(newLevel, newGridSize);
    setPatternLength(newPatternLength);

    // Update pattern display time based on level
    const newDisplayTime = calculatePatternDisplayTime(newLevel);
    setDisplayTime(newDisplayTime);

    // Start next level after a short delay
    setTimeout(() => {
      startNextLevel();
    }, 1500);
  };

  // Handle failed pattern match
  const handleFailure = () => {
    setGameState('failure');

    // Calculate response time
    const currentResponseTime = Date.now() - inputStartTime.current;

    // Play failure sound
    playSound('incorrect');

    // Reset consecutive correct count and combo multiplier
    setConsecutiveCorrect(0);
    setComboMultiplier(1);

    // Add data to TensorFlow model if enabled
    if (isFeatureEnabled('TENSORFLOW_ENABLED')) {
      addTrainingData({
        gridSize,
        patternLength,
        responseTime: currentResponseTime,
        level,
        success: false
      });
    }

    // Apply score penalty
    const newScore = calculatePenalty(score);
    setScore(newScore);
    onScoreChange(newScore);

    // Reduce lives
    const newLives = remainingLives - 1;
    setRemainingLives(newLives);

    if (newLives <= 0) {
      // Game over if no lives left
      setTimeout(() => {
        setGameState('gameover');

        // Save high score
        saveHighScore({
          score: newScore,
          playerName,
          level,
          gridSize,
          gameMode
        });

        // Notify parent component
        onGameComplete(newScore);
      }, 1500);
    } else {
      // Try again with same pattern if lives remaining
      setTimeout(() => {
        setGameState('countdown');
        setCountdown(3);
        setPlayerSelections([]);
      }, 1500);
    }
  };

  // Check for achievements
  const checkAchievements = (currentScore, consecutiveCorrect) => {
    const newAchievements = [...achievements];

    // Score-based achievements
    if (currentScore >= 1000 && !achievements.includes('score_1000')) {
      newAchievements.push('score_1000');
    }

    if (currentScore >= 5000 && !achievements.includes('score_5000')) {
      newAchievements.push('score_5000');
    }

    // Combo-based achievements
    if (consecutiveCorrect >= 5 && !achievements.includes('combo_5')) {
      newAchievements.push('combo_5');
    }

    if (consecutiveCorrect >= 10 && !achievements.includes('combo_10')) {
      newAchievements.push('combo_10');
    }

    // Level-based achievements
    if (level >= 10 && !achievements.includes('level_10')) {
      newAchievements.push('level_10');
    }

    if (newAchievements.length > achievements.length) {
      setAchievements(newAchievements);
    }
  };

  // Format time for display (mm:ss)
  const formatTime = (timeMs) => {
    if (!timeMs) return '--:--';
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render game UI based on current state
  const renderGameContent = () => {
    switch (gameState) {
      case 'idle':
        return (
          <div className="game-start">
            <h2>Ready to Play?</h2>
            <p>Grid Size: {gridSize}x{gridSize}</p>
            <p>Pattern Length: {patternLength}</p>
            {lives !== Infinity && <p>Lives: {lives}</p>}
            {timeLimit && <p>Time Limit: {formatTime(timeLimit)}</p>}
            <button className="start-button" onClick={startGame}>
              Start Game
            </button>
          </div>
        );

      case 'countdown':
        return (
          <div className="game-active">
            <div className="game-header">
              <div className="level-info">Level {level}</div>
              <div className="score-info">Score: {score}</div>
              {lives !== Infinity && (
                <div className="lives-info">
                  Lives: {remainingLives}
                </div>
              )}
              {timeLimit > 0 && (
                <div className="time-info">
                  Time: {formatTime(remainingTime)}
                </div>
              )}
            </div>

            <div className="game-status">
              <div className="status-message">Get Ready!</div>
            </div>

            <Grid
              size={gridSize}
              activePattern={currentPattern}
              showPattern={true}
              onTileClick={() => {}}
              disabled={true}
              highContrast={highContrast}
              countdown={countdown}
              showCountdown={true}
              incorrectSelections={[]}
            />
          </div>
        );

      case 'pattern':
      case 'input':
      case 'success':
      case 'failure':
        return (
          <div className="game-active">
            <div className="game-header">
              <div className="game-info">
                <div className="level">Level: {level}</div>
                <div className="score">Score: {score}</div>
              </div>

              <div className="game-stats">
                {remainingLives !== Infinity && (
                  <div className="lives">
                    Lives: {Array.from({ length: remainingLives }).map((_, i) => (
                      <span key={i} className="life-icon">❤️</span>
                    ))}
                  </div>
                )}

                {timeLimit && (
                  <div className="timer">
                    Time: {formatTime(remainingTime)}
                  </div>
                )}

                {comboMultiplier > 1 && (
                  <div className="combo">
                    Combo: x{comboMultiplier.toFixed(1)}
                  </div>
                )}
              </div>
            </div>

            <div className="game-status">
              {gameState === 'pattern' && <div className="status-message">Memorize the pattern!</div>}
              {gameState === 'input' && <div className="status-message">Reproduce the pattern</div>}
              {gameState === 'success' && (
                <div className="status-message success">
                  Correct! +{Math.round((gridSize * gridSize * patternLength) * (1 + timeBonus) * comboMultiplier)} points
                  {timeBonus > 0 && <span className="bonus">Time Bonus: {Math.round(timeBonus * 100)}%</span>}
                </div>
              )}
              {gameState === 'failure' && <div className="status-message failure">Incorrect pattern!</div>}
            </div>

            <Grid
              size={gridSize}
              activePattern={currentPattern}
              showPattern={gameState === 'pattern' || gameState === 'success' || gameState === 'failure'}
              onTileClick={handleTileClick}
              disabled={gameState !== 'input'}
              highContrast={highContrast}
              countdown={gameState === 'countdown' ? countdown : turnTimer}
              showCountdown={gameState === 'countdown'}
              incorrectSelections={gameState === 'failure' ? playerSelections.filter(index => !currentPattern.includes(index)) : []}
            />

            {gameState === 'input' && (
              <div className="input-controls">
                <div className="selection-info">
                  {/* Show correct and incorrect selections */}
                  <div className="selection-counts">
                    <span className="correct-count">
                      Correct: {playerSelections.filter(idx => currentPattern.includes(idx)).length} / {currentPattern.length}
                    </span>
                    <span className="incorrect-count">
                      Incorrect: {playerSelections.filter(idx => !currentPattern.includes(idx)).length}
                    </span>
                  </div>
                </div>

                <div className="turn-timer-container">
                  <div className="turn-timer-label">Time Remaining:</div>
                  <div className="turn-timer-value">{turnTimer}s</div>
                  <div className="turn-timer-bar">
                    <div
                      className="turn-timer-progress"
                      style={{
                        width: `${(turnTimer / 5) * 100}%`,
                        backgroundColor: turnTimer <= 2 ? '#ff4d4d' : turnTimer <= 3 ? '#ffcc00' : '#4caf50'
                      }}
                    ></div>
                  </div>
                </div>

                <button
                  className="submit-button"
                  onClick={handleSubmit}
                >
                  Submit Pattern
                </button>
              </div>
            )}
          </div>
        );

      case 'gameover':
        return (
          <div className="game-over">
            <h2>Game Over</h2>
            <div className="final-score">Final Score: {score}</div>
            <div className="final-level">Level Reached: {level}</div>

            {achievements.length > 0 && (
              <div className="achievements">
                <h3>Achievements</h3>
                <ul>
                  {achievements.includes('score_1000') && <li>Score Master: Reach 1,000 points</li>}
                  {achievements.includes('score_5000') && <li>Score Legend: Reach 5,000 points</li>}
                  {achievements.includes('combo_5') && <li>Combo Starter: 5 consecutive correct patterns</li>}
                  {achievements.includes('combo_10') && <li>Combo Master: 10 consecutive correct patterns</li>}
                  {achievements.includes('level_10') && <li>Level Master: Reach level 10</li>}
                </ul>
              </div>
            )}

            <div className="game-actions">
              <button className="restart-button" onClick={startGame}>
                Play Again
              </button>

              {isFeatureEnabled('TENSORFLOW_ENABLED') && (
                <button
                  className="ai-button"
                  onClick={() => setShowModelTraining(true)}
                >
                  AI Analysis & Optimization
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle optimal parameters from ModelTraining
  const handleOptimalParameters = (params) => {
    if (params) {
      setGridSize(params.gridSize);
      setPatternLength(params.patternLength);
      setLevel(params.level);
      setShowModelTraining(false);

      // Start a new game with these parameters
      setTimeout(() => {
        startGame();
      }, 500);
    }
  };

  return (
    <div className="game-controller">
      {renderGameContent()}

      {/* TensorFlow.js Model Training Modal */}
      {isFeatureEnabled('TENSORFLOW_ENABLED') ? (
        <Suspense fallback={<div>Loading...</div>}>
          {showModelTraining && (
            <ModelTraining
              isOpen={showModelTraining}
              onClose={() => setShowModelTraining(false)}
              onParametersGenerated={handleOptimalParameters}
            />
          )}
        </Suspense>
      ) : showModelTraining && (
        <div className="feature-disabled">
          <h3>TensorFlow.js Integration is currently disabled</h3>
          <p>This feature will be available in a future update.</p>
          <button
            className="back-button"
            onClick={() => setShowModelTraining(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

GameController.propTypes = {
  initialGridSize: PropTypes.number,
  initialPatternLength: PropTypes.number,
  patternDisplayTime: PropTypes.number,
  onGameComplete: PropTypes.func,
  onScoreChange: PropTypes.func,
  playerName: PropTypes.string,
  timeLimit: PropTypes.number,
  lives: PropTypes.number,
  gameMode: PropTypes.string,
  highContrast: PropTypes.bool
};

export default GameController;
