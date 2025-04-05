import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/GameModes.css';

/**
 * Game modes configuration
 */
export const GAME_MODES = {
  STANDARD: {
    id: 'standard',
    name: 'Standard Mode',
    description: 'Progressive difficulty with increasing grid size and pattern complexity.',
    initialGridSize: 3,
    initialPatternLength: 3,
    patternDisplayTime: 1000,
    timeLimit: null,
    lives: 3
  },
  PRACTICE: {
    id: 'practice',
    name: 'Practice Mode',
    description: 'Customize settings and practice without pressure.',
    initialGridSize: 3,
    initialPatternLength: 3,
    patternDisplayTime: 1500,
    timeLimit: null,
    lives: Infinity
  },
  TIME_ATTACK: {
    id: 'time_attack',
    name: 'Time Attack',
    description: 'Complete as many patterns as possible within the time limit.',
    initialGridSize: 4,
    initialPatternLength: 4,
    patternDisplayTime: 800,
    timeLimit: 60000, // 60 seconds
    lives: Infinity
  },
  ENDLESS: {
    id: 'endless',
    name: 'Endless Mode',
    description: 'Play until you make a mistake. How far can you go?',
    initialGridSize: 3,
    initialPatternLength: 3,
    patternDisplayTime: 1000,
    timeLimit: null,
    lives: 1
  }
};

/**
 * GameModes component for selecting different game modes
 * @param {Object} props - Component props
 * @param {Function} props.onSelectMode - Callback when a mode is selected
 * @param {string} props.currentMode - Currently selected mode ID
 */
const GameModes = ({ onSelectMode, currentMode = GAME_MODES.STANDARD.id }) => {
  const [practiceSettings, setPracticeSettings] = useState({
    gridSize: 3,
    patternLength: 3,
    displayTime: 1500
  });

  // Handle mode selection
  const handleModeSelect = (modeId) => {
    if (modeId === GAME_MODES.PRACTICE.id) {
      // For practice mode, include custom settings
      onSelectMode({
        ...GAME_MODES.PRACTICE,
        initialGridSize: practiceSettings.gridSize,
        initialPatternLength: practiceSettings.patternLength,
        patternDisplayTime: practiceSettings.displayTime
      });
    } else {
      // For other modes, use predefined settings
      onSelectMode(GAME_MODES[modeId.toUpperCase()]);
    }
  };

  // Handle practice settings change
  const handlePracticeSettingChange = (setting, value) => {
    setPracticeSettings({
      ...practiceSettings,
      [setting]: parseInt(value, 10)
    });
  };

  return (
    <div className="game-modes">
      <h2>Game Modes</h2>
      
      <div className="mode-cards">
        {Object.values(GAME_MODES).map((mode) => (
          <div 
            key={mode.id}
            className={`mode-card ${currentMode === mode.id ? 'selected' : ''}`}
            onClick={() => handleModeSelect(mode.id)}
          >
            <h3>{mode.name}</h3>
            <p>{mode.description}</p>
            
            {mode.id === GAME_MODES.PRACTICE.id && currentMode === mode.id && (
              <div className="practice-settings">
                <div className="setting">
                  <label htmlFor="gridSize">Grid Size:</label>
                  <select 
                    id="gridSize"
                    value={practiceSettings.gridSize}
                    onChange={(e) => handlePracticeSettingChange('gridSize', e.target.value)}
                  >
                    <option value="3">3x3</option>
                    <option value="4">4x4</option>
                    <option value="5">5x5</option>
                    <option value="6">6x6</option>
                  </select>
                </div>
                
                <div className="setting">
                  <label htmlFor="patternLength">Pattern Length:</label>
                  <select 
                    id="patternLength"
                    value={practiceSettings.patternLength}
                    onChange={(e) => handlePracticeSettingChange('patternLength', e.target.value)}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                
                <div className="setting">
                  <label htmlFor="displayTime">Display Time (ms):</label>
                  <select 
                    id="displayTime"
                    value={practiceSettings.displayTime}
                    onChange={(e) => handlePracticeSettingChange('displayTime', e.target.value)}
                  >
                    <option value="2000">2000 (Easy)</option>
                    <option value="1500">1500 (Normal)</option>
                    <option value="1000">1000 (Hard)</option>
                    <option value="500">500 (Expert)</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="mode-stats">
              <span>Grid: {mode.initialGridSize}x{mode.initialGridSize}</span>
              <span>Pattern: {mode.initialPatternLength}</span>
              {mode.timeLimit && <span>Time: {mode.timeLimit / 1000}s</span>}
              <span>Lives: {mode.lives === Infinity ? '∞' : mode.lives}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

GameModes.propTypes = {
  onSelectMode: PropTypes.func.isRequired,
  currentMode: PropTypes.string
};

export default GameModes;
