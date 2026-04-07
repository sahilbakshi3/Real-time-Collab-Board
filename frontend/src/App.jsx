import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./hooks/useSocket.js";
import { useCanvas } from "./hooks/useCanvas.js";
import Toolbar from "./components/Toolbar.jsx";
import UsersPanel from "./components/UsersPanel.jsx";
import Cursors from "./components/Cursors.jsx";
import StickyNotes from "./components/StickyNotes.jsx";
import Header from "./components/Header.jsx";
import "./App.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function App() {
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#f2f2f7");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [stickies, setStickies] = useState([]);
  const [shapes, setShapes] = useState([]);

  const { connected, myInfo, users, emit, on, off } = useSocket(SERVER_URL);

  const {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    redrawCanvas,
  } = useCanvas({
    tool,
    color,
    strokeWidth,
    emit,
    on,
    off,
    eraserColor: "#111113",
    shapes,
    setShapes,
  });

  useEffect(() => {
    if (!on || !off) return;

    const handleInit = ({ canvasState }) => {
      if (canvasState?.stickies) setStickies(canvasState.stickies);
      if (canvasState?.shapes) setShapes(canvasState.shapes);
      if (canvasState)
        redrawCanvas(canvasState.strokes || [], canvasState.shapes || []);
    };
    const handleStickyAdded = (sticky) =>
      setStickies((prev) => [
        ...prev.filter((s) => s.id !== sticky.id),
        sticky,
      ]);
    const handleStickyUpdated = ({ id, text }) =>
      setStickies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, text } : s)),
      );

    const handleCanvasState = (newState) => {
      if (newState.stickies) setStickies(newState.stickies);
      if (newState.shapes) setShapes(newState.shapes);
    };

    const handleStickyMoved = ({ id, x, y }) =>
      setStickies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x, y } : s)),
      );
    const handleShapeAdded = (shape) =>
      setShapes((prev) => [...prev.filter((s) => s.id !== shape.id), shape]);

    const handleCanvasCleared = () => {
      setStickies([]);
      setShapes([]);
    };

    on("init", handleInit);
    on("sticky-added", handleStickyAdded);
    on("sticky-updated", handleStickyUpdated);
    on("sticky-moved", handleStickyMoved);
    on("shape-added", handleShapeAdded);
    on("canvas-state", handleCanvasState);
    on("canvas-cleared", handleCanvasCleared);

    return () => {
      off("init", handleInit);
      off("sticky-added", handleStickyAdded);
      off("sticky-updated", handleStickyUpdated);
      off("sticky-moved", handleStickyMoved);
      off("shape-added", handleShapeAdded);
      off("canvas-state", handleCanvasState);
      off("canvas-cleared", handleCanvasCleared);
    };
  }, [on, off]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT")
        return;
      const keyMap = {
        p: "pen",
        e: "eraser",
        r: "rect",
        c: "circle",
        a: "arrow",
        t: "text",
        s: "sticky",
      };
      const k = e.key.toLowerCase();
      if (keyMap[k]) setTool(keyMap[k]);
      if ((e.ctrlKey || e.metaKey) && e.key === "z") emit("undo");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [emit]);

  const handleAddSticky = useCallback(() => {
    emit("add-sticky", {
      x: Math.random() * (window.innerWidth - 400) + 150,
      y: Math.random() * (window.innerHeight - 300) + 80,
      text: "",
    });
  }, [emit]);

  const handleStickyUpdate = useCallback(
    (id, text) => {
      setStickies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, text } : s)),
      );
      emit("update-sticky", { id, text });
    },
    [emit],
  );

  const handleStickyMove = useCallback(
    (id, x, y) => {
      setStickies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x, y } : s)),
      );
      emit("move-sticky", { id, x, y });
    },
    [emit],
  );

  const handleClear = () => {
    if (window.confirm("Clear everything for all users?")) emit("clear-canvas");
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "collaboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="app">
      <Header myInfo={myInfo} connected={connected} onExport={handleExport} />
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor:
              tool === "eraser"
                ? "cell"
                : tool === "text"
                  ? "text"
                  : "crosshair",
          }}
        />
        <Cursors users={users} myInfo={myInfo} />
        <StickyNotes
          stickies={stickies}
          onUpdate={handleStickyUpdate}
          onMove={handleStickyMove}
        />
      </div>
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onClear={handleClear}
        onUndo={() => emit("undo")}
        onAddSticky={handleAddSticky}
      />
      <UsersPanel users={users} myInfo={myInfo} connected={connected} />
    </div>
  );
}
