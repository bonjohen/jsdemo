import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/AIInsights.css';

/**
 * AIInsights component for displaying AI learning and insights
 * @param {Object} props - Component props
 * @param {Object} props.aiPlayer - AI player instance
 * @param {boolean} props.isOpen - Whether the insights modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 */
const AIInsights = ({ aiPlayer, isOpen, onClose }) => {
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load insights when modal opens
  useEffect(() => {
    if (isOpen && aiPlayer) {
      // Get detailed stats from AI
      const stats = aiPlayer.getStats(true);
      setInsights(stats);
    }
  }, [isOpen, aiPlayer]);
  
  // If modal is not open or no AI player, don't render anything
  if (!isOpen || !aiPlayer || !insights) return null;
  
  // Format a number as a percentage
  const formatPercent = (value) => {
    return `${Math.round(value * 100)}%`;
  };
  
  // Render the overview tab
  const renderOverview = () => {
    return (
      <div className="insights-section">
        <div className="insight-card">
          <h3>AI Profile</h3>
          <div className="insight-data">
            <div className="data-row">
              <span className="label">Difficulty:</span>
              <span className="value">{insights.difficulty}</span>
            </div>
            <div className="data-row">
              <span className="label">Personality:</span>
              <span className="value">{insights.personality}</span>
            </div>
            <div className="data-row">
              <span className="label">Memory Accuracy:</span>
              <span className="value">{formatPercent(insights.memoryAccuracy)}</span>
            </div>
            <div className="data-row">
              <span className="label">Success Rate:</span>
              <span className="value">{formatPercent(insights.successRate)}</span>
            </div>
          </div>
        </div>
        
        <div className="insight-card">
          <h3>Learning Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(100, insights.learningProgress * 20)}%` }}
            ></div>
          </div>
          <div className="progress-label">
            {Math.min(100, Math.round(insights.learningProgress * 20))}% Complete
          </div>
          <p className="progress-description">
            The AI has analyzed {insights.patternHistory} patterns and is 
            continuously improving its memory strategies.
          </p>
        </div>
      </div>
    );
  };
  
  // Render the adaptive factors tab
  const renderAdaptiveFactors = () => {
    const factors = insights.adaptiveFactors;
    
    return (
      <div className="insights-section">
        <p className="section-description">
          These factors show how the AI has adapted to your play style and where it focuses its learning.
        </p>
        
        {Object.entries(factors).map(([factor, value]) => (
          <div key={factor} className="factor-item">
            <div className="factor-header">
              <span className="factor-name">{formatFactorName(factor)}</span>
              <span className="factor-value">{value.toFixed(2)}</span>
            </div>
            <div className="factor-bar">
              <div 
                className="factor-fill" 
                style={{ 
                  width: `${Math.min(100, value * 50)}%`,
                  backgroundColor: getFactorColor(value)
                }}
              ></div>
            </div>
            <p className="factor-description">{getFactorDescription(factor, value)}</p>
          </div>
        ))}
      </div>
    );
  };
  
  // Render the player analysis tab
  const renderPlayerAnalysis = () => {
    return (
      <div className="insights-section">
        <div className="insight-card">
          <h3>Pattern Recognition Analysis</h3>
          <p>Based on your performance, the AI has identified your strengths and areas for improvement:</p>
          
          <h4>Grid Size Performance</h4>
          <div className="performance-grid">
            {Object.entries(insights.playerPerformance.byGridSize).map(([size, data]) => (
              <div key={size} className="performance-item">
                <div className="performance-label">{size}x{size}</div>
                <div className="performance-bar">
                  <div 
                    className="performance-fill" 
                    style={{ 
                      width: `${data.rate * 100}%`,
                      backgroundColor: getPerformanceColor(data.rate)
                    }}
                  ></div>
                </div>
                <div className="performance-value">{formatPercent(data.rate)}</div>
              </div>
            ))}
          </div>
          
          <h4>Pattern Length Performance</h4>
          <div className="performance-grid">
            {Object.entries(insights.playerPerformance.byPatternLength).map(([length, data]) => (
              <div key={length} className="performance-item">
                <div className="performance-label">{length} Tiles</div>
                <div className="performance-bar">
                  <div 
                    className="performance-fill" 
                    style={{ 
                      width: `${data.rate * 100}%`,
                      backgroundColor: getPerformanceColor(data.rate)
                    }}
                  ></div>
                </div>
                <div className="performance-value">{formatPercent(data.rate)}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="insight-card">
          <h3>Pattern Challenges</h3>
          
          <div className="challenges-section">
            <h4>Tiles You Often Miss</h4>
            {insights.mistakeAnalysis.commonMistakes.length > 0 ? (
              <div className="tile-list">
                {insights.mistakeAnalysis.commonMistakes.map((mistake, index) => (
                  <div key={index} className="tile-item">
                    <div className="tile-icon">Tile {mistake.tile}</div>
                    <div className="tile-count">{mistake.count} times</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Not enough data collected yet.</p>
            )}
          </div>
          
          <div className="challenges-section">
            <h4>Tiles You Remember Well</h4>
            {insights.successAnalysis.commonSuccesses.length > 0 ? (
              <div className="tile-list">
                {insights.successAnalysis.commonSuccesses.map((success, index) => (
                  <div key={index} className="tile-item success">
                    <div className="tile-icon">Tile {success.tile}</div>
                    <div className="tile-count">{success.count} times</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Not enough data collected yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Format factor name for display
  const formatFactorName = (factor) => {
    // Convert camelCase to Title Case with spaces
    return factor
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };
  
  // Get color for factor value
  const getFactorColor = (value) => {
    if (value >= 1.5) return '#4caf50'; // High (green)
    if (value >= 1.0) return '#2196f3'; // Medium (blue)
    return '#ff9800'; // Low (orange)
  };
  
  // Get color for performance value
  const getPerformanceColor = (value) => {
    if (value >= 0.8) return '#4caf50'; // High (green)
    if (value >= 0.5) return '#2196f3'; // Medium (blue)
    return '#ff9800'; // Low (orange)
  };
  
  // Get description for factor
  const getFactorDescription = (factor, value) => {
    switch (factor) {
      case 'patternRecognition':
        return value > 1.2 
          ? "The AI has developed strong pattern recognition abilities."
          : "The AI is still developing its pattern recognition skills.";
      case 'spatialMemory':
        return value > 1.2 
          ? "The AI excels at remembering spatial arrangements of tiles."
          : "The AI is working on improving its spatial memory.";
      case 'sequenceMemory':
        return value > 1.2 
          ? "The AI is good at remembering sequences and ordered patterns."
          : "The AI is still learning to remember sequential patterns.";
      case 'reactionSpeed':
        return value > 1.2 
          ? "The AI has optimized its response time for quick pattern recognition."
          : "The AI is working on improving its reaction speed.";
      case 'errorRecovery':
        return value > 1.2 
          ? "The AI has developed strong error recovery strategies."
          : "The AI is still developing its error recovery capabilities.";
      default:
        return "This factor represents the AI's learning in this area.";
    }
  };
  
  return (
    <div className="ai-insights-modal-overlay">
      <div className="ai-insights-modal">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>AI Learning Insights</h2>
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'adaptive' ? 'active' : ''}`}
            onClick={() => setActiveTab('adaptive')}
          >
            Adaptive Factors
          </button>
          <button 
            className={`tab-button ${activeTab === 'player' ? 'active' : ''}`}
            onClick={() => setActiveTab('player')}
          >
            Player Analysis
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'adaptive' && renderAdaptiveFactors()}
          {activeTab === 'player' && renderPlayerAnalysis()}
        </div>
      </div>
    </div>
  );
};

AIInsights.propTypes = {
  aiPlayer: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AIInsights;
