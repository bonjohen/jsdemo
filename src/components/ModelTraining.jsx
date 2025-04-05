import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  initializeModel,
  getTrainingStatus,
  trainModel,
  generateOptimalParameters
} from '../utils/tfModel';
import '../styles/ModelTraining.css';

/**
 * ModelTraining component for managing and visualizing the TensorFlow model
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onParametersGenerated - Callback when optimal parameters are generated
 */
const ModelTraining = ({ isOpen, onClose, onParametersGenerated }) => {
  const [status, setStatus] = useState({
    isModelReady: false,
    isTraining: false,
    trainingProgress: 0,
    trainingLoss: 0,
    dataPoints: 0
  });
  
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 10,
    targetSuccessRate: 0.7
  });
  
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [optimalParameters, setOptimalParameters] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialize model when component mounts
  useEffect(() => {
    if (isOpen) {
      initializeModel()
        .then(() => {
          updateStatus();
        })
        .catch(err => {
          setError(`Failed to initialize model: ${err.message}`);
        });
    }
    
    // Update status periodically
    const intervalId = setInterval(updateStatus, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isOpen]);
  
  // Update model status
  const updateStatus = () => {
    setStatus(getTrainingStatus());
  };
  
  // Handle training configuration changes
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setTrainingConfig(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  // Start model training
  const handleStartTraining = async () => {
    try {
      setError(null);
      setTrainingHistory([]);
      
      const history = await trainModel({
        epochs: trainingConfig.epochs,
        onProgress: (progress) => {
          setTrainingHistory(prev => [...prev, progress]);
        }
      });
      
      console.log('Training complete:', history);
    } catch (err) {
      setError(`Training failed: ${err.message}`);
    }
  };
  
  // Generate optimal parameters
  const handleGenerateParameters = async () => {
    try {
      setError(null);
      setOptimalParameters(null);
      
      const params = await generateOptimalParameters(trainingConfig.targetSuccessRate);
      
      if (params) {
        setOptimalParameters(params);
        if (onParametersGenerated) {
          onParametersGenerated(params);
        }
      } else {
        setError('Could not generate optimal parameters');
      }
    } catch (err) {
      setError(`Parameter generation failed: ${err.message}`);
    }
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="model-training-overlay">
      <div className="model-training-modal">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>TensorFlow.js Model Training</h2>
        
        <div className="model-status">
          <h3>Model Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Model Ready:</span>
              <span className={`status-value ${status.isModelReady ? 'positive' : 'negative'}`}>
                {status.isModelReady ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Training Data Points:</span>
              <span className="status-value">{status.dataPoints}</span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Training Status:</span>
              <span className={`status-value ${status.isTraining ? 'in-progress' : ''}`}>
                {status.isTraining ? 'In Progress' : 'Idle'}
              </span>
            </div>
            
            {status.isTraining && (
              <div className="status-item">
                <span className="status-label">Progress:</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${status.trainingProgress * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {Math.round(status.trainingProgress * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="training-controls">
          <h3>Training Configuration</h3>
          
          <div className="form-group">
            <label htmlFor="epochs">Training Epochs:</label>
            <input
              type="number"
              id="epochs"
              name="epochs"
              min="1"
              max="100"
              value={trainingConfig.epochs}
              onChange={handleConfigChange}
              disabled={status.isTraining}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="targetSuccessRate">Target Success Rate:</label>
            <input
              type="range"
              id="targetSuccessRate"
              name="targetSuccessRate"
              min="0.1"
              max="0.9"
              step="0.1"
              value={trainingConfig.targetSuccessRate}
              onChange={handleConfigChange}
              disabled={status.isTraining}
            />
            <span className="range-value">{Math.round(trainingConfig.targetSuccessRate * 100)}%</span>
          </div>
          
          <div className="button-group">
            <button
              className="train-button"
              onClick={handleStartTraining}
              disabled={!status.isModelReady || status.isTraining || status.dataPoints < 10}
            >
              {status.isTraining ? 'Training...' : 'Train Model'}
            </button>
            
            <button
              className="generate-button"
              onClick={handleGenerateParameters}
              disabled={!status.isModelReady || status.isTraining}
            >
              Generate Optimal Parameters
            </button>
          </div>
        </div>
        
        {trainingHistory.length > 0 && (
          <div className="training-history">
            <h3>Training Progress</h3>
            
            <div className="history-chart">
              {trainingHistory.map((entry, index) => (
                <div 
                  key={index} 
                  className="history-bar"
                  style={{ 
                    height: `${Math.min(100, (1 - entry.loss) * 100)}%`,
                    backgroundColor: `rgba(76, 175, 80, ${0.5 + entry.accuracy * 0.5})`
                  }}
                  title={`Epoch ${index + 1}: Loss ${entry.loss.toFixed(4)}, Accuracy ${(entry.accuracy * 100).toFixed(1)}%`}
                ></div>
              ))}
            </div>
            
            <div className="history-stats">
              <div className="stat-item">
                <span className="stat-label">Final Loss:</span>
                <span className="stat-value">
                  {trainingHistory[trainingHistory.length - 1]?.loss.toFixed(4) || 'N/A'}
                </span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Final Accuracy:</span>
                <span className="stat-value">
                  {trainingHistory[trainingHistory.length - 1]?.accuracy
                    ? `${(trainingHistory[trainingHistory.length - 1].accuracy * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {optimalParameters && (
          <div className="optimal-parameters">
            <h3>Optimal Game Parameters</h3>
            
            <div className="parameters-grid">
              <div className="parameter-item">
                <span className="parameter-label">Grid Size:</span>
                <span className="parameter-value">{optimalParameters.gridSize}x{optimalParameters.gridSize}</span>
              </div>
              
              <div className="parameter-item">
                <span className="parameter-label">Pattern Length:</span>
                <span className="parameter-value">{optimalParameters.patternLength} tiles</span>
              </div>
              
              <div className="parameter-item">
                <span className="parameter-label">Level:</span>
                <span className="parameter-value">{optimalParameters.level}</span>
              </div>
              
              <div className="parameter-item">
                <span className="parameter-label">Predicted Success Rate:</span>
                <span className="parameter-value">
                  {Math.round(optimalParameters.successRate * 100)}%
                </span>
              </div>
            </div>
            
            <button
              className="apply-button"
              onClick={() => onParametersGenerated(optimalParameters)}
            >
              Apply These Parameters
            </button>
          </div>
        )}
        
        <div className="info-section">
          <h3>About TensorFlow.js Integration</h3>
          <p>
            This feature uses TensorFlow.js to analyze your gameplay patterns and predict success rates
            based on grid size, pattern length, response time, and level. The model learns from your
            performance data to provide personalized game parameters.
          </p>
          <p>
            <strong>Note:</strong> You need at least 10 gameplay data points before training can begin.
            More data will result in better predictions.
          </p>
        </div>
      </div>
    </div>
  );
};

ModelTraining.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onParametersGenerated: PropTypes.func
};

export default ModelTraining;
