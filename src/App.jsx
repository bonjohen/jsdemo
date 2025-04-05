import { useState } from 'react';
import GameController from './components/GameController';
import './styles/App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

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
            <button
              className="start-button"
              onClick={() => setGameStarted(true)}
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="game-container">
            <GameController
              initialGridSize={3}
              initialPatternLength={3}
              patternDisplayTime={1000}
              onGameComplete={handleGameComplete}
              onScoreChange={handleScoreChange}
            />
            <button
              className="reset-button"
              onClick={() => setGameStarted(false)}
            >
              Back to Menu
            </button>
          </div>
        )}
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} NeuroMatch</p>
      </footer>
    </div>
  );
}

export default App;
