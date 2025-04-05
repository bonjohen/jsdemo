import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getHighScores } from '../utils/storage';
import '../styles/Leaderboard.css';

/**
 * Leaderboard component for displaying high scores
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the leaderboard modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 */
const Leaderboard = ({ isOpen, onClose }) => {
  const [highScores, setHighScores] = useState([]);
  const [filter, setFilter] = useState('all');

  // Load high scores on mount and when isOpen changes
  useEffect(() => {
    if (isOpen) {
      const scores = getHighScores();
      setHighScores(scores);
    }
  }, [isOpen]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter scores based on selected filter
  const filteredScores = () => {
    if (filter === 'all') {
      return highScores;
    }
    
    // Filter by grid size
    const gridSize = parseInt(filter, 10);
    return highScores.filter(score => score.gridSize === gridSize);
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="leaderboard-modal-overlay">
      <div className="leaderboard-modal">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Leaderboard</h2>
        
        <div className="filter-controls">
          <label htmlFor="filter">Filter by Grid Size:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Sizes</option>
            <option value="3">3x3</option>
            <option value="4">4x4</option>
            <option value="5">5x5</option>
            <option value="6">6x6</option>
          </select>
        </div>
        
        {filteredScores().length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Level</th>
                <th>Grid</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores().map((score, index) => (
                <tr key={index} className={index < 3 ? 'top-score' : ''}>
                  <td>{index + 1}</td>
                  <td>{score.playerName || 'Anonymous'}</td>
                  <td>{score.score}</td>
                  <td>{score.level || '-'}</td>
                  <td>{score.gridSize ? `${score.gridSize}x${score.gridSize}` : '-'}</td>
                  <td>{score.date ? formatDate(score.date) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-scores">
            <p>No high scores yet. Start playing to set some records!</p>
          </div>
        )}
      </div>
    </div>
  );
};

Leaderboard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Leaderboard;
