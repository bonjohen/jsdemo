import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import SimpleApp from './SimpleApp.jsx';
// import BasicApp from './BasicApp.jsx';
import { ThemeProvider } from './components/ThemeProvider';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
