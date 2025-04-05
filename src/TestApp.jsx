import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>NeuroMatch Test Page</h1>
      <p>If you can see this, the React app is working correctly!</p>
      <button 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#4fc3f7', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
}

export default TestApp;
