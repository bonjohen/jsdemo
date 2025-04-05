import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getGameSettings } from '../utils/storage';
import '../styles/Grid.css';

/**
 * Grid component that displays a configurable grid of tiles
 * @param {Object} props - Component props
 * @param {number} props.size - Grid size (e.g., 3 for a 3x3 grid)
 * @param {Array} props.activePattern - Array of indices representing the active pattern
 * @param {boolean} props.showPattern - Whether to show the active pattern
 * @param {Function} props.onTileClick - Callback function when a tile is clicked
 * @param {boolean} props.disabled - Whether the grid is disabled for interaction
 * @param {boolean} props.highContrast - Whether to use high contrast mode
 * @param {number} props.countdown - Current countdown value to display over the grid
 * @param {boolean} props.showCountdown - Whether to show the countdown overlay
 * @param {Array} props.incorrectSelections - Array of indices representing incorrect selections
 */
const Grid = ({
  size = 3,
  activePattern = [],
  showPattern = false,
  onTileClick = () => {},
  disabled = false,
  highContrast = false,
  countdown = 0,
  showCountdown = false,
  incorrectSelections = []
}) => {
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [focusedTile, setFocusedTile] = useState(null);
  const [keyboardEnabled, setKeyboardEnabled] = useState(true);
  const gridRef = useRef(null);
  const tileRefs = useRef([]);

  // Initialize tile refs
  useEffect(() => {
    tileRefs.current = Array(size * size).fill().map((_, i) => tileRefs.current[i] || null);
  }, [size]);

  // Load keyboard settings
  useEffect(() => {
    const settings = getGameSettings();
    if (settings && typeof settings.keyboardControls === 'boolean') {
      setKeyboardEnabled(settings.keyboardControls);
    }
  }, []);

  // Reset selected tiles when active pattern changes
  useEffect(() => {
    setSelectedTiles([]);
  }, [activePattern]);

  // Calculate the total number of tiles
  const totalTiles = size * size;

  // Convert 1D index to 2D coordinates
  const getCoordinates = (index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    return { row, col };
  };

  // Convert 2D coordinates to 1D index
  const getIndex = (row, col) => {
    return row * size + col;
  };

  // Handle tile click
  const handleTileClick = (index) => {
    if (disabled) return;

    // Toggle selection
    const newSelectedTiles = [...selectedTiles];
    const tileIndex = newSelectedTiles.indexOf(index);

    if (tileIndex === -1) {
      newSelectedTiles.push(index);
    } else {
      newSelectedTiles.splice(tileIndex, 1);
    }

    setSelectedTiles(newSelectedTiles);
    onTileClick(index, newSelectedTiles);

    // Update focused tile
    setFocusedTile(index);
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!keyboardEnabled || disabled) return;

    // If no tile is focused, focus the first one
    if (focusedTile === null) {
      setFocusedTile(0);
      tileRefs.current[0]?.focus();
      return;
    }

    const { row, col } = getCoordinates(focusedTile);
    let newRow = row;
    let newCol = col;

    // Handle arrow keys for navigation
    switch (e.key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(size - 1, col + 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(size - 1, row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1);
        break;
      case 'Enter':
      case ' ': // Space
        e.preventDefault(); // Prevent scrolling with space
        handleTileClick(focusedTile);
        return;
      default:
        return;
    }

    // Calculate new index and focus that tile
    const newIndex = getIndex(newRow, newCol);
    setFocusedTile(newIndex);
    tileRefs.current[newIndex]?.focus();
  }, [focusedTile, size, disabled, keyboardEnabled, handleTileClick]);

  // Add keyboard event listener
  useEffect(() => {
    if (keyboardEnabled) {
      const gridElement = gridRef.current;
      if (gridElement) {
        gridElement.addEventListener('keydown', handleKeyDown);
        return () => {
          gridElement.removeEventListener('keydown', handleKeyDown);
        };
      }
    }
  }, [handleKeyDown, keyboardEnabled]);

  // Determine if a tile is active (part of the pattern and should be shown)
  const isTileActive = (index) => {
    return showPattern && activePattern.includes(index);
  };

  // Determine if a tile is selected by the user
  const isTileSelected = (index) => {
    return selectedTiles.includes(index);
  };

  // Determine if a tile is focused
  const isTileFocused = (index) => {
    return focusedTile === index;
  };

  // Generate tile shape for high contrast mode
  const getTileShape = (index) => {
    if (!highContrast) return null;

    // Use different shapes for tiles in high contrast mode
    const shapes = ['circle', 'square', 'diamond', 'triangle'];
    return shapes[index % shapes.length];
  };

  return (
    <div
      ref={gridRef}
      className={`grid-container ${highContrast ? 'high-contrast' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
        position: 'relative' // For absolute positioning of countdown overlay
      }}
      aria-label={`${size}x${size} memory grid`}
      tabIndex="-1" // Make div focusable but not in tab order
      role="grid"
    >
      {/* Countdown overlay */}
      {showCountdown && (
        <div className="countdown-overlay">
          <div className="countdown-value">{countdown}</div>
        </div>
      )}

      {Array.from({ length: totalTiles }).map((_, index) => {
        const { row, col } = getCoordinates(index);
        const shape = getTileShape(index);
        const isIncorrect = incorrectSelections.includes(index);

        return (
          <button
            ref={el => tileRefs.current[index] = el}
            key={index}
            className={`grid-tile
              ${isTileActive(index) ? 'active' : ''}
              ${isTileSelected(index) ? 'selected' : ''}
              ${isTileFocused(index) ? 'focused' : ''}
              ${isIncorrect ? 'incorrect' : ''}
              ${shape ? `shape-${shape}` : ''}`
            }
            onClick={() => handleTileClick(index)}
            onFocus={() => setFocusedTile(index)}
            disabled={disabled}
            aria-label={`Tile at row ${row + 1}, column ${col + 1}${isTileActive(index) ? ', active' : ''}${isTileSelected(index) ? ', selected' : ''}${isIncorrect ? ', incorrect' : ''}`}
            aria-pressed={isTileSelected(index)}
            data-row={row}
            data-col={col}
            role="gridcell"
          >
            {highContrast && shape && <span className="visually-hidden">{shape}</span>}
          </button>
        );
      })}

      {/* Visual timer indicator */}
      <div className="timer-indicator-container">
        <div
          className="timer-indicator"
          style={{
            width: `${(countdown / 5) * 100}%`,
            backgroundColor: countdown <= 2 ? '#ff4d4d' : countdown <= 3 ? '#ffcc00' : '#4caf50'
          }}
        ></div>
      </div>
    </div>
  );
};

Grid.propTypes = {
  size: PropTypes.number,
  activePattern: PropTypes.arrayOf(PropTypes.number),
  showPattern: PropTypes.bool,
  onTileClick: PropTypes.func,
  disabled: PropTypes.bool,
  highContrast: PropTypes.bool,
  countdown: PropTypes.number,
  showCountdown: PropTypes.bool,
  incorrectSelections: PropTypes.arrayOf(PropTypes.number)
};

export default Grid;
