import { useEffect, useRef, useCallback } from "react";

export function useCanvas({ tool, color, strokeWidth, emit, on, off }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const currentStroke = useRef([]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawLine = useCallback((ctx, from, to, color, width) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback(
    (strokes) => {
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
    },
    [drawLine],
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (tool !== "pen" && tool !== "eraser") return;
      const canvas = canvasRef.current;
      const pos = getPos(e, canvas);
      isDrawing.current = true;
      lastPos.current = pos;
      currentStroke.current = [pos];
      emit("draw-start", {
        pos,
        color: tool === "eraser" ? "#0d0d0f" : color,
        width: tool === "eraser" ? strokeWidth * 3 : strokeWidth,
      });
    },
    [tool, color, strokeWidth, emit],
  );

  const handleMouseMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const pos = getPos(e, canvas);

      emit("cursor-move", pos);

      if (!isDrawing.current || (tool !== "pen" && tool !== "eraser")) return;

      const ctx = canvas.getContext("2d");
      const drawColor = tool === "eraser" ? "#0d0d0f" : color;
      const drawWidth = tool === "eraser" ? strokeWidth * 3 : strokeWidth;

      const from = lastPos.current;
      drawLine(ctx, from, pos, drawColor, drawWidth);
      emit("draw", { from, to: pos, color: drawColor, width: drawWidth });
      currentStroke.current.push(pos);
      lastPos.current = pos;
    },
    [tool, color, strokeWidth, emit, drawLine],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentStroke.current.length > 0) {
      emit("draw-end", {
        points: currentStroke.current,
        color: tool === "eraser" ? "#0d0d0f" : color,
        width: tool === "eraser" ? strokeWidth * 3 : strokeWidth,
      });
      currentStroke.current = [];
    }
  }, [tool, color, strokeWidth, emit]);

  useEffect(() => {
    if (!on || !off) return;

    const handleRemoteDraw = ({ from, to, color, width }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      drawLine(canvas.getContext("2d"), from, to, color, width);
    };

    const handleCanvasState = ({ strokes }) => redrawCanvas(strokes);

    const handleCanvasCleared = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    };

    on("draw", handleRemoteDraw);
    on("canvas-state", handleCanvasState);
    on("canvas-cleared", handleCanvasCleared);

    return () => {
      off("draw", handleRemoteDraw);
      off("canvas-state", handleCanvasState);
      off("canvas-cleared", handleCanvasCleared);
    };
  }, [on, off, drawLine, redrawCanvas]);

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
