import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Grid from '../components/Grid';

describe('Grid Component', () => {
  it('renders a grid with the correct number of tiles', () => {
    render(<Grid size={3} />);
    const tiles = screen.getAllByRole('button');
    expect(tiles.length).toBe(9); // 3x3 grid
  });

  it('renders a grid with the correct number of tiles when size changes', () => {
    render(<Grid size={4} />);
    const tiles = screen.getAllByRole('button');
    expect(tiles.length).toBe(16); // 4x4 grid
  });

  it('shows active tiles when showPattern is true', () => {
    render(<Grid size={3} activePattern={[0, 4, 8]} showPattern={true} />);
    const tiles = screen.getAllByRole('button');
    
    // Check that the active tiles have the 'active' class
    expect(tiles[0]).toHaveClass('active');
    expect(tiles[4]).toHaveClass('active');
    expect(tiles[8]).toHaveClass('active');
    
    // Check that other tiles don't have the 'active' class
    expect(tiles[1]).not.toHaveClass('active');
    expect(tiles[2]).not.toHaveClass('active');
  });

  it('does not show active tiles when showPattern is false', () => {
    render(<Grid size={3} activePattern={[0, 4, 8]} showPattern={false} />);
    const tiles = screen.getAllByRole('button');
    
    // Check that none of the tiles have the 'active' class
    tiles.forEach(tile => {
      expect(tile).not.toHaveClass('active');
    });
  });

  it('calls onTileClick with the correct index when a tile is clicked', () => {
    const mockOnTileClick = vi.fn();
    render(<Grid size={3} onTileClick={mockOnTileClick} />);
    const tiles = screen.getAllByRole('button');
    
    fireEvent.click(tiles[4]); // Click the middle tile
    
    expect(mockOnTileClick).toHaveBeenCalledWith(4, [4]);
  });

  it('toggles selection when a tile is clicked multiple times', () => {
    const mockOnTileClick = vi.fn();
    render(<Grid size={3} onTileClick={mockOnTileClick} />);
    const tiles = screen.getAllByRole('button');
    
    // First click - select
    fireEvent.click(tiles[4]);
    expect(tiles[4]).toHaveClass('selected');
    
    // Second click - deselect
    fireEvent.click(tiles[4]);
    expect(tiles[4]).not.toHaveClass('selected');
  });

  it('does not allow interaction when disabled', () => {
    const mockOnTileClick = vi.fn();
    render(<Grid size={3} onTileClick={mockOnTileClick} disabled={true} />);
    const tiles = screen.getAllByRole('button');
    
    fireEvent.click(tiles[4]);
    
    expect(mockOnTileClick).not.toHaveBeenCalled();
    expect(tiles[4]).not.toHaveClass('selected');
  });
});
