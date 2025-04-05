/**
 * TensorFlow.js integration for player behavior prediction
 */
import * as tf from '@tensorflow/tfjs';

// Model state
let model = null;
let isModelReady = false;
let isTraining = false;
let trainingProgress = 0;
let trainingLoss = 0;

// Training data
const trainingData = {
  inputs: [],
  outputs: []
};

/**
 * Initialize the TensorFlow model
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
export const initializeModel = async () => {
  try {
    // Check if model already exists
    if (model) {
      return true;
    }
    
    // Create a sequential model
    model = tf.sequential();
    
    // Add layers to the model
    // Input shape: [gridSize, patternLength, responseTime, level]
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu',
      inputShape: [4]
    }));
    
    model.add(tf.layers.dense({
      units: 8,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    // Load saved model if available
    try {
      await loadModel();
    } catch (error) {
      console.log('No saved model found, using new model');
    }
    
    isModelReady = true;
    return true;
  } catch (error) {
    console.error('Error initializing TensorFlow model:', error);
    return false;
  }
};

/**
 * Add training data for the model
 * @param {Object} data - Training data
 * @param {number} data.gridSize - Size of the grid
 * @param {number} data.patternLength - Length of the pattern
 * @param {number} data.responseTime - Player's response time in ms
 * @param {number} data.level - Current game level
 * @param {boolean} data.success - Whether the player was successful
 */
export const addTrainingData = (data) => {
  if (!data || typeof data.success !== 'boolean') {
    return;
  }
  
  // Normalize the input data
  const normalizedInput = [
    data.gridSize / 10,                    // Normalize grid size (assuming max 10)
    data.patternLength / 20,               // Normalize pattern length (assuming max 20)
    Math.min(data.responseTime, 10000) / 10000, // Normalize response time (cap at 10 seconds)
    data.level / 20                        // Normalize level (assuming max 20)
  ];
  
  // Add to training data
  trainingData.inputs.push(normalizedInput);
  trainingData.outputs.push(data.success ? 1 : 0);
  
  // Limit the size of training data to prevent memory issues
  if (trainingData.inputs.length > 1000) {
    trainingData.inputs.shift();
    trainingData.outputs.shift();
  }
};

/**
 * Train the model with collected data
 * @param {Object} options - Training options
 * @param {number} options.epochs - Number of training epochs
 * @param {Function} options.onProgress - Callback for training progress
 * @returns {Promise<Object>} - Training history
 */
export const trainModel = async (options = {}) => {
  // Default options
  const {
    epochs = 10,
    onProgress = null
  } = options;
  
  // Check if model is ready and has enough data
  if (!isModelReady || trainingData.inputs.length < 10) {
    throw new Error('Model not ready or insufficient training data');
  }
  
  // Check if already training
  if (isTraining) {
    throw new Error('Model is already training');
  }
  
  try {
    isTraining = true;
    trainingProgress = 0;
    
    // Convert training data to tensors
    const xs = tf.tensor2d(trainingData.inputs);
    const ys = tf.tensor1d(trainingData.outputs);
    
    // Train the model
    const history = await model.fit(xs, ys, {
      epochs,
      shuffle: true,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          trainingProgress = (epoch + 1) / epochs;
          trainingLoss = logs.loss;
          
          if (onProgress) {
            onProgress({
              progress: trainingProgress,
              loss: trainingLoss,
              accuracy: logs.acc
            });
          }
        }
      }
    });
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    
    // Save the trained model
    await saveModel();
    
    isTraining = false;
    return history;
  } catch (error) {
    isTraining = false;
    console.error('Error training model:', error);
    throw error;
  }
};

/**
 * Predict player success based on game parameters
 * @param {Object} data - Game parameters
 * @param {number} data.gridSize - Size of the grid
 * @param {number} data.patternLength - Length of the pattern
 * @param {number} data.responseTime - Expected response time in ms
 * @param {number} data.level - Current game level
 * @returns {Promise<number>} - Probability of success (0-1)
 */
