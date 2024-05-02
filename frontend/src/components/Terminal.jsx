import React, { useState, useEffect } from "react";
import Field from "./Field";
export default function Terminal() {
  const [maximized, setMaximized] = useState(true);
  const [title, setTitle] = useState("CLI-REPL");

  return (
    <div
      id="terminal"
      style={
        maximized
          ? { height: "100vh", width: "100vw", maxWidth: "100vw" }
          : {boxShadow: '0 2px 5px #111'}
      }
    >
      <div id="window" style={{backgroundColor: '#222345', color: '#F4F4F4'}}>
        <span id="title" style={{ color:'#F4F4F4' }}>
          {title}
        </span>
      </div>
      <Field  />
    </div>
  );
};
