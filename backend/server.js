import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const users = new Map();

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];

let colorIndex = 0;
let canvasState = {
  strokes: [],
  stickies: [],
};

io.on("connection", (socket) => {
  const userColor = COLORS[colorIndex % COLORS.length];
  colorIndex++;

  const user = {
    id: socket.id,
    color: userColor,
    cursor: { x: 0, y: 0 },
    name: `User ${Math.floor(Math.random() * 9000) + 1000}`,
  };

  users.set(socket.id, user);

  socket.emit("init", {
    canvasState,
    users: Array.from(users.values()),
    myId: socket.id,
    myColor: userColor,
    myName: user.name,
  });

  socket.broadcast.emit("user-joined", user);

  console.log("Connected", user.name);

  socket.on("cursor-move", (pos) => {
    const u = users.get(socket.id);

    if (u) {
      u.cursor = pos;

      socket.broadcast.emit("cursor-update", {
        id: socket.id,
        x: pos.x,
        y: pos.y,
        color: u.color,
        name: u.name,
      });
    }
  });

  socket.on("draw-start", (data) => {
    socket.broadcast.emit("draw-start", { ...data, userId: socket.id });
  });

  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", { ...data, userId: socket.id });
  });

  socket.on("draw-end", (stroke) => {
    canvasState.stroke.push(stroke);
    socket.broadcast.emit("draw-end", { ...stroke, userId: socket.id });
  });

  socket.on("add-sticky", (sticky) => {
    const newSticky = {
      ...sticky,
      id: `sticky-${Date.now()}-${socket.id}`,
      color: users.get(socket.id)?.color || "#FFEAA7",
    };

    canvasState.stickies.push(newSticky);
    io.emit("sticky-added", newSticky);
  });

  socket.on("update-sticky", (data) => {
    const sticky = canvasState.stickies.find((s) => s.id === data.id);
    if (sticky) sticky.text = data.text;
    socket.broadcast.emit("sticky-updated", data);
  });

  socket.on("move-sticky", (data) => {
    const sticky = canvasState.stickies.find((s) => s.id === data.id);
    if (sticky) {
      sticky.x = data.x;
      sticky.y = data.y;
    }
    socket.broadcast.emit("sticky-moved", data);
  });

  socket.on("undo", () => {
    if (canvasState.strokes.length > 0) {
      canvasState.strokes.pop();
      io.emit("canvas-state", canvasState);
    }
  });

  socket.on("clear-canvas", () => {
    canvasState = { strokes: [], stickies: [] };
    io.emit("canvas-cleared");
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("user-left", socket.id);
    console.log("Left", user.name);
  });
});

httpServer.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
