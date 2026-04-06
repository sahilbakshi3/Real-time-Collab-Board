import React, { useState } from "react";
// import Header from "./components/Header";
import "./index.css";
// import Toolbar from "./components/Toolbar";
import UsersPanel from "./components/UsersPanel.jsx";

const fakeUsers = [
  { id: "1", color: "#FF6B6B", name: "User 1234", cursor: { x: 0, y: 0 } },
  { id: "2", color: "#4ECDC4", name: "User 5678", cursor: { x: 0, y: 0 } },
  { id: "3", color: "#45B7D1", name: "User 9999", cursor: { x: 0, y: 0 } },
];

const App = () => {
  // const [theme, setTheme] = useState("dark");
  // const [tool, setTool] = useState("pen");
  // const [color, setColor] = useState("#ededed");
  // const [strokeWidth, setStrokeWidth] = useState(4);

  return (
    <div>
      <UsersPanel users={fakeUsers} myInfo={fakeUsers[0]} connected={true} />
      <div style={{ marginTop: 200 }}>
        <UsersPanel users={fakeUsers} myInfo={fakeUsers[0]} connected={false} />
      </div>
    </div>
  );
};

export default App;
