import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import { getGameSettings, saveGameSettings } from '../utils/storage';
import '../styles/Settings.css';

/**
 * Settings component for game settings and preferences
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the settings modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 */
const Settings = ({ isOpen, onClose }) => {
  const { currentTheme, changeTheme, themes } = useTheme();
  
  const [settings, setSettings] = useState({
    volume: 0.7,
    musicEnabled: true,
    soundEffectsEnabled: true,
    difficulty: 'normal',
    showTimer: true,
    keyboardControls: true,
    highContrastMode: false
  });
  
  // Load settings on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedSettings = getGameSettings();
      setSettings(prev => ({
        ...prev,
        ...savedSettings
      }));
    }
  }, [isOpen]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Use checked for checkboxes, value for other inputs
    const newValue = type === 'checkbox' ? checked : 
                    type === 'range' ? parseFloat(value) : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Handle theme change
  const handleThemeChange = (e) => {
    changeTheme(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save settings
    saveGameSettings(settings);
    
    // Close modal
    onClose();
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="settings-modal-overlay" role="dialog" aria-labelledby="settings-title">
      <div className="settings-modal">
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>
        
        <h2 id="settings-title">Game Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3>Display</h3>
            
            <div className="form-group">
              <label htmlFor="theme">Theme:</label>
              <select
                id="theme"
                name="theme"
                value={currentTheme}
                onChange={handleThemeChange}
              >
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="showTimer"
                name="showTimer"
                checked={settings.showTimer}
                onChange={handleChange}
              />
              <label htmlFor="showTimer">Show Timer</label>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="highContrastMode"
                name="highContrastMode"
                checked={settings.highContrastMode}
                onChange={handleChange}
              />
              <label htmlFor="highContrastMode">High Contrast Mode</label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Audio</h3>
            
            <div className="form-group">
              <label htmlFor="volume">Volume: {Math.round(settings.volume * 100)}%</label>
              <input
                type="range"
                id="volume"
                name="volume"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="musicEnabled"
                name="musicEnabled"
                checked={settings.musicEnabled}
                onChange={handleChange}
              />
              <label htmlFor="musicEnabled">Background Music</label>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="soundEffectsEnabled"
                name="soundEffectsEnabled"
                checked={settings.soundEffectsEnabled}
                onChange={handleChange}
              />
              <label htmlFor="soundEffectsEnabled">Sound Effects</label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Gameplay</h3>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty:</label>
              <select
                id="difficulty"
                name="difficulty"
                value={settings.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="keyboardControls"
                name="keyboardControls"
                checked={settings.keyboardControls}
                onChange={handleChange}
              />
              <label htmlFor="keyboardControls">Enable Keyboard Controls</label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

Settings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Settings;
