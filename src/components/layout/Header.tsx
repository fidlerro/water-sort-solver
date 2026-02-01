import React from "react";

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  isHelpOpen: boolean;
  onToggleHelp: () => void;
}

export default function Header({ isDark, onToggleTheme, isHelpOpen, onToggleHelp }: HeaderProps) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <img src="/images/favicon-48.png" alt="Water Sort Solver" className="brand-logo" />
          <div className="brand-info">
            <div className="brand-title">Water Sort Solver</div>
            <div className="brand-subtitle">AI ASSISTED</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>

          
            {/* Theme Toggle */}
            <div
              onClick={onToggleTheme}
              className="theme-switch"
              role="button"
              tabIndex={0}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className={`theme-switch-thumb ${isDark ? 'dark' : 'light'}`}>
                {isDark ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </div>
            </div>
        </div>
      </div>

       {/* Pull-down Handle directly attached to Header */}
       <div className="help-handle-wrapper">
        <button 
          className="help-handle"
          onClick={onToggleHelp}
          title={isHelpOpen ? "Close Help" : "Open Help"}
        >
          <span>HELP</span>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ 
              transform: isHelpOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <style>{`
        .help-handle-wrapper {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translate(-50%, 100%);
          z-index: 2000;
        }

        .help-handle {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-top: none;
          padding: 4px 16px 6px;
          border-radius: 0 0 12px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-weight: 700;
          font-size: 11px;
          color: var(--muted);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }

        .help-handle:hover {
          color: var(--primary);
          padding-top: 8px; /* Slight pull effect */
        }
      `}</style>
    </header>
  );
}
