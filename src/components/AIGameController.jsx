import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Grid from './Grid';
import AIInsights from './AIInsights';
import { generatePattern } from '../utils/patternGenerator';
import { AIPlayer, AI_DIFFICULTY, AI_PERSONALITY } from '../utils/aiPlayer';
import {
  calculateScore,
  calculateTimeBonus,
  calculateComboMultiplier
} from '../utils/scoreManager';
import { saveHighScore } from '../utils/storage';
import { playSound } from '../utils/audioManager';
import { createParticleEffect } from '../utils/visualEffects';
import '../styles/AIGameController.css';

/**
 * AIGameController component for AI vs. Player mode
 * @param {Object} props - Component props
 * @param {number} props.initialGridSize - Initial grid size
 * @param {number} props.initialPatternLength - Initial pattern length
 * @param {number} props.patternDisplayTime - Pattern display time in ms
 * @param {Function} props.onGameComplete - Callback when game is completed
 * @param {string} props.playerName - Player name
 * @param {string} props.aiDifficulty - AI difficulty level
 * @param {string} props.aiPersonality - AI personality type
 * @param {number} props.rounds - Number of rounds to play
 * @param {boolean} props.highContrast - Whether to use high contrast mode
 * @param {boolean} props.soundEnabled - Whether sound is enabled
 */
