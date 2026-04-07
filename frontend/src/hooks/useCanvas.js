import { useEffect, useRef, useCallback } from "react";

export function useCanvas({
  tool,
  color,
  strokeWidth,
  emit,
  on,
  off,
  eraserColor = "#111113",
  setShapes,
}) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const startPos = useRef(null);
  const currentStroke = useRef([]);
  const snapshotRef = useRef(null); // for shape preview

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawLine = useCallback((ctx, from, to, c, width) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = c;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }, []);

  const drawShape = useCallback((ctx, shape) => {
    ctx.beginPath();
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.width;
    ctx.lineCap = "round";

    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
    } else if (shape.type === "circle") {
      const rx = Math.abs(shape.w) / 2;
      const ry = Math.abs(shape.h) / 2;
      ctx.ellipse(
        shape.x + shape.w / 2,
        shape.y + shape.h / 2,
        rx,
        ry,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    } else if (shape.type === "arrow") {
      const ex = shape.x + shape.w;
      const ey = shape.y + shape.h;
      const angle = Math.atan2(ey - shape.y, ex - shape.x);
      const headLen = 14;
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(ex, ey);
      ctx.lineTo(
        ex - headLen * Math.cos(angle - Math.PI / 6),
        ey - headLen * Math.sin(angle - Math.PI / 6),
      );
      ctx.moveTo(ex, ey);
      ctx.lineTo(
        ex - headLen * Math.cos(angle + Math.PI / 6),
        ey - headLen * Math.sin(angle + Math.PI / 6),
      );
      ctx.stroke();
    } else if (shape.type === "text") {
      ctx.font = `${shape.fontSize || 18}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = shape.color;
      ctx.fillText(shape.text || "Text", shape.x, shape.y);
    }
  }, []);

  const redrawCanvas = useCallback(
    (strokes, shapesArr = []) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      strokes.forEach((stroke) => {
        if (!stroke.points || stroke.points.length < 2) return;
        for (let i = 1; i < stroke.points.length; i++) {
          drawLine(
            ctx,
            stroke.points[i - 1],
            stroke.points[i],
            stroke.color,
            stroke.width,
          );
        }
      });
      shapesArr.forEach((s) => drawShape(ctx, s));
    },
    [drawLine, drawShape],
  );

  const handleMouseDown = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const pos = getPos(e, canvas);
      isDrawing.current = true;
      startPos.current = pos;
      lastPos.current = pos;
      currentStroke.current = [pos];

      if (tool === "rect" || tool === "circle" || tool === "arrow") {
        // save snapshot for preview
        const ctx = canvas.getContext("2d");
        snapshotRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }

      if (tool === "text") {
        const text = window.prompt("Enter text:");
        if (text) {
          const shape = {
            type: "text",
            x: pos.x,
            y: pos.y,
            text,
            color,
            width: strokeWidth,
            fontSize: 18,
          };
          const ctx = canvas.getContext("2d");
          drawShape(ctx, shape);
          emit("add-shape", shape);
        }
        isDrawing.current = false;
        return;
      }

      emit("draw-start", {
        pos,
        color: tool === "eraser" ? eraserColor : color,
        width: tool === "eraser" ? strokeWidth * 3 : strokeWidth,
      });
    },
    [tool, color, strokeWidth, emit, eraserColor, drawShape],
  );

  const handleMouseMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const pos = getPos(e, canvas);
      emit("cursor-move", pos);

      if (!isDrawing.current) return;

      const ctx = canvas.getContext("2d");

      if (tool === "pen" || tool === "eraser") {
        const drawColor = tool === "eraser" ? eraserColor : color;
        const drawWidth = tool === "eraser" ? strokeWidth * 3 : strokeWidth;
        const from = lastPos.current;
        drawLine(ctx, from, pos, drawColor, drawWidth);
        emit("draw", { from, to: pos, color: drawColor, width: drawWidth });
        currentStroke.current.push(pos);
        lastPos.current = pos;
      } else if (tool === "rect" || tool === "circle" || tool === "arrow") {
        // restore snapshot and draw preview
        if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);
        const w = pos.x - startPos.current.x;
        const h = pos.y - startPos.current.y;
        drawShape(ctx, {
          type: tool,
          x: startPos.current.x,
          y: startPos.current.y,
          w,
          h,
          color,
          width: strokeWidth,
        });
      }
    },
    [tool, color, strokeWidth, emit, drawLine, eraserColor, drawShape],
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (!isDrawing.current) return;
      isDrawing.current = false;

      if (tool === "pen" || tool === "eraser") {
        if (currentStroke.current.length > 0) {
          emit("draw-end", {
            points: currentStroke.current,
            color: tool === "eraser" ? eraserColor : color,
            width: tool === "eraser" ? strokeWidth * 3 : strokeWidth,
          });
          currentStroke.current = [];
        }
      } else if (tool === "rect" || tool === "circle" || tool === "arrow") {
        const canvas = canvasRef.current;
        const pos = getPos(e, canvas);
        const w = pos.x - startPos.current.x;
        const h = pos.y - startPos.current.y;
        if (Math.abs(w) > 3 || Math.abs(h) > 3) {
          const shape = {
            type: tool,
            x: startPos.current.x,
            y: startPos.current.y,
            w,
            h,
            color,
            width: strokeWidth,
          };
          emit("add-shape", shape);
          if (setShapes)
            setShapes((prev) => [
              ...prev,
              { ...shape, id: `temp-${Date.now()}` },
            ]);
        }
        snapshotRef.current = null;
      }
    },
    [tool, color, strokeWidth, emit, eraserColor, setShapes],
  );

  // remote events
  useEffect(() => {
    if (!on || !off) return;

    const handleRemoteDraw = ({ from, to, color: c, width }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      drawLine(canvas.getContext("2d"), from, to, c, width);
    };

    const handleShapeAdded = (shape) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      drawShape(canvas.getContext("2d"), shape);
      if (setShapes)
        setShapes((prev) => [...prev.filter((s) => s.id !== shape.id), shape]);
    };

    const handleCanvasState = ({ strokes, shapes: shapesArr }) =>
      redrawCanvas(strokes, shapesArr);

    const handleCanvasCleared = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      if (setShapes) setShapes([]);
    };

    on("draw", handleRemoteDraw);
    on("shape-added", handleShapeAdded);
    on("canvas-state", handleCanvasState);
    on("canvas-cleared", handleCanvasCleared);

    return () => {
      off("draw", handleRemoteDraw);
      off("shape-added", handleShapeAdded);
      off("canvas-state", handleCanvasState);
      off("canvas-cleared", handleCanvasCleared);
    };
  }, [on, off, drawLine, drawShape, redrawCanvas, setShapes]);

  // canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const ctx = canvas.getContext("2d");
      const imageData =
        canvas.width > 0 && canvas.height > 0
          ? ctx.getImageData(0, 0, canvas.width, canvas.height)
          : null;
      canvas.width = width;
      canvas.height = height;
      if (imageData) ctx.putImageData(imageData, 0, 0);
    };
    const ro = new ResizeObserver(() => setSize());
    ro.observe(canvas);
    setSize();
    return () => ro.disconnect();
  }, []);

  return {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    redrawCanvas,
  };
}
