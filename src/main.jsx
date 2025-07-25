import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    // By removing <React.StrictMode>, we prevent the development-only double-render
    // that is causing the input focus to be lost. This will not affect the production build.
    <App />
);