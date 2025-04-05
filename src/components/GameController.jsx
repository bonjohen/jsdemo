import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from './Grid';
import { generatePattern } from '../utils/patternGenerator';
import '../styles/GameController.css';

/**
 * GameController component that manages the game state and logic
 * @param {Object} props - Component props
 * @param {number} props.initialGridSize - Initial grid size (e.g., 3 for a 3x3 grid)
 * @param {number} props.initialPatternLength - Initial number of tiles in the pattern
 * @param {number} props.patternDisplayTime - Time in ms to display the pattern
 * @param {Function} props.onGameComplete - Callback when game is completed
 * @param {Function} props.onScoreChange - Callback when score changes
 */
const GameController = ({
  initialGridSize = 3,
  initialPatternLength = 3,
  patternDisplayTime = 1000,
  onGameComplete = () => {},
  onScoreChange = () => {}
}) => {
  // Game configuration
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [patternLength, setPatternLength] = useState(initialPatternLength);
  const [displayTime, setDisplayTime] = useState(patternDisplayTime);
  
  // Game state
  const [gameState, setGameState] = useState('idle'); // idle, pattern, input, success, failure
  const [currentPattern, setCurrentPattern] = useState([]);
  const [playerSelections, setPlayerSelections] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  
  // Generate a new pattern
  const generateNewPattern = useCallback(() => {
    const pattern = generatePattern(gridSize, patternLength);
    setCurrentPattern(pattern);
  }, [gridSize, patternLength]);
  
  // Start a new game
  const startGame = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
    setPlayerSelections([]);
    generateNewPattern();
  }, [generateNewPattern]);
  
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
      }, displayTime);
      
      return () => clearTimeout(timer);
    }
  }, [gameState, displayTime]);
  
  // Handle tile click during input phase
  const handleTileClick = (index, selections) => {
    if (gameState !== 'input') return;
    
    setPlayerSelections(selections);
    
    // Check if the player has selected the correct number of tiles
    if (selections.length === currentPattern.length) {
      // Compare selections with the pattern
      const isCorrect = currentPattern.every(patternIndex => 
        selections.includes(patternIndex)
      ) && selections.every(selectionIndex => 
        currentPattern.includes(selectionIndex)
      );
      
      if (isCorrect) {
        handleSuccess();
      } else {
        handleFailure();
      }
    }
  };
  
  // Handle successful pattern match
  const handleSuccess = () => {
    setGameState('success');
    
    // Calculate score based on grid size and pattern length
    const newScore = score + (gridSize * patternLength * 10);
    setScore(newScore);
    onScoreChange(newScore);
    
    // Increase difficulty for next level
    const newLevel = level + 1;
    setLevel(newLevel);
    
    // Every 3 levels, increase grid size (up to 6x6)
    if (newLevel % 3 === 0 && gridSize < 6) {
      setGridSize(prevSize => prevSize + 1);
    }
    
    // Every level, increase pattern length
    setPatternLength(prevLength => prevLength + 1);
    
    // Every 2 levels, decrease display time (minimum 500ms)
    if (newLevel % 2 === 0 && displayTime > 500) {
      setDisplayTime(prevTime => Math.max(prevTime - 100, 500));
    }
    
    // Start next level after a short delay
    setTimeout(() => {
      startGame();
    }, 1500);
  };
  
  // Handle failed pattern match
  const handleFailure = () => {
    setGameState('failure');
    
    // Notify parent component
    onGameComplete(score);
    
    // Reset game after a delay
    setTimeout(() => {
      setGameState('idle');
    }, 2000);
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
            <button className="start-button" onClick={startGame}>
              Start Level {level}
            </button>
          </div>
        );
        
      case 'countdown':
        return (
          <div className="game-countdown">
            <h2>Get Ready!</h2>
            <div className="countdown">{countdown}</div>
            <p>Remember the pattern that will appear</p>
          </div>
        );
        
      case 'pattern':
      case 'input':
      case 'success':
      case 'failure':
        return (
          <div className="game-active">
            <div className="game-info">
              <div className="level">Level: {level}</div>
              <div className="score">Score: {score}</div>
            </div>
            
            <div className="game-status">
              {gameState === 'pattern' && <div className="status-message">Memorize the pattern!</div>}
              {gameState === 'input' && <div className="status-message">Reproduce the pattern</div>}
              {gameState === 'success' && <div className="status-message success">Correct! Well done!</div>}
              {gameState === 'failure' && <div className="status-message failure">Incorrect pattern!</div>}
            </div>
            
            <Grid
              size={gridSize}
              activePattern={currentPattern}
              showPattern={gameState === 'pattern' || gameState === 'success' || gameState === 'failure'}
              onTileClick={handleTileClick}
              disabled={gameState !== 'input'}
            />
            
            {gameState === 'input' && (
              <div className="selection-info">
                Selected: {playerSelections.length} / {currentPattern.length}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="game-controller">
      {renderGameContent()}
    </div>
  );
};

GameController.propTypes = {
  initialGridSize: PropTypes.number,
  initialPatternLength: PropTypes.number,
  patternDisplayTime: PropTypes.number,
  onGameComplete: PropTypes.func,
  onScoreChange: PropTypes.func
};

export default GameController;