export const predictSuccess = async (data) => {
  if (!isModelReady || !model) {
    throw new Error('Model not ready');
  }
  
  try {
    // Normalize the input data
    const normalizedInput = [
      data.gridSize / 10,
      data.patternLength / 20,
      Math.min(data.responseTime, 10000) / 10000,
      data.level / 20
    ];
    
    // Convert to tensor
    const inputTensor = tf.tensor2d([normalizedInput]);
    
    // Make prediction
    const prediction = await model.predict(inputTensor);
    const result = prediction.dataSync()[0];
    
    // Clean up tensor
    inputTensor.dispose();
    prediction.dispose();
    
    return result;
  } catch (error) {
    console.error('Error making prediction:', error);
    throw error;
  }
};

/**
 * Generate optimal game parameters for a target success rate
 * @param {number} targetSuccessRate - Target success rate (0-1)
 * @param {Object} constraints - Constraints for parameters
 * @param {Object} constraints.gridSize - Min and max grid size
 * @param {Object} constraints.patternLength - Min and max pattern length
 * @returns {Promise<Object>} - Optimal game parameters
 */
export const generateOptimalParameters = async (targetSuccessRate = 0.7, constraints = {}) => {
  if (!isModelReady || !model) {
    throw new Error('Model not ready');
  }
  
  // Default constraints
  const {
    gridSize = { min: 3, max: 8 },
    patternLength = { min: 3, max: 15 }
  } = constraints;
  
  // Generate candidate parameters
  const candidates = [];
  
  for (let g = gridSize.min; g <= gridSize.max; g++) {
    for (let p = patternLength.min; p <= Math.min(patternLength.max, g * g); p++) {
      // Use average response time from training data or a default
      const avgResponseTime = calculateAverageResponseTime();
      
      // Try different levels
      for (let l = 1; l <= 10; l++) {
        candidates.push({
          gridSize: g,
          patternLength: p,
          responseTime: avgResponseTime,
          level: l
        });
      }
    }
  }
  
  // Predict success rate for each candidate
  const results = [];
  
  for (const candidate of candidates) {
    try {
      const successRate = await predictSuccess(candidate);
      results.push({
        ...candidate,
        successRate,
        // Calculate distance from target success rate
        distance: Math.abs(successRate - targetSuccessRate)
      });
    } catch (error) {
      console.error('Error predicting success rate:', error);
    }
  }
  
  // Sort by distance from target success rate
  results.sort((a, b) => a.distance - b.distance);
  
  // Return the best match
  return results[0] || null;
};

/**
 * Calculate average response time from training data
 * @returns {number} - Average response time in ms
 * @private
 */
const calculateAverageResponseTime = () => {
  if (trainingData.inputs.length === 0) {
    return 2000; // Default if no data
  }
  
  // Response time is the 3rd element in each input array
  const sum = trainingData.inputs.reduce((acc, input) => acc + input[2] * 10000, 0);
  return sum / trainingData.inputs.length;
};

/**
 * Save the model to IndexedDB
 * @returns {Promise<void>}
 * @private
 */
const saveModel = async () => {
  if (!model) return;
  
  try {
    await model.save('indexeddb://neuromatch-tf-model');
  } catch (error) {
    console.error('Error saving model:', error);
  }
};

/**
 * Load the model from IndexedDB
 * @returns {Promise<void>}
 * @private
 */
const loadModel = async () => {
  try {
    model = await tf.loadLayersModel('indexeddb://neuromatch-tf-model');
    console.log('Model loaded from IndexedDB');
  } catch (error) {
    throw new Error('No saved model found');
  }
};

/**
 * Get the current training status
 * @returns {Object} - Training status
 */
export const getTrainingStatus = () => {
  return {
    isModelReady,
    isTraining,
    trainingProgress,
    trainingLoss,
    dataPoints: trainingData.inputs.length
  };
};

/**
 * Clean up TensorFlow resources
 */
export const cleanupTensorFlow = () => {
  if (model) {
    try {
      model.dispose();
      model = null;
    } catch (error) {
      console.error('Error disposing model:', error);
    }
  }
  
  // Clear training data
  trainingData.inputs = [];
  trainingData.outputs = [];
  
  // Reset state
  isModelReady = false;
  isTraining = false;
  trainingProgress = 0;
  trainingLoss = 0;
};
