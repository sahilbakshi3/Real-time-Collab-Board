import React, { useState } from "react";
import Header from "./components/Header";
import "./index.css";

const App = () => {
  const [theme, setTheme] = useState("dark");

  return (
    <div>
      <Header
        myInfo={{ id: "123", color: "#FF6B6B", name: "User 1234" }}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />
    </div>
  );
};

export default App;
