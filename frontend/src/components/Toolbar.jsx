import React from "react";
import "./Toolbar.css";
import { Eraser, Pen, StickyNoteIcon, Trash2, Undo } from "lucide-react";

const getColors = (theme) => [
  theme === "dark" ? "#ededed" : "#1a1a1a",
  "#ff6b6b",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fb923c",
];

const STROKE_SIZES = [2, 4, 8, 14];

const Toolbar = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onClear,
  onUndo,
  onAddSticky,
  theme,
}) => {
  const COLORS = getColors(theme);

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">tools</span>
        <div className="toolbar-group">
          <button
            className={`tool-btn ${tool === "pen" ? "active" : ""}`}
            onClick={() => setTool("pen")}
            title="Pen (P)"
          >
            <Pen size={16} strokeWidth={1.8} />
          </button>
          <button
            className={`tool-btn ${tool === "eraser" ? "active" : ""}`}
            onClick={() => setTool("eraser")}
            title="Eraser (E)"
          >
            <Eraser size={16} strokeWidth={1.8} />
          </button>
          <button
            className={`tool-btn ${tool === "sticky" ? "active" : ""}`}
            onClick={() => {
              setTool("sticky");
              onAddSticky();
            }}
            title="Sticky (S)"
          >
            <StickyNoteIcon size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">color</span>
        <div className="color-grid">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`color-btn ${color === c ? "active" : ""}`}
              style={{ "--c": c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />
      <div className="toolbar-section">
        <span className="toolbar-label">size</span>
        <div className="size-group">
          {STROKE_SIZES.map((s) => (
            <button
              key={s}
              className={`size-btn ${strokeWidth === s ? "active" : ""}`}
              onClick={() => setStrokeWidth(s)}
            >
              <span
                className="size-dot"
                style={{ width: s + 3, height: s + 3 }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">edit</span>
        <div className="toolbar-group">
          <button className="tool-btn" onClick={onUndo} title="Undo (Ctrl+Z)">
            <Undo size={16} strokeWidth={1.8} />
          </button>

          <button
            className="tool-btn danger"
            onClick={onClear}
            title="Clear All"
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
