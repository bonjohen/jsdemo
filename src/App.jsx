import { useState, useEffect } from 'react';
import GameController from './components/GameController';
import GameModes, { GAME_MODES } from './components/GameModes';
import PlayerProfile from './components/PlayerProfile';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import AIMode from './components/AIMode';
import AIGameController from './components/AIGameController';
import PerformanceMonitor from './components/PerformanceMonitor';
import { useTheme } from './components/ThemeProvider';
import { getHighScores, getPlayerProfile, getGameSettings } from './utils/storage';
import { AI_DIFFICULTY } from './utils/aiPlayer';
import { initAudio, playSound, playMusic, setVolume, setMute } from './utils/audioManager';
import { createParticleEffect, createScreenTransition } from './utils/visualEffects';
import { initPerformanceMonitoring, getPerformanceMode } from './utils/performanceOptimizer';
import { detectBrowserCapabilities, applyBrowserFixes, addOfflineIndicator, registerServiceWorker } from './utils/browserCompatibility';
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
  const [showAIMode, setShowAIMode] = useState(false);
  const [playerProfile, setPlayerProfile] = useState({ name: 'Player' });
  const [gameSettings, setGameSettings] = useState({
    highContrastMode: false,
    showTimer: true,
    musicEnabled: true,
    soundEffectsEnabled: true,
    volume: 0.7,
    showPerformanceMonitor: false
  });
  const [aiGameConfig, setAiGameConfig] = useState({
    difficulty: AI_DIFFICULTY.MEDIUM,
    personality: AI_PERSONALITY.BALANCED,
    gridSize: 4,
    patternLength: 4,
    rounds: 5
  });
  const [isAIMode, setIsAIMode] = useState(false);
  const [browserSupport, setBrowserSupport] = useState({
    isSupported: true,
    capabilities: {}
  });
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Initialize app on mount
  useEffect(() => {
    // Detect browser capabilities
    const capabilities = detectBrowserCapabilities();
    setBrowserSupport({
      isSupported: true, // We'll support all browsers for now
      capabilities
    });

    // Apply browser-specific fixes
    applyBrowserFixes();

    // Add offline indicator
    addOfflineIndicator();

    // Register service worker for offline support
    registerServiceWorker('/serviceWorker.js').catch(console.error);

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Initialize audio system
    initAudio().then(success => {
      setIsAudioInitialized(success);
      if (success && gameSettings.musicEnabled) {
        playMusic(true);
      }
    }).catch(console.error);

    // Apply screen transition effect
    createScreenTransition('fade', 1000);

    return () => {
      // Clean up resources when component unmounts
      if (isAudioInitialized) {
        playMusic(false);
      }
    };
  }, []);

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
        showTimer: settings.showTimer !== undefined ? settings.showTimer : true,
        musicEnabled: settings.musicEnabled !== undefined ? settings.musicEnabled : true,
        soundEffectsEnabled: settings.soundEffectsEnabled !== undefined ? settings.soundEffectsEnabled : true,
        volume: settings.volume || 0.7,
        showPerformanceMonitor: settings.showPerformanceMonitor || false
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
    setIsAIMode(false);
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

            {!showModes && !showAIMode ? (
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
                    onClick={() => {
                      setGameStarted(true);
                      setIsAIMode(false);
                    }}
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

                    <button
                      className="secondary-button ai-button"
                      onClick={() => setShowAIMode(true)}
                    >
                      AI vs. Player
                    </button>
                  </div>
                </div>
              </>
            ) : showModes ? (
              <GameModes
                onSelectMode={handleModeSelect}
                currentMode={selectedMode.id}
              />
            ) : (
              <AIMode
                onStartGame={(config) => {
                  setAiGameConfig(config);
                  setGameStarted(true);
                  setIsAIMode(true);
                }}
                onBack={() => setShowAIMode(false)}
                playerName={playerProfile.name}
              />
            )}

            {(showModes || showAIMode) && (
              <button
                className="back-button"
                onClick={() => {
                  setShowModes(false);
                  setShowAIMode(false);
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
                {!isAIMode ? (
                  <>
                    <h3>{selectedMode.name}</h3>
                    <p>Player: {playerProfile.name}</p>
                  </>
                ) : (
                  <>
                    <h3>AI vs. Player Mode</h3>
                    <p>Player: {playerProfile.name} | AI Difficulty: {aiGameConfig.difficulty}</p>
                  </>
                )}
              </div>
            </div>

            {!isAIMode ? (
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
            ) : (
              <AIGameController
                initialGridSize={aiGameConfig.gridSize}
                initialPatternLength={aiGameConfig.patternLength}
                patternDisplayTime={1000}
                onGameComplete={handleGameComplete}
                playerName={playerProfile.name}
                aiDifficulty={aiGameConfig.difficulty}
                aiPersonality={aiGameConfig.personality}
                rounds={aiGameConfig.rounds}
                highContrast={gameSettings.highContrastMode}
                soundEnabled={gameSettings.soundEffectsEnabled}
              />
            )}

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

      {/* Performance Monitor */}
      <PerformanceMonitor visible={gameSettings.showPerformanceMonitor} />
    </div>
  );
}

export default App;
