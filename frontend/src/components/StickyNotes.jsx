import { useState, useRef } from "react";
import { GripHorizontal } from "lucide-react";
import "./StickyNotes.css";

function StickyNote({ sticky, onUpdate, onMove }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.tagName === "TEXTAREA") return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - sticky.x, y: e.clientY - sticky.y };

    const handleMove = (me) => {
      onMove(
        sticky.id,
        me.clientX - dragOffset.current.x,
        me.clientY - dragOffset.current.y,
      );
    };
    const handleUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  };

  return (
    <div
      className={`sticky-note ${isDragging ? "dragging" : ""}`}
      style={{ left: sticky.x, top: sticky.y, "--sticky-color": sticky.color }}
      onMouseDown={handleMouseDown}
    >
      <div className="sticky-header">
        <GripHorizontal size={13} color="rgba(0,0,0,0.35)" />
      </div>
      <textarea
        className="sticky-text"
        defaultValue={sticky.text || ""}
        placeholder="note something..."
        onChange={(e) => onUpdate(sticky.id, e.target.value)}
        rows={4}
      />
    </div>
  );
}

export default function StickyNotes({ stickies, onUpdate, onMove }) {
  return (
    <div className="stickies-layer">
      {stickies.map((sticky) => (
        <StickyNote
          key={sticky.id}
          sticky={sticky}
          onUpdate={onUpdate}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
