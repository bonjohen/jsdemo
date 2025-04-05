# NeuroMatch: Memory Matrix Challenge

A grid-based memory game where players must observe and replicate patterns of tiles that briefly illuminate. The game features increasing difficulty levels and a unique AI opponent that adapts to the player's behavior over time.

## Project Overview

NeuroMatch is a brain training game designed to test and improve memory and pattern recognition skills. The game presents players with a grid of tiles where patterns briefly appear, challenging them to replicate these patterns accurately. As players progress, the game increases in difficulty with larger grids, more complex patterns, and shorter display times.

A unique feature of NeuroMatch is its AI opponent, which starts with random guessing but gradually learns from the player's behavior to provide a personalized challenge.

## Technology Stack

- React for UI components
- Vite for build tooling and development server
- Vitest and React Testing Library for testing
- CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd neuromatch

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
/
├── public/            # Static assets
├── src/
│   ├── components/    # React components
│   ├── styles/        # CSS styles
│   ├── utils/         # Utility functions
│   ├── tests/         # Test files
│   ├── App.jsx        # Main App component
│   └── main.jsx       # Entry point
├── index.html         # HTML template
└── vite.config.js     # Vite configuration
```
