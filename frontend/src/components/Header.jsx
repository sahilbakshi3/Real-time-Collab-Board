import { Sun, Moon, Hexagon } from "lucide-react";
import "./Header.css";

export default function Header({ myInfo, theme, toggleTheme }) {
  return (
    <div className="header">
      <div className="header-logo">
        <Hexagon
          size={20}
          strokeWidth={1.5}
          color="var(--accent)"
          fill="var(--accent-glow)"
        />
        <span className="logo-text">collaboard</span>
      </div>

      {myInfo && (
        <div className="header-identity">
          <span
            className="identity-color"
            style={{ background: myInfo.color }}
          />
          <span className="identity-name">{myInfo.name}</span>
        </div>
      )}

      <div className="header-right">
        <span className="header-hint">open multiple tabs to collaborate</span>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={15} strokeWidth={1.8} />
          ) : (
            <Moon size={15} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </div>
  );
}
