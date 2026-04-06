import React, { useState } from "react";
// import Header from "./components/Header";
import "./index.css";
import Toolbar from "./components/Toolbar";

const App = () => {
  // const [theme, setTheme] = useState("dark");
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#ededed");
  const [strokeWidth, setStrokeWidth] = useState(4);

  return (
    <div>
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onUndo={() => console.log("undo")}
        onClear={() => console.log("clear")}
        onAddSticky={() => console.log("sticky")}
      />
    </div>
  );
};

export default App;
