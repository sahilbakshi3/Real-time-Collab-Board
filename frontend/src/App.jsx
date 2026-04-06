import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./hooks/useSocket.js";
import { useCanvas } from "./hooks/useCanvas.js";
import Toolbar from "./components/Toolbar.jsx";
import UsersPanel from "./components/UsersPanel.jsx";
import Cursors from "./components/Cursors.jsx";
import StickyNotes from "./components/StickyNotes.jsx";
import Header from "./components/Header.jsx";
import "./App.css";

const SERVER_URL = "http://localhost:3001";

export default function App() {
  const [tool, setTool] = useState("pen");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [stickies, setStickies] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [color, setColor] = useState(theme === "dark" ? "#ededed" : "#1a1a1a");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      setColor(next === "dark" ? "#ededed" : "#1a1a1a");
      return next;
    });
  };

  const eraserColor = theme === "dark" ? "#0e0e0e" : "#f5f4f0";

  const { connected, myInfo, users, emit, on, off } = useSocket(SERVER_URL);

  const { canvasRef, handleMouseDown, handleMouseMove, handleMouseUp } =
    useCanvas({
      tool,
      color,
      strokeWidth,
      emit,
      on,
      off,
      myInfo,
      eraserColor,
    });

  useEffect(() => {
    if (!on || !off) return;

    const handleInit = ({ canvasState }) => {
      if (canvasState?.stickies) setStickies(canvasState.stickies);
    };
    const handleStickyAdded = (sticky) => {
      setStickies((prev) => [
        ...prev.filter((s) => s.id !== sticky.id),
        sticky,
      ]);
    };
    const handleStickyUpdated = ({ id, text }) => {
      setStickies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, text } : s)),
      );
    };
    const handleStickyMoved = ({ id, x, y }) => {
      setStickies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x, y } : s)),
      );
    };
    const handleCanvasCleared = () => setStickies([]);

    on("init", handleInit);
    on("sticky-added", handleStickyAdded);
    on("sticky-updated", handleStickyUpdated);
    on("sticky-moved", handleStickyMoved);
    on("canvas-cleared", handleCanvasCleared);

    return () => {
      off("init", handleInit);
      off("sticky-added", handleStickyAdded);
      off("sticky-updated", handleStickyUpdated);
      off("sticky-moved", handleStickyMoved);
      off("canvas-cleared", handleCanvasCleared);
    };
  }, [on, off]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "TEXTAREA") return;
      if (e.key === "p" || e.key === "P") setTool("pen");
      if (e.key === "e" || e.key === "E") setTool("eraser");
      if ((e.ctrlKey || e.metaKey) && e.key === "z") emit("undo");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [emit]);

  const handleAddSticky = useCallback(() => {
    emit("add-sticky", {
      x: Math.random() * (window.innerWidth - 300) + 100,
      y: Math.random() * (window.innerHeight - 300) + 100,
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
    if (window.confirm("Clear the entire board for everyone?"))
      emit("clear-canvas");
  };

  return (
    <div className="app">
      <Header myInfo={myInfo} theme={theme} toggleTheme={toggleTheme} />
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
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
        theme={theme}
      />
      <UsersPanel users={users} myInfo={myInfo} connected={connected} />
    </div>
  );
}
