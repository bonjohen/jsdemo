import { describe, it, expect } from 'vitest';
import { generatePattern } from '../utils/patternGenerator';

describe('Pattern Generator', () => {
  it('generates a pattern with the correct length', () => {
    const pattern = generatePattern(3, 5);
    expect(pattern.length).toBe(5);
  });

  it('limits pattern length to the total number of tiles', () => {
    const pattern = generatePattern(3, 20); // 3x3 grid has only 9 tiles
    expect(pattern.length).toBe(9);
  });

  it('generates unique indices within the pattern', () => {
    const pattern = generatePattern(4, 8);
    const uniqueIndices = new Set(pattern);
    expect(uniqueIndices.size).toBe(pattern.length);
  });

  it('generates indices within the valid range', () => {
    const gridSize = 4;
    const totalTiles = gridSize * gridSize;
    const pattern = generatePattern(gridSize, 10);
    
    pattern.forEach(index => {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(totalTiles);
    });
  });

  it('generates different patterns on subsequent calls', () => {
    const pattern1 = generatePattern(4, 8);
    const pattern2 = generatePattern(4, 8);
    
    // There's a small chance this could fail randomly,
    // but it's very unlikely with a 4x4 grid and 8 tiles
    expect(pattern1).not.toEqual(pattern2);
  });

  it('generates sequential patterns when specified', () => {
    const gridSize = 4;
    const pattern = generatePattern(gridSize, 5, 'sequential');
    
    // Check that at least some tiles are adjacent
    let hasAdjacentTiles = false;
    
    for (let i = 0; i < pattern.length - 1; i++) {
      const current = pattern[i];
      const next = pattern[i + 1];
      
      // Check if tiles are adjacent (horizontally, vertically)
      const isAdjacent = 
        Math.abs(current - next) === 1 || // horizontal
        Math.abs(current - next) === gridSize; // vertical
      
      if (isAdjacent) {
        hasAdjacentTiles = true;
        break;
      }
    }
    
    expect(hasAdjacentTiles).toBe(true);
  });

  it('generates shape patterns when specified', () => {
    // This is harder to test deterministically, so we'll just check
    // that it returns a valid pattern of the correct length
    const pattern = generatePattern(5, 5, 'shape');
    expect(pattern.length).toBe(5);
  });
});
