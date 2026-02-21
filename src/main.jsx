import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// --- Splash removal (after first paint) ---
const hideSplash = () => {
    const s = document.getElementById('splash');
    if (!s) return;
    s.classList.add('fade-out');           // uses the CSS in index.html
    setTimeout(() => s.remove(), 280);     // wait for the fade to finish
};

// Ensure we only hide after React has painted at least once.
// The 'load' listener acts as a safety net if requestAnimationFrame fires too early.
if (document.readyState === 'complete') {
    requestAnimationFrame(hideSplash);
} else {
    window.addEventListener('load', hideSplash, { once: true });
}
