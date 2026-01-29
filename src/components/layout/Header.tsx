import React from "react";
import Button from "../shared/Button";

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <span style={{ fontSize: 24 }}>🎨</span>
          <div>
            <div>Water Sort Solver</div>
            <div className="muted" style={{ fontSize: 12 }}>
              v1.2.0
            </div>
          </div>
          <span className="brand-badge">AI Assisted</span>
        </div>
        <Button
          variant="secondary"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
    </header>
  );
}
