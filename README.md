# 🎨 Real-Time Collaborative Whiteboard

A full-stack real-time collaborative drawing application where multiple users can draw, sketch, and brainstorm together on a shared canvas — all changes reflected instantly across every connected client with zero refresh.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Key Implementation Details](#key-implementation-details)
- [Author](#author)

---

## Overview

Real-Time Collab Board is a full-stack application built around the **HTML5 Canvas API** and **Socket.IO** bidirectional event system. When one user draws a stroke on the canvas, the raw drawing data is emitted to the Node.js server which broadcasts it to all other connected clients — each of whom re-renders that stroke on their own canvas in real time.

This project demonstrates core real-time web engineering challenges: low-latency event propagation, canvas state synchronization across clients, room-based session management, and handling the imperative Canvas API cleanly inside a declarative React component tree.

---

## Features

- **Real-Time Drawing Sync** — Every stroke drawn by any user appears on all connected clients in real time via Socket.IO events
- **Freehand Drawing** — Smooth mouse-based drawing on an HTML5 canvas with configurable brush size and color
- **Room-Based Sessions** — Users join a shared board session; only users in the same room see each other's strokes
- **Canvas State on Join** — New users connecting to an existing session receive the current board state so they're not starting from a blank slate
- **Clear Board** — Broadcast a clear event to reset the canvas for all users in the room simultaneously
- **Multi-User Cursor Tracking** — Live cursor positions of other connected users visible on the canvas
- **Responsive Canvas** — Canvas adapts to the viewport while maintaining drawing fidelity

---

## Tech Stack

### Frontend

| Technology | Role |
|---|---|
| **React** | Component-based UI, canvas wrapper |
| **HTML5 Canvas API** | Drawing surface and rendering |
| **Socket.IO Client** | Real-time event emission and reception |
| **CSS3** | Layout, toolbar styling, responsive design |

### Backend

| Technology | Role |
|---|---|
| **Node.js** | Server runtime |
| **Express** | HTTP server, static file serving, CORS |
| **Socket.IO** | WebSocket server, room management, event broadcasting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client A (Browser)                       │
│                                                                 │
│   React App                                                     │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Canvas Component                                        │  │
│   │  - onMouseMove → emit('draw', { x, y, color, size })    │  │
│   │  - socket.on('draw') → ctx.lineTo() → ctx.stroke()      │  │
│   └──────────────────────────────────────────────────────────┘  │
│                    ▲                  │                         │
│             receive│                  │emit                     │
└────────────────────┼──────────────────┼─────────────────────────┘
                     │                  │
                     │    Socket.IO     │
              ┌──────┴──────────────────▼──────┐
              │        Node.js Server           │
              │                                │
              │  io.on('connection', socket => {│
              │    socket.join(roomId)          │
              │    socket.on('draw', data =>    │
              │      socket.to(room).emit(data) │
              │    )                            │
              │  })                             │
              └──────────────────┬─────────────┘
                                 │
                          broadcast to
                          all others in room
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                        Client B (Browser)                       │
│                                                                 │
│   React App                                                     │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Canvas Component                                        │  │
│   │  - socket.on('draw') → apply stroke to canvas           │  │
│   └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Real-time-Collab-Board/
├── backend/
│   ├── index.js           # Express server + Socket.IO setup
│   ├── roomManager.js     # Room state tracking, canvas history
│   └── package.json       # Node dependencies (express, socket.io, cors)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   │   ├── Canvas.js      # Core drawing component, socket integration
│   │   │   │   └── Canvas.css
│   │   │   ├── Toolbar/
│   │   │   │   ├── Toolbar.js     # Color picker, brush size, clear button
│   │   │   │   └── Toolbar.css
│   │   │   └── RoomEntry/
│   │   │       └── RoomEntry.js   # Room ID input, join flow
│   │   ├── hooks/
│   │   │   └── useSocket.js       # Socket.IO connection lifecycle hook
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json       # React dependencies (react, socket.io-client)
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 16
- npm >= 8

### 1. Clone the Repository

```bash
git clone https://github.com/sahilbakshi3/Real-time-Collab-Board.git
cd Real-time-Collab-Board
```

### 2. Start the Backend

```bash
cd backend
npm install
node index.js
# Server starts on http://localhost:5000
```

### 3. Start the Frontend

Open a new terminal tab:

```bash
cd frontend
npm install
npm start
# React app starts on http://localhost:3000
```

### 4. Test Collaborative Drawing

Open `http://localhost:3000` in two separate browser tabs or windows. Draw on one — watch it appear on the other in real time.

---

## Key Implementation Details

### Canvas Drawing Loop

The canvas component tracks `mousedown`, `mousemove`, and `mouseup` events to define stroke segments. Each segment emits a draw event to the server containing the start/end coordinates, color, and brush size.

```js
// Emit drawing data on every mouse move while pressed
const handleMouseMove = (e) => {
  if (!isDrawing) return;
  const { offsetX, offsetY } = e.nativeEvent;
  ctx.lineTo(offsetX, offsetY);
  ctx.stroke();
  socket.emit('draw', {
    x: offsetX, y: offsetY,
    prevX, prevY,
    color, brushSize,
    roomId
  });
};
```

### Applying Remote Strokes

Incoming draw events from other users are applied directly to the canvas context — no React state involved. This is intentional: routing canvas operations through React state would introduce render-cycle latency visible to users.

```js
socket.on('draw', ({ x, y, prevX, prevY, color, brushSize }) => {
  const ctx = canvasRef.current.getContext('2d');
  ctx.strokeStyle = color;
  ctx.lineWidth = brushSize;
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();
});
```

### Canvas State on Join

When a new user joins a room, the server sends the accumulated stroke history for that room. The client replays all strokes sequentially on mount to reconstruct the current board state — so late joiners see exactly what earlier collaborators drew.

### Room Management

Each board session is identified by a room ID. Socket.IO's built-in room system (`socket.join(roomId)`) scopes all draw and clear events to the correct subset of connected clients — preventing strokes from leaking across unrelated sessions.

### useSocket Hook

The custom `useSocket` hook handles Socket.IO connection setup, cleanup on component unmount, and event listener registration/deregistration — keeping socket lifecycle concerns out of the Canvas component itself.

---

## Author

**Sahil Bakshi**
Frontend Engineer · React · TypeScript · JavaScript

- GitHub: [@sahilbakshi3](https://github.com/sahilbakshi3)
- Machine Coding Practice: [sahilbakshi3/Machine-Coding](https://github.com/sahilbakshi3/Machine-Coding)
- Fleet Tracking Project: [sahilbakshi3/Fleet-Tracking](https://github.com/sahilbakshi3/Fleet-Tracking)
