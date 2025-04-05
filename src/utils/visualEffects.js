/**
 * Visual Effects utility for creating animations and particle effects
 */

/**
 * Create a particle effect at the specified position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} options - Particle effect options
 * @param {string} options.color - Particle color
 * @param {number} options.count - Number of particles
 * @param {number} options.speed - Particle speed
 * @param {number} options.size - Particle size
 * @param {number} options.duration - Effect duration in ms
 * @param {string} options.shape - Particle shape ('circle', 'square', 'triangle')
 */
export const createParticleEffect = (x, y, options = {}) => {
  // Default options
  const settings = {
    color: options.color || '#4fc3f7',
    count: options.count || 20,
    speed: options.speed || 3,
    size: options.size || 5,
    duration: options.duration || 1000,
    shape: options.shape || 'circle'
  };
  
  // Create a container for the particles
  const container = document.createElement('div');
  container.className = 'particle-container';
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  container.style.overflow = 'hidden';
  
  // Add the container to the document
  document.body.appendChild(container);
  
  // Create particles
  for (let i = 0; i < settings.count; i++) {
    createParticle(container, x, y, settings);
  }
  
  // Remove the container after the effect is complete
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, settings.duration + 500);
};

/**
 * Create a single particle
 * @param {HTMLElement} container - Container element
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} settings - Particle settings
 * @private
 */
const createParticle = (container, x, y, settings) => {
  // Create a particle element
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  // Set particle styles
  particle.style.position = 'absolute';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.width = `${settings.size}px`;
  particle.style.height = `${settings.size}px`;
  particle.style.backgroundColor = settings.color;
  particle.style.opacity = '1';
  particle.style.pointerEvents = 'none';
  
  // Set particle shape
  switch (settings.shape) {
    case 'square':
      particle.style.borderRadius = '0';
      break;
    case 'triangle':
      particle.style.width = '0';
      particle.style.height = '0';
      particle.style.backgroundColor = 'transparent';
      particle.style.borderLeft = `${settings.size / 2}px solid transparent`;
      particle.style.borderRight = `${settings.size / 2}px solid transparent`;
      particle.style.borderBottom = `${settings.size}px solid ${settings.color}`;
      break;
    case 'circle':
    default:
      particle.style.borderRadius = '50%';
      break;
  }
  
  // Add the particle to the container
  container.appendChild(particle);
  
  // Random direction and speed
  const angle = Math.random() * Math.PI * 2;
  const speed = settings.speed * (0.5 + Math.random());
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  
  // Animate the particle
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / settings.duration;
    
    if (progress >= 1) {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
      return;
    }
    
    // Update position
    const currentX = parseFloat(particle.style.left);
    const currentY = parseFloat(particle.style.top);
    particle.style.left = `${currentX + vx}px`;
    particle.style.top = `${currentY + vy}px`;
    
    // Update opacity
    particle.style.opacity = 1 - progress;
    
    // Continue animation
    requestAnimationFrame(animate);
  };
  
  // Start animation
  requestAnimationFrame(animate);
};

/**
 * Create a screen transition effect
 * @param {string} type - Transition type ('fade', 'slide', 'zoom')
 * @param {number} duration - Transition duration in ms
 * @param {Function} callback - Callback function when transition is complete
 */
export const createScreenTransition = (type = 'fade', duration = 500, callback = null) => {
  // Create a transition overlay
  const overlay = document.createElement('div');
  overlay.className = 'transition-overlay';
  overlay.style.position = 'fixed';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.zIndex = '9998';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = `all ${duration}ms ease-in-out`;
  
  // Set initial styles based on transition type
  switch (type) {
    case 'slide':
      overlay.style.backgroundColor = 'transparent';
      overlay.style.transform = 'translateX(-100%)';
      overlay.style.borderRight = `100vw solid ${getComputedStyle(document.body).backgroundColor || '#f5f5f5'}`;
      break;
    case 'zoom':
      overlay.style.backgroundColor = getComputedStyle(document.body).backgroundColor || '#f5f5f5';
      overlay.style.transform = 'scale(0)';
      overlay.style.opacity = '0';
      overlay.style.borderRadius = '50%';
      break;
    case 'fade':
    default:
      overlay.style.backgroundColor = getComputedStyle(document.body).backgroundColor || '#f5f5f5';
      overlay.style.opacity = '0';
      break;
  }
  
  // Add the overlay to the document
  document.body.appendChild(overlay);
  
  // Force a reflow to ensure the transition works
  overlay.offsetHeight;
  
  // Apply transition
  switch (type) {
    case 'slide':
      overlay.style.transform = 'translateX(0)';
      break;
    case 'zoom':
      overlay.style.transform = 'scale(1)';
      overlay.style.opacity = '1';
      break;
    case 'fade':
    default:
      overlay.style.opacity = '1';
      break;
  }
  
  // Remove the overlay after the transition
  setTimeout(() => {
    // Reverse the transition
    switch (type) {
      case 'slide':
        overlay.style.transform = 'translateX(100%)';
        break;
      case 'zoom':
        overlay.style.transform = 'scale(0)';
        overlay.style.opacity = '0';
        break;
      case 'fade':
      default:
        overlay.style.opacity = '0';
        break;
    }
    
    // Remove the overlay after the reverse transition
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      // Call the callback function if provided
      if (typeof callback === 'function') {
        callback();
      }
    }, duration);
    
  }, duration);
};

/**
 * Create a pulsing effect on an element
 * @param {HTMLElement} element - Target element
 * @param {Object} options - Pulse effect options
 * @param {string} options.color - Pulse color
 * @param {number} options.duration - Pulse duration in ms
 * @param {number} options.count - Number of pulses
 */
export const createPulseEffect = (element, options = {}) => {
  if (!element) return;
  
  // Default options
  const settings = {
    color: options.color || '#4fc3f7',
    duration: options.duration || 1000,
    count: options.count || 3
  };
  
  // Create a pulse element
  const pulse = document.createElement('div');
  pulse.className = 'pulse-effect';
  
  // Get element position and size
  const rect = element.getBoundingClientRect();
  
  // Set pulse styles
  pulse.style.position = 'fixed';
  pulse.style.left = `${rect.left}px`;
  pulse.style.top = `${rect.top}px`;
  pulse.style.width = `${rect.width}px`;
  pulse.style.height = `${rect.height}px`;
  pulse.style.borderRadius = getComputedStyle(element).borderRadius;
  pulse.style.boxShadow = `0 0 0 0 ${settings.color}`;
  pulse.style.animation = `pulse ${settings.duration}ms ease-out ${settings.count}`;
  pulse.style.pointerEvents = 'none';
  pulse.style.zIndex = '9997';
  
  // Add keyframes for the pulse animation if they don't exist
  if (!document.querySelector('#pulse-keyframes')) {
    const style = document.createElement('style');
    style.id = 'pulse-keyframes';
    style.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(${hexToRgb(settings.color)}, 0.7);
          transform: scale(1);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(${hexToRgb(settings.color)}, 0);
          transform: scale(1.05);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(${hexToRgb(settings.color)}, 0);
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add the pulse element to the document
  document.body.appendChild(pulse);
  
  // Remove the pulse element after the animation
  setTimeout(() => {
    if (pulse.parentNode) {
      pulse.parentNode.removeChild(pulse);
    }
  }, settings.duration * settings.count);
};

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code
 * @returns {string} - RGB color values
 * @private
 */
const hexToRgb = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert shorthand hex to full hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
};
