import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveToStorage,
  loadFromStorage,
  saveHighScore,
  getHighScores,
  savePlayerProfile,
  getPlayerProfile,
  saveGameSettings,
  getGameSettings,
  saveGameProgress,
  getGameProgress
} from '../utils/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('saveToStorage and loadFromStorage', () => {
    it('saves and loads data correctly', () => {
      const testData = { test: 'value', number: 42 };
      saveToStorage('test_key', testData);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(testData));
      
      const loadedData = loadFromStorage('test_key');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test_key');
      expect(loadedData).toEqual(testData);
    });

    it('returns default value when key does not exist', () => {
      const defaultValue = { default: true };
      const result = loadFromStorage('nonexistent_key', defaultValue);
      
      expect(result).toEqual(defaultValue);
    });

    it('handles errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      const defaultValue = { default: true };
      const result = loadFromStorage('error_key', defaultValue);
      
      expect(result).toEqual(defaultValue);
    });
  });

  describe('High Scores', () => {
    it('saves and retrieves high scores', () => {
      const scoreData = {
        score: 1000,
        playerName: 'TestPlayer',
        level: 5,
        gridSize: 4
      };
      
      saveHighScore(scoreData);
      const highScores = getHighScores();
      
      expect(highScores.length).toBe(1);
      expect(highScores[0].score).toBe(1000);
      expect(highScores[0].playerName).toBe('TestPlayer');
      expect(highScores[0].date).toBeDefined();
    });

    it('sorts high scores by score in descending order', () => {
      saveHighScore({ score: 500, playerName: 'Player1' });
      saveHighScore({ score: 1000, playerName: 'Player2' });
      saveHighScore({ score: 750, playerName: 'Player3' });
      
      const highScores = getHighScores();
      
      expect(highScores.length).toBe(3);
      expect(highScores[0].score).toBe(1000);
      expect(highScores[1].score).toBe(750);
      expect(highScores[2].score).toBe(500);
    });

    it('limits high scores to top 10', () => {
      // Add 12 scores
      for (let i = 0; i < 12; i++) {
        saveHighScore({ score: i * 100, playerName: `Player${i}` });
      }
      
      const highScores = getHighScores();
      
      expect(highScores.length).toBe(10);
      expect(highScores[0].score).toBe(1100); // Highest score
    });
  });

  describe('Player Profile', () => {
    it('saves and retrieves player profile', () => {
      const profileData = {
        name: 'TestPlayer',
        avatar: 'avatar1',
        preferences: { theme: 'dark' }
      };
      
      savePlayerProfile(profileData);
      const profile = getPlayerProfile();
      
      expect(profile).toEqual(profileData);
    });
  });

  describe('Game Settings', () => {
    it('saves and retrieves game settings', () => {
      const settings = {
        volume: 0.5,
        musicEnabled: false,
        difficulty: 'hard'
      };
      
      saveGameSettings(settings);
      const savedSettings = getGameSettings();
      
      expect(savedSettings.volume).toBe(0.5);
      expect(savedSettings.musicEnabled).toBe(false);
      expect(savedSettings.difficulty).toBe('hard');
    });

    it('returns default settings when none are saved', () => {
      const settings = getGameSettings();
      
      expect(settings).toEqual({
        volume: 0.7,
        musicEnabled: true,
        soundEffectsEnabled: true,
        difficulty: 'normal',
        theme: 'default'
      });
    });
  });

  describe('Game Progress', () => {
    it('saves and retrieves game progress', () => {
      const progressData = {
        level: 5,
        score: 750,
        completedLevels: [1, 2, 3, 4]
      };
      
      saveGameProgress(progressData);
      const progress = getGameProgress();
      
      expect(progress).toEqual(progressData);
    });
  });
});
