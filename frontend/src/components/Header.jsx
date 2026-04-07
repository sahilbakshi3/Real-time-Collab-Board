import { Download } from "lucide-react";
import "./Header.css";

export default function Header({ myInfo, connected, onExport }) {
  return (
    <div className="header">
      {/* Logo */}
      <div className="header-logo">
        <div className="logo-mark">
          <svg viewBox="0 0 160 160" className="logo-svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>

            {/* Background */}
            <circle cx="80" cy="80" r="70" fill="url(#grad)" />

            {/* Nodes */}
            <circle cx="50" cy="80" r="8" fill="#ffffff" />
            <circle cx="110" cy="80" r="8" fill="#ffffff" />
            <circle cx="80" cy="50" r="8" fill="#ffffff" />
            <circle cx="80" cy="110" r="8" fill="#ffffff" />

            {/* Connections */}
            <line
              x1="50"
              y1="80"
              x2="80"
              y2="50"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <line
              x1="80"
              y1="50"
              x2="110"
              y2="80"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <line
              x1="110"
              y1="80"
              x2="80"
              y2="110"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <line
              x1="80"
              y1="110"
              x2="50"
              y2="80"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Pulse */}
            <circle cx="80" cy="80" r="6" className="pulse-core" />
            <circle
              cx="80"
              cy="80"
              r="6"
              className={`pulse-ring ${connected ? "active" : "inactive"}`}
            />
          </svg>
        </div>

        <span className="logo-text">collaboard</span>
      </div>

      {/* Identity */}
      {myInfo && (
        <div className="header-identity">
          <span className="identity-dot" style={{ background: myInfo.color }} />
          <span className="identity-name">{myInfo.name}</span>
        </div>
      )}

      {/* Status */}
      <div className="header-status">
        <span className={`status-dot ${connected ? "live" : "offline"}`} />
        <span className="status-text">{connected ? "live" : "offline"}</span>
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="header-btn" onClick={onExport} title="Export PNG">
          <Download size={14} strokeWidth={2} />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}
