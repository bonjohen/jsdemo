import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import SimpleApp from './SimpleApp.jsx';
// import BasicApp from './BasicApp.jsx';
import { ThemeProvider } from './components/ThemeProvider';
import './styles/index.css';

// Register service worker for cache control
if ('serviceWorker' in navigator && import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
