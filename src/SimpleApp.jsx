import { useState, useEffect } from 'react';
import SimpleGameController from './components/SimpleGameController';
import GameModes, { GAME_MODES } from './components/GameModes';
import PlayerProfile from './components/PlayerProfile';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import { useTheme } from './components/ThemeProvider';
import { getHighScores, getPlayerProfile, getGameSettings } from './utils/storage';
import './styles/App.css';

function SimpleApp() {
  const { theme } = useTheme();

  // Game state
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

  // Handle profile update
  const handleProfileUpdate = (profile) => {
    setPlayerProfile(profile);
    setShowProfile(false);
  };

  // Handle settings update
  const handleSettingsUpdate = (settings) => {
    setGameSettings(settings);
    setShowSettings(false);
  };

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <h1>NeuroMatch</h1>
        <h2>Memory Matrix Challenge</h2>
      </header>

      <main className="app-content">
        {!gameStarted ? (
          <div className="welcome-screen">
            {!showModes && !showProfile && !showLeaderboard && !showSettings ? (
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
            ) : showModes ? (
              <GameModes
                onSelectMode={handleModeSelect}
                currentMode={selectedMode.id}
              />
            ) : showProfile ? (
              <PlayerProfile
                profile={playerProfile}
                onSave={handleProfileUpdate}
                onCancel={() => setShowProfile(false)}
              />
            ) : showLeaderboard ? (
              <Leaderboard
                onClose={() => setShowLeaderboard(false)}
              />
            ) : (
              <Settings
                settings={gameSettings}
                onSave={handleSettingsUpdate}
                onCancel={() => setShowSettings(false)}
              />
            )}

            {(showModes || showProfile || showLeaderboard || showSettings) && (
              <button
                className="back-button"
                onClick={() => {
                  setShowModes(false);
                  setShowProfile(false);
                  setShowLeaderboard(false);
                  setShowSettings(false);
                }}
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

            <SimpleGameController
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
        <div className="score-display">
          <div className="current-score">
            <span>Score:</span>
            <span>{currentScore}</span>
          </div>
          <div className="high-score">
            <span>High Score:</span>
            <span>{highScore}</span>
          </div>
        </div>
        <p>© 2023 NeuroMatch</p>
      </footer>
    </div>
  );
}

export default SimpleApp;
