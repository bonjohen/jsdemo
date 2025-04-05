/**
 * Generates a random pattern of tile indices
 * @param {number} gridSize - The size of the grid (e.g., 3 for a 3x3 grid)
 * @param {number} patternLength - The number of tiles in the pattern
 * @param {string} patternType - The type of pattern to generate ('random', 'sequential', 'shape')
 * @returns {Array} - Array of tile indices representing the pattern
 */
export const generatePattern = (gridSize = 3, patternLength = 3, patternType = 'random') => {
  const totalTiles = gridSize * gridSize;
  
  // Ensure pattern length doesn't exceed total tiles
  const safePatternLength = Math.min(patternLength, totalTiles);
  
  switch (patternType) {
    case 'sequential':
      return generateSequentialPattern(gridSize, safePatternLength);
    case 'shape':
      return generateShapePattern(gridSize, safePatternLength);
    case 'random':
    default:
      return generateRandomPattern(gridSize, safePatternLength);
  }
};

/**
 * Generates a random pattern
 * @param {number} gridSize - The size of the grid
 * @param {number} patternLength - The number of tiles in the pattern
 * @returns {Array} - Array of tile indices
 */
const generateRandomPattern = (gridSize, patternLength) => {
  const totalTiles = gridSize * gridSize;
  const allIndices = Array.from({ length: totalTiles }, (_, i) => i);
  
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }
  
  // Return the first n elements
  return allIndices.slice(0, patternLength);
};

/**
 * Generates a sequential pattern (adjacent tiles)
 * @param {number} gridSize - The size of the grid
 * @param {number} patternLength - The number of tiles in the pattern
 * @returns {Array} - Array of tile indices
 */
const generateSequentialPattern = (gridSize, patternLength) => {
  const totalTiles = gridSize * gridSize;
  
  // Start from a random position
  const startIndex = Math.floor(Math.random() * totalTiles);
  const pattern = [startIndex];
  
  // Get possible directions (up, right, down, left)
  const directions = [
    -gridSize, // up
    1,         // right
    gridSize,  // down
    -1         // left
  ];
  
  let currentIndex = startIndex;
  
  // Add tiles in sequence until we reach the pattern length
  while (pattern.length < patternLength) {
    // Shuffle directions
    const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
    
    let foundNextTile = false;
    
    // Try each direction until we find a valid next tile
    for (const direction of shuffledDirections) {
      const nextIndex = currentIndex + direction;
      
      // Check if the next index is valid
      if (
        nextIndex >= 0 && 
        nextIndex < totalTiles && 
        !pattern.includes(nextIndex) &&
        // Ensure we don't wrap around the grid edges
        !(direction === 1 && currentIndex % gridSize === gridSize - 1) && // right edge
        !(direction === -1 && currentIndex % gridSize === 0) // left edge
      ) {
        pattern.push(nextIndex);
        currentIndex = nextIndex;
        foundNextTile = true;
        break;
      }
    }
    
    // If we can't find a valid next tile, break out of the loop
    if (!foundNextTile) {
      break;
    }
  }
  
  // If we couldn't generate a full pattern, fill in with random tiles
  if (pattern.length < patternLength) {
    const remainingTiles = generateRandomPattern(gridSize, patternLength - pattern.length)
      .filter(index => !pattern.includes(index));
    
    pattern.push(...remainingTiles.slice(0, patternLength - pattern.length));
  }
  
  return pattern;
};

/**
 * Generates a shape pattern (geometric shapes like lines, squares, etc.)
 * @param {number} gridSize - The size of the grid
 * @param {number} patternLength - The number of tiles in the pattern
 * @returns {Array} - Array of tile indices
 */
const generateShapePattern = (gridSize, patternLength) => {
  // For small grids, default to random patterns
  if (gridSize < 3) {
    return generateRandomPattern(gridSize, patternLength);
  }
  
  const shapes = [
    () => generateLine(gridSize),
    () => generateDiagonal(gridSize),
    () => generateSquare(gridSize),
    () => generateCross(gridSize)
  ];
  
  // Select a random shape generator
  const shapeGenerator = shapes[Math.floor(Math.random() * shapes.length)];
  let pattern = shapeGenerator();
  
  // If the pattern is too long, truncate it
  if (pattern.length > patternLength) {
    pattern = pattern.slice(0, patternLength);
  }
  // If the pattern is too short, add random tiles
  else if (pattern.length < patternLength) {
    const additionalTiles = generateRandomPattern(gridSize, patternLength - pattern.length)
      .filter(index => !pattern.includes(index));
    
    pattern.push(...additionalTiles.slice(0, patternLength - pattern.length));
  }
  
  return pattern;
};

// Shape generator functions
const generateLine = (gridSize) => {
  const isHorizontal = Math.random() > 0.5;
  const lineIndex = Math.floor(Math.random() * gridSize);
  
  if (isHorizontal) {
    // Horizontal line
    return Array.from({ length: gridSize }, (_, i) => lineIndex * gridSize + i);
  } else {
    // Vertical line
    return Array.from({ length: gridSize }, (_, i) => i * gridSize + lineIndex);
  }
};

const generateDiagonal = (gridSize) => {
  const isMainDiagonal = Math.random() > 0.5;
  
  if (isMainDiagonal) {
    // Main diagonal (top-left to bottom-right)
    return Array.from({ length: gridSize }, (_, i) => i * gridSize + i);
  } else {
    // Anti-diagonal (top-right to bottom-left)
    return Array.from({ length: gridSize }, (_, i) => i * gridSize + (gridSize - 1 - i));
  }
};

const generateSquare = (gridSize) => {
  // Only works for grids 3x3 or larger
  if (gridSize < 3) return generateRandomPattern(gridSize, gridSize * 2);
  
  // Generate a random position for the top-left corner of the square
  const maxCorner = gridSize - 2; // Ensure the square fits within the grid
  const row = Math.floor(Math.random() * maxCorner);
  const col = Math.floor(Math.random() * maxCorner);
  
  // Create a 2x2 square
  return [
    row * gridSize + col,           // top-left
    row * gridSize + col + 1,       // top-right
    (row + 1) * gridSize + col,     // bottom-left
    (row + 1) * gridSize + col + 1  // bottom-right
  ];
};

const generateCross = (gridSize) => {
  // Only works for odd-sized grids 3x3 or larger
  if (gridSize < 3 || gridSize % 2 === 0) {
    return generateRandomPattern(gridSize, gridSize * 2);
  }
  
  const center = Math.floor(gridSize / 2);
  const centerIndex = center * gridSize + center;
  
  // Create a cross pattern
  return [
    centerIndex,                // center
    centerIndex - gridSize,     // up
    centerIndex + 1,            // right
    centerIndex + gridSize,     // down
    centerIndex - 1             // left
  ];
};
