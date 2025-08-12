import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// --- Splash removal (after first paint) ---
const hideSplash = () => {
    const s = document.getElementById('splash');
    if (!s) return;
    s.classList.add('fade-out');           // uses the CSS in index.html
    setTimeout(() => s.remove(), 280);     // wait for the fade to finish
};

// Ensure we only hide after React has painted at least once
requestAnimationFrame(hideSplash);

// Extra safety: if something delays paint, remove on full load too
window.addEventListener('load', hideSplash);
