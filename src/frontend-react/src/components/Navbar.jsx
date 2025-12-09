import React, { useState, useEffect } from 'react';
import { Sun, Moon, Zap, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ theme, setTheme, mode, setMode }) => {
  const location = useLocation();

  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    document.documentElement.setAttribute('data-mode', newMode);
    localStorage.setItem('mode', newMode);
  };

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--header-bg)] backdrop-blur-[var(--backdrop-blur)] transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--border-radius)] bg-[var(--primary)] text-xl font-bold text-[var(--primary-text)] ${theme === 'neobrutalism' ? 'border-[var(--border-width)] border-[var(--border-color)] shadow-[4px_4px_0_0_var(--text-main)] -rotate-3' : ''}`}>
            M1
          </div>
          <div className={`text-2xl font-extrabold tracking-tight text-[var(--text-main)] ${theme === 'neobrutalism' ? 'uppercase' : ''}`}>
            Mark 1
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex gap-1 rounded-[var(--border-radius)] border border-[var(--border-color)] bg-[var(--bg-surface-secondary)] p-1 ${theme === 'neobrutalism' ? 'border-none bg-[var(--bg-surface)] gap-2 p-0' : ''}`}>
            <button
              onClick={() => handleSetTheme('professional')}
              className={`flex items-center justify-center rounded-[var(--border-radius-sm)] p-2 transition-all ${theme === 'professional' ? 'bg-[var(--bg-surface)] text-[var(--primary)] font-bold shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'} ${theme === 'neobrutalism' ? 'border-[var(--border-width)] border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] rounded-none shadow-[3px_3px_0_0_var(--text-main)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_var(--text-main)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none' : ''} ${theme === 'neobrutalism' && theme === 'professional' ? '!bg-[var(--primary)] !text-[var(--primary-text)] !translate-x-[2px] !translate-y-[2px] !shadow-none' : ''}`}
              title="Professional"
            >
              <Zap size={18} />
            </button>
            <button
              onClick={() => handleSetTheme('neobrutalism')}
              className={`flex items-center justify-center rounded-[var(--border-radius-sm)] p-2 transition-all ${theme === 'neobrutalism' ? 'bg-[var(--bg-surface)] text-[var(--primary)] font-bold shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'} ${theme === 'neobrutalism' ? 'border-[var(--border-width)] border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] rounded-none shadow-[3px_3px_0_0_var(--text-main)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_var(--text-main)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none' : ''} ${theme === 'neobrutalism' && theme === 'neobrutalism' ? '!bg-[var(--primary)] !text-[var(--primary-text)] !translate-x-[2px] !translate-y-[2px] !shadow-none' : ''}`}
              title="Neobrutalism"
            >
              <span className="font-bold text-xs">Gen Z</span>
            </button>
          </div>

          <div className={`flex rounded-[var(--border-radius)] border border-[var(--border-color)] bg-[var(--bg-surface-secondary)] p-1 ${theme === 'neobrutalism' ? 'border-none bg-[var(--bg-surface)] p-0' : ''}`}>
            <button
              onClick={toggleMode}
              className={`flex items-center justify-center rounded-[var(--border-radius-sm)] p-2 transition-all text-[var(--text-secondary)] hover:text-[var(--text-main)] ${theme === 'neobrutalism' ? 'border-[var(--border-width)] border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] rounded-none shadow-[3px_3px_0_0_var(--text-main)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_var(--text-main)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none' : ''}`}
              title="Toggle Dark Mode"
            >
              {mode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          {location.pathname !== '/metrics' && (
            <Link
              to="/metrics"
              className={`flex items-center justify-center rounded-[var(--border-radius-sm)] p-2 transition-all text-[var(--text-secondary)] hover:text-[var(--text-main)] ${theme === 'neobrutalism' ? 'border-[var(--border-width)] border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] rounded-none shadow-[3px_3px_0_0_var(--text-main)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_var(--text-main)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none' : ''}`}
              title="View Metrics"
            >
              <BarChart2 size={18} />
            </Link>
          )}

          {location.pathname === '/metrics' && (
             <Link
              to="/"
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-[var(--border-radius)] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] transition-all ${theme === 'neobrutalism' ? 'border-[var(--border-width)] rounded-none shadow-[4px_4px_0_0_var(--text-main)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_var(--text-main)]' : 'hover:bg-[var(--bg-surface-secondary)]'}`}
            >
              Back to Runner
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
