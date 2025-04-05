import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

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
    
    expect(screen.getByText('Game will be implemented here')).toBeInTheDocument();
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
});
