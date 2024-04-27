import React, { useState, useEffect, useRef } from "react";

export default function Field() {
  //cursor
  const [isCursorBlinking, setIsCursorBlinking] = useState(false);
  //field
  const [fieldHistory, setFieldHistory] = useState([
    // history of text output to the user
    { text: "React Terminal" },
    { text: "Type 'help' to see the full list of commands.", hasBuffer: true },
  ]);
  //input
  const [userInput, setUserInput] = useState("");
  const [showFileInput, setShowFileInput] = useState(false);
  //history
  const [commandHistory, setCommandHistory] = useState([]); // history of commands entered
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(0);
  //ref
  const fieldRef = useRef(null);
  const fileInputRef = useRef(null);

  const helpCommands = [
    {
      command: "help",
      purpose: "Provides help information for React Terminal commands.\n",
    },
    {
      command: "about",
      purpose: "Provides information about this CLI.\n",
    },
    {
      command: "fetch-price [pair]",
      purpose: "Fetches the current price of the given cryptocurrency pair.\n",
    },
    {
      command: "upload",
      purpose:
        "Opens the file explorer to allow uploading csv files only to the draw-chart directory.\n",
    },
    {
      command: "draw [file] [columns]",
      purpose:
        "Draws the chart of the specified columns of the file present in the draw-chart directory. Collumns must be seperated by a comma.\n",
    },
    {
      command: "delete [file]",
      purpose: "Deletes the specified file from the draw-chart directory.",
    },
  ];
  //   useEffect(() => {
  //     if (
  //       typeof window.orientation !== "undefined" ||
  //       navigator.userAgent.indexOf("IEMobile") !== -1
  //     ) {
  //       setIsMobile(true);
  //       setFieldHistory((currentFieldHistory) => [
  //         ...currentFieldHistory,
  //         { isCommand: true },
  //         {
  //           text: 'Unfortunately due to this application being an "input-less" environment, mobile is not supported. Please use a desktop.',
  //           isError: true,
  //           hasBuffer: true,
  //         },
  //       ]);
  //     }

  //     const handleClick = () => {
  //       setFieldHistory((currentFieldHistory) => [
  //         ...currentFieldHistory,
  //         { isCommand: true },
  //         { text: "SYS >> That button doesn't do anything.", hasBuffer: true },
  //       ]);
  //     };

  //     document
  //       .querySelector("#useless-btn")
  //       .addEventListener("click", handleClick);

  //     return () => {
  //       document
  //         .querySelector("#useless-btn")
  //         .removeEventListener("click", handleClick);
  //     };
  //   }, []);

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
    }
  });
  const handleTyping = (e) => {
    e.preventDefault();
    const { key, ctrlKey, altKey } = e;
    const forbiddenKeys = [
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
      "F9",
      "F10",
      "F11",
      "F12",
      "ContextMenu",
      "Meta",
      "NumLock",
      "Shift",
      "Control",
      "Alt",
      "CapsLock",
      "Tab",
      "ScrollLock",
      "Pause",
      "Insert",
      "Home",
      "PageUp",
      "Delete",
      "End",
      "PageDown",
    ];

    if (!forbiddenKeys.includes(key) && !ctrlKey && !altKey) {
      if (key === "Backspace") {
        setUserInput((currentInput) => currentInput.slice(0, -1));
      } else if (key === "Escape") {
        setUserInput("");
      } else if (key === "ArrowDown" || key === "ArrowLeft") {
        setCommandHistoryIndex((currentIndex) => {
          console.log(currentIndex);
          console.log(commandHistory.length);
          const newIndex = Math.min(commandHistory.length, currentIndex + 1);
          setUserInput(commandHistory[newIndex] || "");
          return newIndex;
        });
      } else if (key === "ArrowUp" || key === "ArrowRight") {
        setCommandHistoryIndex((currentIndex) => {
          const newIndex = Math.max(0, currentIndex - 1);
          setUserInput(commandHistory[newIndex] || "");
          return newIndex;
        });
      } else if (key === "Enter") {
        if (userInput) {
          const newHistory = [...commandHistory, userInput];
          setCommandHistory(newHistory);
          setCommandHistoryIndex(newHistory.length);
          setFieldHistory((currentFieldHistory) => [
            ...currentFieldHistory,
            { text: userInput, isCommand: true },
          ]);
          setUserInput("");
          handleInputEvaluation(userInput);
        } else {
          setFieldHistory((currentFieldHistory) => [
            ...currentFieldHistory,
            { isCommand: true },
          ]);
        }
      } else {
        setUserInput((currentInput) => currentInput + key); //normal input
      }
    }
  };

  const handleInputEvaluation = (input) => {
    const cleaned_input = input.trim().toLowerCase().split(" ");

      if (cleaned_input[0] === "help"){
        const helpPrint = helpCommands.map((command) => {
          return (
            {
              text: command.command + (command.purpose ? " - " + command.purpose : ""),
              isCommand: false,
              hasBuffer: true,
            }
        
          )
        })
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,...helpPrint
        ]);
      }
      else if (cleaned_input[0] === "upload"){
        setShowFileInput(true); // Set file input to be shown
        fileInputRef.current.click(); // Programmatically click the file input
      }
     
        
    
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFieldHistory([
        ...fieldHistory,
        {
          text: `${file.name} has been selected`,
          isCommand: false,
          hasBuffer: true,
        },
      ]);
      // Process the file or store it as needed
    }
    setShowFileInput(false); // Hide the file input againfile
  };

  const handleInputExecution = (cmd, params, flags) => {
    // Implementation of command execution logic
  };

  const handleContextMenuPaste = (e) => {
    e.preventDefault();
    navigator.clipboard.readText().then((clipboardContent) => {
      setUserInput((currentInput) => `${currentInput}${clipboardContent}`);
    });
  };

  //cursor
  const handleFocus = () => {
    setIsCursorBlinking(true);
  };

  const handleBlur = () => {
    setIsCursorBlinking(false);
  };

  return (
    <div
      id="field"
      className="dark"
      style={{
        backgroundColor: "#222333",
        color: "#F4F4F4",
        fontWeight: "normal",
      }}
      onKeyDown={handleTyping}
      tabIndex={0}
      onContextMenu={handleContextMenuPaste}
      ref={fieldRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {fieldHistory.map(({ text, isCommand, isError, hasBuffer }, index) => (
        <React.Fragment key={index}>
          <div>
            {isCommand && (
              <div id="query">
                ante@matter:${" "}
                <span className={isCommand && isError ? "error" : ""}>
                  {text}
                </span>{" "}
              </div>
            )}
            {!isCommand && <div>{text}</div>}
            {!isCommand && hasBuffer && <div></div>}
            <br/>
          </div>
        </React.Fragment>
      ))}
      <div>
        <div id="query">
          ante@matter:$ <span>{userInput}</span>{" "}
        </div>

        {isCursorBlinking && (
          <div
            id="cursor"
            style={{ animation: "1.02s blink-dark step-end infinite" }}
          ></div>
        )}
        <br/>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