const AIGameController = ({
  initialGridSize = 3,
  initialPatternLength = 3,
  patternDisplayTime = 1000,
  onGameComplete = () => {},
  playerName = 'Player',
  aiDifficulty = AI_DIFFICULTY.MEDIUM,
  aiPersonality = AI_PERSONALITY.BALANCED,
  rounds = 5,
  highContrast = false,
  soundEnabled = true
}) => {
  // Game configuration
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [patternLength, setPatternLength] = useState(initialPatternLength);
  const [displayTime, setDisplayTime] = useState(patternDisplayTime);

  // Game state
  const [gameState, setGameState] = useState('idle'); // idle, countdown, pattern, playerTurn, aiTurn, roundResult, gameOver
  const [currentPattern, setCurrentPattern] = useState([]);
  const [playerSelections, setPlayerSelections] = useState([]);
  const [aiSelections, setAiSelections] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [playerTimeBonus, setPlayerTimeBonus] = useState(0);
  const [playerCombo, setPlayerCombo] = useState(1);
  const [aiCombo, setAiCombo] = useState(1);
  const [playerConsecutiveCorrect, setPlayerConsecutiveCorrect] = useState(0);
  const [roundWinner, setRoundWinner] = useState(null); // 'player', 'ai', 'tie'
  const [turnMessage, setTurnMessage] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [playerResponseTime, setPlayerResponseTime] = useState(0);
  const [aiResponseTime, setAiResponseTime] = useState(0);
  const [playerStats, setPlayerStats] = useState({
    averageResponseTime: 0,
    totalPatterns: 0,
    correctPatterns: 0,
    successRate: 0
  });

  // AI player
  const aiPlayerRef = useRef(new AIPlayer(aiDifficulty, aiPersonality));

  // Refs for timing
  const patternStartTime = useRef(null);
  const playerInputStartTime = useRef(null);

  // Generate a new pattern
  const generateNewPattern = useCallback(() => {
    // Use different pattern types as rounds progress
    const patternType = currentRound < 3 ? 'random' :
                        currentRound < 6 ? 'sequential' : 'shape';

    const pattern = generatePattern(gridSize, patternLength, patternType);
    setCurrentPattern(pattern);
  }, [gridSize, patternLength, currentRound]);

  // Start a new game
  const startGame = useCallback(() => {
    // Reset game state
    setGameState('countdown');
    setCountdown(3);
    setPlayerSelections([]);
    setAiSelections([]);
    setPlayerScore(0);
    setAiScore(0);
    setCurrentRound(1);
    setPlayerTimeBonus(0);
    setPlayerCombo(1);
    setAiCombo(1);
    setPlayerConsecutiveCorrect(0);
    setRoundWinner(null);
    setPlayerResponseTime(0);
    setAiResponseTime(0);
    setPlayerStats({
      averageResponseTime: 0,
      totalPatterns: 0,
      correctPatterns: 0,
      successRate: 0
    });

    // Reset AI player
    aiPlayerRef.current = new AIPlayer(aiDifficulty, aiPersonality);

    // Play sound
    if (soundEnabled) {
      playSound('level_up');
    }

    // Generate first pattern
    generateNewPattern();
  }, [generateNewPattern, aiDifficulty, aiPersonality, soundEnabled]);

  // Start a new round
  const startNextRound = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
    setPlayerSelections([]);
    setAiSelections([]);
    setRoundWinner(null);

    // Increase difficulty slightly for each round
    if (currentRound % 2 === 0 && patternLength < gridSize * gridSize * 0.75) {
      setPatternLength(prev => prev + 1);
    }

    if (currentRound % 3 === 0 && displayTime > 500) {
      setDisplayTime(prev => Math.max(prev - 100, 500));
    }

    generateNewPattern();
  }, [currentRound, generateNewPattern, gridSize, patternLength, displayTime]);

  // Handle countdown before showing pattern
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('pattern');
      patternStartTime.current = Date.now();
      setTurnMessage('Memorize the pattern!');
    }
  }, [gameState, countdown]);

  // Handle pattern display
  useEffect(() => {
    if (gameState === 'pattern') {
      const timer = setTimeout(() => {
        setGameState('playerTurn');
        playerInputStartTime.current = Date.now();
        setTurnMessage(`${playerName}'s turn - Reproduce the pattern`);
      }, displayTime);

      return () => clearTimeout(timer);
    }
  }, [gameState, displayTime, playerName]);

  // Handle player tile click
  const handlePlayerTileClick = (index, selections) => {
    if (gameState !== 'playerTurn') return;

    // Play sound effect
    if (soundEnabled) {
      playSound('tile_select');
    }

    setPlayerSelections(selections);

    // Check if the player has selected the correct number of tiles
    if (selections.length === currentPattern.length) {
      // Compare selections with the pattern
      const isCorrect = currentPattern.every(patternIndex =>
        selections.includes(patternIndex)
      ) && selections.every(selectionIndex =>
        currentPattern.includes(selectionIndex)
      );

      // Calculate response time and time bonus
      const responseTime = Date.now() - playerInputStartTime.current;
      setPlayerResponseTime(responseTime);

      const maxResponseTime = displayTime * 3; // Allow 3x the display time for response
      const timeBonus = calculateTimeBonus(responseTime, maxResponseTime);
      setPlayerTimeBonus(timeBonus);

      // Update player stats
      setPlayerStats(prev => {
        const totalPatterns = prev.totalPatterns + 1;
        const correctPatterns = isCorrect ? prev.correctPatterns + 1 : prev.correctPatterns;
        const totalResponseTime = prev.averageResponseTime * prev.totalPatterns + responseTime;
        const averageResponseTime = totalResponseTime / totalPatterns;

        return {
          totalPatterns,
          correctPatterns,
          averageResponseTime,
          successRate: correctPatterns / totalPatterns
        };
      });

      // Update consecutive correct count and combo multiplier
      let newConsecutiveCorrect = playerConsecutiveCorrect;
      let newCombo = playerCombo;

      if (isCorrect) {
        // Play success sound
        if (soundEnabled) {
          playSound('correct');
        }

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

        newConsecutiveCorrect = playerConsecutiveCorrect + 1;
        setPlayerConsecutiveCorrect(newConsecutiveCorrect);
        newCombo = calculateComboMultiplier(newConsecutiveCorrect);
        setPlayerCombo(newCombo);

        // Calculate score
        const roundScore = calculateScore(gridSize, patternLength, timeBonus, newCombo);
        setPlayerScore(prev => prev + roundScore);

        setTurnMessage(`Correct! +${roundScore} points`);
      } else {
        // Play failure sound
        if (soundEnabled) {
          playSound('incorrect');
        }

        setPlayerConsecutiveCorrect(0);
        setPlayerCombo(1);
        setTurnMessage('Incorrect pattern!');
      }

      // Record player's result for AI learning with metadata
      aiPlayerRef.current.recordResult(isCorrect, currentPattern, selections, {
        gridSize,
        responseTime,
        level: currentRound
      });

      // After a short delay, switch to AI's turn
      setTimeout(() => {
        setGameState('aiTurn');
        setTurnMessage(`AI's turn - Watching AI reproduce the pattern`);

        // AI attempts to memorize the pattern with player's response time
        const aiAttempt = aiPlayerRef.current.memorizePattern(
          currentPattern,
          gridSize,
          currentRound,
          responseTime
        );

        // Show AI's attempt gradually
        showAIAttempt(aiAttempt);
      }, 1500);
    }
  };

  // Show AI's attempt with a delay between each tile
  const showAIAttempt = (attempt) => {
    setAiSelections([]);

    // Show each tile with a delay
    attempt.forEach((tile, index) => {
      setTimeout(() => {
        setAiSelections(prev => [...prev, tile]);

        // After showing all tiles, evaluate AI's performance
        if (index === attempt.length - 1) {
          setTimeout(() => evaluateAIAttempt(attempt), 1000);
        }
      }, index * 500); // 500ms delay between each tile
    });
  };

  // Evaluate AI's attempt and update scores
  const evaluateAIAttempt = (attempt) => {
    // Calculate AI response time (simulated)
    const aiResponseTime = Math.random() * 1000 + 500; // Between 500-1500ms
    setAiResponseTime(aiResponseTime);

    // Compare AI's attempt with the pattern
    const isCorrect = currentPattern.every(patternIndex =>
      attempt.includes(patternIndex)
    ) && attempt.every(selectionIndex =>
      currentPattern.includes(selectionIndex)
    );

    // Update AI's combo
    let newAiCombo = aiCombo;

    if (isCorrect) {
      // Play success sound
      if (soundEnabled) {
        playSound('correct');
      }

      newAiCombo = calculateComboMultiplier(aiPlayerRef.current.consecutiveCorrect);
      setAiCombo(newAiCombo);

      // Calculate AI score
      const aiRoundScore = calculateScore(gridSize, patternLength, 0.5, newAiCombo);
      setAiScore(prev => prev + aiRoundScore);

      setTurnMessage(`AI got it right! +${aiRoundScore} points`);
    } else {
      // Play failure sound
      if (soundEnabled) {
        playSound('incorrect');
      }

      setAiCombo(1);
      setTurnMessage('AI made a mistake!');
    }

    // Adjust AI difficulty based on player performance
    aiPlayerRef.current.adjustDifficulty(playerStats.successRate, {
      averageResponseTime: playerStats.averageResponseTime,
      level: currentRound,
      consecutiveCorrect: playerConsecutiveCorrect
    });

    // Determine round winner
    let winner = null;
    const playerCorrect = playerSelections.every(tile => currentPattern.includes(tile)) &&
                         playerSelections.length === currentPattern.length;

    if (playerCorrect && isCorrect) {
      winner = 'tie';
    } else if (playerCorrect) {
      winner = 'player';
    } else if (isCorrect) {
      winner = 'ai';
    }

    setRoundWinner(winner);

    // After a short delay, show round result
    setTimeout(() => {
      setGameState('roundResult');
    }, 1500);
  };

  // Handle round completion
  useEffect(() => {
    if (gameState === 'roundResult') {
      // Check if this was the final round
      if (currentRound >= rounds) {
        // Game over, determine winner
        setTimeout(() => {
          setGameState('gameOver');

          // Save high score
          saveHighScore({
            score: playerScore,
            playerName,
            level: currentRound,
            gridSize,
            gameMode: 'ai_vs_player'
          });

          // Notify parent component
          onGameComplete(playerScore, aiScore);
        }, 2000);
      } else {
        // Start next round after a delay
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          startNextRound();
        }, 2000);
      }
    }
  }, [gameState, currentRound, rounds, startNextRound, playerScore, aiScore, playerName, gridSize, onGameComplete]);

  // Format score with commas
  const formatScore = (score) => {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Render game UI based on current state
  const renderGameContent = () => {
    switch (gameState) {
      case 'idle':
        return (
          <div className="ai-game-start">
            <h2>AI vs. Player Mode</h2>
            <p>Compete against an AI opponent in a memory challenge!</p>
            <div className="game-info">
              <p>Grid Size: {gridSize}x{gridSize}</p>
              <p>Pattern Length: {patternLength}</p>
              <p>Rounds: {rounds}</p>
              <p>AI Difficulty: {aiDifficulty}</p>
            </div>
            <button className="start-button" onClick={startGame}>
              Start Game
            </button>
          </div>
        );

      case 'countdown':
        return (
          <div className="ai-game-countdown">
            <h2>Get Ready!</h2>
            <div className="countdown">{countdown}</div>
            <p>Round {currentRound} of {rounds}</p>
          </div>
        );

      case 'pattern':
      case 'playerTurn':
      case 'aiTurn':
        return (
          <div className="ai-game-active">
            <div className="ai-game-header">
              <div className="round-info">Round {currentRound} of {rounds}</div>

              <div className="scores">
                <div className={`player-score ${roundWinner === 'player' ? 'winner' : ''}`}>
                  <span className="player-name">{playerName}</span>
                  <span className="score">{formatScore(playerScore)}</span>
                  {playerCombo > 1 && <span className="combo">x{playerCombo.toFixed(1)}</span>}
                </div>

                <div className="vs">VS</div>

                <div className={`ai-score ${roundWinner === 'ai' ? 'winner' : ''}`}>
                  <span className="player-name">AI</span>
                  <span className="score">{formatScore(aiScore)}</span>
                  {aiCombo > 1 && <span className="combo">x{aiCombo.toFixed(1)}</span>}
                </div>
              </div>
            </div>

            <div className="turn-message">
              {turnMessage}
              {gameState === 'playerTurn' && playerTimeBonus > 0 && (
                <span className="bonus">Time Bonus: {Math.round(playerTimeBonus * 100)}%</span>
              )}
            </div>

            <div className="grid-container">
              <Grid
                size={gridSize}
                activePattern={currentPattern}
                showPattern={gameState === 'pattern' || gameState === 'aiTurn'}
                onTileClick={handlePlayerTileClick}
                disabled={gameState !== 'playerTurn'}
                highContrast={highContrast}
              />

              {gameState === 'playerTurn' && (
                <div className="selection-info">
                  Selected: {playerSelections.length} / {currentPattern.length}
                </div>
              )}

              {gameState === 'aiTurn' && (
                <div className="selection-info">
                  AI Selected: {aiSelections.length} / {currentPattern.length}
                </div>
              )}
            </div>
          </div>
        );

      case 'roundResult':
        return (
          <div className="round-result">
            <h2>Round {currentRound} Result</h2>

            <div className="result-details">
              {roundWinner === 'player' && (
                <div className="winner-message player-win">
                  {playerName} wins this round!
                </div>
              )}

              {roundWinner === 'ai' && (
                <div className="winner-message ai-win">
                  AI wins this round!
                </div>
              )}

              {roundWinner === 'tie' && (
                <div className="winner-message tie">
                  It's a tie!
                </div>
              )}

              {!roundWinner && (
                <div className="winner-message no-winner">
                  Both players made mistakes!
                </div>
              )}
            </div>

            <div className="scores">
              <div className="player-score">
                <span className="player-name">{playerName}</span>
                <span className="score">{formatScore(playerScore)}</span>
              </div>

              <div className="vs">VS</div>

              <div className="ai-score">
                <span className="player-name">AI</span>
                <span className="score">{formatScore(aiScore)}</span>
              </div>
            </div>

            {currentRound < rounds ? (
              <p>Preparing for round {currentRound + 1}...</p>
            ) : (
              <p>Final round complete! Calculating results...</p>
            )}
          </div>
        );

      case 'gameOver':
        return (
          <div className="game-over">
            <h2>Game Over</h2>

            <div className="final-scores">
              <div className={`player-score ${playerScore > aiScore ? 'winner' : ''}`}>
                <span className="player-name">{playerName}</span>
                <span className="score">{formatScore(playerScore)}</span>
              </div>

              <div className="vs">VS</div>

              <div className={`ai-score ${aiScore > playerScore ? 'winner' : ''}`}>
                <span className="player-name">AI</span>
                <span className="score">{formatScore(aiScore)}</span>
              </div>
            </div>

            <div className="game-result">
              {playerScore > aiScore && (
                <div className="winner-message player-win">
                  Congratulations! You beat the AI!
                </div>
              )}

              {aiScore > playerScore && (
                <div className="winner-message ai-win">
                  The AI has won this time!
                </div>
              )}

              {playerScore === aiScore && (
                <div className="winner-message tie">
                  It's a tie! Great match!
                </div>
              )}
            </div>

            <div className="ai-stats">
              <h3>AI Performance</h3>
              <p>Accuracy: {Math.round(aiPlayerRef.current.memoryAccuracy * 100)}%</p>
              <p>Success Rate: {Math.round(aiPlayerRef.current.getStats().successRate * 100)}%</p>
              <p>Personality: {aiPlayerRef.current.personality}</p>
              <p>Learning Progress: {Math.min(100, Math.round(aiPlayerRef.current.learningProgress * 20))}%</p>
            </div>

            <div className="game-over-actions">
              <button
                className="insights-button"
                onClick={() => setShowInsights(true)}
              >
                View AI Insights
              </button>

              <button
                className="restart-button"
                onClick={startGame}
              >
                Play Again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ai-game-controller">
      {renderGameContent()}

      {/* AI Insights Modal */}
      <AIInsights
        aiPlayer={aiPlayerRef.current}
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
      />
    </div>
  );
};

AIGameController.propTypes = {
  initialGridSize: PropTypes.number,
  initialPatternLength: PropTypes.number,
  patternDisplayTime: PropTypes.number,
  onGameComplete: PropTypes.func,
  playerName: PropTypes.string,
  aiDifficulty: PropTypes.string,
  aiPersonality: PropTypes.string,
  rounds: PropTypes.number,
  highContrast: PropTypes.bool,
  soundEnabled: PropTypes.bool
};

export default AIGameController;
