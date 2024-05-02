import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Field() {
  const [isLoading, setIsLoading] = useState(false);
  //cursor
  const [isCursorBlinking, setIsCursorBlinking] = useState(false);
  //field
  const [fieldHistory, setFieldHistory] = useState([
    // history of text output to the user
    { text: "Type 'help' to see the full list of commands.", hasBuffer: true },
  ]);
  //input
  const [userInput, setUserInput] = useState("");
  const [showFileInput, setShowFileInput] = useState(false);
  //history
  const [commandHistory, setCommandHistory] = useState([]); // history of commands entered
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(0);
  //ref
  const fieldRef = useRef(null); //for auto scrolling down
  const fileInputRef = useRef(null);

  const helpCommands = [
    {
      command: "help",
      purpose: "Provides help information for terminal commands.\n",
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
      command: 'draw "[file]" "[columns]"',
      purpose:
        "Draws the chart of the specified column of the file present in the draw-chart directory. File name must be in double quotes. Column must be in double quotes seperated by a space.\n",
    },
    {
      command: 'delete "[file]"',
      purpose:
        "Deletes the specified file from the draw-chart directory. File name must be in double quotes.\n",
    },
    {
    command: "Arrow Keys",
    purpose: "Navigate through the command history.\n",
    }
  ];

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
    }
  });
  const handleTyping = async (e) => {
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
      } else if (key === "ArrowDown" || key === "ArrowRight") {
        setCommandHistoryIndex((currentIndex) => {
          // console.log(currentIndex);
          // console.log(commandHistory.length);
          const newIndex = Math.min(commandHistory.length, currentIndex + 1);
          setUserInput(commandHistory[newIndex] || "");
          return newIndex;
        });
      } else if (key === "ArrowUp" || key === "ArrowLeft") {
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

  const handleInputEvaluation = async (input) => {
    const cleaned_input = input.trim().toLowerCase().split(" ");

    if (cleaned_input[0] === "help") {
      const helpPrint = helpCommands.map((command) => {
        return {
          text:
            command.command + (command.purpose ? " - " + command.purpose : ""),
          isCommand: false,
          hasBuffer: true,
        };
      });
      setFieldHistory((currentFieldHistory) => [
        ...currentFieldHistory,
        ...helpPrint,
      ]);
    } else if (cleaned_input[0] === "upload") {
      setShowFileInput(true);
      fileInputRef.current.click();
    } else if (cleaned_input[0] === "fetch-price") {
      const pair = cleaned_input[1].toUpperCase();
      setIsLoading(true);
      try {
        const res = await axios.get(
          `https://api.binance.com/api/v3/avgPrice?symbol=${pair}`
        );
        console.log(res);
        const price = res.data.price;

        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          {
            text: `Current price for ${pair} is ${price}`,
            isCommand: false,
            hasBuffer: true,
          },
        ]);
      } catch (err) {
        console.log(err);
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          { text: "Error fetching price", isError: true, hasBuffer: true },
        ]);
      }
      setIsLoading(false);
    } else if (cleaned_input[0] === "about") {
      setFieldHistory((currentFieldHistory) => [
        ...currentFieldHistory,
        {
          text: (
            <div>
              <div>CLI Version 1.0</div>This is a front-end CLI created as a
              part of the Full Stack Hiring test. It simulates various
              command-line functionalities.
            </div>
          ),
          isCommand: false,
          hasBuffer: true,
        },
      ]);
    } else if (cleaned_input[0] === "delete") {
      let fileName = input.slice(6).trim();
      if (fileName.startsWith('"') && fileName.endsWith('"')) {
        fileName = fileName.slice(1, -1);
      }
      setIsLoading(true);
      try {
        const res = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/file/${fileName}`
        );
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          {
            text: `File ${fileName} deleted successfully`,
            isCommand: false,
          },
        ]);
      } catch (err) {
        console.log(err);
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          {
            text: err?.response?.data?.message,
            isError: true,
            hasBuffer: true,
          },
        ]);
      }
      setIsLoading(false);
    } else if (cleaned_input[0] === "draw") {
      const draw_regex = /^draw\s+"([^"]+)"((?:\s+"[^"]+")+)$/;
      let trimmed_input = input.trim();
      const match = trimmed_input.match(draw_regex);
      let columns = [];
      let fileName = "";
      console.log(fileName);
      console.log(columns);
      console.log(input);
      if (match) {
        console.log("here");
        fileName = match[1];
        const columnsPart = match[2].trim();

        //extractin columns 
        const columnRegex = /"([^"]+)"/g;
        let columnMatch;
        while ((columnMatch = columnRegex.exec(columnsPart)) !== null) {
          columns.push(columnMatch[1]);
        }
      }
      if (!match) {
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          {
            text: 'Invalid draw command. Please use the format: draw "filename" "column1" "column2"',
            isError: true,
            hasBuffer: true,
          },
        ]);
        return;
      }
      if (columns.length != 2) {
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          {
            text: "Draw command must have 2 columns.",
            isError: true,
            hasBuffer: true,
          },
        ]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/file/${fileName}`,
          {
            column_1: columns[0],
            column_2: columns[1],
          }
        );
        console.log(res);
        const data = res.data.columns;
        console.log("data", data);

        const chart = (
          <LineChart
            width={730}
            height={400}
            data={data}
            margin={{ top: 10, right: 30, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={columns[0]}
              label={`${columns[0]}`}
              textAnchor="end"
              height={100} 
              tickMargin={20}
            />
            <YAxis
              dataKey={`${columns[1]}`}
              label={`${columns[1]}`}
              width={100}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={`${columns[1]}`}
              stroke="#8884d8"
              dot={false}
            />
          </LineChart>
        );
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          {
            text: chart,
            isCommand: false,
            hasBuffer: true,
          },
        ]);
      } catch (error) {
        console.log(error);
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          {
            text: error?.response?.data?.message || "Error drawing chart",
            isError: true,
            hasBuffer: true,
          },
        ]);
      }
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      console.log(file);
      console.log("type", file.type);
      if (file.type !== "text/csv") {
        setFieldHistory((currentFieldHistory) => [
          ...currentFieldHistory,
          {
            text: "File must be of type CSV.",
            isError: true,
            hasBuffer: true,
          },
        ]);
        event.target.value = null;
        return;
      }
      setIsLoading(true);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setFieldHistory([
          ...fieldHistory,
          {
            text: `${file.name} has been uploaded.`,
            isCommand: false,
            hasBuffer: true,
          },
        ]);
        event.target.value = null;
      } catch (err) {
        console.log(err);
        setFieldHistory([
          ...fieldHistory,
          {
            text: "Error uploading file",
            isError: true,
            hasBuffer: true,
          },
        ]);

        event.target.value = null;
      }
      setIsLoading(false);
    }
    setShowFileInput(false);
  };

  //cursor
  const handleContextMenuPaste = (e) => {
    e.preventDefault();
    navigator.clipboard.readText().then((clipboardContent) => {
      setUserInput((currentInput) => `${currentInput}${clipboardContent}`);
    });
  };

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
            <br />
          </div>
        </React.Fragment>
      ))}
      {!isLoading && (
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
          <br />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
