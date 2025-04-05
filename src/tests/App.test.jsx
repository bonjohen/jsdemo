import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock the GameController component to simplify testing
vi.mock('../components/GameController', () => ({
  default: ({ onGameComplete, onScoreChange }) => (
    <div data-testid="game-controller">
      <button onClick={() => onGameComplete(100)}>Complete Game</button>
      <button onClick={() => onScoreChange(50)}>Update Score</button>
    </div>
  )
}));

describe('App Component', () => {
  it('renders the welcome screen initially', () => {
    render(<App />);
    expect(screen.getByText('Welcome to NeuroMatch!')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('switches to game screen when Start Game button is clicked', () => {
    render(<App />);
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    expect(screen.getByTestId('game-controller')).toBeInTheDocument();
    expect(screen.getByText('Back to Menu')).toBeInTheDocument();
  });

  it('returns to welcome screen when Back to Menu button is clicked', () => {
    render(<App />);

    // First go to game screen
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // Then go back to welcome screen
    const backButton = screen.getByText('Back to Menu');
    fireEvent.click(backButton);

    expect(screen.getByText('Welcome to NeuroMatch!')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('updates the current score when score changes', () => {
    render(<App />);

    // Go to game screen
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // Update score
    const updateScoreButton = screen.getByText('Update Score');
    fireEvent.click(updateScoreButton);

    expect(screen.getByText('Current Score: 50')).toBeInTheDocument();
  });

  it('updates the high score when game completes with a higher score', () => {
    render(<App />);

    // Go to game screen
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    // Complete game
    const completeGameButton = screen.getByText('Complete Game');
    fireEvent.click(completeGameButton);

    expect(screen.getByText('High Score: 100')).toBeInTheDocument();
  });
});
