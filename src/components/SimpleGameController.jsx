import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Grid from './Grid';
import { generatePattern } from '../utils/patternGenerator';
import {
  calculateScore,
  calculateTimeBonus,
  calculateComboMultiplier,
  calculatePenalty,
  calculateGridSize,
  calculatePatternLength,
  calculatePatternDisplayTime
} from '../utils/scoreManager';
import { saveHighScore, saveGameProgress } from '../utils/storage';
import '../styles/GameController.css';

/**
 * GameController component for managing the game state and logic
 * @param {Object} props - Component props
 * @param {number} props.initialGridSize - Initial grid size
 * @param {number} props.initialPatternLength - Initial pattern length
 * @param {number} props.patternDisplayTime - Pattern display time in ms
 * @param {Function} props.onGameComplete - Callback when game is completed
 * @param {Function} props.onScoreChange - Callback when score changes
 * @param {string} props.playerName - Player name
 * @param {number} props.timeLimit - Time limit in seconds (0 for no limit)
 * @param {number} props.lives - Number of lives (0 for infinite)
 * @param {string} props.gameMode - Game mode identifier
 * @param {boolean} props.highContrast - Whether to use high contrast mode
 */
const SimpleGameController = ({
  initialGridSize = 3,
  initialPatternLength = 3,
  patternDisplayTime = 1000,
  onGameComplete = () => {},
  onScoreChange = () => {},
  playerName = 'Player',
  timeLimit = 0,
  lives = 3,
  gameMode = 'standard',
  highContrast = false
}) => {
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
  
  // Dynamic game parameters
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [patternLength, setPatternLength] = useState(initialPatternLength);
  const [displayTime, setDisplayTime] = useState(patternDisplayTime);
  
  // Refs for timing
  const timerRef = useRef(null);
  const inputStartTime = useRef(null);
  
  // Generate a new pattern
  const generateNewPattern = useCallback(() => {
    const pattern = generatePattern(gridSize, patternLength);
    setCurrentPattern(pattern);
  }, [gridSize, patternLength]);
  
  // Start a new game
  const startGame = useCallback(() => {
    // Reset game state
    setGameState('countdown');
    setCountdown(3);
    setPlayerSelections([]);
    setScore(0);
    setLevel(1);
    setConsecutiveCorrect(0);
    setComboMultiplier(1);
    setTimeBonus(0);
    setRemainingLives(lives);
    setRemainingTime(timeLimit);
    setAchievements([]);
    
    // Reset dynamic game parameters
    setGridSize(initialGridSize);
    setPatternLength(initialPatternLength);
    setDisplayTime(patternDisplayTime);
    
    // Generate first pattern
    generateNewPattern();
    
    // Clear any existing timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Start timer if time limit is set
    if (timeLimit > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [
    generateNewPattern,
    initialGridSize,
    initialPatternLength,
    patternDisplayTime,
    lives,
    timeLimit
  ]);
  
  // Start the next level
  const startNextLevel = useCallback(() => {
    // Increment level
    const newLevel = level + 1;
    setLevel(newLevel);
    
    // Update grid size based on level
    const newGridSize = calculateGridSize(newLevel, initialGridSize);
    setGridSize(newGridSize);
    
    // Update pattern length based on level
    const newPatternLength = calculatePatternLength(newLevel, initialPatternLength);
    setPatternLength(newPatternLength);
    
    // Update display time based on level
    const newDisplayTime = calculatePatternDisplayTime(newLevel, patternDisplayTime);
    setDisplayTime(newDisplayTime);
    
    // Reset for next level
    setGameState('countdown');
    setCountdown(3);
    setPlayerSelections([]);
    
    // Generate new pattern
    generateNewPattern();
    
    // Save game progress
    saveGameProgress({
      level: newLevel,
      score,
      gameMode
    });
  }, [
    level,
    score,
    gameMode,
    generateNewPattern,
    initialGridSize,
    initialPatternLength,
    patternDisplayTime
  ]);
  
  // Handle countdown before showing pattern
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('pattern');
    }
  }, [gameState, countdown]);
  
  // Handle pattern display
  useEffect(() => {
    if (gameState === 'pattern') {
      const timer = setTimeout(() => {
        setGameState('input');
        inputStartTime.current = Date.now();
      }, displayTime);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, displayTime]);
  
  // Handle tile click
  const handleTileClick = (index) => {
    if (gameState !== 'input') return;
    
    // Add tile to selections if not already selected
    if (!playerSelections.includes(index)) {
      const newSelections = [...playerSelections, index];
      setPlayerSelections(newSelections);
      
      // Check if the player has selected the correct number of tiles
      if (newSelections.length === currentPattern.length) {
        // Check if the selections match the pattern
        const isCorrect = newSelections.every(
          (selection, i) => selection === currentPattern[i]
        );
        
        if (isCorrect) {
          handleSuccess();
        } else {
          handleFailure();
        }
      }
    }
  };
  
  // Handle successful pattern match
  const handleSuccess = () => {
    setGameState('success');

    // Calculate response time and time bonus
    const responseTime = Date.now() - inputStartTime.current;
    const maxResponseTime = displayTime * 3; // Allow 3x the display time for response
    const newTimeBonus = calculateTimeBonus(responseTime, maxResponseTime);
    setTimeBonus(newTimeBonus);

    // Update consecutive correct count and combo multiplier
    const newConsecutiveCorrect = consecutiveCorrect + 1;
    setConsecutiveCorrect(newConsecutiveCorrect);
    const newComboMultiplier = calculateComboMultiplier(newConsecutiveCorrect);
    setComboMultiplier(newComboMultiplier);

    // Calculate score based on grid size, pattern length, time bonus, and combo
    const roundScore = calculateScore(gridSize, patternLength, newTimeBonus, newComboMultiplier);
    const newScore = score + roundScore;
    setScore(newScore);
    onScoreChange(newScore);

    // Check for achievements
    checkAchievements(newScore, newConsecutiveCorrect);

    // Start next level after a short delay
    setTimeout(() => {
      startNextLevel();
    }, 1500);
  };
  
  // Handle failed pattern match
  const handleFailure = () => {
    setGameState('failure');

    // Reset consecutive correct count and combo multiplier
    setConsecutiveCorrect(0);
    setComboMultiplier(1);

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
        onGameComplete(newScore, level);
      }, 1500);
    } else {
      // Start next level after a short delay
      setTimeout(() => {
        startNextLevel();
      }, 1500);
    }
  };
  
  // Handle game over
  const handleGameOver = () => {
    setGameState('gameover');
    
    // Clear any existing timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Save high score
    saveHighScore({
      score,
      playerName,
      level,
      gridSize,
      gameMode
    });
    
    // Notify parent component
    onGameComplete(score, level);
  };
  
  // Check for achievements
  const checkAchievements = (newScore, newConsecutiveCorrect) => {
    const newAchievements = [...achievements];
    
    // Score-based achievements
    if (newScore >= 1000 && !achievements.includes('score_1000')) {
      newAchievements.push('score_1000');
    }
    
    if (newScore >= 5000 && !achievements.includes('score_5000')) {
      newAchievements.push('score_5000');
    }
    
    // Combo-based achievements
    if (newConsecutiveCorrect >= 5 && !achievements.includes('combo_5')) {
      newAchievements.push('combo_5');
    }
    
    if (newConsecutiveCorrect >= 10 && !achievements.includes('combo_10')) {
      newAchievements.push('combo_10');
    }
    
    // Level-based achievements
    if (level >= 10 && !achievements.includes('level_10')) {
      newAchievements.push('level_10');
    }
    
    if (level >= 20 && !achievements.includes('level_20')) {
      newAchievements.push('level_20');
    }
    
    // Update achievements if new ones were earned
    if (newAchievements.length > achievements.length) {
      setAchievements(newAchievements);
    }
  };
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Render game content based on current state
  const renderGameContent = () => {
    switch (gameState) {
      case 'idle':
        return (
          <div className="game-start">
            <h2>Memory Matrix Challenge</h2>
            <p>Test your memory by recreating patterns of increasing complexity.</p>
            <div className="game-info">
              <p>Grid Size: {gridSize}x{gridSize}</p>
              <p>Pattern Length: {patternLength}</p>
              {lives > 0 && <p>Lives: {lives}</p>}
              {timeLimit > 0 && <p>Time Limit: {formatTime(timeLimit)}</p>}
            </div>
            <button className="start-button" onClick={startGame}>
              Start Game
            </button>
          </div>
        );
        
      case 'countdown':
        return (
          <div className="game-countdown">
            <h2>Get Ready!</h2>
            <div className="countdown">{countdown}</div>
            <p>Level {level}</p>
          </div>
        );
        
      case 'pattern':
      case 'input':
      case 'success':
      case 'failure':
        return (
          <div className="game-active">
            <div className="game-header">
              <div className="level-info">Level {level}</div>
              <div className="score-info">Score: {score}</div>
              {lives > 0 && (
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
            
            {gameState === 'success' && (
              <div className="success-message">
                <h3>Correct!</h3>
                <p>Time Bonus: {Math.round(timeBonus * 100)}%</p>
                <p>Combo: x{comboMultiplier.toFixed(1)}</p>
              </div>
            )}
            
            {gameState === 'failure' && (
              <div className="failure-message">
                <h3>Incorrect!</h3>
                <p>The correct pattern will be shown again.</p>
              </div>
            )}
            
            <div className="grid-container">
              <Grid
                size={gridSize}
                activePattern={gameState === 'pattern' ? currentPattern : []}
                selectedTiles={playerSelections}
                onTileClick={handleTileClick}
                disabled={gameState !== 'input'}
                showCorrectPattern={gameState === 'failure'}
                correctPattern={currentPattern}
                highContrast={highContrast}
              />
            </div>
            
            {gameState === 'input' && (
              <div className="input-info">
                <p>Select {currentPattern.length} tiles</p>
                <p>Selected: {playerSelections.length} / {currentPattern.length}</p>
              </div>
            )}
          </div>
        );
        
      case 'gameover':
        return (
          <div className="game-over">
            <h2>Game Over</h2>
            <div className="final-score">
              <p>Final Score: {score}</p>
              <p>Level Reached: {level}</p>
            </div>
            
            {achievements.length > 0 && (
              <div className="achievements">
                <h3>Achievements</h3>
                <ul>
                  {achievements.map(achievement => (
                    <li key={achievement}>{formatAchievement(achievement)}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button className="restart-button" onClick={startGame}>
              Play Again
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Format achievement for display
  const formatAchievement = (achievement) => {
    switch (achievement) {
      case 'score_1000':
        return 'Score 1,000 points';
      case 'score_5000':
        return 'Score 5,000 points';
      case 'combo_5':
        return '5x Combo';
      case 'combo_10':
        return '10x Combo';
      case 'level_10':
        return 'Reach Level 10';
      case 'level_20':
        return 'Reach Level 20';
      default:
        return achievement;
    }
  };
  
  return (
    <div className="game-controller">
      {renderGameContent()}
    </div>
  );
};

SimpleGameController.propTypes = {
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

export default SimpleGameController;
