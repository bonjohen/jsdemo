import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { savePlayerProfile, getPlayerProfile } from '../utils/storage';
import '../styles/PlayerProfile.css';

/**
 * PlayerProfile component for managing player information
 * @param {Object} props - Component props
 * @param {Function} props.onProfileSave - Callback when profile is saved
 * @param {boolean} props.isOpen - Whether the profile modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 */
const PlayerProfile = ({ onProfileSave, isOpen, onClose }) => {
  const [profile, setProfile] = useState({
    name: '',
    avatar: 'avatar1',
    preferences: {
      theme: 'default'
    }
  });

  // Load existing profile on mount
  useEffect(() => {
    const savedProfile = getPlayerProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle preference changes
  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatar) => {
    setProfile(prev => ({
      ...prev,
      avatar
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save profile to storage
    savePlayerProfile(profile);
    
    // Notify parent component
    if (onProfileSave) {
      onProfileSave(profile);
    }
    
    // Close modal
    if (onClose) {
      onClose();
    }
  };

  // Available avatars
  const avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6'];

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Player Profile</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Select Avatar:</label>
            <div className="avatar-grid">
              {avatars.map((avatar) => (
                <div
                  key={avatar}
                  className={`avatar ${profile.avatar === avatar ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <div className={`avatar-image ${avatar}`}></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="theme">Theme:</label>
            <select
              id="theme"
              name="theme"
              value={profile.preferences.theme}
              onChange={handlePreferenceChange}
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="colorful">Colorful</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PlayerProfile.propTypes = {
  onProfileSave: PropTypes.func,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PlayerProfile;
