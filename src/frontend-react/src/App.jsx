import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import MetricsPage from './pages/MetricsPage';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'professional');

  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('mode');
    if (savedMode) return savedMode;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // We don't persist automatically here to respect user's choice not to choose yet,
        // or we can persist. The requirement said "call setMode... and also persist".
        // If we persist here, it works.
        // But better to just return 'dark' and let user interactions persist if needed,
        // OR if the goal is to "detect and save preference", we do:
        localStorage.setItem('mode', 'dark');
        return 'dark';
    }
    return 'light';
  });

  // Effect for theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Effect for mode (sync to DOM)
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-main)] font-sans transition-colors duration-300">
        <Navbar theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} />
        <main>
          <Routes>
            <Route path="/" element={<MainPage theme={theme} />} />
            <Route path="/metrics" element={<MetricsPage theme={theme} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
