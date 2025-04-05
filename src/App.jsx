import { useState, useEffect } from 'react';
import GameController from './components/GameController';
import GameModes, { GAME_MODES } from './components/GameModes';
import PlayerProfile from './components/PlayerProfile';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import { useTheme } from './components/ThemeProvider';
import { getHighScores, getPlayerProfile, getGameSettings } from './utils/storage';
import './styles/App.css';

function App() {
  const { currentTheme } = useTheme();
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [selectedMode, setSelectedMode] = useState(GAME_MODES.STANDARD);
  const [showModes, setShowModes] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
  const handleGameComplete = (finalScore) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
  };

  // Handle score changes during gameplay
  const handleScoreChange = (newScore) => {
    setCurrentScore(newScore);
  };

  // Handle mode selection
  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowModes(false);
  };

  // Handle profile save
  const handleProfileSave = (profile) => {
    setPlayerProfile(profile);
  };

  // Handle back to menu
  const handleBackToMenu = () => {
    setGameStarted(false);
    setCurrentScore(0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>NeuroMatch: Memory Matrix Challenge</h1>
        <p>Test and improve your memory with this pattern matching game!</p>
        {gameStarted && (
          <div className="header-scores">
            <span>Current Score: {currentScore}</span>
            <span>High Score: {highScore}</span>
          </div>
        )}
      </header>
      <main className="app-main">
        {!gameStarted ? (
          <div className="welcome-screen">
            <h2>Welcome to NeuroMatch!</h2>
            <p>
              Observe the pattern of tiles that briefly illuminate, then replicate
              the pattern. Each level increases in complexity.
            </p>

            {!showModes ? (
              <>
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
                    onClick={() => setGameStarted(true)}
                  >
                    Start Game
                  </button>

                  <div className="secondary-actions">
                    <button
                      className="secondary-button"
                      onClick={() => setShowModes(true)}
                    >
                      Game Modes
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => setShowProfile(true)}
                    >
                      Player Profile
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => setShowLeaderboard(true)}
                    >
                      Leaderboard
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => setShowSettings(true)}
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <GameModes
                onSelectMode={handleModeSelect}
                currentMode={selectedMode.id}
              />
            )}

            {showModes && (
              <button
                className="back-button"
                onClick={() => setShowModes(false)}
              >
                Back
              </button>
            )}
          </div>
        ) : (
          <div className="game-container">
            <div className="game-header">
              <div className="game-mode-info">
                <h3>{selectedMode.name}</h3>
                <p>Player: {playerProfile.name}</p>
              </div>
            </div>

            <GameController
              initialGridSize={selectedMode.initialGridSize}
              initialPatternLength={selectedMode.initialPatternLength}
              patternDisplayTime={selectedMode.patternDisplayTime}
              onGameComplete={handleGameComplete}
              onScoreChange={handleScoreChange}
              playerName={playerProfile.name}
              timeLimit={selectedMode.timeLimit}
              lives={selectedMode.lives}
              gameMode={selectedMode.id}
              highContrast={gameSettings.highContrastMode}
            />

            <button
              className="reset-button"
              onClick={handleBackToMenu}
            >
              Back to Menu
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} NeuroMatch</p>
      </footer>

      {/* Modals */}
      <PlayerProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onProfileSave={handleProfileSave}
      />

      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
