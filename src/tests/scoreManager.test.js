import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculateTimeBonus,
  calculateComboMultiplier,
  calculatePenalty,
  calculateLevelThreshold,
  checkLevelUp,
  calculateGridSize,
  calculatePatternLength,
  calculatePatternDisplayTime
} from '../utils/scoreManager';

describe('Score Manager', () => {
  describe('calculateScore', () => {
    it('calculates base score correctly', () => {
      const score = calculateScore(3, 4);
      // 3² × 4 × 10 = 9 × 4 × 10 = 360
      expect(score).toBe(360);
    });

    it('applies time bonus correctly', () => {
      const score = calculateScore(3, 4, 0.5);
      // Base: 360, Time Bonus: 360 × 0.5 × 0.5 = 90, Total: 450
      expect(score).toBe(450);
    });

    it('applies combo multiplier correctly', () => {
      const score = calculateScore(3, 4, 0.5, 1.5);
      // Base + Time Bonus: 450, With Multiplier: 450 × 1.5 = 675
      expect(score).toBe(675);
    });
  });

  describe('calculateTimeBonus', () => {
    it('returns 0 when response time equals or exceeds max time', () => {
      expect(calculateTimeBonus(5000, 5000)).toBe(0);
      expect(calculateTimeBonus(6000, 5000)).toBe(0);
    });

    it('returns 1 when response time is 0', () => {
      expect(calculateTimeBonus(0, 5000)).toBe(1);
    });

    it('calculates proportional bonus for times in between', () => {
      expect(calculateTimeBonus(2500, 5000)).toBe(0.5);
      expect(calculateTimeBonus(1000, 5000)).toBe(0.8);
    });
  });

  describe('calculateComboMultiplier', () => {
    it('returns 1.0 for 0 consecutive correct patterns', () => {
      expect(calculateComboMultiplier(0)).toBe(1);
    });

    it('increases by 0.1 for each consecutive correct pattern', () => {
      expect(calculateComboMultiplier(1)).toBe(1.1);
      expect(calculateComboMultiplier(5)).toBe(1.5);
    });

    it('caps at 2.0 (10 consecutive correct patterns)', () => {
      expect(calculateComboMultiplier(10)).toBe(2);
      expect(calculateComboMultiplier(15)).toBe(2);
    });
  });

  describe('calculatePenalty', () => {
    it('applies 10% penalty to current score', () => {
      expect(calculatePenalty(1000)).toBe(900);
    });

    it('applies minimum penalty of 50 points', () => {
      expect(calculatePenalty(400)).toBe(350); // 10% would be 40, but minimum is 50
    });

    it('does not reduce score below 0', () => {
      expect(calculatePenalty(30)).toBe(0);
    });
  });

  describe('calculateLevelThreshold', () => {
    it('starts at 1000 for level 1', () => {
      expect(calculateLevelThreshold(1)).toBe(1000);
    });

    it('increases exponentially with level', () => {
      expect(calculateLevelThreshold(2)).toBe(1500);
      expect(calculateLevelThreshold(3)).toBe(2250);
    });
  });

  describe('checkLevelUp', () => {
    it('returns true when score meets or exceeds threshold', () => {
      expect(checkLevelUp(1000, 1)).toBe(true);
      expect(checkLevelUp(1600, 2)).toBe(true);
    });

    it('returns false when score is below threshold', () => {
      expect(checkLevelUp(900, 1)).toBe(false);
      expect(checkLevelUp(1400, 2)).toBe(false);
    });
  });

  describe('calculateGridSize', () => {
    it('starts with 3x3 grid', () => {
      expect(calculateGridSize(1)).toBe(3);
    });

    it('increases grid size every 3 levels', () => {
      expect(calculateGridSize(3)).toBe(3);
      expect(calculateGridSize(4)).toBe(4);
      expect(calculateGridSize(7)).toBe(5);
    });

    it('caps at 6x6 grid', () => {
      expect(calculateGridSize(10)).toBe(6);
      expect(calculateGridSize(15)).toBe(6);
    });
  });

  describe('calculatePatternLength', () => {
    it('starts with 3 tiles at level 1', () => {
      expect(calculatePatternLength(1, 3)).toBe(3);
    });

    it('increases by 1 every level', () => {
      expect(calculatePatternLength(2, 3)).toBe(4);
      expect(calculatePatternLength(5, 4)).toBe(7);
    });

    it('caps at 75% of total tiles', () => {
      // 3x3 grid has 9 tiles, 75% is 6.75, so cap at 6
      expect(calculatePatternLength(10, 3)).toBe(6);
      
      // 4x4 grid has 16 tiles, 75% is 12
      expect(calculatePatternLength(15, 4)).toBe(12);
    });
  });

  describe('calculatePatternDisplayTime', () => {
    it('starts with 1000ms at level 1', () => {
      expect(calculatePatternDisplayTime(1)).toBe(1000);
    });

    it('decreases by 50ms per level', () => {
      expect(calculatePatternDisplayTime(2)).toBe(950);
      expect(calculatePatternDisplayTime(5)).toBe(800);
    });

    it('has a minimum of 300ms', () => {
      expect(calculatePatternDisplayTime(20)).toBe(300);
    });
  });
});
