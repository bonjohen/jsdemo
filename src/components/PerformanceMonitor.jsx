import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  getPerformanceMetrics, 
  getPerformanceMode, 
  setPerformanceMode,
  onPerformanceModeChange,
  offPerformanceModeChange
} from '../utils/performanceOptimizer';
import '../styles/PerformanceMonitor.css';

/**
 * PerformanceMonitor component for displaying performance metrics
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the monitor is visible
 */
const PerformanceMonitor = ({ visible = false }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0
  });
  const [mode, setMode] = useState(getPerformanceMode());
  const [expanded, setExpanded] = useState(false);
  
  // Update metrics periodically
  useEffect(() => {
    if (!visible) return;
    
    const updateMetrics = () => {
      setMetrics(getPerformanceMetrics());
    };
    
    // Update every 500ms
    const intervalId = setInterval(updateMetrics, 500);
    
    // Handle performance mode changes
    const handleModeChange = (newMode) => {
      setMode(newMode);
    };
    
    onPerformanceModeChange(handleModeChange);
    
    return () => {
      clearInterval(intervalId);
      offPerformanceModeChange(handleModeChange);
    };
  }, [visible]);
  
  // Handle performance mode change
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setPerformanceMode(newMode);
    setMode(newMode);
  };
  
  if (!visible) return null;
  
  return (
    <div className={`performance-monitor ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="monitor-header" onClick={() => setExpanded(!expanded)}>
        <span className="fps">FPS: {metrics.fps}</span>
        {expanded ? '▼' : '▲'}
      </div>
      
      {expanded && (
        <div className="monitor-details">
          <div className="metric">
            <span className="label">Frame Time:</span>
            <span className="value">{metrics.frameTime.toFixed(2)} ms</span>
          </div>
          
          {metrics.memoryUsage > 0 && (
            <div className="metric">
              <span className="label">Memory:</span>
              <span className="value">{metrics.memoryUsage.toFixed(1)} MB</span>
            </div>
          )}
          
          <div className="performance-mode">
            <label htmlFor="performance-mode">Mode:</label>
            <select 
              id="performance-mode" 
              value={mode}
              onChange={handleModeChange}
            >
              <option value="high">High Quality</option>
              <option value="medium">Balanced</option>
              <option value="low">Performance</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

PerformanceMonitor.propTypes = {
  visible: PropTypes.bool
};

export default PerformanceMonitor;
