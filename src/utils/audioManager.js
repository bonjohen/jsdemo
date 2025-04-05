/**
 * Audio Manager for handling game sounds and music
 */

// Audio context for Web Audio API
let audioContext = null;

// Sound effect buffers
const soundBuffers = {};

// Background music elements
let backgroundMusic = null;
let isMusicPlaying = false;

// Volume settings
const volumes = {
  master: 0.7,
  music: 0.5,
  effects: 0.8
};

// Mute settings
const muted = {
  master: false,
  music: false,
  effects: false
};

/**
 * Initialize the audio system
 * @returns {Promise} - Promise that resolves when audio is initialized
 */
export const initAudio = async () => {
  try {
    // Create audio context on user interaction to comply with browser autoplay policies
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume audio context if it's suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Load sound effects
    await Promise.all([
      loadSound('tile_activate', '/sounds/tile_activate.mp3'),
      loadSound('tile_select', '/sounds/tile_select.mp3'),
      loadSound('correct', '/sounds/correct.mp3'),
      loadSound('incorrect', '/sounds/incorrect.mp3'),
      loadSound('level_up', '/sounds/level_up.mp3'),
      loadSound('game_over', '/sounds/game_over.mp3'),
      loadSound('countdown', '/sounds/countdown.mp3'),
      loadSound('achievement', '/sounds/achievement.mp3')
    ]);
    
    // Initialize background music
    backgroundMusic = new Audio('/sounds/background_music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = volumes.master * volumes.music;
    
    return true;
  } catch (error) {
    console.error('Error initializing audio:', error);
    return false;
  }
};

/**
 * Load a sound file and store it in the buffer
 * @param {string} name - Name of the sound
 * @param {string} url - URL of the sound file
 * @returns {Promise} - Promise that resolves when the sound is loaded
 */
const loadSound = async (name, url) => {
  try {
    // Create a placeholder for sounds that might not exist yet
    // This allows the game to function even if sounds aren't available
    soundBuffers[name] = null;
    
    // Fetch the sound file
    const response = await fetch(url);
    
    // If the sound file doesn't exist, just return
    if (!response.ok) {
      console.warn(`Sound file not found: ${url}`);
      return;
    }
    
    // Convert to array buffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Store in the buffer
    soundBuffers[name] = audioBuffer;
  } catch (error) {
    console.warn(`Error loading sound ${name}:`, error);
  }
};

/**
 * Play a sound effect
 * @param {string} name - Name of the sound to play
 * @param {Object} options - Options for playing the sound
 * @param {number} options.volume - Volume override (0-1)
 * @param {number} options.pitch - Pitch adjustment (0.5-2)
 * @param {number} options.pan - Stereo panning (-1 to 1)
 */
export const playSound = (name, options = {}) => {
  // Check if audio is available and not muted
  if (!audioContext || muted.master || muted.effects || !soundBuffers[name]) {
    return;
  }
  
  try {
    // Create a sound source
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffers[name];
    
    // Create a gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = (options.volume !== undefined ? options.volume : 1) * 
                          volumes.master * volumes.effects;
    
    // Apply pitch adjustment if specified
    if (options.pitch !== undefined) {
      source.playbackRate.value = Math.max(0.5, Math.min(2, options.pitch));
    }
    
    // Apply stereo panning if specified
    if (options.pan !== undefined && audioContext.createStereoPanner) {
      const panNode = audioContext.createStereoPanner();
      panNode.pan.value = Math.max(-1, Math.min(1, options.pan));
      source.connect(panNode);
      panNode.connect(gainNode);
    } else {
      source.connect(gainNode);
    }
    
    // Connect to the destination (speakers)
    gainNode.connect(audioContext.destination);
    
    // Play the sound
    source.start(0);
  } catch (error) {
    console.warn(`Error playing sound ${name}:`, error);
  }
};

/**
 * Play or pause background music
 * @param {boolean} play - Whether to play or pause
 */
export const playMusic = (play = true) => {
  if (!backgroundMusic || muted.master || muted.music) {
    return;
  }
  
  try {
    if (play && !isMusicPlaying) {
      backgroundMusic.play().catch(error => {
        console.warn('Error playing background music:', error);
      });
      isMusicPlaying = true;
    } else if (!play && isMusicPlaying) {
      backgroundMusic.pause();
      isMusicPlaying = false;
    }
  } catch (error) {
    console.warn('Error controlling background music:', error);
  }
};

/**
 * Set the volume for a specific audio type
 * @param {string} type - Type of audio ('master', 'music', 'effects')
 * @param {number} level - Volume level (0-1)
 */
export const setVolume = (type, level) => {
  // Ensure level is between 0 and 1
  const safeLevel = Math.max(0, Math.min(1, level));
  
  // Update the volume setting
  if (volumes[type] !== undefined) {
    volumes[type] = safeLevel;
  }
  
  // Apply the new volume to background music
  if (backgroundMusic && (type === 'master' || type === 'music')) {
    backgroundMusic.volume = volumes.master * volumes.music;
  }
};

/**
 * Mute or unmute a specific audio type
 * @param {string} type - Type of audio ('master', 'music', 'effects')
 * @param {boolean} shouldMute - Whether to mute or unmute
 */
export const setMute = (type, shouldMute) => {
  // Update the mute setting
  if (muted[type] !== undefined) {
    muted[type] = shouldMute;
  }
  
  // Apply mute setting to background music
  if (backgroundMusic && (type === 'master' || type === 'music')) {
    if (muted.master || muted.music) {
      if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
      }
    } else if (!isMusicPlaying) {
      playMusic(true);
    }
  }
};

/**
 * Get the current audio settings
 * @returns {Object} - Current audio settings
 */
export const getAudioSettings = () => {
  return {
    volumes: { ...volumes },
    muted: { ...muted }
  };
};

/**
 * Apply audio settings
 * @param {Object} settings - Audio settings to apply
 */
export const applyAudioSettings = (settings) => {
  if (settings.volumes) {
    Object.keys(settings.volumes).forEach(type => {
      if (volumes[type] !== undefined) {
        setVolume(type, settings.volumes[type]);
      }
    });
  }
  
  if (settings.muted) {
    Object.keys(settings.muted).forEach(type => {
      if (muted[type] !== undefined) {
        setMute(type, settings.muted[type]);
      }
    });
  }
};

/**
 * Clean up audio resources
 */
export const cleanupAudio = () => {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.src = '';
    backgroundMusic = null;
  }
  
  if (audioContext) {
    audioContext.close().catch(console.error);
    audioContext = null;
  }
  
  Object.keys(soundBuffers).forEach(key => {
    soundBuffers[key] = null;
  });
};
