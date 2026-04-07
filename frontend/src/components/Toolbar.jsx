import {
  Pen,
  Eraser,
  StickyNote,
  Square,
  Circle,
  MoveUpRight,
  Type,
  Undo2,
  Trash2,
} from "lucide-react";
import "./Toolbar.css";

const COLORS = [
  "#f2f2f7",
  "#7fff6e",
  "#5b8af5",
  "#f5923b",
  "#f55b5b",
  "#9b72f5",
  "#3dd6c8",
  "#fde68a",
];
const SIZES = [2, 4, 7, 12];

const TOOLS = [
  { id: "pen", icon: Pen, label: "Pen", key: "P" },
  { id: "eraser", icon: Eraser, label: "Eraser", key: "E" },
  { id: "rect", icon: Square, label: "Rect", key: "R" },
  { id: "circle", icon: Circle, label: "Circle", key: "C" },
  { id: "arrow", icon: MoveUpRight, label: "Arrow", key: "A" },
  { id: "text", icon: Type, label: "Text", key: "T" },
  { id: "sticky", icon: StickyNote, label: "Sticky", key: "S" },
];

export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onClear,
  onUndo,
  onAddSticky,
}) {
  const handleToolClick = (id) => {
    if (id === "sticky") {
      setTool("sticky");
      onAddSticky();
    } else setTool(id);
  };

  return (
    <div className="toolbar">
      {/* Tools */}
      <div className="toolbar-group">
        {TOOLS.map((item) => {
          const ToolIcon = item.icon; // Explicitly assign to a Capitalized variable
          return (
            <button
              key={item.id}
              className={`tool-btn ${tool === item.id ? "active" : ""}`}
              onClick={() => handleToolClick(item.id)}
              title={`${item.label} (${item.key})`}
            >
              <ToolIcon size={15} strokeWidth={1.9} />
              <span className="tool-key">{item.key}</span>
            </button>
          );
        })}
      </div>

      <div className="toolbar-sep" />

      {/* Colors */}
      <div className="toolbar-group">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`color-dot ${color === c ? "active" : ""}`}
            style={{ "--c": c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>

      <div className="toolbar-sep" />

      {/* Stroke size */}
      <div className="toolbar-group">
        {SIZES.map((s) => (
          <button
            key={s}
            className={`size-btn ${strokeWidth === s ? "active" : ""}`}
            onClick={() => setStrokeWidth(s)}
            title={`${s}px`}
          >
            <span
              className="size-pip"
              style={{ width: s + 3, height: s + 3 }}
            />
          </button>
        ))}
      </div>

      <div className="toolbar-sep" />

      {/* Actions */}
      <div className="toolbar-group">
        <button className="tool-btn" onClick={onUndo} title="Undo (Ctrl+Z)">
          <Undo2 size={15} strokeWidth={1.9} />
        </button>
        <button className="tool-btn danger" onClick={onClear} title="Clear All">
          <Trash2 size={15} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );
}
