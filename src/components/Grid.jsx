import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/Grid.css';

/**
 * Grid component that displays a configurable grid of tiles
 * @param {Object} props - Component props
 * @param {number} props.size - Grid size (e.g., 3 for a 3x3 grid)
 * @param {Array} props.activePattern - Array of indices representing the active pattern
 * @param {boolean} props.showPattern - Whether to show the active pattern
 * @param {Function} props.onTileClick - Callback function when a tile is clicked
 * @param {boolean} props.disabled - Whether the grid is disabled for interaction
 */
const Grid = ({ 
  size = 3, 
  activePattern = [], 
  showPattern = false, 
  onTileClick = () => {}, 
  disabled = false 
}) => {
  const [selectedTiles, setSelectedTiles] = useState([]);
  
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
  };
  
  // Determine if a tile is active (part of the pattern and should be shown)
  const isTileActive = (index) => {
    return showPattern && activePattern.includes(index);
  };
  
  // Determine if a tile is selected by the user
  const isTileSelected = (index) => {
    return selectedTiles.includes(index);
  };
  
  return (
    <div 
      className="grid-container" 
      style={{ 
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`
      }}
      aria-label={`${size}x${size} memory grid`}
    >
      {Array.from({ length: totalTiles }).map((_, index) => {
        const { row, col } = getCoordinates(index);
        return (
          <button
            key={index}
            className={`grid-tile ${isTileActive(index) ? 'active' : ''} ${isTileSelected(index) ? 'selected' : ''}`}
            onClick={() => handleTileClick(index)}
            disabled={disabled}
            aria-label={`Tile at row ${row + 1}, column ${col + 1}${isTileActive(index) ? ', active' : ''}${isTileSelected(index) ? ', selected' : ''}`}
            aria-pressed={isTileSelected(index)}
          />
        );
      })}
    </div>
  );
};

Grid.propTypes = {
  size: PropTypes.number,
  activePattern: PropTypes.arrayOf(PropTypes.number),
  showPattern: PropTypes.bool,
  onTileClick: PropTypes.func,
  disabled: PropTypes.bool
};

export default Grid;
