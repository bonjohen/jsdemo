import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import GameController from '../components/GameController';

// Mock the pattern generator to return predictable patterns
vi.mock('../utils/patternGenerator', () => ({
  generatePattern: vi.fn().mockImplementation((size, length) => {
    return Array.from({ length }, (_, i) => i);
  })
}));

describe('GameController Component', () => {
  beforeEach(() => {
    // Reset timers before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the initial idle state correctly', () => {
    render(<GameController />);
    expect(screen.getByText('Ready to Play?')).toBeInTheDocument();
    expect(screen.getByText('Start Level 1')).toBeInTheDocument();
  });

  it('starts countdown when start button is clicked', () => {
    render(<GameController />);
    
    // Click start button
    const startButton = screen.getByText('Start Level 1');
    fireEvent.click(startButton);
    
    // Should show countdown
    expect(screen.getByText('Get Ready!')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('progresses through countdown sequence', async () => {
    render(<GameController />);
    
    // Click start button
    const startButton = screen.getByText('Start Level 1');
    fireEvent.click(startButton);
    
    // Initial countdown is 3
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Advance timer by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Countdown should be 2
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Advance timer by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Countdown should be 1
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Advance timer by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Should now show the pattern
    expect(screen.getByText('Memorize the pattern!')).toBeInTheDocument();
  });

  it('transitions from pattern display to input phase', () => {
    render(<GameController patternDisplayTime={1000} />);
    
    // Start the game
    const startButton = screen.getByText('Start Level 1');
    fireEvent.click(startButton);
    
    // Skip countdown
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Should be in pattern display phase
    expect(screen.getByText('Memorize the pattern!')).toBeInTheDocument();
    
    // Advance timer by pattern display time
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Should now be in input phase
    expect(screen.getByText('Reproduce the pattern')).toBeInTheDocument();
  });

  it('calls onScoreChange when score changes', () => {
    const mockOnScoreChange = vi.fn();
    render(
      <GameController 
        initialPatternLength={1} 
        onScoreChange={mockOnScoreChange} 
        patternDisplayTime={1000}
      />
    );
    
    // Start the game
    const startButton = screen.getByText('Start Level 1');
    fireEvent.click(startButton);
    
    // Skip countdown and pattern display
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    // Click the first tile (which should be part of the pattern)
    const tiles = screen.getAllByRole('button');
    fireEvent.click(tiles[0]);
    
    // Should show success message
    expect(screen.getByText('Correct! Well done!')).toBeInTheDocument();
    
    // Should have called onScoreChange
    expect(mockOnScoreChange).toHaveBeenCalled();
  });

  it('calls onGameComplete when pattern is incorrect', () => {
    const mockOnGameComplete = vi.fn();
    render(
      <GameController 
        initialPatternLength={1} 
        onGameComplete={mockOnGameComplete} 
        patternDisplayTime={1000}
      />
    );
    
    // Start the game
    const startButton = screen.getByText('Start Level 1');
    fireEvent.click(startButton);
    
    // Skip countdown and pattern display
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    // Click the wrong tile (pattern is [0], so click [1])
    const tiles = screen.getAllByRole('button');
    fireEvent.click(tiles[1]);
    
    // Should show failure message
    expect(screen.getByText('Incorrect pattern!')).toBeInTheDocument();
    
    // Should have called onGameComplete
    expect(mockOnGameComplete).toHaveBeenCalled();
  });
});
