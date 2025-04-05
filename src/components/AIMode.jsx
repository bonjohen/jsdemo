import { useState } from 'react';
import PropTypes from 'prop-types';
import { AI_DIFFICULTY, AI_PERSONALITY } from '../utils/aiPlayer';
import '../styles/AIMode.css';

/**
 * AIMode component for configuring AI vs. Player mode
 * @param {Object} props - Component props
 * @param {Function} props.onStartGame - Callback when game is started
 * @param {Function} props.onBack - Callback to go back
 * @param {string} props.playerName - Player name
 */
const AIMode = ({ onStartGame, onBack, playerName = 'Player' }) => {
  const [difficulty, setDifficulty] = useState(AI_DIFFICULTY.MEDIUM);
  const [personality, setPersonality] = useState(AI_PERSONALITY.BALANCED);
  const [gridSize, setGridSize] = useState(4);
  const [patternLength, setPatternLength] = useState(4);
  const [rounds, setRounds] = useState(5);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    onStartGame({
      difficulty,
      personality,
      gridSize,
      patternLength,
      rounds
    });
  };

  return (
    <div className="ai-mode">
      <h2>AI vs. Player Mode</h2>

      <p className="description">
        Challenge an AI opponent to a memory duel! Take turns memorizing and reproducing patterns.
        The player with the highest score after all rounds wins.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="difficulty">AI Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value={AI_DIFFICULTY.EASY}>Easy - AI makes more mistakes</option>
            <option value={AI_DIFFICULTY.MEDIUM}>Medium - Balanced challenge</option>
            <option value={AI_DIFFICULTY.HARD}>Hard - AI rarely makes mistakes</option>
            <option value={AI_DIFFICULTY.ADAPTIVE}>Adaptive - AI adjusts to your skill level</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="personality">AI Personality:</label>
          <select
            id="personality"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
          >
            <option value={AI_PERSONALITY.BALANCED}>Balanced - Well-rounded learning</option>
            <option value={AI_PERSONALITY.ANALYTICAL}>Analytical - Focuses on patterns</option>
            <option value={AI_PERSONALITY.REACTIVE}>Reactive - Adapts quickly</option>
            <option value={AI_PERSONALITY.CONSISTENT}>Consistent - Steady performance</option>
            <option value={AI_PERSONALITY.AGGRESSIVE}>Aggressive - Takes more risks</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="gridSize">Grid Size:</label>
          <select
            id="gridSize"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value, 10))}
          >
            <option value="3">3x3</option>
            <option value="4">4x4</option>
            <option value="5">5x5</option>
            <option value="6">6x6</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="patternLength">Starting Pattern Length:</label>
          <select
            id="patternLength"
            value={patternLength}
            onChange={(e) => setPatternLength(parseInt(e.target.value, 10))}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i} value={i + 3}>{i + 3}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rounds">Number of Rounds:</label>
          <select
            id="rounds"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value, 10))}
          >
            <option value="3">3 Rounds</option>
            <option value="5">5 Rounds</option>
            <option value="7">7 Rounds</option>
            <option value="10">10 Rounds</option>
          </select>
        </div>

        <div className="ai-info">
          <h3>AI Difficulty Explained</h3>
          <ul>
            <li><strong>Easy:</strong> The AI has a 50% chance of remembering each tile correctly.</li>
            <li><strong>Medium:</strong> The AI has a 70% chance of remembering each tile correctly.</li>
            <li><strong>Hard:</strong> The AI has a 90% chance of remembering each tile correctly.</li>
            <li><strong>Adaptive:</strong> The AI starts at 60% accuracy and adjusts based on your performance.</li>
          </ul>

          <h3>AI Personality Types</h3>
          <ul>
            <li><strong>Balanced:</strong> Well-rounded learning across all aspects.</li>
            <li><strong>Analytical:</strong> Excels at recognizing patterns but adapts slowly.</li>
            <li><strong>Reactive:</strong> Adapts quickly to your play style but less consistent.</li>
            <li><strong>Consistent:</strong> Maintains steady performance with minimal variance.</li>
            <li><strong>Aggressive:</strong> Takes more risks, leading to higher variance in performance.</li>
          </ul>
          <p>All AI opponents learn from your play patterns and improve over time.</p>
        </div>

        <div className="player-info">
          <h3>Player Info</h3>
          <p>Playing as: <strong>{playerName}</strong></p>
        </div>

        <div className="form-actions">
          <button type="button" className="back-button" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="start-button">
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};

AIMode.propTypes = {
  onStartGame: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  playerName: PropTypes.string
};

export default AIMode;
