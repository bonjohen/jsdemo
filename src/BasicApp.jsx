import React, { useState, useEffect } from 'react';
import { useTheme } from './components/ThemeProvider';
import GameController from './components/GameController';
import GameModes, { GAME_MODES } from './components/GameModes';
import { getHighScores, getPlayerProfile, getGameSettings } from './utils/storage';
import './styles/App.css';

function BasicApp() {
  const { theme, setTheme } = useTheme();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [selectedMode, setSelectedMode] = useState(GAME_MODES.STANDARD);
  const [showModes, setShowModes] = useState(false);
  const [playerProfile, setPlayerProfile] = useState({ name: 'Player' });
  const [gameSettings, setGameSettings] = useState({
    highContrastMode: false,
    showTimer: true
  });

  // Load high score, player profile, and game settings on mount
  useEffect(() => {
    const highScores = getHighScores();
    if (highScores.length > 0) {
      setHighScore(highScores[0].score);
    }

    const profile = getPlayerProfile();
    if (profile) {
      setPlayerProfile(profile);
    }

    const settings = getGameSettings();
    if (settings) {
      setGameSettings(prevSettings => ({
        ...prevSettings,
        highContrastMode: settings.highContrastMode || false,
        showTimer: settings.showTimer !== undefined ? settings.showTimer : true
      }));
    }
  }, []);

  // Handle game completion
  const handleGameComplete = (score) => {
    if (score > highScore) {
      setHighScore(score);
    }
  };

  // Handle score change
  const handleScoreChange = (score) => {
    setCurrentScore(score);
  };

  // Handle mode selection
  const handleModeSelect = (modeId) => {
    const mode = Object.values(GAME_MODES).find(mode => mode.id === modeId);
    if (mode) {
      setSelectedMode(mode);
      setShowModes(false);
    }
  };

  // Handle back to menu
  const handleBackToMenu = () => {
    setGameStarted(false);
    setCurrentScore(0);
  };

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <h1>NeuroMatch</h1>
        <h2>Memory Matrix Challenge</h2>
      </header>

      <main className="app-content">
        <div className="welcome-screen">
          <div className="instructions">
            <strong>How to play:</strong>
            <ol>
              <li>A pattern of tiles will briefly light up on the grid</li>
              <li>Memorize the pattern</li>
              <li>Click on the tiles to recreate the pattern</li>
              <li>Complete the pattern correctly to advance to the next level</li>
              <li>The game gets progressively harder with larger grids and more complex patterns</li>
            </ol>
          </div>

          <div className="welcome-actions">
            <button
              className="start-button"
              onClick={() => alert('Game functionality temporarily disabled for debugging')}
            >
              Start Game
            </button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="theme-selector">
          <button
            className={`theme-button ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            Light
          </button>
          <button
            className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            Dark
          </button>
          <button
            className={`theme-button ${theme === 'blue' ? 'active' : ''}`}
            onClick={() => setTheme('blue')}
          >
            Blue
          </button>
        </div>
        <p>© 2023 NeuroMatch</p>
      </footer>
    </div>
  );
}

export default BasicApp;
