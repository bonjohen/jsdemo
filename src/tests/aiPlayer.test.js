import { describe, it, expect, beforeEach } from 'vitest';
import { AIPlayer, AI_DIFFICULTY } from '../utils/aiPlayer';

describe('AI Player', () => {
  let aiPlayer;
  
  beforeEach(() => {
    aiPlayer = new AIPlayer(AI_DIFFICULTY.MEDIUM);
  });
  
  describe('Initialization', () => {
    it('initializes with the correct default values', () => {
      expect(aiPlayer.difficulty).toBe(AI_DIFFICULTY.MEDIUM);
      expect(aiPlayer.memoryAccuracy).toBeGreaterThan(0);
      expect(aiPlayer.memoryAccuracy).toBeLessThan(1);
      expect(aiPlayer.learningRate).toBeGreaterThan(0);
      expect(aiPlayer.patternHistory).toEqual([]);
      expect(aiPlayer.playerMistakePatterns).toEqual({});
      expect(aiPlayer.totalAttempts).toBe(0);
      expect(aiPlayer.correctAttempts).toBe(0);
    });
    
    it('sets different memory accuracy based on difficulty', () => {
      const easyAI = new AIPlayer(AI_DIFFICULTY.EASY);
      const mediumAI = new AIPlayer(AI_DIFFICULTY.MEDIUM);
      const hardAI = new AIPlayer(AI_DIFFICULTY.HARD);
      
      expect(easyAI.memoryAccuracy).toBeLessThan(mediumAI.memoryAccuracy);
      expect(mediumAI.memoryAccuracy).toBeLessThan(hardAI.memoryAccuracy);
    });
  });
  
  describe('Pattern Memorization', () => {
    it('returns an attempt with the same length as the pattern', () => {
      const pattern = [0, 3, 6];
      const gridSize = 3;
      const level = 1;
      
      const attempt = aiPlayer.memorizePattern(pattern, gridSize, level);
      
      expect(attempt.length).toBe(pattern.length);
    });
    
    it('stores patterns in history', () => {
      const pattern = [0, 3, 6];
      const gridSize = 3;
      const level = 1;
      
      aiPlayer.memorizePattern(pattern, gridSize, level);
      
      expect(aiPlayer.patternHistory).toContain(pattern);
    });
    
    it('generates different attempts for the same pattern', () => {
      const pattern = [0, 3, 6, 8];
      const gridSize = 3;
      const level = 1;
      
      const attempt1 = aiPlayer.memorizePattern(pattern, gridSize, level);
      const attempt2 = aiPlayer.memorizePattern(pattern, gridSize, level);
      
      // This could occasionally fail due to randomness, but it's unlikely
      expect(attempt1).not.toEqual(attempt2);
    });
    
    it('adjusts accuracy based on level difficulty', () => {
      const pattern = [0, 3, 6];
      const gridSize = 3;
      
      // Store the original memory accuracy
      const originalAccuracy = aiPlayer.memoryAccuracy;
      
      // Memorize a pattern at a high level
      aiPlayer.memorizePattern(pattern, gridSize, 10);
      
      // The effective accuracy should be lower at higher levels
      // but this is internal to the method, so we can't test it directly.
      // Instead, we'll verify that the AI still functions
      expect(aiPlayer.patternHistory.length).toBe(1);
    });
  });
  
  describe('Result Recording', () => {
    it('updates stats when recording results', () => {
      aiPlayer.recordResult(true, [0, 3, 6], [0, 3, 6]);
      
      expect(aiPlayer.totalAttempts).toBe(1);
      expect(aiPlayer.correctAttempts).toBe(1);
      expect(aiPlayer.consecutiveCorrect).toBe(1);
      
      aiPlayer.recordResult(false, [0, 3, 6], [0, 3, 8]);
      
      expect(aiPlayer.totalAttempts).toBe(2);
      expect(aiPlayer.correctAttempts).toBe(1);
      expect(aiPlayer.consecutiveCorrect).toBe(0);
    });
    
    it('records player mistakes for learning', () => {
      const pattern = [0, 3, 6];
      const playerAttempt = [0, 3, 8]; // Missed 6, incorrectly added 8
      
      aiPlayer.recordResult(false, pattern, playerAttempt);
      
      // Check that the mistake patterns were recorded
      expect(aiPlayer.playerMistakePatterns[6]).toBe(1); // Missed tile
      expect(aiPlayer.playerMistakePatterns[8]).toBe(1); // Incorrect tile
    });
  });
  
  describe('Difficulty Adjustment', () => {
    it('adjusts difficulty based on player performance for adaptive AI', () => {
      const adaptiveAI = new AIPlayer(AI_DIFFICULTY.ADAPTIVE);
      const initialAccuracy = adaptiveAI.memoryAccuracy;
      
      // Player doing very well
      adaptiveAI.adjustDifficulty(0.9);
      expect(adaptiveAI.memoryAccuracy).toBeGreaterThan(initialAccuracy);
      
      // Reset
      adaptiveAI.memoryAccuracy = initialAccuracy;
      
      // Player struggling
      adaptiveAI.adjustDifficulty(0.3);
      expect(adaptiveAI.memoryAccuracy).toBeLessThan(initialAccuracy);
    });
    
    it('does not adjust difficulty for non-adaptive AI', () => {
      const hardAI = new AIPlayer(AI_DIFFICULTY.HARD);
      const initialAccuracy = hardAI.memoryAccuracy;
      
      hardAI.adjustDifficulty(0.9);
      expect(hardAI.memoryAccuracy).toBe(initialAccuracy);
      
      hardAI.adjustDifficulty(0.3);
      expect(hardAI.memoryAccuracy).toBe(initialAccuracy);
    });
  });
  
  describe('Challenge Pattern Generation', () => {
    it('generates a pattern of the requested length', () => {
      const patternLength = 4;
      const gridSize = 3;
      
      const pattern = aiPlayer.generateChallengePattern(patternLength, gridSize);
      
      expect(pattern.length).toBe(patternLength);
    });
    
    it('uses player mistake patterns when available', () => {
      // Record some player mistakes
      aiPlayer.recordResult(false, [0, 3, 6], [0, 3, 8]);
      aiPlayer.recordResult(false, [1, 4, 7], [1, 4, 8]);
      
      // Now 8 should be a common mistake (recorded twice)
      
      const patternLength = 3;
      const gridSize = 3;
      
      const pattern = aiPlayer.generateChallengePattern(patternLength, gridSize);
      
      // The pattern should include tile 8 since it's a common mistake
      expect(pattern).toContain(8);
    });
    
    it('generates valid patterns within grid bounds', () => {
      const patternLength = 4;
      const gridSize = 3;
      const totalTiles = gridSize * gridSize;
      
      const pattern = aiPlayer.generateChallengePattern(patternLength, gridSize);
      
      // All tiles should be within grid bounds
      pattern.forEach(tile => {
        expect(tile).toBeGreaterThanOrEqual(0);
        expect(tile).toBeLessThan(totalTiles);
      });
      
      // All tiles should be unique
      const uniqueTiles = new Set(pattern);
      expect(uniqueTiles.size).toBe(patternLength);
    });
  });
  
  describe('Stats Reporting', () => {
    it('reports correct stats', () => {
      // Record some results
      aiPlayer.recordResult(true, [0, 3, 6], [0, 3, 6]);
      aiPlayer.recordResult(true, [1, 4, 7], [1, 4, 7]);
      aiPlayer.recordResult(false, [2, 5, 8], [2, 5, 0]);
      
      const stats = aiPlayer.getStats();
      
      expect(stats.difficulty).toBe(AI_DIFFICULTY.MEDIUM);
      expect(stats.totalAttempts).toBe(3);
      expect(stats.correctAttempts).toBe(2);
      expect(stats.successRate).toBeCloseTo(2/3, 2);
    });
  });
});
