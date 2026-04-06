import React, { useState, useEffect } from "react";
// import Header from "./components/Header";
import "./index.css";
// import Toolbar from "./components/Toolbar";
// import UsersPanel from "./components/UsersPanel.jsx";

// const fakeUsers = [
//   { id: "1", color: "#FF6B6B", name: "User 1234", cursor: { x: 0, y: 0 } },
//   { id: "2", color: "#4ECDC4", name: "User 5678", cursor: { x: 0, y: 0 } },
//   { id: "3", color: "#45B7D1", name: "User 9999", cursor: { x: 0, y: 0 } },
// ];

const myInfo = { id: "me", color: "#FF6B6B", name: "User 0001" };

const App = () => {
  // const [theme, setTheme] = useState("dark");
  // const [tool, setTool] = useState("pen");
  // const [color, setColor] = useState("#ededed");
  // const [strokeWidth, setStrokeWidth] = useState(4);

  const [users, setUsers] = useState([
    {
      id: "user2",
      color: "#4ECDC4",
      name: "User 2222",
      cursor: { x: 200, y: 200 },
    },
    {
      id: "user3",
      color: "#fbbf24",
      name: "User 3333",
      cursor: { x: 400, y: 300 },
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          cursor: {
            x: u.cursor.x + (Math.random() - 0.5) * 20,
            y: u.cursor.y + (Math.random() - 0.5) * 20,
          },
        })),
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <div className="canvas-container" style={{ top: 0 }}>
        <Cursors users={users} myInfo={myInfo} />
      </div>
    </div>
  );
};

export default App;
