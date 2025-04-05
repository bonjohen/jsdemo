import { useState } from 'react';
import './styles/App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1>NeuroMatch: Memory Matrix Challenge</h1>
        <p>Test and improve your memory with this pattern matching game!</p>
      </header>
      <main className="app-main">
        {!gameStarted ? (
          <div className="welcome-screen">
            <h2>Welcome to NeuroMatch!</h2>
            <p>
              Observe the pattern of tiles that briefly illuminate, then replicate
              the pattern. Each level increases in complexity.
            </p>
            <button 
              className="start-button"
              onClick={() => setGameStarted(true)}
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="game-container">
            <p>Game will be implemented here</p>
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
