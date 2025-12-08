import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import MetricsPage from './pages/MetricsPage';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'professional');
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', mode);

    // Check system preference if mode not set
    if (!localStorage.getItem('mode') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setMode('dark');
    }
  }, [theme, mode]);

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
